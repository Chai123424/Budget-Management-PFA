import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, StatusBar, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { CreditCard, Wallet, DollarSign, ArrowUpRight, Lightbulb, Sun, Moon } from "lucide-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from "../theme/colors"; // à créer

export default function Dashboard() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeTip, setActiveTip] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // États pour les données calculées automatiquement
  const [budgetData, setBudgetData] = useState({
    spent: 0,
    saved: 0,
    budget: 0,
    totalExpenses: 0,
    totalIncome: 0,
    remaining: 0
  });

  // États pour les détails des dépenses
  const [expenseDetails, setExpenseDetails] = useState({
    rent: 0,
    food: 0,
    transport: 0,
    tuitionAmount: 0
  });

  // État pour les informations utilisateur
  const [userInfo, setUserInfo] = useState({
    firstName: 'Utilisateur',
    lastName: ''
  });

  const tips = [
    "Track your coffee expenses - small savings add up!",
    "Set a weekly budget for entertainment to avoid overspending",
    "Use student discounts whenever possible - they add up!",
    "Plan meals ahead to reduce food delivery expenses",
    "Consider second-hand textbooks to save on course materials",
    `Based on your budget, try to save at least 10% each month`,
    `Your biggest expense is rent (${Math.round((expenseDetails.rent / budgetData.totalExpenses) * 100)}% of total expenses)`,
  ];

  // Fonction pour charger les données du formulaire
  const loadBudgetData = async () => {
    try {
      // Charger les données du profil utilisateur
      const userProfile = await AsyncStorage.getItem('userProfile');
      const budgetFormData = await AsyncStorage.getItem('budgetFormData');
      
      let data = null;
      
      if (userProfile) {
        data = JSON.parse(userProfile);
      } else if (budgetFormData) {
        data = JSON.parse(budgetFormData);
      }

      if (data) {
        console.log('Données chargées:', data);
        
        // Convertir les chaînes en nombres
        const budget = parseFloat(data.budget) || 0;
        const rent = parseFloat(data.rent) || 0;
        const food = parseFloat(data.food) || 0;
        const transport = parseFloat(data.transport) || 0;
        const tuitionAmount = data.hasTuition === 'yes' ? (parseFloat(data.tuitionAmount) || 0) : 0;
        
        // Calculer les totaux
        const totalExpenses = rent + food + transport;
        const totalIncome = budget + tuitionAmount;
        const remaining = totalIncome - totalExpenses;
        const saved = remaining > 0 ? remaining : 0;
        
        // Mettre à jour les états
        setBudgetData({
          spent: totalExpenses,
          saved: saved,
          budget: budget,
          totalExpenses: totalExpenses,
          totalIncome: totalIncome,
          remaining: remaining
        });

        setExpenseDetails({
          rent: rent,
          food: food,
          transport: transport,
          tuitionAmount: tuitionAmount
        });

        setUserInfo({
          firstName: data.firstName || 'Utilisateur',
          lastName: data.lastName || ''
        });
      } else {
        console.log('Aucune donnée de budget trouvée');
        // Données par défaut si aucune donnée n'est trouvée
        setBudgetData({
          spent: 0,
          saved: 0,
          budget: 0,
          totalExpenses: 0,
          totalIncome: 0,
          remaining: 0
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  useEffect(() => {
    loadBudgetData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTip((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [budgetData]); // Relancer quand les données changent

  const theme = darkMode ? styles.dark : styles.light;

  const percentRemaining = budgetData.budget > 0 ? Math.round((budgetData.remaining / budgetData.budget) * 100) : 0;
  const percentSpent = budgetData.budget > 0 ? Math.round((budgetData.spent / budgetData.budget) * 100) : 0;

  // Fonction pour calculer les tendances (simulation)
  const calculateTrend = (current, category) => {
    // Simulation de données du mois précédent
    const lastMonthData = {
      spent: current * 1.12, // 12% de plus le mois dernier
      saved: current * 0.92  // 8% de moins le mois dernier
    };
    
    if (category === 'spent') {
      const difference = ((lastMonthData.spent - current) / lastMonthData.spent) * 100;
      return Math.round(difference);
    } else if (category === 'saved') {
      const difference = ((current - lastMonthData.saved) / lastMonthData.saved) * 100;
      return Math.round(difference);
    }
    return 0;
  };

  const spentTrend = calculateTrend(budgetData.spent, 'spent');
  const savedTrend = calculateTrend(budgetData.saved, 'saved');

  return (
    <ScrollView style={[styles.container, theme.container]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <Text style={[styles.title, theme.text]}>
          Hello, {userInfo.firstName} 👋
        </Text>
        <TouchableOpacity onPress={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun color="white" /> : <Moon color="black" />}
        </TouchableOpacity>
      </View>

      <Text style={theme.textSecondary}>Here's your financial overview for this month</Text>

      <View style={styles.tabRow}>
        {['overview', 'expenses', 'savings'].map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tabButton, activeTab === tab && theme.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && theme.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Simple Tip Card */}
      <View style={[styles.tipCard, theme.card]}>
        <View style={styles.tipHeader}>
          <Lightbulb color={darkMode ? 'white' : 'black'} />
          <Text style={theme.text}>Pro Tip:</Text>
        </View>
        <Text style={theme.textSecondary}>{tips[activeTip]}</Text>
      </View>

      {activeTab === 'overview' && (
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, theme.card]}>
            <Text style={theme.textSecondary}>Spent this month</Text>
            <CreditCard color={COLORS.primary} />
            <Text style={[styles.amount, theme.text]}>{budgetData.spent.toFixed(0)} €</Text>
            <View style={styles.trendRow}>
              <ArrowUpRight size={16} color={spentTrend > 0 ? COLORS.success : COLORS.warning} />
              <Text style={{ color: spentTrend > 0 ? COLORS.success : COLORS.warning, marginLeft: 4 }}>
                {Math.abs(spentTrend)}% {spentTrend > 0 ? 'less' : 'more'} than last month
              </Text>
            </View>
          </View>

          <View style={[styles.statCard, theme.card]}>
            <Text style={theme.textSecondary}>Saved this month</Text>
            <Wallet color={COLORS.success} />
            <Text style={[styles.amount, theme.text]}>{budgetData.saved.toFixed(0)} €</Text>
            <View style={styles.trendRow}>
              <ArrowUpRight size={16} color={savedTrend > 0 ? COLORS.success : COLORS.warning} />
              <Text style={{ color: savedTrend > 0 ? COLORS.success : COLORS.warning, marginLeft: 4 }}>
                {Math.abs(savedTrend)}% {savedTrend > 0 ? 'more' : 'less'} than last month
              </Text>
            </View>
          </View>

          <View style={[styles.statCard, theme.card]}>
            <Text style={theme.textSecondary}>Remaining Budget</Text>
            <DollarSign color={budgetData.remaining >= 0 ? COLORS.success : COLORS.warning} />
            <Text style={[styles.amount, theme.text, budgetData.remaining < 0 && { color: COLORS.warning }]}>
              {budgetData.remaining.toFixed(0)} €
            </Text>
            <Text style={theme.textSecondary}>
              {percentRemaining}% of monthly budget ({budgetData.budget.toFixed(0)} €)
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={[
                styles.progressBar, 
                { 
                  width: `${Math.min(Math.abs(percentRemaining), 100)}%`, 
                  backgroundColor: budgetData.remaining >= 0 ? COLORS.success : COLORS.warning 
                }
              ]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={theme.textSecondary}>0 €</Text>
              <Text style={theme.textSecondary}>{budgetData.budget.toFixed(0)} €</Text>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'expenses' && (
        <View style={styles.statsGrid}>
          <Text style={[styles.sectionTitle, theme.text]}>Expense Breakdown</Text>
          
          <View style={[styles.statCard, theme.card]}>
            <Text style={theme.textSecondary}>Rent</Text>
            <Text style={[styles.amount, theme.text]}>{expenseDetails.rent.toFixed(0)} €</Text>
            <Text style={theme.textSecondary}>
              {budgetData.totalExpenses > 0 ? Math.round((expenseDetails.rent / budgetData.totalExpenses) * 100) : 0}% of total expenses
            </Text>
          </View>

          <View style={[styles.statCard, theme.card]}>
            <Text style={theme.textSecondary}>Food</Text>
            <Text style={[styles.amount, theme.text]}>{expenseDetails.food.toFixed(0)} €</Text>
            <Text style={theme.textSecondary}>
              {budgetData.totalExpenses > 0 ? Math.round((expenseDetails.food / budgetData.totalExpenses) * 100) : 0}% of total expenses
            </Text>
          </View>

          <View style={[styles.statCard, theme.card]}>
            <Text style={theme.textSecondary}>Transport</Text>
            <Text style={[styles.amount, theme.text]}>{expenseDetails.transport.toFixed(0)} €</Text>
            <Text style={theme.textSecondary}>
              {budgetData.totalExpenses > 0 ? Math.round((expenseDetails.transport / budgetData.totalExpenses) * 100) : 0}% of total expenses
            </Text>
          </View>

          {expenseDetails.tuitionAmount > 0 && (
            <View style={[styles.statCard, theme.card]}>
              <Text style={theme.textSecondary}>Tuition Income</Text>
              <Text style={[styles.amount, theme.text, { color: COLORS.success }]}>
                {expenseDetails.tuitionAmount.toFixed(0)} €
              </Text>
              <Text style={theme.textSecondary}>Additional income</Text>
            </View>
            
          )}

          <View style={[styles.statCard, theme.card, { backgroundColor: darkMode ? '#2d1b69' : '#f0f4ff' }]}>
            <Text style={theme.textSecondary}>Total Monthly Expenses</Text>
            <Text style={[styles.amount, theme.text]}>{budgetData.totalExpenses.toFixed(0)} €</Text>
            <Text style={theme.textSecondary}>
              {budgetData.budget > 0 ? percentSpent : 0}% of budget used
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.viewMoreButton, theme.card]}
            onPress={() => router.push('/expenses')}
          >
            <Text style={theme.text}>Voir plus →</Text>
          </TouchableOpacity>
        </View>

        
      )}

      {activeTab === 'savings' && (
        <View style={styles.statsGrid}>
          <Text style={[styles.sectionTitle, theme.text]}>Savings Overview</Text>
          
          <View style={[styles.statCard, theme.card]}>
            <Text style={theme.textSecondary}>This Month's Savings</Text>
            <Wallet color={COLORS.success} />
            <Text style={[styles.amount, theme.text, { color: COLORS.success }]}>
              {budgetData.saved.toFixed(0)} €
            </Text>
            <Text style={theme.textSecondary}>
              {budgetData.budget > 0 ? Math.round((budgetData.saved / budgetData.budget) * 100) : 0}% of income saved
            </Text>
          </View>

          <View style={[styles.statCard, theme.card]}>
            <Text style={theme.textSecondary}>Savings Goal Progress</Text>
            <Text style={[styles.amount, theme.text]}>
              {Math.round((budgetData.saved / (budgetData.budget * 0.2)) * 100)}% 
            </Text>
            <Text style={theme.textSecondary}>
              Goal: 20% of income ({(budgetData.budget * 0.2).toFixed(0)} €)
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={[
                styles.progressBar, 
                { 
                  width: `${Math.min((budgetData.saved / (budgetData.budget * 0.2)) * 100, 100)}%`, 
                  backgroundColor: COLORS.success 
                }
              ]} />
            </View>
          </View>

          {budgetData.remaining < 0 && (
            <View style={[styles.statCard, theme.card, { backgroundColor: darkMode ? '#4a1d1d' : '#fff5f5' }]}>
              <Text style={[theme.textSecondary, { color: COLORS.warning }]}>Budget Alert</Text>
              <Text style={[styles.amount, { color: COLORS.warning }]}>
                {Math.abs(budgetData.remaining).toFixed(0)} € over budget
              </Text>
              <Text style={theme.textSecondary}>Consider reducing expenses next month</Text>
            </View>
          )}
        </View>
      )}

      {/* Bouton pour actualiser les données */}
      <TouchableOpacity 
        style={[styles.refreshButton, theme.card]} 
        onPress={loadBudgetData}
      >
        <Text style={theme.text}>🔄 Refresh Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  tabRow: {
    flexDirection: "row",
    marginVertical: 10,
  },
  tabButton: {
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  tabText: {
    fontWeight: "600",
  },
  tipCard: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  statsGrid: {
    gap: 15,
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  amount: {
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 8,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  refreshButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
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
    activeTab: {
      backgroundColor: COLORS.primary,
    },
    activeTabText: {
      color: "white",
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
    activeTab: {
      backgroundColor: COLORS.primaryLight,
    },
    activeTabText: {
      color: "white",
    },
  },
});