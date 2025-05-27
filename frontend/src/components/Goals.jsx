"use client"

import { useState } from "react"
import { Plus, Target, TrendingUp, Calendar, DollarSign, Award, Edit, Trash2, CheckCircle } from 'lucide-react'
import "../css/Goals.css"

const mockGoals = [
  {
    id: "1",
    title: "Emergency Fund",
    description: "Build an emergency fund for unexpected expenses",
    targetAmount: 1000,
    currentAmount: 650,
    category: "savings",
    deadline: "2024-12-31",
    priority: "high",
    isCompleted: false,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "New Laptop",
    description: "Save for a new laptop for studies",
    targetAmount: 800,
    currentAmount: 320,
    category: "savings",
    deadline: "2024-08-15",
    priority: "medium",
    isCompleted: false,
    createdAt: "2024-02-01",
  },
  {
    id: "3",
    title: "Monthly Food Budget",
    description: "Keep food expenses under budget",
    targetAmount: 300,
    currentAmount: 180,
    category: "expense",
    deadline: "2024-06-30",
    priority: "medium",
    isCompleted: false,
    createdAt: "2024-06-01",
  },
  {
    id: "4",
    title: "Summer Vacation",
    description: "Save for summer vacation trip",
    targetAmount: 1200,
    currentAmount: 1200,
    category: "savings",
    deadline: "2024-07-01",
    priority: "low",
    isCompleted: true,
    createdAt: "2024-01-01",
  },
]

export default function GoalsPage() {
  const [goals, setGoals] = useState(mockGoals)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [editingGoal, setEditingGoal] = useState(null)

  const filteredGoals = goals.filter((goal) => selectedCategory === "all" || goal.category === selectedCategory)

  const completedGoals = goals.filter((goal) => goal.isCompleted).length
  const totalGoals = goals.length
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "var(--student-error)"
      case "medium":
        return "var(--student-warning)"
      case "low":
        return "var(--student-success)"
      default:
        return "var(--student-primary)"
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case "savings":
        return <Target className="w-5 h-5" />
      case "expense":
        return <TrendingUp className="w-5 h-5" />
      case "income":
        return <DollarSign className="w-5 h-5" />
      default:
        return <Target className="w-5 h-5" />
    }
  }

  return (
    <div className="goals-container">
      {/* Header */}
      <div className="goals-header">
        <div className="header-content">
          <h1>Financial Goals</h1>
          <p>Track your progress and achieve your financial dreams</p>
        </div>
        <button className="add-goal-btn" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Add Goal
        </button>
      </div>

      {/* Summary Stats */}
      <div className="goals-summary">
        <div className="summary-card">
          <div className="summary-icon achievement">
            <Award className="w-6 h-6" />
          </div>
          <div className="summary-content">
            <h3>Goals Completed</h3>
            <div className="summary-value">
              {completedGoals}/{totalGoals}
            </div>
            <div className="summary-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(completedGoals / totalGoals) * 100}%` }} />
              </div>
              <span className="progress-text">{Math.round((completedGoals / totalGoals) * 100)}% Complete</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon savings">
            <Target className="w-6 h-6" />
          </div>
          <div className="summary-content">
            <h3>Total Progress</h3>
            <div className="summary-value">${totalCurrentAmount.toLocaleString()}</div>
            <div className="summary-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(totalCurrentAmount / totalTargetAmount) * 100}%` }}
                />
              </div>
              <span className="progress-text">of ${totalTargetAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon trending">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="summary-content">
            <h3>Active Goals</h3>
            <div className="summary-value">{goals.filter((g) => !g.isCompleted).length}</div>
            <div className="summary-progress">
              <span className="progress-text">Goals in progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <button
          className={`filter-btn ${selectedCategory === "all" ? "active" : ""}`}
          onClick={() => setSelectedCategory("all")}
        >
          All Goals
        </button>
        <button
          className={`filter-btn ${selectedCategory === "savings" ? "active" : ""}`}
          onClick={() => setSelectedCategory("savings")}
        >
          <Target className="w-4 h-4" />
          Savings
        </button>
        <button
          className={`filter-btn ${selectedCategory === "expense" ? "active" : ""}`}
          onClick={() => setSelectedCategory("expense")}
        >
          <TrendingUp className="w-4 h-4" />
          Expenses
        </button>
        <button
          className={`filter-btn ${selectedCategory === "income" ? "active" : ""}`}
          onClick={() => setSelectedCategory("income")}
        >
          <DollarSign className="w-4 h-4" />
          Income
        </button>
      </div>

      {/* Goals Grid */}
      <div className="goals-grid">
        {filteredGoals.map((goal) => (
          <div key={goal.id} className={`goal-card ${goal.isCompleted ? "completed" : ""}`}>
            <div className="goal-header">
              <div className="goal-category">
                {getCategoryIcon(goal.category)}
                <span className="category-text">{goal.category}</span>
              </div>
              <div className="goal-actions">
                <button
                  className="action-btn edit"
                  onClick={() => {
                    setEditingGoal(goal)
                    setIsModalOpen(true)
                  }}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button className="action-btn delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="goal-content">
              <h3 className="goal-title">{goal.title}</h3>
              <p className="goal-description">{goal.description}</p>

              <div className="goal-progress">
                <div className="progress-header">
                  <span className="progress-amount">
                    ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                  </span>
                  <span className="progress-percentage">
                    {Math.round(getProgressPercentage(goal.currentAmount, goal.targetAmount))}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${getProgressPercentage(goal.currentAmount, goal.targetAmount)}%`,
                      backgroundColor: goal.isCompleted ? "var(--student-success)" : "var(--student-primary)",
                    }}
                  />
                </div>
              </div>

              <div className="goal-meta">
                <div className="goal-deadline">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                </div>
                <div className="goal-priority" style={{ color: getPriorityColor(goal.priority) }}>
                  <div className="priority-dot" style={{ backgroundColor: getPriorityColor(goal.priority) }} />
                  {goal.priority} priority
                </div>
              </div>

              {goal.isCompleted && (
                <div className="completion-badge">
                  <CheckCircle className="w-5 h-5" />
                  <span>Goal Achieved!</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredGoals.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Target className="w-16 h-16" />
          </div>
          <h3>No goals found</h3>
          <p>Start by creating your first financial goal to track your progress.</p>
          <button className="add-goal-btn" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-5 h-5" />
            Create Your First Goal
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingGoal ? "Edit Goal" : "Create New Goal"}</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingGoal(null)
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Goal Title</label>
                <input type="text" placeholder="e.g., Emergency Fund" defaultValue={editingGoal?.title || ""} />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="Describe your goal..." defaultValue={editingGoal?.description || ""} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Target Amount</label>
                  <input type="number" placeholder="1000" defaultValue={editingGoal?.targetAmount || ""} />
                </div>
                <div className="form-group">
                  <label>Current Amount</label>
                  <input type="number" placeholder="0" defaultValue={editingGoal?.currentAmount || ""} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select defaultValue={editingGoal?.category || "savings"}>
                    <option value="savings">Savings</option>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select defaultValue={editingGoal?.priority || "medium"}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Deadline</label>
                <input type="date" defaultValue={editingGoal?.deadline || ""} />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingGoal(null)
                }}
              >
                Cancel
              </button>
              <button className="save-btn">{editingGoal ? "Update Goal" : "Create Goal"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}