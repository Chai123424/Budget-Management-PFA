import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { CreditCard, Wallet, DollarSign, ArrowUpRight, Lightbulb, Clock, ArrowDown, ArrowUp, Calendar, Target, AlertTriangle } from "lucide-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import Header from '../../component/Header';
import BottomNav from '../../component/BottomNav';
import { COLORS } from '../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';


export default function OverviewScreen() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [activeTip, setActiveTip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState(0);
  const [savingsBalance, setSavingsBalance] = useState(0);
  const [savedThisMonth, setSavedThisMonth] = useState(0);
  const [goals, setGoals] = useState([]);

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
    firstName: 'Guest',
    lastName: ''
  });

  const [recurringPayments, setRecurringPayments] = useState([
    { id: 1, title: 'Loyer', amount: 0, dueDay: 5, isPaid: false },
    { id: 2, title: 'Internet', amount: 29.99, dueDay: 15, isPaid: true },
    { id: 3, title: 'Transport', amount: 0, dueDay: 20, isPaid: false },
    { id: 4, title: 'Assurance', amount: 45, dueDay: 28, isPaid: true },
  ]);

  const [shortTermGoals, setShortTermGoals] = useState([
    { 
      id: 1, 
      title: "Fonds d'urgence", 
      target: 0, 
      current: 0,
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
    "Suivez vos dépenses quotidiennes - les petites économies s'accumulent !",
    "Fixez un budget hebdomadaire pour les loisirs pour éviter les dépenses excessives",
    "Utilisez les réductions étudiantes quand c'est possible - elles s'additionnent !",
    "Planifiez vos repas à l'avance pour réduire les dépenses de livraison",
    "Envisagez les manuels d'occasion pour économiser sur le matériel de cours",
    `Basé sur votre budget, essayez d'épargner au moins ${Math.round((budgetData.saved / (budgetData.totalIncome || 1)) * 100)}% chaque mois`,
    `Votre plus grosse dépense est ${
      Object.entries(expenseDetails)
        .sort(([,a], [,b]) => b - a)[0][0] === 'rent' ? 'le loyer' :
      Object.entries(expenseDetails)
        .sort(([,a], [,b]) => b - a)[0][0] === 'food' ? 'l\'alimentation' :
      Object.entries(expenseDetails)
        .sort(([,a], [,b]) => b - a)[0][0] === 'transport' ? 'le transport' :
      Object.entries(expenseDetails)
        .sort(([,a], [,b]) => b - a)[0][0] === 'tuitionAmount' ? 'les frais de scolarité' : 'autre'
    } (${Math.round((Object.entries(expenseDetails).sort(([,a], [,b]) => b - a)[0][1] / (budgetData.totalExpenses || 1)) * 100)}% des dépenses)`,
    `Conseil personnalisé: ${
      budgetData.saved < 0 ? "Vos dépenses dépassent votre budget. Essayez de réduire les dépenses non essentielles." :
      budgetData.saved < (budgetData.totalIncome * 0.1) ? "Vous épargnez moins de 10% de vos revenus. Essayez d'identifier des domaines où vous pourriez réduire vos dépenses." :
      budgetData.saved < (budgetData.totalIncome * 0.2) ? "Bon début ! Vous épargnez plus de 10% de vos revenus. Continuez ainsi !" :
      "Excellent ! Vous avez un très bon taux d'épargne. Pensez à diversifier vos investissements."
    }`,
    `${
      expenseDetails.food > (budgetData.totalIncome * 0.3) ? "Vos dépenses alimentaires semblent élevées. Envisagez de cuisiner plus souvent à la maison." :
      expenseDetails.transport > (budgetData.totalIncome * 0.2) ? "Vos frais de transport sont significatifs. Explorez les options de transport en commun ou de covoiturage." :
      expenseDetails.rent > (budgetData.totalIncome * 0.4) ? "Votre loyer représente une part importante de votre budget. Envisagez la colocation ou un logement moins cher si possible." :
      "Votre répartition des dépenses est équilibrée. Continuez à suivre votre budget !"
    }`
  ];

const loadBudgetData = useCallback(async () => {
  if (loading) return;
  
  setLoading(true);
  try {
    const API_BASE_URL = 'http://10.0.2.2:5000/api';
    
    // Charger les informations utilisateur
    const localUserData = await AsyncStorage.getItem('userData');
    if (localUserData) {
      const user = JSON.parse(localUserData);
      setUserInfo({
        firstName: user.name || user.firstName || 'Guest',
        lastName: user.lastName || ''
      });
    }

    // Charger les données du formulaire budgétaire
    const localBudgetData = await AsyncStorage.getItem('budgetFormData');
    let budgetFormData = localBudgetData ? JSON.parse(localBudgetData) : {};

    // Charger les dépenses individuelles ajoutées
    const savedExpenses = await AsyncStorage.getItem('expenses');
    const individualExpenses = savedExpenses ? JSON.parse(savedExpenses) : [];

    // Calculer les totaux par catégorie à partir des dépenses individuelles
    const expenseTotals = individualExpenses.reduce((totals, expense) => {
      const amount = parseFloat(expense.amount) || 0;
      switch (expense.category) {
        case 'Loyer':
          totals.rent += amount;
          break;
        case 'Alimentation':
          totals.food += amount;
          break;
        case 'Transport':
          totals.transport += amount;
          break;
        case 'Frais de scolarité':
          totals.tuitionAmount += amount;
          break;
        default:
          totals.other += amount;
          break;
      }
      return totals;
    }, { rent: 0, food: 0, transport: 0, tuitionAmount: 0, other: 0 });

    // Fusionner avec les données du formulaire
    const combinedData = {
      budget: parseFloat(budgetFormData.budget) || 0,
      hasTuition: budgetFormData.hasTuition || false,
      rent: (parseFloat(budgetFormData.rent) || 0) + expenseTotals.rent,
      food: (parseFloat(budgetFormData.food) || 0) + expenseTotals.food,
      transport: (parseFloat(budgetFormData.transport) || 0) + expenseTotals.transport,
      tuitionAmount: (parseFloat(budgetFormData.tuitionAmount) || 0) + expenseTotals.tuitionAmount,
      other: (parseFloat(budgetFormData.other) || 0) + expenseTotals.other,
      saved: parseFloat(budgetFormData.saved) || 0
    };

    // Calculer les totaux
    const totalExpenses = combinedData.rent + combinedData.food + combinedData.transport + 
                         combinedData.tuitionAmount + combinedData.other;
    const remaining = Math.max(0, combinedData.budget - totalExpenses);

    // Mettre à jour l'affichage
    setBudgetData({
      spent: totalExpenses,
      saved: combinedData.saved,
      budget: combinedData.budget,
      totalExpenses: totalExpenses,
      totalIncome: combinedData.budget,
      remaining: remaining
    });

    setExpenseDetails({
      rent: combinedData.rent,
      food: combinedData.food,
      transport: combinedData.transport,
      tuitionAmount: combinedData.tuitionAmount,
      other: combinedData.other
    });

    // Sauvegarder les données combinées pour l'Overview
    await AsyncStorage.setItem('budgetData', JSON.stringify({
      spent: totalExpenses,
      saved: combinedData.saved,
      budget: combinedData.budget,
      totalExpenses: totalExpenses,
      totalIncome: combinedData.budget,
      remaining: remaining
    }));

    // Essayer de synchroniser avec le serveur
    const token = await AsyncStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/get_budget_data`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const serverData = await response.json();
          
          // Utiliser les données du serveur comme base et ajouter les dépenses locales
          const serverFormattedData = {
            budget: serverData.monthlyBudget || 0,
            hasTuition: serverData.hasTuition || false,
            rent: (serverData.expenses?.rent || 0) + expenseTotals.rent,
            food: (serverData.expenses?.food || 0) + expenseTotals.food,
            transport: (serverData.expenses?.transport || 0) + expenseTotals.transport,
            tuitionAmount: (serverData.tuitionAmount || 0) + expenseTotals.tuitionAmount,
            other: expenseTotals.other,
          };

          updateBudgetDisplay(serverFormattedData);
        }
      } catch (serverError) {
        console.log('Utilisation des données locales uniquement');
      }
    }

    // Charger les soldes
    const mainBalanceStr = await AsyncStorage.getItem('mainBalance');
    const savingsBalanceStr = await AsyncStorage.getItem('savingsBalance');
    const goalsStr = await AsyncStorage.getItem('goals');

    setBudget(parseFloat(mainBalanceStr) || 0);
    setSavingsBalance(parseFloat(savingsBalanceStr) || 0);
    setGoals(JSON.parse(goalsStr) || []);

  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
  } finally {
    setLoading(false);
  }
}, [loading]);

  // Fonction pour mettre à jour l'affichage avec les données
const updateBudgetDisplay = (data) => {
  const monthlyBudget = parseFloat(data.budget) || 0;
  const rent = parseFloat(data.rent) || 0;
  const food = parseFloat(data.food) || 0;
  const transport = parseFloat(data.transport) || 0;
  const tuitionAmount = parseFloat(data.tuitionAmount) || 0;
  const other = parseFloat(data.other) || 0;
  
  const totalExpenses = rent + food + transport + other;
  const totalSpent = totalExpenses + tuitionAmount;
  const remaining = monthlyBudget - totalSpent;
  
  setBudgetData({
    spent: totalSpent,
    saved: remaining > 0 ? remaining : 0,
    budget: monthlyBudget,
    totalExpenses: totalSpent,
    totalIncome: monthlyBudget,
    remaining: remaining
  });

  setExpenseDetails({
    rent: rent,
    food: food,
    transport: transport,
    tuitionAmount: tuitionAmount,
    other: other
  });

  // Mettre à jour les paiements récurrents
  setRecurringPayments(prev => prev.map(payment => {
    if (payment.title === 'Loyer') return { ...payment, amount: rent };
    if (payment.title === 'Transport') return { ...payment, amount: transport };
    return payment;
  }));

  // Mettre à jour les objectifs à court terme
  setShortTermGoals(prev => prev.map(goal => {
    if (goal.title === "Fonds d'urgence") {
      return { 
        ...goal, 
        target: monthlyBudget * 3, 
        current: remaining > 0 ? remaining : 0 
      };
    }
    return goal;
  }));
};


  // Charger les données quand l'écran devient visible
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        await loadBudgetData();
      };
      fetchData();
      
      // Cette fonction sera appelée quand l'écran perd le focus
      return () => {
        // Cleanup si nécessaire
      };
    }, [])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTip((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [expenseDetails, budgetData]); 

  const theme = darkMode ? styles.dark : styles.light;

  const percentRemaining = budgetData.budget > 0 ? Math.round((budgetData.remaining / budgetData.budget) * 100) : 0;
  const percentSpent = budgetData.budget > 0 ? Math.round((budgetData.spent / budgetData.budget) * 100) : 0;

  // Fonction pour calculer les tendances (simulation)
  const calculateTrend = (current, category) => {
    const lastMonthData = {
      spent: current * 1.12, 
      saved: current * 0.92  
    };
    
    if (category === 'spent') {
      const difference = ((lastMonthData.spent - current) / (lastMonthData.spent || 1)) * 100;
      return Math.round(difference);
    } else if (category === 'saved') {
      const difference = ((current - lastMonthData.saved) / (lastMonthData.saved || 1)) * 100;
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

  const handleRefresh = async () => {
    await loadBudgetData();
    Alert.alert('Actualisé', 'Les données ont été mises à jour');
  };

  const calculateTotalProgress = () => {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => {
      const progress = (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100;
      return sum + progress;
    }, 0);
    return (totalProgress / goals.length).toFixed(1);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Charger le budget depuis le formulaire
      const budgetData = await AsyncStorage.getItem('budget');
      if (budgetData) {
        const parsedBudget = JSON.parse(budgetData);
        setBudget(parseFloat(parsedBudget.amount) || 0);
        setSavedThisMonth(parseFloat(parsedBudget.saved) || 0);
      }

      // Charger le compte épargne et les objectifs
      const savingsBalanceStr = await AsyncStorage.getItem('savingsBalance');
      const goalsStr = await AsyncStorage.getItem('goals');

      setSavingsBalance(parseFloat(savingsBalanceStr) || 0);
      setGoals(JSON.parse(goalsStr) || []);
    } catch (error) {
      console.error('Error loading data:', error);
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
          onPress={handleRefresh}
          disabled={loading}
        >
          <Text style={theme.text}>
            {loading ? '🔄 Chargement...' : '🔄 Actualiser les données'}
          </Text>
        </TouchableOpacity>

        {/* Expense Distribution */}
        <View style={[styles.sectionCard, theme.card]}>
          <Text style={[styles.sectionTitle, theme.text]}>Distribution des dépenses</Text>
          <View style={styles.expenseDistribution}>
            <View style={styles.expenseCategory}>
              <View style={[styles.categoryBar, { 
                height: budgetData.totalExpenses > 0 ? `${(expenseDetails.rent / budgetData.totalExpenses) * 100}%` : '0%', 
                backgroundColor: COLORS.primary 
              }]} />
              <Text style={theme.textSecondary}>Loyer</Text>
              <Text style={theme.text}>
                {budgetData.totalExpenses > 0 ? Math.round((expenseDetails.rent / budgetData.totalExpenses) * 100) : 0}%
              </Text>
            </View>
            <View style={styles.expenseCategory}>
              <View style={[styles.categoryBar, { 
                height: budgetData.totalExpenses > 0 ? `${(expenseDetails.food / budgetData.totalExpenses) * 100}%` : '0%', 
                backgroundColor: COLORS.success 
              }]} />
              <Text style={theme.textSecondary}>Nourriture</Text>
              <Text style={theme.text}>
                {budgetData.totalExpenses > 0 ? Math.round((expenseDetails.food / budgetData.totalExpenses) * 100) : 0}%
              </Text>
            </View>
            <View style={styles.expenseCategory}>
              <View style={[styles.categoryBar, { 
                height: budgetData.totalExpenses > 0 ? `${(expenseDetails.transport / budgetData.totalExpenses) * 100}%` : '0%', 
                backgroundColor: COLORS.warning 
              }]} />
              <Text style={theme.textSecondary}>Transport</Text>
              <Text style={theme.text}>
                {budgetData.totalExpenses > 0 ? Math.round((expenseDetails.transport / budgetData.totalExpenses) * 100) : 0}%
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={[styles.sectionCard, theme.card]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, theme.text]}>Transactions récentes</Text>
            <TouchableOpacity onPress={() => router.push('../expenses/expenses')}>
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
                {budgetData.budget > 0 ? Math.round((budgetData.saved / budgetData.budget) * 100) : 0}
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
                        width: goal.target > 0 ? `${Math.min((goal.current / goal.target) * 100, 100)}%` : '0%',
                        backgroundColor: getPriorityColor(goal.priority)
                      }
                    ]} />
                  </View>
                  <View style={styles.goalAmounts}>
                    <Text style={theme.text}>{goal.current} €</Text>
                    <Text style={theme.textSecondary}>/ {goal.target} €</Text>
                  </View>
                  <Text style={[styles.goalPercentage, { color: getPriorityColor(goal.priority) }]}>
                    {goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.balanceSection}>
          <View style={[styles.balanceCard, theme.card]}>
            <View style={styles.balanceHeader}>
              <MaterialIcons name="account-balance-wallet" size={24} color={COLORS.primary} />
              <Text style={[styles.balanceTitle, theme.text]}>Budget Disponible</Text>
            </View>
            <Text style={[styles.balanceAmount, theme.text]}>{budget.toFixed(2)} DH</Text>
          </View>

          <View style={[styles.balanceCard, theme.card]}>
            <View style={styles.balanceHeader}>
              <MaterialIcons name="savings" size={24} color={COLORS.primary} />
              <Text style={[styles.balanceTitle, theme.text]}>Épargne Totale</Text>
            </View>
            <Text style={[styles.balanceAmount, theme.text]}>{savingsBalance.toFixed(2)} DH</Text>
          </View>
        </View>

        <View style={[styles.monthlySavingsCard, theme.card]}>
          <View style={styles.monthlySavingsHeader}>
            <MaterialIcons name="calendar-today" size={24} color={COLORS.primary} />
            <Text style={[styles.monthlySavingsTitle, theme.text]}>Épargné ce mois-ci</Text>
          </View>
          <Text style={[styles.monthlySavingsAmount, theme.text]}>{savedThisMonth.toFixed(2)} DH</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min((savedThisMonth / budget) * 100, 100)}%` }
              ]} 
            />
          </View>
        </View>

        <View style={[styles.goalsOverview, theme.card]}>
          <View style={styles.goalsHeader}>
            <MaterialIcons name="flag" size={24} color={COLORS.primary} />
            <Text style={[styles.sectionTitle, theme.text]}>Objectifs d'épargne</Text>
          </View>
          
          <View style={styles.goalsStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, theme.textSecondary]}>Objectifs actifs</Text>
              <Text style={[styles.statValue, theme.text]}>{goals.length}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, theme.textSecondary]}>Progression moyenne</Text>
              <Text style={[styles.statValue, theme.text]}>{calculateTotalProgress()}%</Text>
            </View>
          </View>

          {goals.map(goal => (
            <View key={goal.id} style={styles.goalItem}>
              <View style={styles.goalInfo}>
                <Text style={[styles.goalTitle, theme.text]}>{goal.title}</Text>
                <Text style={[styles.goalProgress, theme.textSecondary]}>
                  {parseFloat(goal.currentAmount).toFixed(2)} / {parseFloat(goal.targetAmount).toFixed(2)} DH
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${Math.min((parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100, 100)}%` }
                  ]} 
                />
              </View>
            </View>
          ))}
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
    minHeight: 10, // Hauteur minimale pour la visibilité
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
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  balanceCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  goalsOverview: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  goalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  goalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  monthlySavingsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  monthlySavingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthlySavingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  monthlySavingsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
}); 