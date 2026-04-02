"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Search } from "lucide-react"

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

export default function Expenses({ darkMode }) {
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
        title: newExpense.title,
        amount: Number.parseFloat(newExpense.amount),
        category: newExpense.category,
        date: newExpense.date || new Date().toISOString().slice(0, 10),
        description: newExpense.description,
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
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div style={{ padding: "0", position: "relative", zIndex: 1 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: window.innerWidth < 768 ? "column" : "row",
          justifyContent: "space-between",
          alignItems: window.innerWidth < 768 ? "stretch" : "center",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <h1
          style={{
            fontSize: window.innerWidth < 768 ? "1.5rem" : "2rem",
            fontWeight: "700",
            margin: "0",
            color: "var(--text)",
          }}
        >
          Gestion des Dépenses
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: window.innerWidth < 640 ? "column" : "row",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", width: window.innerWidth < 640 ? "100%" : "16rem" }}>
            <Search
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                width: "1rem",
                height: "1rem",
                color: "var(--text-secondary)",
              }}
            />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem 0.5rem 2.5rem",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--card-bg)",
                color: "var(--text)",
                fontSize: "0.875rem",
                transition: "all 0.3s ease",
              }}
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(90deg, var(--primary), var(--primary-dark))",
              color: "white",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(138, 124, 255, 0.3)",
            }}
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: window.innerWidth < 1024 ? "column" : "row",
            justifyContent: "space-between",
            alignItems: window.innerWidth < 1024 ? "stretch" : "center",
            gap: "1rem",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "var(--text-secondary)",
                margin: "0 0 0.25rem 0",
              }}
            >
              Total des dépenses
            </h3>
            <p
              style={{
                fontSize: "1.875rem",
                fontWeight: "700",
                margin: "0",
                background: "linear-gradient(90deg, var(--primary), var(--primary-light))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {totalExpenses.toFixed(2)} DH
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--card-bg-light)",
                color: "var(--text)",
                fontSize: "0.875rem",
              }}
            >
              <option value="all">Toutes</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--card-bg-light)",
                color: "var(--text)",
                fontSize: "0.875rem",
              }}
            />
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filteredExpenses.length === 0 ? (
          <div
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "2rem",
              textAlign: "center",
              color: "var(--text-secondary)",
            }}
          >
            <p style={{ marginBottom: "1rem", fontSize: "1rem" }}>Aucune dépense trouvée</p>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                backgroundColor: "transparent",
                color: "var(--text)",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                margin: "0 auto",
              }}
            >
              <Plus size={16} />
              Ajouter une dépense
            </button>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem",
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "3rem",
                  height: "3rem",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(138, 124, 255, 0.2), rgba(138, 124, 255, 0.1))",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>{getCategoryIcon(expense.category)}</span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "var(--text)",
                    margin: "0 0 0.25rem 0",
                  }}
                >
                  {expense.title}
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.25rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.125rem 0.5rem",
                      borderRadius: "12px",
                      backgroundColor: "var(--primary)",
                      color: "white",
                      fontWeight: "500",
                    }}
                  >
                    {getCategoryLabel(expense.category)}
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {new Date(expense.date).toLocaleDateString()}
                  </span>
                </div>
                {expense.description && (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                      margin: "0.25rem 0 0 0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: window.innerWidth < 480 ? "normal" : "nowrap",
                    }}
                  >
                    {expense.description}
                  </p>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontWeight: "700",
                    color: "var(--text)",
                    whiteSpace: "nowrap",
                    fontSize: "1rem",
                  }}
                >
                  {expense.amount.toFixed(2)} DH
                </span>
                <button
                  onClick={() => handleDeleteExpense(expense.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "var(--accent)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "28rem",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "1.5rem 1.5rem 0.5rem 1.5rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "var(--text)",
                  margin: "0",
                }}
              >
                Ajouter une dépense
              </h2>
            </div>

            <div
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "var(--text)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Titre
                </label>
                <input
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  placeholder="Ex: Courses alimentaires"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card-bg-light)",
                    color: "var(--text)",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "var(--text)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Montant (DH)
                </label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card-bg-light)",
                    color: "var(--text)",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "var(--text)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Catégorie
                </label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card-bg-light)",
                    color: "var(--text)",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "var(--text)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Date
                </label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card-bg-light)",
                    color: "var(--text)",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "var(--text)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Description (optionnel)
                </label>
                <textarea
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="Ajouter une description..."
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card-bg-light)",
                    color: "var(--text)",
                    fontSize: "0.875rem",
                    minHeight: "5rem",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                padding: "0.5rem 1.5rem 1.5rem 1.5rem",
                borderTop: "1px solid var(--border)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
              }}
            >
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  backgroundColor: "transparent",
                  color: "var(--text)",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleAddExpense}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(90deg, var(--primary), var(--primary-dark))",
                  color: "white",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(138, 124, 255, 0.3)",
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
