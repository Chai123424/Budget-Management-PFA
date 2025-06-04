"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../css/Form.css"
import moneyManagementIcon from "../assets/icons/money-management.png"
import sunIcon from "../assets/icons/soleil.png"
import moonIcon from "../assets/icons/lune.png"

export default function Formulaire({ darkMode, toggleTheme }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    age: "",
    email: "",
    university: "",
    budget: "",
    hasTuition: "no",
    tuitionAmount: "",
    rent: "",
    food: "",
    transport: "",
  })
  const [saveMessage, setSaveMessage] = useState("")
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with existing user data
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      const userData = JSON.parse(currentUser)
      setFormData(prev => ({
        ...prev,
        email: userData.email || "",
        firstName: userData.name?.split(' ')[0] || "",
        lastName: userData.name?.split(' ').slice(1).join(' ') || ""
      }))
    }
  }, [])

  // Sync with app's dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode")
    } else {
      document.body.classList.remove("dark-mode")
    }
  }, [darkMode])

  const validateStep = () => {
    const newErrors = {}

    if (step === 1) {
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required!"
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required!"
      if (!formData.age.trim()) newErrors.age = "Age is required!"
      if (!formData.email.trim()) {
        newErrors.email = "Email is required!"
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = "Email is invalid!"
      }
      if (!formData.university) newErrors.university = "University selection is required!"
    } else if (step === 2) {
      if (!formData.budget.trim()) newErrors.budget = "Budget is required!"
      if (formData.hasTuition === "yes" && !formData.tuitionAmount.trim()) {
        newErrors.tuitionAmount = "Tuition amount is required when you have tuition!"
      }
      if (!formData.rent.trim()) newErrors.rent = "Rent amount is required!"
      if (!formData.food.trim()) newErrors.food = "Food amount is required!"
      if (!formData.transport.trim()) newErrors.transport = "Transport amount is required!"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const nextStep = () => {
    if (validateStep()) {
      setStep((prevStep) => prevStep + 1)
    }
  }

  const prevStep = () => {
    setStep((prevStep) => prevStep - 1)
  }

  const saveData = () => {
    if (validateStep()) {
      // Simulate saving data
      localStorage.setItem("budgetFormData", JSON.stringify(formData))
      setSaveMessage("Data saved successfully!")

      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage("")
      }, 3000)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep()) {
      return
    }

    try {
      setIsSubmitting(true)
      
      // Get current user data
      const currentUserData = localStorage.getItem("currentUser")
      const currentUser = currentUserData ? JSON.parse(currentUserData) : {}
      
      // Prepare complete user profile
      const completeUserProfile = {
        ...currentUser,
        // Personal information
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`,
        age: parseInt(formData.age),
        email: formData.email,
        university: formData.university,
        
        // Budget information
        budget: {
          monthly: parseFloat(formData.budget),
          hasTuition: formData.hasTuition === "yes",
          tuitionAmount: formData.hasTuition === "yes" ? parseFloat(formData.tuitionAmount) : 0,
          expenses: {
            rent: parseFloat(formData.rent),
            food: parseFloat(formData.food),
            transportation: parseFloat(formData.transport),
            total: parseFloat(formData.rent) + parseFloat(formData.food) + parseFloat(formData.transport)
          },
          remainingBudget: (
            parseFloat(formData.budget) + 
            (formData.hasTuition === "yes" ? parseFloat(formData.tuitionAmount) : 0) - 
            (parseFloat(formData.rent) + parseFloat(formData.food) + parseFloat(formData.transport))
          )
        },
        
        // Metadata
        isProfileComplete: true,
        profileCompletedAt: new Date().toISOString(),
        registrationStep: 'completed'
      }

      // Update user in "database"
      const users = JSON.parse(localStorage.getItem('usersDB') || '[]')
      const userIndex = users.findIndex(user => user.email === currentUser.email)
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...completeUserProfile }
        localStorage.setItem('usersDB', JSON.stringify(users))
      }

      // Save complete profile
      localStorage.setItem('currentUser', JSON.stringify(completeUserProfile))
      localStorage.setItem('userProfile', JSON.stringify(completeUserProfile))
      
      // Mark as authenticated and remove pending signup
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.removeItem('pendingSignup')
      
      console.log('Profile completed successfully:', completeUserProfile)
      
      // Show success message briefly
      setSaveMessage("Profile completed successfully! Redirecting to dashboard...")
      
      // Delay navigation slightly to show success message
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 1500)
      
    } catch (error) {
      console.error('Submission error:', error)
      setErrors({ general: 'Error completing profile. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`budget-form-container ${darkMode ? "budget-form-dark" : "budget-form-light"}`}>
      {/* Theme toggle button */}
      {toggleTheme && (
        <button className="budget-form-theme-toggle" onClick={toggleTheme}>
          {darkMode ? (
            <img src={sunIcon || "/placeholder.svg"} alt="Light mode" className="budget-form-theme-icon" />
          ) : (
            <img src={moonIcon || "/placeholder.svg"} alt="Dark mode" className="budget-form-theme-icon" />
          )}
        </button>
      )}

      <header className="budget-form-header">
        <img src={moneyManagementIcon || "/placeholder.svg"} alt="Budget Logo" />
      </header>

      <div className="budget-form-content">
        <h1 className="budget-form-main-title">SIMPLIFY FORM</h1>

        {/* Step indicator */}
        <div className="budget-form-step-indicator">
          <div className={`budget-form-step-text ${step === 1 ? "budget-form-active" : ""}`}>Personal Information</div>
          <div className="budget-form-step-line"></div>
          <div className={`budget-form-step-text ${step === 2 ? "budget-form-active" : ""}`}>Budget Information</div>
          <div className="budget-form-step-line"></div>
          <div className={`budget-form-step-text ${step === 3 ? "budget-form-active" : ""}`}>Summary</div>
        </div>

        {saveMessage && <div className="budget-form-save-message">{saveMessage}</div>}
        {errors.general && <div className="budget-form-error-message budget-form-general-error">{errors.general}</div>}

        {step === 1 && (
          <>
            <h2 className="budget-form-section-title">Personal Information</h2>

            <div className="budget-form-group">
              <div className="budget-form-row">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? "budget-form-error" : ""}
                />
                {errors.lastName && <span className="budget-form-error-message">{errors.lastName}</span>}
              </div>
              <div className="budget-form-row budget-form-right">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? "budget-form-error" : ""}
                />
                {errors.firstName && <span className="budget-form-error-message">{errors.firstName}</span>}
              </div>
            </div>

            <div className="budget-form-group">
              <div className="budget-form-row">
                <label htmlFor="age">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className={errors.age ? "budget-form-error" : ""}
                  min="16"
                  max="100"
                />
                {errors.age && <span className="budget-form-error-message">{errors.age}</span>}
              </div>
              <div className="budget-form-row budget-form-right">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "budget-form-error" : ""}
                />
                {errors.email && <span className="budget-form-error-message">{errors.email}</span>}
              </div>
            </div>

            <div className="budget-form-row">
              <label htmlFor="university">University</label>
              <select
                id="university"
                name="university"
                value={formData.university}
                onChange={handleChange}
                className={errors.university ? "budget-form-error" : ""}
              >
                <option value="">--Select--</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              {errors.university && <span className="budget-form-error-message">{errors.university}</span>}
            </div>

            <div className="budget-form-buttons">
              <button type="button" className="budget-form-button-save" onClick={saveData}>
                Save
              </button>
              <button type="button" className="budget-form-button-next" onClick={nextStep}>
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="budget-form-section-title">Budget Information</h2>

            

              <div className="budget-form-row">
                <label htmlFor="budget">{"What's your monthly budget? (DH)"}</label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className={errors.budget ? "budget-form-error" : ""}
                  min="0"
                  step="0.01"
                />
                {errors.budget && <span className="budget-form-error-message">{errors.budget}</span>}
              </div>

              <div className="budget-form-row">
                <label>Do you have a tuition?</label>
                <div className="budget-form-radio-group">
                  <input
                    type="radio"
                    id="tuition-yes"
                    name="hasTuition"
                    value="yes"
                    checked={formData.hasTuition === "yes"}
                    onChange={handleChange}
                  />
                  <label htmlFor="tuition-yes" className="budget-form-radio-label">
                    Yes
                  </label>
                  <input
                    type="radio"
                    id="tuition-no"
                    name="hasTuition"
                    value="no"
                    checked={formData.hasTuition === "no"}
                    onChange={handleChange}
                  />
                  <label htmlFor="tuition-no" className="budget-form-radio-label">
                    No
                  </label>
                </div>
              </div>

              {formData.hasTuition === "yes" && (
                <div className="budget-form-row budget-form-slide-in">
                  <label htmlFor="tuitionAmount">How much do you earn? (DH)</label>
                  <input
                    type="number"
                    id="tuitionAmount"
                    name="tuitionAmount"
                    value={formData.tuitionAmount}
                    onChange={handleChange}
                    className={errors.tuitionAmount ? "budget-form-error" : ""}
                    min="0"
                    step="0.01"
                  />
                  {errors.tuitionAmount && <span className="budget-form-error-message">{errors.tuitionAmount}</span>}
                </div>
              )}

              <fieldset className="budget-form-sub-fieldset">
                <legend>Monthly Expenses</legend>

                <div className="budget-form-row">
                  <label htmlFor="rent">How much do you spend on rent? (DH)</label>
                  <input
                    type="number"
                    id="rent"
                    name="rent"
                    value={formData.rent}
                    onChange={handleChange}
                    className={errors.rent ? "budget-form-error" : ""}
                    min="0"
                    step="0.01"
                  />
                  {errors.rent && <span className="budget-form-error-message">{errors.rent}</span>}
                </div>

                <div className="budget-form-row">
                  <label htmlFor="food">How much do you spend on food? (DH)</label>
                  <input
                    type="number"
                    id="food"
                    name="food"
                    value={formData.food}
                    onChange={handleChange}
                    className={errors.food ? "budget-form-error" : ""}
                    min="0"
                    step="0.01"
                  />
                  {errors.food && <span className="budget-form-error-message">{errors.food}</span>}
                </div>

                <div className="budget-form-row">
                  <label htmlFor="transport">How much do you spend on transportation? (DH)</label>
                  <input
                    type="number"
                    id="transport"
                    name="transport"
                    value={formData.transport}
                    onChange={handleChange}
                    className={errors.transport ? "budget-form-error" : ""}
                    min="0"
                    step="0.01"
                  />
                  {errors.transport && <span className="budget-form-error-message">{errors.transport}</span>}
                </div>
              </fieldset>
            

            <div className="budget-form-buttons">
              <button type="button" className="budget-form-button-prev" onClick={prevStep}>
                Previous
              </button>
              <button type="button" className="budget-form-button-save" onClick={saveData}>
                Save
              </button>
              <button type="button" className="budget-form-button-next" onClick={nextStep}>
                Next
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="budget-form-section-title">Summary</h2>

            <div className="budget-form-summary-container">
              <div className="budget-form-summary-section">
                <h3 className="budget-form-summary-title">Personal Information</h3>
                <div className="budget-form-summary-row">
                  <span className="budget-form-summary-label">Last Name:</span>
                  <span className="budget-form-summary-value">{formData.lastName}</span>
                </div>
                <div className="budget-form-summary-row">
                  <span className="budget-form-summary-label">First Name:</span>
                  <span className="budget-form-summary-value">{formData.firstName}</span>
                </div>
                <div className="budget-form-summary-row">
                  <span className="budget-form-summary-label">Age:</span>
                  <span className="budget-form-summary-value">{formData.age}</span>
                </div>
                <div className="budget-form-summary-row">
                  <span className="budget-form-summary-label">Email:</span>
                  <span className="budget-form-summary-value">{formData.email}</span>
                </div>
                <div className="budget-form-summary-row">
                  <span className="budget-form-summary-label">University:</span>
                  <span className="budget-form-summary-value">
                    {formData.university === "public" && "Public"}
                    {formData.university === "private" && "Private"}
                    {!formData.university && "Not specified"}
                  </span>
                </div>
              </div>

              <div className="budget-form-summary-section">
                <h3 className="budget-form-summary-title">Budget Information</h3>
                <div className="budget-form-summary-row">
                  <span className="budget-form-summary-label">Monthly Budget:</span>
                  <span className="budget-form-summary-value">{formData.budget} DH</span>
                </div>
                <div className="budget-form-summary-row">
                  <span className="budget-form-summary-label">Has Tuition:</span>
                  <span className="budget-form-summary-value">{formData.hasTuition === "yes" ? "Yes" : "No"}</span>
                </div>
                {formData.hasTuition === "yes" && (
                  <div className="budget-form-summary-row">
                    <span className="budget-form-summary-label">Tuition Amount:</span>
                    <span className="budget-form-summary-value">{formData.tuitionAmount} DH</span>
                  </div>
                )}
              </div>

              <div className="budget-form-summary-section">
                <h3 className="budget-form-summary-title">Monthly Expenses</h3>
                <div className="budget-form-summary-row">
                  <span className="budget-form-summary-label">Rent:</span>
                  <span className="budget-form-summary-value">{formData.rent} DH</span>
                </div>
                <div className="budget-form-summary-row">
                  <span className="budget-form-summary-label">Food:</span>
                  <span className="budget-form-summary-value">{formData.food} DH</span>
                </div>
                <div className="budget-form-summary-row">
                  <span className="budget-form-summary-label">Transportation:</span>
                  <span className="budget-form-summary-value">{formData.transport} DH</span>
                </div>
              </div>

              <div className="budget-form-summary-total">
                <div className="budget-form-summary-row budget-form-total">
                  <span className="budget-form-summary-label">Total Expenses:</span>
                  <span className="budget-form-summary-value">
                    {(parseFloat(formData.rent || 0) +
                      parseFloat(formData.food || 0) +
                      parseFloat(formData.transport || 0)).toFixed(2)}{" "}
                    DH
                  </span>
                </div>
                <div className="budget-form-summary-row budget-form-balance">
                  <span className="budget-form-summary-label">Remaining Budget:</span>
                  <span
                    className={`budget-form-summary-value ${
                      parseFloat(formData.budget || 0) +
                        parseFloat(formData.hasTuition === "yes" ? formData.tuitionAmount || 0 : 0) -
                        (parseFloat(formData.rent || 0) +
                          parseFloat(formData.food || 0) +
                          parseFloat(formData.transport || 0)) >=
                      0
                        ? "budget-form-positive"
                        : "budget-form-negative"
                    }`}
                  >
                    {(parseFloat(formData.budget || 0) +
                      parseFloat(formData.hasTuition === "yes" ? formData.tuitionAmount || 0 : 0) -
                      (parseFloat(formData.rent || 0) +
                        parseFloat(formData.food || 0) +
                        parseFloat(formData.transport || 0))).toFixed(2)}{" "}
                    DH
                  </span>
                </div>
              </div>
            </div>

            <div className="budget-form-buttons">
              <button type="button" className="budget-form-button-prev" onClick={prevStep}>
                Previous
              </button>
              <button type="button" className="budget-form-button-save" onClick={saveData}>
                Save
              </button>
              <button
                type="button"
                className="budget-form-button-submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Complete Profile"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Debug info - à supprimer en production */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          fontSize: '12px',
          borderRadius: '5px',
          maxWidth: '200px'
        }}>
          <div>Pending Signup: {localStorage.getItem("pendingSignup")}</div>
          <div>Is Authenticated: {localStorage.getItem("isAuthenticated")}</div>
          <div>Current User: {localStorage.getItem("currentUser") ? "✓" : "✗"}</div>
        </div>
      )}
    </div>
  )
}