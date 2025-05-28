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
    try {
      setIsSubmitting(true);
      
      // Prepare form data from state
      const submissionData = {
        lastName: formData.lastName,
        firstName: formData.firstName,
        age: formData.age,
        email: formData.email,
        university: formData.university,
        budget: {
          monthly: formData.budget,
          tuition: formData.hasTuition === "yes" ? formData.tuitionAmount : "0",
          expenses: {
            rent: formData.rent,
            food: formData.food,
            transportation: formData.transport
          }
        }
      };
  
      // Save to localStorage
      localStorage.setItem('userProfile', JSON.stringify(submissionData));
      
      // Mark registration as complete
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.removeItem('pendingSignup'); // Clear the pending signup flag
  
      // Force a full page reload to ensure auth state is properly initialized
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
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
        <h1 className="budget-form-main-title">BUDGET FORM</h1>

        {/* Step indicator */}
        <div className="budget-form-step-indicator">
          <div className={`budget-form-step-text ${step === 1 ? "budget-form-active" : ""}`}>Personal Information</div>
          <div className="budget-form-step-line"></div>
          <div className={`budget-form-step-text ${step === 2 ? "budget-form-active" : ""}`}>Budget Information</div>
          <div className="budget-form-step-line"></div>
          <div className={`budget-form-step-text ${step === 3 ? "budget-form-active" : ""}`}>Summary</div>
        </div>

        {saveMessage && <div className="budget-form-save-message">{saveMessage}</div>}

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
                  type="text"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className={errors.age ? "budget-form-error" : ""}
                />
                {errors.age && <span className="budget-form-error-message">{errors.age}</span>}
              </div>
              <div className="budget-form-row budget-form-right">
                <label htmlFor="email">Email</label>
                <input
                  type="text"
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

            <fieldset className="budget-form-main-fieldset">
              <legend>Student Budget</legend>

              <div className="budget-form-row">
                <label htmlFor="budget">{"What's your monthly budget? (€)"}</label>
                <input
                  type="text"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className={errors.budget ? "budget-form-error" : ""}
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
                  <label htmlFor="tuitionAmount">How much do you earn? (€)</label>
                  <input
                    type="text"
                    id="tuitionAmount"
                    name="tuitionAmount"
                    value={formData.tuitionAmount}
                    onChange={handleChange}
                    className={errors.tuitionAmount ? "budget-form-error" : ""}
                  />
                  {errors.tuitionAmount && <span className="budget-form-error-message">{errors.tuitionAmount}</span>}
                </div>
              )}

              <fieldset className="budget-form-sub-fieldset">
                <legend>Monthly Expenses</legend>

                <div className="budget-form-row">
                  <label htmlFor="rent">How much do you spend on rent? (€)</label>
                  <input
                    type="text"
                    id="rent"
                    name="rent"
                    value={formData.rent}
                    onChange={handleChange}
                    className={errors.rent ? "budget-form-error" : ""}
                  />
                  {errors.rent && <span className="budget-form-error-message">{errors.rent}</span>}
                </div>

                <div className="budget-form-row">
                  <label htmlFor="food">How much do you spend on food? (€)</label>
                  <input
                    type="text"
                    id="food"
                    name="food"
                    value={formData.food}
                    onChange={handleChange}
                    className={errors.food ? "budget-form-error" : ""}
                  />
                  {errors.food && <span className="budget-form-error-message">{errors.food}</span>}
                </div>

                <div className="budget-form-row">
                  <label htmlFor="transport">How much do you spend on transportation? (€)</label>
                  <input
                    type="text"
                    id="transport"
                    name="transport"
                    value={formData.transport}
                    onChange={handleChange}
                    className={errors.transport ? "budget-form-error" : ""}
                  />
                  {errors.transport && <span className="budget-form-error-message">{errors.transport}</span>}
                </div>
              </fieldset>
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
                  <span className="budget-form-summary-value">{formData.budget} €</span>
                </div>
                <div className="budget-form-summary-row">
                  <span className="budget-form-summary-label">Has Tuition:</span>
                  <span className="budget-form-summary-value">{formData.hasTuition === "yes" ? "Yes" : "No"}</span>
                </div>
                {formData.hasTuition === "yes" && (
                  <div className="budget-form-summary-row">
                    <span className="budget-form-summary-label">Tuition Amount:</span>
                    <span className="budget-form-summary-value">{formData.tuitionAmount} €</span>
                  </div>
                )}
              </div>

              <div className="budget-form-summary-section">
                <h3 className="budget-form-summary-title">Monthly Expenses</h3>
                <div className="budget-form-summary-row">
                  <span className="budget-form-summary-label">Rent:</span>
                  <span className="budget-form-summary-value">{formData.rent} €</span>
                </div>
                <div className="budget-form-summary-row">
                  <span className="budget-form-summary-label">Food:</span>
                  <span className="budget-form-summary-value">{formData.food} €</span>
                </div>
                <div className="budget-form-summary-row">
                  <span className="budget-form-summary-label">Transportation:</span>
                  <span className="budget-form-summary-value">{formData.transport} €</span>
                </div>
              </div>

              <div className="budget-form-summary-total">
                <div className="budget-form-summary-row budget-form-total">
                  <span className="budget-form-summary-label">Total Expenses:</span>
                  <span className="budget-form-summary-value">
                    {Number.parseFloat(formData.rent || 0) +
                      Number.parseFloat(formData.food || 0) +
                      Number.parseFloat(formData.transport || 0)}{" "}
                    €
                  </span>
                </div>
                <div className="budget-form-summary-row budget-form-balance">
                  <span className="budget-form-summary-label">Remaining Budget:</span>
                  <span
                    className={`budget-form-summary-value ${
                      Number.parseFloat(formData.budget || 0) +
                        Number.parseFloat(formData.hasTuition === "yes" ? formData.tuitionAmount || 0 : 0) -
                        (Number.parseFloat(formData.rent || 0) +
                          Number.parseFloat(formData.food || 0) +
                          Number.parseFloat(formData.transport || 0)) >=
                      0
                        ? "budget-form-positive"
                        : "budget-form-negative"
                    }`}
                  >
                    {Number.parseFloat(formData.budget || 0) +
                      Number.parseFloat(formData.hasTuition === "yes" ? formData.tuitionAmount || 0 : 0) -
                      (Number.parseFloat(formData.rent || 0) +
                        Number.parseFloat(formData.food || 0) +
                        Number.parseFloat(formData.transport || 0))}{" "}
                    €
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
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
