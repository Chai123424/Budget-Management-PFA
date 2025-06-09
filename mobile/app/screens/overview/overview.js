import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { CreditCard, Wallet, DollarSign, ArrowUpRight, Lightbulb, Clock, ArrowDown, ArrowUp, Calendar, Target, AlertTriangle } from "lucide-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../component/Header';
import BottomNav from '../../component/BottomNav';
import { COLORS } from '../theme/colors';

export default function OverviewScreen() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
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

  const [recurringPayments] = useState([
    { id: 1, title: 'Loyer', amount: expenseDetails.rent, dueDay: 5, isPaid: false },
    { id: 2, title: 'Internet', amount: 29.99, dueDay: 15, isPaid: true },
    { id: 3, title: 'Transport', amount: expenseDetails.transport, dueDay: 20, isPaid: false },
    { id: 4, title: 'Assurance', amount: 45, dueDay: 28, isPaid: true },
  ]);

  const [shortTermGoals] = useState([
    { 
      id: 1, 
      title: "Fonds d'urgence", 
      target: budgetData.budget * 3, 
      current: budgetData.saved,
      deadline: "3 mois",
      priority: "high"
    },
    { 
      id: 2, 
      title: "Vacances d'été", 
      target: 800, 
      current: 320,
      deadline: "6 mois",
      priority: "medium"
    },
    { 
      id: 3, 
      title: "Nouveau téléphone", 
      target: 600, 
      current: 150,
      deadline: "4 mois",
      priority: "low"
    },
  ]);

  const tips = [
    "Track your coffee expenses - small savings add up!",
    "Set a weekly budget for entertainment to avoid overspending",
    "Use student discounts whenever possible - they add up!",
    "Plan meals ahead to reduce food delivery expenses",
    "Consider second-hand textbooks to save on course materials",
    `Based on your budget, try to save at least 10% each month`,
    `Your biggest expense is rent (${Math.round((expenseDetails.rent / budgetData.totalExpenses) * 100)}% of total expenses)`,
  ];

  const loadBudgetData = async () => {
    try {
      // Charger les données de l'utilisateur connecté
      const userData = await AsyncStorage.getItem('userData');
      const token = await AsyncStorage.getItem('authToken');
      const API_BASE_URL = 'http://10.0.2.2:5000/api';

      // Récupérer les informations de l'utilisateur
      if (userData) {
        const user = JSON.parse(userData);
        setUserInfo({
          firstName: user.name || 'Utilisateur',
          lastName: user.lastName || ''
        });
      }

      // Charger les données depuis le serveur
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
          
          // Mettre à jour les données du budget
          const totalIncome = data.data.income.monthlyBudget + data.data.income.additionalIncome;
          const totalExpenses = data.data.analysis.totalExpenses;
          const remaining = totalIncome - totalExpenses;
          
          setBudgetData({
            spent: totalExpenses,
            saved: remaining > 0 ? remaining : 0,
            budget: totalIncome,
            totalExpenses: totalExpenses,
            totalIncome: totalIncome,
            remaining: remaining
          });

          // Mettre à jour les détails des dépenses
          setExpenseDetails({
            rent: data.data.expenses.fixed.rent,
            food: data.data.expenses.fixed.food,
            transport: data.data.expenses.fixed.transport,
            tuitionAmount: data.data.expenses.education.tuitionAmount
          });

          // Sauvegarder les données dans AsyncStorage
          const formattedData = {
            budget: data.data.income.monthlyBudget,
            hasTuition: data.data.expenses.education.hasTuition,
            tuitionAmount: data.data.expenses.education.tuitionAmount,
            rent: data.data.expenses.fixed.rent,
            food: data.data.expenses.fixed.food,
            transport: data.data.expenses.fixed.transport,
          };
          await AsyncStorage.setItem('budgetFormData', JSON.stringify(formattedData));
          await AsyncStorage.setItem('budgetAnalysis', JSON.stringify(data.data.analysis));
        }
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
  }, [budgetData]); 

  const theme = darkMode ? styles.dark : styles.light;

  const percentRemaining = budgetData.budget > 0 ? Math.round((budgetData.remaining / budgetData.budget) * 100) : 0;
  const percentSpent = budgetData.budget > 0 ? Math.round((budgetData.spent / budgetData.budget) * 100) : 0;

  // Fonction pour calculer les tendances (simulation)
  const calculateTrend = (current, category) => {
    // Simulation de données du mois précédent
    const lastMonthData = {
      spent: current * 1.12, 
      saved: current * 0.92  
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return COLORS.warning;
      case 'medium':
        return COLORS.primary;
      case 'low':
        return COLORS.success;
      default:
        return COLORS.primary;
    }
  };

  return (
    <View style={[styles.container, theme.container]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
      <Header 
        title="Vue d'ensemble" 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
      />

      <ScrollView style={styles.content}>
        <Text style={[styles.welcomeText, theme.text]}>
          Hello, {userInfo.firstName} 👋
        </Text>
        
        <Text style={theme.textSecondary}>Here's your financial overview for this month</Text>

        {/* Simple Tip Card */}
        <View style={[styles.tipCard, theme.card]}>
          <View style={styles.tipHeader}>
            <Lightbulb color={darkMode ? 'white' : 'black'} />
            <Text style={theme.text}>Pro Tip:</Text>
          </View>
          <Text style={theme.textSecondary}>{tips[activeTip]}</Text>
        </View>

        {/* Stats Grid */}
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

        {/* Bouton pour actualiser les données */}
        <TouchableOpacity 
          style={[styles.refreshButton, theme.card]} 
          onPress={loadBudgetData}
        >
          <Text style={theme.text}>🔄 Refresh Data</Text>
        </TouchableOpacity>

        {/* Expense Distribution */}
        <View style={[styles.sectionCard, theme.card]}>
          <Text style={[styles.sectionTitle, theme.text]}>Distribution des dépenses</Text>
          <View style={styles.expenseDistribution}>
            <View style={styles.expenseCategory}>
              <View style={[styles.categoryBar, { height: `${(expenseDetails.rent / budgetData.totalExpenses) * 100}%`, backgroundColor: COLORS.primary }]} />
              <Text style={theme.textSecondary}>Loyer</Text>
              <Text style={theme.text}>{Math.round((expenseDetails.rent / budgetData.totalExpenses) * 100)}%</Text>
            </View>
            <View style={styles.expenseCategory}>
              <View style={[styles.categoryBar, { height: `${(expenseDetails.food / budgetData.totalExpenses) * 100}%`, backgroundColor: COLORS.success }]} />
              <Text style={theme.textSecondary}>Nourriture</Text>
              <Text style={theme.text}>{Math.round((expenseDetails.food / budgetData.totalExpenses) * 100)}%</Text>
            </View>
            <View style={styles.expenseCategory}>
              <View style={[styles.categoryBar, { height: `${(expenseDetails.transport / budgetData.totalExpenses) * 100}%`, backgroundColor: COLORS.warning }]} />
              <Text style={theme.textSecondary}>Transport</Text>
              <Text style={theme.text}>{Math.round((expenseDetails.transport / budgetData.totalExpenses) * 100)}%</Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={[styles.sectionCard, theme.card]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, theme.text]}>Transactions récentes</Text>
            <TouchableOpacity onPress={() => router.push('/expenses')}>
              <Text style={{ color: COLORS.primary }}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.transactionList}>
            <View style={styles.transaction}>
              <View style={styles.transactionLeft}>
                <View style={[styles.transactionIcon, { backgroundColor: COLORS.success + '20' }]}>
                  <ArrowDown size={20} color={COLORS.success} />
                </View>
                <View>
                  <Text style={theme.text}>Salaire</Text>
                  <Text style={theme.textSecondary}><Clock size={12} /> Aujourd'hui</Text>
                </View>
              </View>
              <Text style={[theme.text, { color: COLORS.success }]}>+{budgetData.budget.toFixed(0)} €</Text>
            </View>

            <View style={styles.transaction}>
              <View style={styles.transactionLeft}>
                <View style={[styles.transactionIcon, { backgroundColor: COLORS.warning + '20' }]}>
                  <ArrowUp size={20} color={COLORS.warning} />
                </View>
                <View>
                  <Text style={theme.text}>Loyer</Text>
                  <Text style={theme.textSecondary}><Clock size={12} /> Hier</Text>
                </View>
              </View>
              <Text style={[theme.text, { color: COLORS.warning }]}>-{expenseDetails.rent.toFixed(0)} €</Text>
            </View>

            <View style={styles.transaction}>
              <View style={styles.transactionLeft}>
                <View style={[styles.transactionIcon, { backgroundColor: COLORS.warning + '20' }]}>
                  <ArrowUp size={20} color={COLORS.warning} />
                </View>
                <View>
                  <Text style={theme.text}>Courses</Text>
                  <Text style={theme.textSecondary}><Clock size={12} /> 2 jours</Text>
                </View>
              </View>
              <Text style={[theme.text, { color: COLORS.warning }]}>-{expenseDetails.food.toFixed(0)} €</Text>
            </View>
          </View>
        </View>

        {/* Budget Health Score */}
        <View style={[styles.sectionCard, theme.card]}>
          <Text style={[styles.sectionTitle, theme.text]}>Score de santé budgétaire</Text>
          <View style={styles.healthScore}>
            <View style={styles.scoreCircle}>
              <Text style={[styles.scoreNumber, theme.text]}>
                {Math.round((budgetData.saved / budgetData.budget) * 100)}
              </Text>
              <Text style={theme.textSecondary}>points</Text>
            </View>
            <View style={styles.scoreDetails}>
              <Text style={theme.text}>
                {budgetData.saved > 0 ? "Bon travail ! 🎉" : "Attention ! ⚠️"}
              </Text>
              <Text style={theme.textSecondary}>
                {budgetData.saved > 0 
                  ? "Vous gérez bien votre budget ce mois-ci."
                  : "Essayez de réduire vos dépenses non essentielles."}
              </Text>
            </View>
          </View>
        </View>

        {/* Recurring Payments Calendar */}
        <View style={[styles.sectionCard, theme.card]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, theme.text]}>Paiements récurrents</Text>
            <View style={styles.calendarBadge}>
              <Calendar size={16} color={COLORS.primary} />
              <Text style={{ color: COLORS.primary }}>Mai 2024</Text>
            </View>
          </View>

          <View style={styles.paymentsList}>
            {recurringPayments.map(payment => (
              <View key={payment.id} style={styles.paymentItem}>
                <View style={styles.paymentInfo}>
                  <View style={[styles.paymentStatus, { 
                    backgroundColor: payment.isPaid ? COLORS.success + '20' : COLORS.warning + '20' 
                  }]}>
                    {payment.isPaid ? (
                      <Text style={{ color: COLORS.success }}>✓</Text>
                    ) : (
                      <AlertTriangle size={16} color={COLORS.warning} />
                    )}
                  </View>
                  <View>
                    <Text style={theme.text}>{payment.title}</Text>
                    <Text style={theme.textSecondary}>Échéance : {payment.dueDay} du mois</Text>
                  </View>
                </View>
                <View style={styles.paymentAmount}>
                  <Text style={[theme.text, payment.isPaid && { color: COLORS.success }]}>
                    {payment.amount.toFixed(2)} €
                  </Text>
                  {!payment.isPaid && (
                    <TouchableOpacity style={styles.payButton}>
                      <Text style={{ color: COLORS.primary }}>Payer</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Short Term Goals */}
        <View style={[styles.sectionCard, theme.card]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, theme.text]}>Objectifs à court terme</Text>
            <TouchableOpacity style={styles.addButton}>
              <Text style={{ color: COLORS.primary }}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.goalsList}>
            {shortTermGoals.map(goal => (
              <View key={goal.id} style={styles.goalItem}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalTitleSection}>
                    <Target size={16} color={getPriorityColor(goal.priority)} />
                    <Text style={theme.text}>{goal.title}</Text>
                  </View>
                  <Text style={theme.textSecondary}>
                    Échéance : {goal.deadline}
                  </Text>
                </View>

                <View style={styles.goalProgress}>
                  <View style={styles.progressBarContainer}>
                    <View style={[
                      styles.progressBar,
                      { 
                        width: `${Math.min((goal.current / goal.target) * 100, 100)}%`,
                        backgroundColor: getPriorityColor(goal.priority)
                      }
                    ]} />
                  </View>
                  <View style={styles.goalAmounts}>
                    <Text style={theme.text}>{goal.current} €</Text>
                    <Text style={theme.textSecondary}>/ {goal.target} €</Text>
                  </View>
                  <Text style={[styles.goalPercentage, { color: getPriorityColor(goal.priority) }]}>
                    {Math.round((goal.current / goal.target) * 100)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomNav activeTab="overview" darkMode={darkMode} />
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
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
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
    paddingBottom: 20,
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
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
  sectionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  expenseDistribution: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 200,
    alignItems: 'flex-end',
    marginTop: 20,
  },
  expenseCategory: {
    alignItems: 'center',
    width: '30%',
  },
  categoryBar: {
    width: '100%',
    borderRadius: 8,
    marginBottom: 8,
  },
  transactionList: {
    gap: 12,
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionIcon: {
    padding: 8,
    borderRadius: 8,
  },
  healthScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreDetails: {
    flex: 1,
  },
  calendarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paymentsList: {
    gap: 12,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentAmount: {
    alignItems: 'flex-end',
    gap: 4,
  },
  payButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  goalsList: {
    gap: 16,
  },
  goalItem: {
    gap: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalProgress: {
    gap: 8,
  },
  goalAmounts: {
    flexDirection: 'row',
    gap: 4,
  },
  goalPercentage: {
    fontWeight: 'bold',
    position: 'absolute',
    right: 0,
    top: -20,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
  },
}); 