"use client"

import { useState, useEffect } from "react"
import "../css/Savings.css"
import {
  Plus,
  Wallet,
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  Filter,
  Download,
} from "lucide-react"

// Modifier la valeur par défaut de darkMode à true pour que l'interface soit sombre par défaut
const Savings = ({ darkMode = true }) => {
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [currentAccount, setCurrentAccount] = useState(null)
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false)
  const [transactionAccount, setTransactionAccount] = useState(null)
  const [filterPeriod, setFilterPeriod] = useState("all")

  const [formData, setFormData] = useState({
    name: "",
    balance: "",
    accountType: "checking",
    interestRate: "",
    color: "#6366f1",
    icon: "wallet",
  })

  const [transactionData, setTransactionData] = useState({
    amount: "",
    type: "deposit",
    description: "",
    date: new Date().toISOString().slice(0, 10),
  })

  // Types de comptes disponibles
  const accountTypes = [
    { id: "checking", label: "Compte Courant", icon: "credit-card" },
    { id: "savings", label: "Livret A", icon: "wallet" },
    { id: "investment", label: "Investissement", icon: "trending-up" },
    { id: "other", label: "Autre", icon: "dollar-sign" },
  ]

  // Couleurs disponibles pour les comptes
  const accountColors = [
    "#6366f1", // Indigo
    "#8b5cf6", // Violet
    "#ec4899", // Rose
    "#f59e0b", // Ambre
    "#10b981", // Émeraude
    "#3b82f6", // Bleu
    "#ef4444", // Rouge
  ]

  // Charger les comptes et transactions depuis localStorage
  useEffect(() => {
    const savedAccounts = localStorage.getItem("savingsAccounts")
    const savedTransactions = localStorage.getItem("savingsTransactions")

    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts))
    } else {
      // Comptes par défaut pour la démo
      const defaultAccounts = [
        {
          id: 1,
          name: "Compte Étudiant",
          balance: 1250.75,
          accountType: "checking",
          interestRate: 0,
          color: "#6366f1",
          icon: "credit-card",
        },
        {
          id: 2,
          name: "Livret A",
          balance: 3000,
          accountType: "savings",
          interestRate: 3,
          color: "#10b981",
          icon: "wallet",
        },
      ]
      setAccounts(defaultAccounts)
      localStorage.setItem("savingsAccounts", JSON.stringify(defaultAccounts))
    }

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    } else {
      // Transactions par défaut pour la démo
      const defaultTransactions = [
        {
          id: 1,
          accountId: 1,
          amount: 750,
          type: "deposit",
          description: "Bourse du mois",
          date: "2023-09-05",
        },
        {
          id: 2,
          accountId: 1,
          amount: 250.75,
          type: "deposit",
          description: "Job étudiant",
          date: "2023-09-15",
        },
        {
          id: 3,
          accountId: 1,
          amount: 45.5,
          type: "withdrawal",
          description: "Courses alimentaires",
          date: "2023-09-18",
        },
        {
          id: 4,
          accountId: 2,
          amount: 3000,
          type: "deposit",
          description: "Économies initiales",
          date: "2023-08-01",
        },
      ]
      setTransactions(defaultTransactions)
      localStorage.setItem("savingsTransactions", JSON.stringify(defaultTransactions))
    }
  }, [])

  // Sauvegarder les comptes et transactions dans localStorage
  useEffect(() => {
    if (accounts.length > 0) {
      localStorage.setItem("savingsAccounts", JSON.stringify(accounts))
    }
  }, [accounts])

  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem("savingsTransactions", JSON.stringify(transactions))
    }
  }, [transactions])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleTransactionInputChange = (e) => {
    const { name, value } = e.target
    setTransactionData({ ...transactionData, [name]: value })
  }

  const handleAddAccount = () => {
    if (!formData.name || formData.balance === "") {
      alert("Veuillez remplir le nom et le solde du compte.")
      return
    }

    const newAccount = {
      id: Date.now(),
      name: formData.name,
      balance: Number.parseFloat(formData.balance),
      accountType: formData.accountType,
      interestRate: Number.parseFloat(formData.interestRate) || 0,
      color: formData.color,
      icon: getAccountTypeIcon(formData.accountType),
    }

    setAccounts([...accounts, newAccount])
    resetForm()
    setShowModal(false)
  }

  const handleEditAccount = () => {
    if (!formData.name || formData.balance === "") {
      alert("Veuillez remplir le nom et le solde du compte.")
      return
    }

    const updatedAccounts = accounts.map((account) =>
      account.id === currentAccount.id
        ? {
            ...account,
            name: formData.name,
            balance: Number.parseFloat(formData.balance),
            accountType: formData.accountType,
            interestRate: Number.parseFloat(formData.interestRate) || 0,
            color: formData.color,
            icon: getAccountTypeIcon(formData.accountType),
          }
        : account,
    )

    setAccounts(updatedAccounts)
    resetForm()
    setShowModal(false)
    setCurrentAccount(null)
  }

  const handleDeleteAccount = (id) => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer ce compte ? Toutes les transactions associées seront également supprimées.",
      )
    ) {
      setAccounts(accounts.filter((account) => account.id !== id))
      setTransactions(transactions.filter((transaction) => transaction.accountId !== id))
    }
  }

  const handleAddTransaction = () => {
    if (!transactionData.amount || !transactionData.type || !transactionAccount) {
      alert("Veuillez remplir tous les champs obligatoires.")
      return
    }

    const amount = Number.parseFloat(transactionData.amount)

    if (amount <= 0) {
      alert("Le montant doit être supérieur à zéro.")
      return
    }

    const newTransaction = {
      id: Date.now(),
      accountId: transactionAccount.id,
      amount: amount,
      type: transactionData.type,
      description: transactionData.description,
      date: transactionData.date || new Date().toISOString().slice(0, 10),
    }

    // Mettre à jour le solde du compte
    const updatedAccounts = accounts.map((account) => {
      if (account.id === transactionAccount.id) {
        let newBalance = account.balance
        if (transactionData.type === "deposit") {
          newBalance += amount
        } else {
          newBalance -= amount
        }
        return { ...account, balance: newBalance }
      }
      return account
    })

    setTransactions([...transactions, newTransaction])
    setAccounts(updatedAccounts)
    resetTransactionForm()
    setShowAddTransactionModal(false)
    setTransactionAccount(null)
  }

  const openAddModal = () => {
    setCurrentAccount(null)
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (account) => {
    setCurrentAccount(account)
    setFormData({
      name: account.name,
      balance: account.balance.toString(),
      accountType: account.accountType,
      interestRate: account.interestRate.toString(),
      color: account.color,
      icon: account.icon,
    })
    setShowModal(true)
  }

  const openAddTransactionModal = (account) => {
    setTransactionAccount(account)
    resetTransactionForm()
    setShowAddTransactionModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
    setCurrentAccount(null)
  }

  const closeTransactionModal = () => {
    setShowAddTransactionModal(false)
    resetTransactionForm()
    setTransactionAccount(null)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      balance: "",
      accountType: "checking",
      interestRate: "",
      color: "#6366f1",
      icon: "wallet",
    })
  }

  const resetTransactionForm = () => {
    setTransactionData({
      amount: "",
      type: "deposit",
      description: "",
      date: new Date().toISOString().slice(0, 10),
    })
  }

  const getAccountTypeIcon = (type) => {
    const accountType = accountTypes.find((t) => t.id === type)
    return accountType ? accountType.icon : "wallet"
  }

  const getAccountTypeLabel = (type) => {
    const accountType = accountTypes.find((t) => t.id === type)
    return accountType ? accountType.label : "Autre"
  }

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "wallet":
        return <Wallet size={24} />
      case "credit-card":
        return <CreditCard size={24} />
      case "trending-up":
        return <TrendingUp size={24} />
      case "dollar-sign":
        return <DollarSign size={24} />
      default:
        return <Wallet size={24} />
    }
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  const getFilteredTransactions = () => {
    let filtered = [...transactions]

    if (filterPeriod !== "all") {
      const today = new Date()
      const startDate = new Date()

      if (filterPeriod === "week") {
        startDate.setDate(today.getDate() - 7)
      } else if (filterPeriod === "month") {
        startDate.setMonth(today.getMonth() - 1)
      } else if (filterPeriod === "year") {
        startDate.setFullYear(today.getFullYear() - 1)
      }

      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return transactionDate >= startDate
      })
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  const getAccountById = (id) => {
    return accounts.find((account) => account.id === id)
  }

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" }
    return new Date(dateString).toLocaleDateString("fr-FR", options)
  }

  const filteredTransactions = getFilteredTransactions()

  return (
    <div className={`savings-container ${darkMode ? "dark-theme" : "light-theme"}`}>
      <div className="savings-header">
        <h1>Mes Comptes</h1>
        <button className="add-account-btn" onClick={openAddModal}>
          <Plus size={20} />
          Ajouter un compte
        </button>
      </div>

      <div className="savings-summary">
        <div className="summary-card total-card">
          <h3>Solde Total</h3>
          <p className="amount">{totalBalance.toFixed(2)} DH</p>
          <div className="sparkline">
            <div className="sparkline-bar" style={{ height: "60%" }}></div>
            <div className="sparkline-bar" style={{ height: "40%" }}></div>
            <div className="sparkline-bar" style={{ height: "70%" }}></div>
            <div className="sparkline-bar" style={{ height: "50%" }}></div>
            <div className="sparkline-bar" style={{ height: "80%" }}></div>
            <div className="sparkline-bar" style={{ height: "65%" }}></div>
            <div className="sparkline-bar" style={{ height: "90%" }}></div>
          </div>
        </div>
        <div className="summary-card">
          <h3>Comptes</h3>
          <p className="count">{accounts.length}</p>
          <div className="account-types">
            {accountTypes.slice(0, 3).map((type) => (
              <span key={type.id} className="account-type-badge">
                {type.label}
              </span>
            ))}
          </div>
        </div>
        <div className="summary-card">
          <h3>Dernière Transaction</h3>
          {filteredTransactions.length > 0 ? (
            <>
              <p className="last-transaction">
                {filteredTransactions[0].type === "deposit" ? "+" : "-"}
                {filteredTransactions[0].amount.toFixed(2)} DH
              </p>
              <p className="transaction-date">
                <Clock size={14} />
                {formatDate(filteredTransactions[0].date)}
              </p>
            </>
          ) : (
            <p className="no-transactions">Aucune transaction</p>
          )}
        </div>
      </div>

      <div className="accounts-section">
        <h2>Mes Comptes d'Épargne</h2>
        <div className="accounts-list">
          {accounts.length === 0 ? (
            <div className="no-accounts">
              <p>Vous n'avez pas encore de compte d'épargne.</p>
              <button className="add-first-account-btn" onClick={openAddModal}>
                <Plus size={20} />
                Ajouter votre premier compte
              </button>
            </div>
          ) : (
            accounts.map((account) => (
              <div key={account.id} className="account-card">
                <div className="account-icon" style={{ backgroundColor: `${account.color}20`, color: account.color }}>
                  {getIconComponent(account.icon)}
                </div>
                <div className="account-details">
                  <h3>{account.name}</h3>
                  <p className="account-type">{getAccountTypeLabel(account.accountType)}</p>
                  {account.interestRate > 0 && (
                    <p className="interest-rate">
                      <TrendingUp size={14} />
                      {account.interestRate}% d'intérêt
                    </p>
                  )}
                </div>
                <div className="account-balance">
                  <p className="balance-amount">{account.balance.toFixed(2)} DH</p>
                  <div className="account-actions">
                    <button className="transaction-btn" onClick={() => openAddTransactionModal(account)}>
                      <Plus size={16} />
                      Transaction
                    </button>
                    <button className="edit-btn" onClick={() => openEditModal(account)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteAccount(account.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="transactions-section">
        <div className="transactions-header">
          <h2>Historique des Transactions</h2>
          <div className="transactions-filter">
            <Filter size={16} />
            <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)} className="filter-select">
              <option value="all">Toutes les périodes</option>
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="year">12 derniers mois</option>
            </select>
            <button className="export-btn">
              <Download size={16} />
              Exporter
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="no-transactions-message">
            <p>Aucune transaction pour la période sélectionnée.</p>
          </div>
        ) : (
          <div className="transactions-list">
            {filteredTransactions.map((transaction) => {
              const account = getAccountById(transaction.accountId)
              return (
                <div key={transaction.id} className="transaction-item">
                  <div
                    className="transaction-icon"
                    style={{
                      backgroundColor: account ? `${account.color}20` : "#6366f120",
                      color: account ? account.color : "#6366f1",
                    }}
                  >
                    {transaction.type === "deposit" ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div className="transaction-details">
                    <h4>{transaction.description || (transaction.type === "deposit" ? "Dépôt" : "Retrait")}</h4>
                    <p className="transaction-account">{account ? account.name : "Compte inconnu"}</p>
                    <p className="transaction-date">{formatDate(transaction.date)}</p>
                  </div>
                  <div className={`transaction-amount ${transaction.type === "deposit" ? "deposit" : "withdrawal"}`}>
                    {transaction.type === "deposit" ? "+" : "-"}
                    {transaction.amount.toFixed(2)} DH
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal d'ajout/modification de compte */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{currentAccount ? "Modifier le compte" : "Ajouter un compte"}</h2>
            <div className="form-group">
              <label>Nom du compte</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex: Compte Étudiant"
              />
            </div>
            <div className="form-group">
              <label>Solde actuel (€)</label>
              <input
                type="number"
                name="balance"
                value={formData.balance}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Type de compte</label>
              <select name="accountType" value={formData.accountType} onChange={handleInputChange}>
                {accountTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Taux d'intérêt (% annuel)</label>
              <input
                type="number"
                name="interestRate"
                value={formData.interestRate}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Couleur</label>
              <div className="color-picker">
                {accountColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${formData.color === color ? "selected" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeModal}>
                Annuler
              </button>
              <button className="save-btn" onClick={currentAccount ? handleEditAccount : handleAddAccount}>
                {currentAccount ? "Sauvegarder les modifications" : "Ajouter le compte"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout de transaction */}
      {showAddTransactionModal && transactionAccount && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Ajouter une transaction</h2>
            <p className="modal-subtitle">Compte: {transactionAccount.name}</p>

            <div className="form-group">
              <label>Type de transaction</label>
              <div className="transaction-type-selector">
                <button
                  type="button"
                  className={`type-option ${transactionData.type === "deposit" ? "selected" : ""}`}
                  onClick={() => setTransactionData({ ...transactionData, type: "deposit" })}
                >
                  <ArrowUpRight size={20} />
                  Dépôt
                </button>
                <button
                  type="button"
                  className={`type-option ${transactionData.type === "withdrawal" ? "selected" : ""}`}
                  onClick={() => setTransactionData({ ...transactionData, type: "withdrawal" })}
                >
                  <ArrowDownRight size={20} />
                  Retrait
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Montant (€)</label>
              <input
                type="number"
                name="amount"
                value={transactionData.amount}
                onChange={handleTransactionInputChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Description (optionnel)</label>
              <input
                type="text"
                name="description"
                value={transactionData.description}
                onChange={handleTransactionInputChange}
                placeholder="Ex: Bourse du mois"
              />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" value={transactionData.date} onChange={handleTransactionInputChange} />
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeTransactionModal}>
                Annuler
              </button>
              <button className="save-btn" onClick={handleAddTransaction}>
                Ajouter la transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Savings
