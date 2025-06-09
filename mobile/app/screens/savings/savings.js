import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus, Filter, Download } from 'lucide-react-native';
import Header from '../../component/Header';
import BottomNav from '../../component/BottomNav';
import { COLORS } from '../theme/colors';
import AccountsList from './components/AccountsList';
import TransactionsList from './components/TransactionsList';
import SummaryCards from './components/SummaryCards';
import AccountModal from './components/AccountModal';
import TransactionModal from './components/TransactionModal';

// Types de comptes disponibles
export const accountTypes = [
  { id: "checking", label: "Compte Courant", icon: "credit-card" },
  { id: "savings", label: "Livret A", icon: "wallet" },
  { id: "investment", label: "Investissement", icon: "trending-up" },
  { id: "other", label: "Autre", icon: "dollar-sign" },
];


export const accountColors = [
  "#6366f1", 
  "#8b5cf6", 
  "#ec4899", 
  "#f59e0b", 
  "#10b981", 
  "#3b82f6", 
  "#ef4444", 
];

const calculateSavingsRecommendations = async () => {
  try {
    // Charger les données du formulaire
    const formDataString = await AsyncStorage.getItem('budgetFormData');
    if (!formDataString) return null;

    const formData = JSON.parse(formDataString);
    const totalIncome = parseFloat(formData.budget) || 0;
    const totalExpenses = (
      (parseFloat(formData.rent) || 0) +
      (parseFloat(formData.food) || 0) +
      (parseFloat(formData.transport) || 0) +
      (formData.hasTuition === 'yes' ? (parseFloat(formData.tuitionAmount) || 0) : 0)
    );

    // Calculer le montant disponible pour l'épargne
    const availableForSavings = totalIncome - totalExpenses;

    // Règles de répartition de l'épargne
    const recommendations = {
      emergency: Math.round(availableForSavings * 0.5 * 100) / 100, // 50% pour le fonds d'urgence
      goals: Math.round(availableForSavings * 0.3 * 100) / 100,     // 30% pour les objectifs
      leisure: Math.round(availableForSavings * 0.2 * 100) / 100    // 20% pour les loisirs
    };

    return {
      totalIncome,
      totalExpenses,
      availableForSavings,
      recommendations
    };
  } catch (error) {
    console.error('Erreur lors du calcul des recommandations d\'épargne:', error);
    return null;
  }
};

const loadBudgetDataFromServer = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const API_BASE_URL = 'http://10.0.2.2:5000/api';

    if (token) {
      const response = await fetch(`${API_BASE_URL}/users/get_budget_data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Données du serveur:', data);
        
        // Convertir les données du serveur au format du formulaire
        const formattedData = {
          budget: data.data.income.monthlyBudget,
          hasTuition: data.data.expenses.education.hasTuition,
          tuitionAmount: data.data.expenses.education.tuitionAmount,
          rent: data.data.expenses.fixed.rent,
          food: data.data.expenses.fixed.food,
          transport: data.data.expenses.fixed.transport,
        };

        // Sauvegarder les données dans AsyncStorage
        await AsyncStorage.setItem('budgetFormData', JSON.stringify(formattedData));
        await AsyncStorage.setItem('budgetAnalysis', JSON.stringify(data.data.analysis));

        // Calculer les recommandations d'épargne
        const totalIncome = data.data.income.monthlyBudget + data.data.income.additionalIncome;
        const totalExpenses = data.data.analysis.totalExpenses;
        const availableForSavings = totalIncome - totalExpenses;

        const recommendations = {
          totalIncome,
          totalExpenses,
          availableForSavings,
          recommendations: {
            emergency: Math.round(availableForSavings * 0.5 * 100) / 100,
            goals: Math.round(availableForSavings * 0.3 * 100) / 100,
            leisure: Math.round(availableForSavings * 0.2 * 100) / 100
          }
        };

        setSavingsRecommendations(recommendations);

        // Créer ou mettre à jour les comptes par défaut
        if (accounts.length === 0) {
          const defaultAccounts = [
            {
              id: 'emergency-' + Date.now(),
              name: "Fonds d'urgence",
              balance: data.data.savings.currentAmount || 0,
              accountType: "savings",
              interestRate: 3,
              color: "#10b981",
              icon: "shield",
              targetAmount: recommendations.recommendations.emergency,
            },
            {
              id: 'goals-' + Date.now(),
              name: "Objectifs",
              balance: 0,
              accountType: "investment",
              interestRate: 4,
              color: "#6366f1",
              icon: "target",
              targetAmount: recommendations.recommendations.goals,
            },
            {
              id: 'checking-' + Date.now(),
              name: "Compte Courant",
              balance: totalIncome || 0,
              accountType: "checking",
              interestRate: 0,
              color: "#8b5cf6",
              icon: "credit-card",
            }
          ];
          setAccounts(defaultAccounts);
          await AsyncStorage.setItem("savingsAccounts", JSON.stringify(defaultAccounts));
        }

        return formattedData;
      }
    }
    return null;
  } catch (error) {
    console.error('Erreur lors du chargement des données du serveur:', error);
    return null;
  }
};

export default function SavingsScreen() {
  const [darkMode, setDarkMode] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionAccount, setTransactionAccount] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [savingsRecommendations, setSavingsRecommendations] = useState(null);
  const [formData, setFormData] = useState(null);

  // Charger les données depuis AsyncStorage
  useEffect(() => {
    loadData();
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      // D'abord essayer de charger depuis le serveur
      const serverData = await loadBudgetDataFromServer();
      
      if (!serverData) {
        // Si pas de données du serveur, essayer de charger depuis le stockage local
        const formDataString = await AsyncStorage.getItem('budgetFormData');
        if (formDataString) {
          const data = JSON.parse(formDataString);
          setFormData(data);
          
          // Créer automatiquement des comptes basés sur les recommandations d'épargne
          const recommendations = await calculateSavingsRecommendations();
          if (recommendations && accounts.length === 0) {
            const defaultAccounts = [
              {
                id: Date.now(),
                name: "Fonds d'urgence",
                balance: 0,
                accountType: "savings",
                interestRate: 3,
                color: "#10b981",
                icon: "shield",
                targetAmount: recommendations.recommendations.emergency,
              },
              {
                id: Date.now() + 1,
                name: "Objectifs",
                balance: 0,
                accountType: "investment",
                interestRate: 4,
                color: "#6366f1",
                icon: "target",
                targetAmount: recommendations.recommendations.goals,
              },
              {
                id: Date.now() + 2,
                name: "Compte Courant",
                balance: recommendations.totalIncome || 0,
                accountType: "checking",
                interestRate: 0,
                color: "#8b5cf6",
                icon: "credit-card",
              }
            ];
            setAccounts(defaultAccounts);
            await AsyncStorage.setItem("savingsAccounts", JSON.stringify(defaultAccounts));
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données du formulaire:', error);
    }
  };

  // Sauvegarder les données dans AsyncStorage
  useEffect(() => {
    if (accounts.length > 0) {
      const saveData = async () => {
        try {
          await AsyncStorage.setItem("savingsAccounts", JSON.stringify(accounts));
          // Sauvegarder aussi dans savedUserData pour la persistance après déconnexion
          const savedData = await AsyncStorage.getItem('savedUserData') || '{}';
          const parsedData = JSON.parse(savedData);
          await AsyncStorage.setItem('savedUserData', JSON.stringify({
            ...parsedData,
            savingsAccounts: accounts,
            savingsTransactions: transactions
          }));
        } catch (error) {
          console.error('Erreur lors de la sauvegarde des comptes:', error);
        }
      };
      saveData();
    }
  }, [accounts]);

  useEffect(() => {
    if (transactions.length > 0) {
      const saveTransactions = async () => {
        try {
          await AsyncStorage.setItem("savingsTransactions", JSON.stringify(transactions));
          // Mettre à jour savedUserData
          const savedData = await AsyncStorage.getItem('savedUserData') || '{}';
          const parsedData = JSON.parse(savedData);
          await AsyncStorage.setItem('savedUserData', JSON.stringify({
            ...parsedData,
            savingsTransactions: transactions
          }));
        } catch (error) {
          console.error('Erreur lors de la sauvegarde des transactions:', error);
        }
      };
      saveTransactions();
    }
  }, [transactions]);

  const loadData = async () => {
    try {
      // Charger les données sauvegardées
      const savedData = await AsyncStorage.getItem('savedUserData');
      const parsedSavedData = savedData ? JSON.parse(savedData) : {};
      
      // Charger les comptes
      const savedAccounts = await AsyncStorage.getItem("savingsAccounts");
      if (savedAccounts) {
        setAccounts(JSON.parse(savedAccounts));
      } else if (parsedSavedData.savingsAccounts) {
        // Restaurer depuis les données sauvegardées
        setAccounts(parsedSavedData.savingsAccounts);
        await AsyncStorage.setItem("savingsAccounts", JSON.stringify(parsedSavedData.savingsAccounts));
      }

      // Charger les transactions
      const savedTransactions = await AsyncStorage.getItem("savingsTransactions");
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      } else if (parsedSavedData.savingsTransactions) {
        // Restaurer depuis les données sauvegardées
        setTransactions(parsedSavedData.savingsTransactions);
        await AsyncStorage.setItem("savingsTransactions", JSON.stringify(parsedSavedData.savingsTransactions));
      }

      // Charger les recommandations
      const recommendations = await calculateSavingsRecommendations();
      if (recommendations) {
        setSavingsRecommendations(recommendations);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const handleAddAccount = (accountData) => {
    const newAccount = {
      id: Date.now(),
      ...accountData,
    };
    setAccounts([...accounts, newAccount]);
    setShowAccountModal(false);
  };

  const handleEditAccount = (accountData) => {
    const updatedAccounts = accounts.map((account) =>
      account.id === currentAccount.id ? { ...account, ...accountData } : account
    );
    setAccounts(updatedAccounts);
    setShowAccountModal(false);
    setCurrentAccount(null);
  };

  const handleDeleteAccount = (id) => {
    setAccounts(accounts.filter((account) => account.id !== id));
    setTransactions(transactions.filter((transaction) => transaction.accountId !== id));
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      const newTransaction = {
        id: Date.now(),
        accountId: transactionAccount.id,
        ...transactionData,
      };

      // Mettre à jour le solde du compte
      const updatedAccounts = accounts.map((account) => {
        if (account.id === transactionAccount.id) {
          let newBalance = account.balance;
          if (transactionData.type === "deposit") {
            newBalance += parseFloat(transactionData.amount);
          } else {
            newBalance -= parseFloat(transactionData.amount);
          }
          return { ...account, balance: newBalance };
        }
        return account;
      });

      // Mettre à jour les données du formulaire
      const formDataString = await AsyncStorage.getItem('budgetFormData');
      if (formDataString) {
        const formData = JSON.parse(formDataString);
        
        // Mettre à jour le budget en fonction du type de transaction
        if (transactionData.type === "deposit") {
          formData.budget = (parseFloat(formData.budget) || 0) + parseFloat(transactionData.amount);
        } else {
          // Pour les retraits, mettre à jour les dépenses appropriées
          switch (transactionData.category) {
            case "rent":
              formData.rent = (parseFloat(formData.rent) || 0) + parseFloat(transactionData.amount);
              break;
            case "food":
              formData.food = (parseFloat(formData.food) || 0) + parseFloat(transactionData.amount);
              break;
            case "transport":
              formData.transport = (parseFloat(formData.transport) || 0) + parseFloat(transactionData.amount);
              break;
            case "tuition":
              formData.tuitionAmount = (parseFloat(formData.tuitionAmount) || 0) + parseFloat(transactionData.amount);
              formData.hasTuition = "yes";
              break;
            default:
              // Pour les autres dépenses, on les ajoute à une nouvelle catégorie "other"
              formData.otherExpenses = (parseFloat(formData.otherExpenses) || 0) + parseFloat(transactionData.amount);
          }
        }

        // Sauvegarder les données mises à jour
        await AsyncStorage.setItem('budgetFormData', JSON.stringify(formData));

        // Mettre à jour les recommandations d'épargne
        const newRecommendations = await calculateSavingsRecommendations();
        setSavingsRecommendations(newRecommendations);
      }

      // Mettre à jour l'état local
      setTransactions([...transactions, newTransaction]);
      setAccounts(updatedAccounts);
      setShowTransactionModal(false);
      setTransactionAccount(null);

      // Afficher une confirmation
      Alert.alert(
        "Transaction effectuée",
        `${transactionData.type === "deposit" ? "Dépôt" : "Retrait"} de ${transactionData.amount}€ ${transactionData.type === "deposit" ? "sur" : "depuis"} ${transactionAccount.name}`,
        [{ text: "OK" }]
      );

    } catch (error) {
      console.error('Erreur lors de l\'ajout de la transaction:', error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la transaction");
    }
  };

  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    if (filterPeriod !== "all") {
      const today = new Date();
      const startDate = new Date();

      if (filterPeriod === "week") {
        startDate.setDate(today.getDate() - 7);
      } else if (filterPeriod === "month") {
        startDate.setMonth(today.getMonth() - 1);
      } else if (filterPeriod === "year") {
        startDate.setFullYear(today.getFullYear() - 1);
      }

      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate;
      });
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const theme = darkMode ? styles.dark : styles.light;
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const filteredTransactions = getFilteredTransactions();

  const renderSavingsRecommendations = () => {
    if (!savingsRecommendations) return null;

    // Calculer les progrès pour chaque objectif
    const emergencyProgress = accounts.find(a => a.name === "Fonds d'urgence")?.balance || 0;
    const goalsProgress = accounts.find(a => a.name === "Objectifs")?.balance || 0;

    return (
      <View style={[styles.recommendationsContainer, theme.card]}>
        <Text style={[styles.recommendationsTitle, theme.text]}>
          Recommandations d'épargne
        </Text>
        <View style={styles.recommendationsContent}>
          <Text style={[styles.recommendationsText, theme.text]}>
            Revenu total: {savingsRecommendations.totalIncome.toFixed(2)} €
          </Text>
          <Text style={[styles.recommendationsText, theme.text]}>
            Dépenses totales: {savingsRecommendations.totalExpenses.toFixed(2)} €
          </Text>
          <Text style={[styles.recommendationsText, theme.text]}>
            Disponible pour l'épargne: {savingsRecommendations.availableForSavings.toFixed(2)} €
          </Text>
          
          <View style={styles.recommendationsDivider} />
          
          <Text style={[styles.recommendationsSubtitle, theme.text]}>
            Progrès des objectifs:
          </Text>
          <View style={styles.progressContainer}>
            <Text style={[styles.recommendationsText, theme.text]}>
              Fonds d'urgence: {emergencyProgress.toFixed(2)} € / {savingsRecommendations.recommendations.emergency.toFixed(2)} €
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min((emergencyProgress / savingsRecommendations.recommendations.emergency) * 100, 100)}%`,
                    backgroundColor: COLORS.primary
                  }
                ]} 
              />
            </View>
          </View>

          <View style={styles.progressContainer}>
            <Text style={[styles.recommendationsText, theme.text]}>
              Objectifs: {goalsProgress.toFixed(2)} € / {savingsRecommendations.recommendations.goals.toFixed(2)} €
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min((goalsProgress / savingsRecommendations.recommendations.goals) * 100, 100)}%`,
                    backgroundColor: COLORS.primary
                  }
                ]} 
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, theme.container]}>
      <Header title="Mes Comptes" darkMode={darkMode} setDarkMode={setDarkMode} />

      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setCurrentAccount(null);
              setShowAccountModal(true);
            }}
          >
            <Plus color="white" size={24} />
          </TouchableOpacity>
        </View>

        <SummaryCards
          totalBalance={totalBalance}
          accountsCount={accounts.length}
          lastTransaction={filteredTransactions[0]}
          theme={theme}
        />

        <AccountsList
          accounts={accounts}
          onEdit={(account) => {
            setCurrentAccount(account);
            setShowAccountModal(true);
          }}
          onDelete={handleDeleteAccount}
          onAddTransaction={(account) => {
            setTransactionAccount(account);
            setShowTransactionModal(true);
          }}
          theme={theme}
        />

        <TransactionsList
          transactions={filteredTransactions}
          accounts={accounts}
          filterPeriod={filterPeriod}
          onFilterChange={setFilterPeriod}
          theme={theme}
        />

        {renderSavingsRecommendations()}
      </ScrollView>

      <AccountModal
        visible={showAccountModal}
        account={currentAccount}
        onClose={() => {
          setShowAccountModal(false);
          setCurrentAccount(null);
        }}
        onSave={currentAccount ? handleEditAccount : handleAddAccount}
        theme={theme}
      />

      <TransactionModal
        visible={showTransactionModal}
        account={transactionAccount}
        onClose={() => {
          setShowTransactionModal(false);
          setTransactionAccount(null);
        }}
        onSave={handleAddTransaction}
        theme={theme}
      />

      <BottomNav activeTab="savings" darkMode={darkMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  light: {
    container: {
      backgroundColor: "#f8fafc",
    },
    text: {
      color: "#0f172a",
    },
    textSecondary: {
      color: "#475569",
    },
    card: {
      backgroundColor: "white",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
  },
  dark: {
    container: {
      backgroundColor: "#0f172a",
    },
    text: {
      color: "#f8fafc",
    },
    textSecondary: {
      color: "#cbd5e1",
    },
    card: {
      backgroundColor: "#1e293b",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 3.84,
      elevation: 5,
    },
  },
  recommendationsContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  recommendationsContent: {
    gap: 8,
  },
  recommendationsText: {
    fontSize: 14,
  },
  recommendationsSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  recommendationsDivider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
}); 