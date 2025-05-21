"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Search } from 'lucide-react'
import "../css/Expenses.css"

// Catégories de dépenses prédéfinies
const categories = [
  { id: "food", label: "Nourriture", icon: "🍔" },
  { id: "transport", label: "Transport", icon: "🚌" },
  { id: "housing", label: "Logement", icon: "🏠" },
  { id: "education", label: "Éducation", icon: "📚" },
  { id: "entertainment", label: "Loisirs", icon: "🎮" },
  { id: "health", label: "Santé", icon: "💊" },
  { id: "other", label: "Autres", icon: "📦" },
]

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
    description: "",
  })
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  // Charger les dépenses depuis le localStorage
  useEffect(() => {
    const savedExpenses = localStorage.getItem("expenses")
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses))
    }
  }, [])

  // Sauvegarder les dépenses dans le localStorage
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses))
  }, [expenses])

  const handleAddExpense = () => {
    if (newExpense.title && newExpense.amount && newExpense.category) {
      const expense = {
        id: Date.now(),
        ...newExpense,
        amount: Number.parseFloat(newExpense.amount),
        date: newExpense.date || new Date().toISOString().slice(0, 10),
      }
      setExpenses([...expenses, expense])
      setNewExpense({
        title: "",
        amount: "",
        category: "",
        date: "",
        description: "",
      })
      setShowAddModal(false)
    }
  }

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter((expense) => expense.id !== id))
  }

  const getCategoryIcon = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.icon : "📦"
  }

  const getCategoryLabel = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.label : "Autres"
  }

  const filteredExpenses = expenses
    .filter((expense) => {
      const matchesFilter = filter === "all" || expense.category === filter
      const matchesSearch =
        expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesMonth = expense.date.startsWith(selectedMonth)
      return matchesFilter && matchesSearch && matchesMonth
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="expenses-container">
      <div className="expenses-header">
        <h1>Gestion des Dépenses</h1>

        <div className="expenses-actions">
          <div className="search-bar">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="add-button" onClick={() => setShowAddModal(true)}>
            <Plus className="button-icon" />
            Ajouter
          </button>
        </div>
      </div>

      <div className="expenses-summary">
        <div className="summary-card">
          <div className="summary-content">
            <div>
              <h3>Total des dépenses</h3>
              <p className="total-amount">{totalExpenses.toFixed(2)} €</p>
            </div>
            <div className="filters">
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">Toutes</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>

              <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="expenses-list">
        {filteredExpenses.length === 0 ? (
          <div className="no-expenses">
            <p>Aucune dépense trouvée</p>
            <button className="add-button outline" onClick={() => setShowAddModal(true)}>
              <Plus className="button-icon" />
              Ajouter une dépense
            </button>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <div key={expense.id} className="expense-card">
              <div className="expense-icon">
                <span>{getCategoryIcon(expense.category)}</span>
              </div>

              <div className="expense-details">
                <h3>{expense.title}</h3>
                <div className="expense-meta">
                  <span className="category-badge">{getCategoryLabel(expense.category)}</span>
                  <span className="expense-date">{new Date(expense.date).toLocaleDateString()}</span>
                </div>
                {expense.description && <p className="expense-description">{expense.description}</p>}
              </div>

              <div className="expense-actions">
                <span className="expense-amount">{expense.amount.toFixed(2)} €</span>
                <button className="delete-button" onClick={() => handleDeleteExpense(expense.id)}>
                  <Trash2 className="button-icon" />
                  <span className="sr-only">Supprimer</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal d'ajout de dépense */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Ajouter une dépense</h2>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="title">Titre</label>
                <input
                  id="title"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  placeholder="Ex: Courses alimentaires"
                />
              </div>
              <div className="form-group">
                <label htmlFor="amount">Montant (€)</label>
                <input
                  id="amount"
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Catégorie</label>
                <select
                  id="category"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description (optionnel)</label>
                <textarea
                  id="description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="Ajouter une description..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowAddModal(false)}>
                Annuler
              </button>
              <button className="save-button" onClick={handleAddExpense}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
