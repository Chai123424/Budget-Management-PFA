import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus, Filter, Download } from 'lucide-react-native';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
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

export default function SavingsScreen() {
  const [darkMode, setDarkMode] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionAccount, setTransactionAccount] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState("all");

  // Charger les données depuis AsyncStorage
  useEffect(() => {
    loadData();
  }, []);

  // Sauvegarder les données dans AsyncStorage
  useEffect(() => {
    if (accounts.length > 0) {
      AsyncStorage.setItem("savingsAccounts", JSON.stringify(accounts));
    }
  }, [accounts]);

  useEffect(() => {
    if (transactions.length > 0) {
      AsyncStorage.setItem("savingsTransactions", JSON.stringify(transactions));
    }
  }, [transactions]);

  const loadData = async () => {
    try {
      const savedAccounts = await AsyncStorage.getItem("savingsAccounts");
      const savedTransactions = await AsyncStorage.getItem("savingsTransactions");

      if (savedAccounts) {
        setAccounts(JSON.parse(savedAccounts));
      } else {
        // Comptes par défaut
        const defaultAccounts = [
          {
            id: 1,
            name: "Compte Étudiant",
            balance: 1250.75,
            accountType: "checking",
            interestRate: 0,
            color: "#6366f1",
            icon: "credit-card",
          },
          {
            id: 2,
            name: "Livret A",
            balance: 3000,
            accountType: "savings",
            interestRate: 3,
            color: "#10b981",
            icon: "wallet",
          },
        ];
        setAccounts(defaultAccounts);
        AsyncStorage.setItem("savingsAccounts", JSON.stringify(defaultAccounts));
      }

      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      } else {
        // Transactions par défaut
        const defaultTransactions = [
          {
            id: 1,
            accountId: 1,
            amount: 750,
            type: "deposit",
            description: "Bourse du mois",
            date: "2023-09-05",
          },
          {
            id: 2,
            accountId: 1,
            amount: 250.75,
            type: "deposit",
            description: "Job étudiant",
            date: "2023-09-15",
          },
        ];
        setTransactions(defaultTransactions);
        AsyncStorage.setItem("savingsTransactions", JSON.stringify(defaultTransactions));
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

  const handleAddTransaction = (transactionData) => {
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

    setTransactions([...transactions, newTransaction]);
    setAccounts(updatedAccounts);
    setShowTransactionModal(false);
    setTransactionAccount(null);
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
}); 