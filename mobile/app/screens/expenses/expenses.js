import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Alert,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus, Search, Trash2, Calendar, ChevronDown } from 'lucide-react-native';
import Header from '../../component/Header';
import BottomNav from '../../component/BottomNav';
import { COLORS } from '../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';

// Catégories de dépenses prédéfinies
const categories = [
  { id: "food", label: "Nourriture", icon: "🍔" },
  { id: "transport", label: "Transport", icon: "🚌" },
  { id: "housing", label: "Logement", icon: "🏠" },
  { id: "education", label: "Éducation", icon: "📚" },
  { id: "entertainment", label: "Loisirs", icon: "🎮" },
  { id: "health", label: "Santé", icon: "💊" },
  { id: "other", label: "Autres", icon: "📦" },
];

export default function ExpensesScreen() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
  });
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split('T')[0].substring(0, 7));
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Charger les dépenses depuis AsyncStorage
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadBudgetDataFromServer = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
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
            budget: data.monthlyBudget || 0,
            hasTuition: data.hasTuition || false,
            tuitionAmount: data.tuitionAmount || 0,
            rent: data.expenses?.rent || 0,
            food: data.expenses?.food || 0,
            transport: data.expenses?.transport || 0,
          };

          // Sauvegarder les données dans AsyncStorage
          await AsyncStorage.setItem('budgetFormData', JSON.stringify(formattedData));
          await AsyncStorage.setItem('budgetAnalysis', JSON.stringify(data.analysis || {}));

          // Mettre à jour l'état local
          setExpenses([
            {
              category: 'Loyer',
              amount: formattedData.rent,
              icon: 'home',
              color: '#FF6B6B'
            },
            {
              category: 'Alimentation',
              amount: formattedData.food,
              icon: 'restaurant',
              color: '#4CAF50'
            },
            {
              category: 'Transport',
              amount: formattedData.transport,
              icon: 'directions-bus',
              color: '#2196F3'
            },
            {
              category: 'Frais de scolarité',
              amount: formattedData.tuitionAmount,
              icon: 'school',
              color: '#9C27B0'
            }
          ].filter(expense => expense.amount > 0));

          return formattedData;
        } else {
          console.error('Erreur lors de la récupération des données:', response.status);
          return null;
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données du serveur:', error);
      return null;
    }
  };

  const loadExpenses = async () => {
    try {
      // D'abord essayer de charger depuis le serveur
      const serverData = await loadBudgetDataFromServer();
      
      if (!serverData) {
        // Si pas de données du serveur, essayer de charger depuis le stockage local
        const savedExpenses = await AsyncStorage.getItem('expenses');
        if (savedExpenses) {
          setExpenses(JSON.parse(savedExpenses));
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des dépenses:', error);
    }
  };

  // Sauvegarder les dépenses dans AsyncStorage
  const saveExpenses = async (newExpenses) => {
    try {
      await AsyncStorage.setItem('expenses', JSON.stringify(newExpenses));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des dépenses:', error);
    }
  };

  const handleAddExpense = () => {
    if (!newExpense.category || !newExpense.amount) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const expenseToAdd = {
      id: Date.now().toString(),
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      icon: getCategoryIcon(newExpense.category),
      color: getCategoryColor(newExpense.category)
    };

    setExpenses(prev => [...prev, expenseToAdd]);
    setShowAddModal(false);
    setNewExpense({
      title: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split('T')[0],
      description: ""
    });
  };

  const handleDeleteExpense = async (id) => {
    const updatedExpenses = expenses.filter((expense) => expense.id !== id);
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
  };

  const getCategoryIcon = (category) => {
    const categoryMap = {
      'Loyer': 'home',
      'Alimentation': 'restaurant',
      'Transport': 'directions-bus',
      'Frais de scolarité': 'school',
      'Loisirs': 'local-activity',
      'Shopping': 'shopping-cart',
      'Santé': 'local-hospital',
      'Autres': 'more-horiz'
    };
    return categoryMap[category] || 'more-horiz';
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'Loyer': '#FF6B6B',
      'Alimentation': '#4CAF50',
      'Transport': '#2196F3',
      'Frais de scolarité': '#9C27B0',
      'Loisirs': '#FF9800',
      'Shopping': '#E91E63',
      'Santé': '#00BCD4',
      'Autres': '#607D8B'
    };
    return colorMap[category] || '#607D8B';
  };

  const getCategoryLabel = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.label : "Autres";
  };

  // Filtrer les dépenses en fonction de la recherche
  const getFilteredExpenses = () => {
    let filtered = [...expenses];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(expense => {
        const matchesSearch = expense.category.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      });
    }

    // Filtre par catégorie
    if (filter !== "all") {
      filtered = filtered.filter(expense => expense.category.toLowerCase() === filter.toLowerCase());
    }

    // Filtre par mois - on ne filtre plus par mois car les dépenses n'ont plus de dates
    // if (selectedMonth) {
    //   filtered = filtered.filter(expense => {
    //     const expenseDate = new Date(expense.date);
    //     return expenseDate.toISOString().slice(0, 7) === selectedMonth;
    //   });
    // }

    return filtered;
  };

  const filteredExpenses = getFilteredExpenses();

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const theme = darkMode ? styles.dark : styles.light;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return '';
    }
  };

  return (
    <View style={[styles.container, theme.container]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
      <Header 
        title="Dépenses" 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
      />

      <View style={styles.content}>
        {/* Filtres */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filtersContainer}
        >
          {[
            {id: "all", label: "Tout"},
            {id: "Loyer", label: "Loyer"},
            {id: "Alimentation", label: "Alim."},
            {id: "Transport", label: "Transport"},
            {id: "Frais de scolarité", label: "Scolarité"},
            {id: "Loisirs", label: "Loisirs"},
            {id: "Shopping", label: "Shopping"},
            {id: "Santé", label: "Santé"},
            {id: "Autres", label: "Autres"}
          ].map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterButton,
                filter === category.id && styles.activeFilter,
                { backgroundColor: filter === category.id ? getCategoryColor(category.id) : theme.card.backgroundColor }
              ]}
              onPress={() => setFilter(category.id)}
            >
              <Text style={[
                styles.filterText,
                filter === category.id ? styles.activeFilterText : theme.text
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Liste des dépenses */}
        <ScrollView style={styles.expensesList}>
          {filteredExpenses.map((expense) => (
            <View 
              key={expense.id || `${expense.category}-${Date.now()}-${Math.random()}`}
              style={[styles.expenseCard, theme.card]}
            >
              <View style={styles.expenseHeader}>
                <View style={styles.expenseInfo}>
                  <View style={[styles.categoryIcon, { backgroundColor: expense.color + '20' }]}>
                    <MaterialIcons name={expense.icon} size={24} color={expense.color} />
                  </View>
                  <View style={styles.expenseDetails}>
                    <Text style={theme.text}>{expense.category}</Text>
                    <Text style={theme.textSecondary}>
                      {formatDate(expense.date)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.expenseAmount, theme.text]}>
                  {expense.amount.toFixed(2)} €
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Bouton d'ajout */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>

        {/* Modal d'ajout de dépense */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={[styles.modalContent, theme.card]}>
              <Text style={[styles.modalTitle, theme.text]}>Nouvelle dépense</Text>

              <TouchableOpacity
                style={[styles.categorySelector, theme.card]}
                onPress={() => setShowCategoryPicker(true)}
              >
                <Text style={theme.text}>
                  {newExpense.category || "Sélectionner une catégorie"}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={darkMode ? "#fff" : "#000"} />
              </TouchableOpacity>

              <TextInput
                style={[styles.input, theme.card, theme.text]}
                placeholder="Montant"
                placeholderTextColor={darkMode ? "#666" : "#999"}
                keyboardType="numeric"
                value={newExpense.amount}
                onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.buttonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleAddExpense}
                >
                  <Text style={styles.buttonText}>Ajouter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Modal de sélection de catégorie */}
        <Modal
          visible={showCategoryPicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCategoryPicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, theme.card]}>
              <Text style={[styles.modalTitle, theme.text]}>Choisir une catégorie</Text>
              <ScrollView style={styles.categoryList}>
                {["Loyer", "Alimentation", "Transport", "Frais de scolarité", "Loisirs", "Shopping", "Santé", "Autres"].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryItem,
                      newExpense.category === category && styles.selectedCategory
                    ]}
                    onPress={() => {
                      setNewExpense({ ...newExpense, category });
                      setShowCategoryPicker(false);
                    }}
                  >
                    <View style={styles.categoryItemContent}>
                      <MaterialIcons 
                        name={getCategoryIcon(category)} 
                        size={24} 
                        color={getCategoryColor(category)} 
                      />
                      <Text style={[styles.categoryItemText, theme.text]}>{category}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCategoryPicker(false)}
              >
                <Text style={styles.buttonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>

      <BottomNav activeTab="expenses" darkMode={darkMode} />
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
  filtersContainer: {
    marginBottom: 8,
    paddingHorizontal: 4,
    height: 32,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
    minWidth: 50,
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  activeFilterText: {
    color: 'white',
  },
  expensesList: {
    flex: 0,
  },
  expenseCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryList: {
    marginBottom: 20,
  },
  categoryItem: {
    padding: 16,
    borderRadius: 8,
  },
  selectedCategory: {
    backgroundColor: COLORS.primary + '20',
  },
  categoryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryItemText: {
    fontSize: 16,
    marginLeft: 12,
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
    },
  },
}); 