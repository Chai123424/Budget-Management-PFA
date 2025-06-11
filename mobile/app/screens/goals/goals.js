import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { COLORS } from '../theme/colors';

const GOAL_CATEGORIES = {
  SHORT: { label: 'Court terme', color: '#4CAF50', icon: 'timer' },
  MEDIUM: { label: 'Moyen terme', color: '#2196F3', icon: 'calendar-today' },
  LONG: { label: 'Long terme', color: '#9C27B0', icon: 'timeline' }
};

export default function GoalsScreen() {
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '0',
    category: 'SHORT',
    deadline: '',
  });

  useEffect(() => {
    loadGoals();
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du thème:', error);
    }
  };

  const loadGoals = async () => {
    try {
      const savedGoals = await AsyncStorage.getItem('goals');
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des objectifs:', error);
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

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.deadline) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const goalToAdd = {
      ...newGoal,
      id: Date.now().toString(),
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount || 0),
      createdAt: new Date().toISOString(),
    };

    const updatedGoals = [...goals, goalToAdd];
    saveGoals(updatedGoals);
    setModalVisible(false);
    setNewGoal({
      title: '',
      targetAmount: '',
      currentAmount: '0',
      category: 'SHORT',
      deadline: '',
    });
  };

  const handleUpdateProgress = (goalId, amount) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const newAmount = parseFloat(goal.currentAmount) + parseFloat(amount);
        return {
          ...goal,
          currentAmount: Math.min(newAmount, goal.targetAmount)
        };
      }
      return goal;
    });
    saveGoals(updatedGoals);
  };

  const calculateProgress = (current, target) => {
    return (current / target) * 100;
  };

  const theme = darkMode ? styles.dark : styles.light;

  const renderGoalCard = (goal) => {
    const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
    const category = GOAL_CATEGORIES[goal.category];

    return (
      <View key={goal.id} style={[styles.goalCard, theme.card]}>
        <View style={styles.goalHeader}>
          <MaterialIcons name={category.icon} size={24} color={category.color} />
          <Text style={[styles.goalTitle, theme.text]}>{goal.title}</Text>
          <Text style={[styles.goalCategory, theme.textSecondary]}>{category.label}</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: category.color }]} />
        </View>

        <View style={styles.goalDetails}>
          <Text style={[styles.goalAmount, theme.text]}>
            {goal.currentAmount}€ / {goal.targetAmount}€
          </Text>
          <Text style={[styles.goalDeadline, theme.textSecondary]}>
            Échéance: {new Date(goal.deadline).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.goalActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: category.color }]}
            onPress={() => handleUpdateProgress(goal.id, 100)}
          >
            <Text style={styles.actionButtonText}>Ajouter un progrès</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, theme.container]}>
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

        {goals.map(renderGoalCard)}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, theme.card]}>
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
              onChangeText={(text) => setNewGoal({...newGoal, targetAmount: text})}
            />

            <TextInput
              style={[styles.input, theme.text, { borderColor: theme === styles.dark ? COLORS.borderDark : COLORS.borderLight }]}
              placeholder="Date limite (YYYY-MM-DD)"
              placeholderTextColor={theme.textSecondary.color}
              value={newGoal.deadline}
              onChangeText={(text) => setNewGoal({...newGoal, deadline: text})}
            />

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

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, theme.card]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={theme.text}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddGoal}
              >
                <Text style={styles.modalButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  goalCategory: {
    fontSize: 14,
    opacity: 0.7,
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
    borderRadius: 4,
  },
  goalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  goalDeadline: {
    fontSize: 14,
    opacity: 0.7,
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
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