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
  KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus, Search, Trash2, Calendar, ChevronDown } from 'lucide-react-native';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { COLORS } from '../theme/colors';

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
    date: new Date().toISOString().slice(0, 10),
    description: "",
  });
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Charger les dépenses depuis AsyncStorage
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const savedExpenses = await AsyncStorage.getItem('expenses');
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
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

  const handleAddExpense = async () => {
    if (newExpense.title && newExpense.amount && newExpense.category) {
      const expense = {
        id: Date.now().toString(),
        title: newExpense.title,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        date: newExpense.date || new Date().toISOString().slice(0, 10),
        description: newExpense.description,
      };
      const updatedExpenses = [...expenses, expense];
      setExpenses(updatedExpenses);
      await saveExpenses(updatedExpenses);
      setNewExpense({
        title: "",
        amount: "",
        category: "",
        date: new Date().toISOString().slice(0, 10),
        description: "",
      });
      setShowAddModal(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    const updatedExpenses = expenses.filter((expense) => expense.id !== id);
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.icon : "📦";
  };

  const getCategoryLabel = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.label : "Autres";
  };

  const filteredExpenses = expenses
    .filter((expense) => {
      const matchesFilter = filter === "all" || expense.category === filter;
      const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMonth = expense.date.startsWith(selectedMonth);
      return matchesFilter && matchesSearch && matchesMonth;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const theme = darkMode ? styles.dark : styles.light;

  return (
    <View style={[styles.container, theme.container]}>
      <Header title="Dépenses" darkMode={darkMode} setDarkMode={setDarkMode} />

      <ScrollView style={styles.content}>
        {/* Search and Add Button */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, theme.card]}>
            <Search color={theme.textSecondary.color} size={20} />
            <TextInput
              placeholder="Rechercher..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={[styles.searchInput, theme.text]}
              placeholderTextColor={theme.textSecondary.color}
            />
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus color="white" size={24} />
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <View style={[styles.summaryCard, theme.card]}>
          <View>
            <Text style={theme.textSecondary}>Total des dépenses</Text>
            <Text style={[styles.totalAmount, theme.text]}>
              {totalExpenses.toFixed(2)} €
            </Text>
          </View>

          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, theme.card]}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Text style={theme.text}>
                {filter === "all" ? "Toutes" : getCategoryLabel(filter)}
              </Text>
              <ChevronDown size={20} color={theme.text.color} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, theme.card]}
              onPress={() => {
                // Implement date picker
              }}
            >
              <Calendar size={20} color={theme.text.color} />
              <Text style={theme.text}>{selectedMonth}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Expenses List */}
        <View style={styles.expensesList}>
          {filteredExpenses.length === 0 ? (
            <View style={[styles.emptyState, theme.card]}>
              <Text style={theme.textSecondary}>Aucune dépense trouvée</Text>
              <TouchableOpacity
                style={[styles.emptyStateButton, theme.card]}
                onPress={() => setShowAddModal(true)}
              >
                <Plus size={20} color={theme.text.color} />
                <Text style={theme.text}>Ajouter une dépense</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredExpenses.map((expense) => (
              <View key={expense.id} style={[styles.expenseItem, theme.card]}>
                <View style={styles.expenseIcon}>
                  <Text style={styles.categoryIcon}>
                    {getCategoryIcon(expense.category)}
                  </Text>
                </View>

                <View style={styles.expenseDetails}>
                  <Text style={[styles.expenseTitle, theme.text]}>
                    {expense.title}
                  </Text>
                  <View style={styles.expenseMetadata}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryLabel}>
                        {getCategoryLabel(expense.category)}
                      </Text>
                    </View>
                    <Text style={theme.textSecondary}>
                      {new Date(expense.date).toLocaleDateString()}
                    </Text>
                  </View>
                  {expense.description && (
                    <Text style={[styles.expenseDescription, theme.textSecondary]}>
                      {expense.description}
                    </Text>
                  )}
                </View>

                <View style={styles.expenseActions}>
                  <Text style={[styles.expenseAmount, theme.text]}>
                    {expense.amount.toFixed(2)} €
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteExpense(expense.id)}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Expense Modal */}
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
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, theme.text]}>
                Ajouter une dépense
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={styles.closeButton}
              >
                <Text style={theme.text}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, theme.text]}>Titre</Text>
                <TextInput
                  value={newExpense.title}
                  onChangeText={(text) => setNewExpense({ ...newExpense, title: text })}
                  placeholder="Ex: Courses alimentaires"
                  style={[styles.input, theme.card, theme.text]}
                  placeholderTextColor={theme.textSecondary.color}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, theme.text]}>Montant (€)</Text>
                <TextInput
                  value={newExpense.amount}
                  onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
                  placeholder="0.00"
                  keyboardType="numeric"
                  style={[styles.input, theme.card, theme.text]}
                  placeholderTextColor={theme.textSecondary.color}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, theme.text]}>Catégorie</Text>
                <TouchableOpacity
                  style={[styles.input, theme.card]}
                  onPress={() => setShowCategoryPicker(true)}
                >
                  <Text style={theme.text}>
                    {newExpense.category
                      ? `${getCategoryIcon(newExpense.category)} ${getCategoryLabel(
                          newExpense.category
                        )}`
                      : "Sélectionner une catégorie"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, theme.text]}>Date</Text>
                <TouchableOpacity
                  style={[styles.input, theme.card]}
                  onPress={() => {
                    // Implement date picker
                  }}
                >
                  <Text style={theme.text}>{newExpense.date}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, theme.text]}>Description (optionnel)</Text>
                <TextInput
                  value={newExpense.description}
                  onChangeText={(text) =>
                    setNewExpense({ ...newExpense, description: text })
                  }
                  placeholder="Ajouter une description..."
                  multiline
                  numberOfLines={4}
                  style={[styles.textArea, theme.card, theme.text]}
                  placeholderTextColor={theme.textSecondary.color}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.cancelButton, theme.card]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={theme.text}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddExpense}
              >
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, theme.card]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, theme.text]}>
                Sélectionner une catégorie
              </Text>
              <TouchableOpacity
                onPress={() => setShowCategoryPicker(false)}
                style={styles.closeButton}
              >
                <Text style={theme.text}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoryList}>
              <TouchableOpacity
                style={[styles.categoryItem, filter === "all" && styles.selectedCategory]}
                onPress={() => {
                  setFilter("all");
                  setShowCategoryPicker(false);
                }}
              >
                <Text style={theme.text}>🔄 Toutes les catégories</Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    filter === category.id && styles.selectedCategory,
                  ]}
                  onPress={() => {
                    setFilter(category.id);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={theme.text}>
                    {category.icon} {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
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
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
  },
  expensesList: {
    gap: 12,
  },
  expenseItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  expenseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
  },
  expenseDetails: {
    flex: 1,
    gap: 4,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  expenseMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  categoryLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  expenseDescription: {
    fontSize: 14,
  },
  expenseActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  modalForm: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  textArea: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryList: {
    padding: 16,
  },
  categoryItem: {
    padding: 16,
    borderRadius: 8,
  },
  selectedCategory: {
    backgroundColor: COLORS.primary + '20',
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