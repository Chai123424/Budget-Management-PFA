import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Header from '../../component/Header';
import BottomNav from '../../component/BottomNav';
import { COLORS } from '../theme/colors';
import { Picker } from '@react-native-picker/picker';


// Configuration du calendrier en français
LocaleConfig.locales['fr'] = {
  monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  today: "Aujourd'hui"
};
LocaleConfig.defaultLocale = 'fr';

const GOAL_CATEGORIES = {
  SHORT: { label: 'Court terme', color: '#4CAF50', icon: 'timer', maxMonths: 6 },
  MEDIUM: { label: 'Moyen terme', color: '#2196F3', icon: 'calendar-today', maxMonths: 24 },
  LONG: { label: 'Long terme', color: '#9C27B0', icon: 'timeline', maxMonths: 120 }
};

const SAVING_FREQUENCIES = {
  DAILY: { label: 'Par jour', divider: 365 },
  WEEKLY: { label: 'Par semaine', divider: 52 },
  BIWEEKLY: { label: 'Toutes les 2 semaines', divider: 26 },
  MONTHLY: { label: 'Par mois', divider: 12 },
  QUARTERLY: { label: 'Par trimestre', divider: 4 },
  YEARLY: { label: 'Par année', divider: 1 }
};

const SAVING_METHODS = {
  AUTOMATIC: { label: 'Prélèvement automatique', icon: 'account-balance' },
  MANUAL: { label: 'Dépôt manuel', icon: 'payments' },
  ALERTS: { label: 'Alertes de versement', icon: 'notifications' }
};

export default function GoalsScreen() {
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '0',
    category: 'SHORT',
    deadline: new Date(),
    monthlySavingsNeeded: '0',
    savingFrequency: 'MONTHLY',
    savingMethod: 'MANUAL',
    savingsByFrequency: {
      WEEKLY: '0',
      MONTHLY: '0',
      QUARTERLY: '0',
      YEARLY: '0'
    }
  });
  const [budget, setBudget] = useState(0);
  const [savingsBalance, setSavingsBalance] = useState(0);
  const [savedThisMonth, setSavedThisMonth] = useState(0);

  const theme = darkMode ? styles.dark : styles.light;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await loadGoals();
      await loadBalances();
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadGoals = async () => {
    try {
      const savedGoals = await AsyncStorage.getItem('goals');
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals);
        setGoals(parsedGoals);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const loadBalances = async () => {
    try {
      // Charger le budget depuis budgetFormData
      const budgetFormDataStr = await AsyncStorage.getItem('budgetFormData');
      const expensesStr = await AsyncStorage.getItem('expenses');
      
      if (budgetFormDataStr) {
        const formData = JSON.parse(budgetFormDataStr);
        const individualExpenses = expensesStr ? JSON.parse(expensesStr) : [];

        // Calculer le total des dépenses du formulaire
        const formExpenses = (
          parseFloat(formData.rent || 0) +
          parseFloat(formData.food || 0) +
          parseFloat(formData.transport || 0) +
          (formData.hasTuition === 'yes' ? parseFloat(formData.tuitionAmount || 0) : 0)
        );

        // Calculer le total des dépenses individuelles
        const totalIndividualExpenses = individualExpenses.reduce((total, expense) => {
          return total + parseFloat(expense.amount || 0);
        }, 0);

        // Le budget disponible est le budget initial moins toutes les dépenses
        const budgetInitial = parseFloat(formData.budget) || 0;
        const totalExpenses = formExpenses + totalIndividualExpenses;
        const budgetDisponible = Math.max(0, budgetInitial - totalExpenses);
        
        setBudget(budgetDisponible);
        setSavedThisMonth(parseFloat(formData.saved) || 0);
      }

      // Charger le compte épargne
      const savingsBalanceStr = await AsyncStorage.getItem('savingsBalance');
      setSavingsBalance(parseFloat(savingsBalanceStr) || 0);
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  };

  const loadMonthlySavings = async () => {
    try {
      const savedData = await AsyncStorage.getItem('monthlySavings');
      if (savedData) {
        const { amount, month } = JSON.parse(savedData);
        const currentMonth = new Date().getMonth();
        
        // Réinitialiser si c'est un nouveau mois
        if (month !== currentMonth) {
          await AsyncStorage.setItem('monthlySavings', JSON.stringify({
            amount: 0,
            month: currentMonth
          }));
          setMonthlySavings(0);
        } else {
          setMonthlySavings(parseFloat(amount) || 0);
        }
      } else {
        // Initialiser les données si elles n'existent pas
        await AsyncStorage.setItem('monthlySavings', JSON.stringify({
          amount: 0,
          month: new Date().getMonth()
        }));
        setMonthlySavings(0);
      }
    } catch (error) {
      console.error('Error loading monthly savings:', error);
    }
  };

  const saveGoals = async (updatedGoals) => {
    try {
      await AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));
      setGoals(updatedGoals);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des objectifs:', error);
    }
  };

  const calculateMonthlySavings = (target, deadline, current = 0) => {
    const today = new Date();
    const months = (new Date(deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    if (months <= 0) return 0;
    
    const remaining = parseFloat(target) - parseFloat(current);
    return (remaining / months).toFixed(2);
  };

  const calculateSavingsByFrequency = (targetAmount, currentAmount, deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysRemaining = Math.max(1, Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24)));
    const amountRemaining = targetAmount - currentAmount;

    const savingsByFrequency = {};
    Object.entries(SAVING_FREQUENCIES).forEach(([key, { divider }]) => {
      const periodsRemaining = Math.ceil(daysRemaining / (365 / divider));
      const amountPerPeriod = (amountRemaining / periodsRemaining).toFixed(2);
      savingsByFrequency[key] = amountPerPeriod;
    });

    return savingsByFrequency;
  };

  const handleDateChange = (date) => {
    const savingsByFrequency = calculateSavingsByFrequency(
      parseFloat(newGoal.targetAmount) || 0,
      parseFloat(newGoal.currentAmount) || 0,
      date.dateString
    );

    setNewGoal(prev => ({
      ...prev,
      deadline: new Date(date.dateString),
      savingsByFrequency
    }));
  };

  const handleTargetAmountChange = (text) => {
    const savingsByFrequency = calculateSavingsByFrequency(
      parseFloat(text) || 0,
      parseFloat(newGoal.currentAmount) || 0,
      newGoal.deadline
    );

    setNewGoal(prev => ({
      ...prev,
      targetAmount: text,
      savingsByFrequency
    }));
  };

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.targetAmount) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs requis');
      return;
    }

    const goalToAdd = {
      ...newGoal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    try {
      const updatedGoals = [...goals, goalToAdd];
      await AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));
      setGoals(updatedGoals);
      setModalVisible(false);
      resetNewGoal();
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder l\'objectif');
    }
  };

  const handleUpdateGoal = async (goalId, amount) => {
    try {
      const updatedGoals = goals.map(goal => {
        if (goal.id === goalId) {
          const currentAmount = parseFloat(goal.currentAmount) + parseFloat(amount);
          const targetAmount = parseFloat(goal.targetAmount);
          
          // Check if goal is completed
          if (currentAmount >= targetAmount) {
            // Remove the goal if completed
            return null;
          }
          
          return {
            ...goal,
            currentAmount: currentAmount.toString()
          };
        }
        return goal;
      }).filter(Boolean); // Remove null values (completed goals)

      await AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));
      setGoals(updatedGoals);

      // Show completion message if goal was removed
      if (updatedGoals.length < goals.length) {
        Alert.alert('Félicitations !', 'Objectif atteint !');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour l\'objectif');
    }
  };

  const calculateProgress = (current, target) => {
    return (current / target) * 100;
  };

  const getCalendarTheme = (isDark) => ({
    backgroundColor: 'transparent',
    calendarBackground: isDark ? '#1e293b' : '#ffffff',
    textSectionTitleColor: isDark ? '#cbd5e1' : '#64748b',
    selectedDayBackgroundColor: COLORS.primary,
    selectedDayTextColor: '#ffffff',
    todayTextColor: COLORS.primary,
    dayTextColor: isDark ? '#f8fafc' : '#0f172a',
    textDisabledColor: isDark ? '#475569' : '#94a3b8',
    dotColor: COLORS.primary,
    monthTextColor: isDark ? '#f8fafc' : '#0f172a',
    arrowColor: COLORS.primary,
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14,
    'stylesheet.calendar.header': {
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
      },
      monthText: {
        fontSize: 18,
        fontWeight: 'bold',
      },
      arrow: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: isDark ? '#2d3748' : '#f1f5f9',
      },
      week: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#2d3748' : '#e2e8f0',
      },
      dayHeader: {
        width: 32,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
      },
    },
    'stylesheet.calendar.main': {
      week: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 8,
      },
      day: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
      },
      dayText: {
        fontSize: 16,
      },
    }
  });

  const handleTransferToSavings = async (goalId, amount) => {
    try {
      // Charger le budget et les dépenses
      const budgetFormDataStr = await AsyncStorage.getItem('budgetFormData');
      const expensesStr = await AsyncStorage.getItem('expenses');
      
      if (!budgetFormDataStr) {
        Alert.alert('Erreur', 'Impossible de charger le budget');
        return false;
      }

      const formData = JSON.parse(budgetFormDataStr);
      const individualExpenses = expensesStr ? JSON.parse(expensesStr) : [];
      
      // Calculer le total des dépenses du formulaire
      const formExpenses = (
        parseFloat(formData.rent || 0) +
        parseFloat(formData.food || 0) +
        parseFloat(formData.transport || 0) +
        (formData.hasTuition === 'yes' ? parseFloat(formData.tuitionAmount || 0) : 0)
      );

      // Calculer le total des dépenses individuelles
      const totalIndividualExpenses = individualExpenses.reduce((total, expense) => {
        return total + parseFloat(expense.amount || 0);
      }, 0);

      // Calculer le budget disponible
      const budgetInitial = parseFloat(formData.budget) || 0;
      const totalExpenses = formExpenses + totalIndividualExpenses;
      const budgetDisponible = Math.max(0, budgetInitial - totalExpenses);

      // Vérifier si le montant est disponible
      if (budgetDisponible < amount) {
        Alert.alert(
          'Solde insuffisant',
          `Votre budget disponible est de ${budgetDisponible.toFixed(2)} DH. Il vous manque ${(amount - budgetDisponible).toFixed(2)} DH pour effectuer ce transfert.`
        );
        return false;
      }

      // Mettre à jour le budget et le montant sauvegardé
      const newBudgetAmount = budgetInitial - amount;
      const newSavedAmount = parseFloat(formData.saved || 0) + amount;
      const updatedFormData = {
        ...formData,
        budget: newBudgetAmount,
        saved: newSavedAmount
      };

      // Sauvegarder les modifications dans budgetFormData
      await AsyncStorage.setItem('budgetFormData', JSON.stringify(updatedFormData));
      setBudget(Math.max(0, newBudgetAmount - totalExpenses));
      setSavedThisMonth(newSavedAmount);

      // Mettre à jour le compte épargne
      const newSavingsBalance = savingsBalance + amount;
      await AsyncStorage.setItem('savingsBalance', newSavingsBalance.toString());
      setSavingsBalance(newSavingsBalance);

      // Mettre à jour les données de l'Overview
      const overviewDataStr = await AsyncStorage.getItem('budgetData');
      let overviewData = overviewDataStr ? JSON.parse(overviewDataStr) : {
        spent: 0,
        saved: 0,
        budget: budgetInitial,
        totalExpenses: 0,
        totalIncome: budgetInitial,
        remaining: budgetInitial
      };

      overviewData = {
        ...overviewData,
        saved: (parseFloat(overviewData.saved) || 0) + amount,
        remaining: Math.max(0, (parseFloat(overviewData.remaining) || 0) - amount)
      };

      await AsyncStorage.setItem('budgetData', JSON.stringify(overviewData));

      // Mise à jour de l'objectif
      const updatedGoals = goals.map(goal => {
        if (goal.id === goalId) {
          const currentAmount = parseFloat(goal.currentAmount) + amount;
          const targetAmount = parseFloat(goal.targetAmount);
          
          if (currentAmount >= targetAmount) {
            Alert.alert('Félicitations !', 'Objectif atteint !');
            return null;
          }
          
          return {
            ...goal,
            currentAmount: currentAmount.toString()
          };
        }
        return goal;
      }).filter(Boolean);

      await AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));
      setGoals(updatedGoals);

      Alert.alert('Succès', `Transfert de ${amount.toFixed(2)} DH effectué avec succès !`);
      return true;
    } catch (error) {
      console.error('Error updating goal:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour l\'objectif');
      return false;
    }
  };

  const renderGoalCard = (goal) => {
    const targetAmount = parseFloat(goal.targetAmount);
    const currentAmount = parseFloat(goal.currentAmount);
    const progress = (currentAmount / targetAmount) * 100;
    const remainingAmount = targetAmount - currentAmount;
    
    // Calculer le montant à épargner selon la fréquence
    const today = new Date();
    const deadline = new Date(goal.deadline);
    const daysRemaining = Math.max(1, Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)));
    const amountPerDay = remainingAmount / daysRemaining;
    
    const savingAmount = {
      DAILY: amountPerDay,
      WEEKLY: amountPerDay * 7,
      BIWEEKLY: amountPerDay * 14,
      MONTHLY: amountPerDay * 30,
      QUARTERLY: amountPerDay * 90,
      YEARLY: amountPerDay * 365
    }[goal.savingFrequency];

    return (
      <View key={goal.id} style={[styles.goalCard, theme.card]}>
        <View style={styles.goalHeader}>
          <Text style={[styles.goalTitle, theme.text]}>{goal.title}</Text>
          <Text style={[styles.goalAmount, theme.text]}>
            {currentAmount.toFixed(2)} / {targetAmount.toFixed(2)} DH
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${Math.min(progress, 100)}%` }
            ]} 
          />
        </View>

        <View style={styles.goalDetails}>
          <Text style={[styles.detailText, theme.text]}>
            Prochain versement ({SAVING_FREQUENCIES[goal.savingFrequency].label}):
          </Text>
          <Text style={[styles.amountText, theme.text]}>{savingAmount.toFixed(2)} DH</Text>
          {budget < savingAmount && (
            <Text style={[styles.warningText, theme.text]}>
              Il vous manque {(savingAmount - budget).toFixed(2)} DH pour effectuer ce versement
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.transferButton,
            budget < savingAmount && styles.transferButtonDisabled
          ]}
          onPress={() => handleTransferToSavings(goal.id, savingAmount)}
          disabled={budget < savingAmount}
        >
          <Text style={styles.transferButtonText}>
            {budget < savingAmount ? 'Budget insuffisant' : 'Transférer maintenant'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const resetNewGoal = () => {
    setNewGoal({
      title: '',
      targetAmount: '',
      currentAmount: '0',
      category: 'SHORT',
      deadline: new Date(),
      monthlySavingsNeeded: '0',
      savingFrequency: 'MONTHLY',
      savingMethod: 'MANUAL',
      savingsByFrequency: {
        WEEKLY: '0',
        MONTHLY: '0',
        QUARTERLY: '0',
        YEARLY: '0'
      }
    });
  };

  const renderFrequencySelector = () => (
    <View style={styles.savingsInfo}>
      <Text style={[styles.sectionTitle, theme.text]}>Fréquence d'épargne</Text>
      <View style={[styles.pickerContainer, { backgroundColor: theme === styles.dark ? '#2d2d2d' : '#ffffff' }]}>
        <Picker
          selectedValue={newGoal.savingFrequency}
          onValueChange={(itemValue) => setNewGoal(prev => ({
            ...prev,
            savingFrequency: itemValue
          }))}
          style={[styles.picker, { color: theme === styles.dark ? '#ffffff' : '#000000' }]}
          dropdownIconColor={theme === styles.dark ? '#ffffff' : '#000000'}
        >
          {Object.entries(SAVING_FREQUENCIES).map(([key, value]) => (
            <Picker.Item 
              key={key} 
              label={`${value.label} (${parseFloat(newGoal.savingsByFrequency[key] || 0).toFixed(2)}€)`} 
              value={key} 
            />
          ))}
        </Picker>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, theme.container]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      <Header title="Objectifs" darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, theme.text]}>Mes objectifs financiers</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceContainer}>
          <View style={[styles.balanceCard, theme.card]}>
            <Text style={[styles.balanceLabel, theme.text]}>Budget Disponible</Text>
            <Text style={[styles.balanceAmount, theme.text]}>{budget.toFixed(2)} DH</Text>
          </View>
          <View style={[styles.balanceCard, theme.card]}>
            <Text style={[styles.balanceLabel, theme.text]}>Épargne Totale</Text>
            <Text style={[styles.balanceAmount, theme.text]}>{savingsBalance.toFixed(2)} DH</Text>
          </View>
        </View>

        {goals.map(renderGoalCard)}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={[styles.modalContent, theme.card]}>
            <Text style={[styles.modalTitle, theme.text]}>Nouvel objectif</Text>

            <TextInput
              style={[styles.input, theme.text, { borderColor: theme === styles.dark ? COLORS.borderDark : COLORS.borderLight }]}
              placeholder="Titre de l'objectif"
              placeholderTextColor={theme.textSecondary.color}
              value={newGoal.title}
              onChangeText={(text) => setNewGoal({...newGoal, title: text})}
            />

            <TextInput
              style={[styles.input, theme.text, { borderColor: theme === styles.dark ? COLORS.borderDark : COLORS.borderLight }]}
              placeholder="Montant cible (€)"
              placeholderTextColor={theme.textSecondary.color}
              keyboardType="numeric"
              value={newGoal.targetAmount}
              onChangeText={handleTargetAmountChange}
            />

            <View style={styles.calendarContainer}>
              <Text style={[styles.sectionTitle, theme.text]}>Date objectif</Text>
              <View style={[styles.calendarWrapper, theme.card]}>
                <Calendar
                  current={newGoal.deadline.toISOString()}
                  minDate={new Date().toISOString()}
                  onDayPress={handleDateChange}
                  markedDates={{
                    [newGoal.deadline.toISOString().split('T')[0]]: {
                      selected: true,
                      selectedColor: GOAL_CATEGORIES[newGoal.category].color,
                      selectedTextColor: '#ffffff'
                    }
                  }}
                  theme={{
                    ...getCalendarTheme(darkMode),
                    textDayFontSize: 14,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 12,
                    dayTextColor: theme === styles.dark ? '#f8fafc' : '#0f172a',
                    calendarBackground: theme === styles.dark ? '#1e293b' : '#ffffff',
                  }}
                  enableSwipeMonths={true}
                />
              </View>
            </View>

            {renderFrequencySelector()}

            <View style={styles.categoryButtons}>
              {Object.entries(GOAL_CATEGORIES).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.categoryButton,
                    { borderColor: theme === styles.dark ? COLORS.borderDark : COLORS.borderLight },
                    newGoal.category === key && { backgroundColor: value.color }
                  ]}
                  onPress={() => setNewGoal({...newGoal, category: key})}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    theme.text,
                    newGoal.category === key && { color: 'white' }
                  ]}>
                    {value.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleAddGoal}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <BottomNav activeTab="goals" darkMode={darkMode} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  goalDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transferButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  transferButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  categoryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  cancelButtonText: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#22c55e',
  },
  saveButtonText: {
    color: 'white',
  },
  light: {
    container: {
      backgroundColor: '#f5f5f5',
    },
    text: {
      color: '#1a1a1a',
    },
    textSecondary: {
      color: '#666666',
    },
    card: {
      backgroundColor: '#ffffff',
    },
  },
  dark: {
    container: {
      backgroundColor: '#1a1a1a',
    },
    text: {
      color: '#ffffff',
    },
    textSecondary: {
      color: '#a3a3a3',
    },
    card: {
      backgroundColor: '#2d2d2d',
    },
  },
  calendarContainer: {
    marginVertical: 12,
  },
  calendarWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  savingsInfo: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  savingsBreakdown: {
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
  },
  savingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  savingsAmount: {
    fontSize: 14,
    marginVertical: 2,
  },
  lateText: {
    color: '#ef4444',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  balanceCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  warningText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  transferButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
}); 