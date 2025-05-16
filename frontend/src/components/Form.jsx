"use client"
import React, { useState } from 'react';
import "../css/Form.css"
import moneyManagementIcon from '../assets/icons/money-management.png';

export default function Formulaire() {
  const [step, setStep] = useState(1);
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
    transport: ""
  });
  const [saveMessage, setSaveMessage] = useState("");
  const [errors, setErrors] = useState({});

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required!";
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required!";
      if (!formData.age.trim()) newErrors.age = "Age is required!";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required!";
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = "Email is invalid!";
      }
      if (!formData.university) newErrors.university = "University selection is required!";
    } else if (step === 2) {
      if (!formData.budget.trim()) newErrors.budget = "Budget is required!";
      if (formData.hasTuition === "yes" && !formData.tuitionAmount.trim()) {
        newErrors.tuitionAmount = "Tuition amount is required when you have tuition!";
      }
      if (!formData.rent.trim()) newErrors.rent = "Rent amount is required!";
      if (!formData.food.trim()) newErrors.food = "Food amount is required!";
      if (!formData.transport.trim()) newErrors.transport = "Transport amount is required!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prevStep => prevStep + 1);
    }
  };

  const prevStep = () => {
    setStep(prevStep => prevStep - 1);
  };

  const saveData = () => {
    if (validateStep()) {
      // Simulate saving data
      localStorage.setItem("budgetFormData", JSON.stringify(formData));
      setSaveMessage("Data saved successfully!");
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    }
  };

  return (
    <div className="form-container">
      <header className="header">
        <img src={moneyManagementIcon} alt="Budget Logo" />
      </header>

      <div className="form-content">
        <h1 className="main-title">BUDGET FORM</h1>
        
        {/* Step indicator */}
        <div className="step-indicator">
          <div className={`step-text ${step === 1 ? "active" : ""}`}>
            Personal Information
          </div>
          <div className="step-line"></div>
          <div className={`step-text ${step === 2 ? "active" : ""}`}>
            Budget Information
          </div>
          <div className="step-line"></div>
          <div className={`step-text ${step === 3 ? "active" : ""}`}>
            Summary
          </div>
        </div>

        {saveMessage && <div className="save-message">{saveMessage}</div>}

        {step === 1 && (
          <>
            <h2 className="section-title">Personal Information</h2>

            <div className="form-group">
              <div className="form-row">
                <label htmlFor="lastName">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName" 
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? "error" : ""}
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
              <div className="form-row right">
                <label htmlFor="firstName">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName" 
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? "error" : ""}
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>
            </div>

            <div className="form-group">
              <div className="form-row">
                <label htmlFor="age">Age</label>
                <input 
                  type="text" 
                  id="age" 
                  name="age" 
                  value={formData.age}
                  onChange={handleChange}
                  className={errors.age ? "error" : ""}
                />
                {errors.age && <span className="error-message">{errors.age}</span>}
              </div>
              <div className="form-row right">
                <label htmlFor="email">Email</label>
                <input 
                  type="text" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "error" : ""}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="university">University</label>
              <select 
                id="university" 
                name="university"
                value={formData.university}
                onChange={handleChange}
                className={errors.university ? "error" : ""}
              >
                <option value="">--Select--</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              {errors.university && <span className="error-message">{errors.university}</span>}
            </div>

            <div className="form-buttons">
              <button type="button" className="button-save" onClick={saveData}>
                Save
              </button>
              <button type="button" className="button-next" onClick={nextStep}>
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="section-title">Budget Information</h2>

            <fieldset className="main-fieldset">
              <legend>Student Budget</legend>

              <div className="form-row">
                <label htmlFor="budget">What's your monthly budget? (€)</label>
                <input 
                  type="text" 
                  id="budget" 
                  name="budget" 
                  value={formData.budget}
                  onChange={handleChange}
                  className={errors.budget ? "error" : ""}
                />
                {errors.budget && <span className="error-message">{errors.budget}</span>}
              </div>

              <div className="form-row">
                <label>Do you have a tuition?</label>
                <div className="radio-group">
                  <input 
                    type="radio" 
                    id="tuition-yes" 
                    name="hasTuition" 
                    value="yes"
                    checked={formData.hasTuition === "yes"}
                    onChange={handleChange}
                  />
                  <label htmlFor="tuition-yes" className="radio-label">
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
                  <label htmlFor="tuition-no" className="radio-label">
                    No
                  </label>
                </div>
              </div>

              {formData.hasTuition === "yes" && (
                <div className="form-row slide-in">
                  <label htmlFor="tuitionAmount">How much do you earn? (€)</label>
                  <input 
                    type="text" 
                    id="tuitionAmount" 
                    name="tuitionAmount" 
                    value={formData.tuitionAmount}
                    onChange={handleChange}
                    className={errors.tuitionAmount ? "error" : ""}
                  />
                  {errors.tuitionAmount && <span className="error-message">{errors.tuitionAmount}</span>}
                </div>
              )}

              <fieldset className="sub-fieldset">
                <legend>Monthly Expenses</legend>

                <div className="form-row">
                  <label htmlFor="rent">How much do you spend on rent? (€)</label>
                  <input 
                    type="text" 
                    id="rent" 
                    name="rent" 
                    value={formData.rent}
                    onChange={handleChange}
                    className={errors.rent ? "error" : ""}
                  />
                  {errors.rent && <span className="error-message">{errors.rent}</span>}
                </div>

                <div className="form-row">
                  <label htmlFor="food">How much do you spend on food? (€)</label>
                  <input 
                    type="text" 
                    id="food" 
                    name="food" 
                    value={formData.food}
                    onChange={handleChange}
                    className={errors.food ? "error" : ""}
                  />
                  {errors.food && <span className="error-message">{errors.food}</span>}
                </div>

                <div className="form-row">
                  <label htmlFor="transport">How much do you spend on transportation? (€)</label>
                  <input 
                    type="text" 
                    id="transport" 
                    name="transport" 
                    value={formData.transport}
                    onChange={handleChange}
                    className={errors.transport ? "error" : ""}
                  />
                  {errors.transport && <span className="error-message">{errors.transport}</span>}
                </div>
              </fieldset>
            </fieldset>

            <div className="form-buttons">
              <button type="button" className="button-prev" onClick={prevStep}>
                Previous
              </button>
              <button type="button" className="button-save" onClick={saveData}>
                Save
              </button>
              <button type="button" className="button-next" onClick={nextStep}>
                Next
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="section-title">Summary</h2>
            
            <div className="summary-container">
              <div className="summary-section">
                <h3 className="summary-title">Personal Information</h3>
                <div className="summary-row">
                  <span className="summary-label">Last Name:</span>
                  <span className="summary-value">{formData.lastName}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">First Name:</span>
                  <span className="summary-value">{formData.firstName}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Age:</span>
                  <span className="summary-value">{formData.age}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Email:</span>
                  <span className="summary-value">{formData.email}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">University:</span>
                  <span className="summary-value">
                    {formData.university === "public" && "Public"}
                    {formData.university === "private" && "Private"}
                    {!formData.university && "Not specified"}
                  </span>
                </div>
              </div>

              <div className="summary-section">
                <h3 className="summary-title">Budget Information</h3>
                <div className="summary-row">
                  <span className="summary-label">Monthly Budget:</span>
                  <span className="summary-value">{formData.budget} €</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Has Tuition:</span>
                  <span className="summary-value">{formData.hasTuition === "yes" ? "Yes" : "No"}</span>
                </div>
                {formData.hasTuition === "yes" && (
                  <div className="summary-row">
                    <span className="summary-label">Tuition Amount:</span>
                    <span className="summary-value">{formData.tuitionAmount} €</span>
                  </div>
                )}
              </div>

              <div className="summary-section">
                <h3 className="summary-title">Monthly Expenses</h3>
                <div className="summary-row">
                  <span className="summary-label">Rent:</span>
                  <span className="summary-value">{formData.rent} €</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Food:</span>
                  <span className="summary-value">{formData.food} €</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Transportation:</span>
                  <span className="summary-value">{formData.transport} €</span>
                </div>
              </div>

              <div className="summary-total">
                <div className="summary-row total">
                  <span className="summary-label">Total Expenses:</span>
                  <span className="summary-value">
                    {parseFloat(formData.rent || 0) + 
                     parseFloat(formData.food || 0) + 
                     parseFloat(formData.transport || 0)} €
                  </span>
                </div>
                <div className="summary-row balance">
                  <span className="summary-label">Remaining Budget:</span>
                  <span className={`summary-value ${
                    (parseFloat(formData.budget || 0) + parseFloat(formData.hasTuition === "yes" ? formData.tuitionAmount || 0 : 0)) - 
                    (parseFloat(formData.rent || 0) + parseFloat(formData.food || 0) + parseFloat(formData.transport || 0)) >= 0 
                    ? "positive" : "negative"}`}>
                    {(parseFloat(formData.budget || 0) + parseFloat(formData.hasTuition === "yes" ? formData.tuitionAmount || 0 : 0)) - 
                     (parseFloat(formData.rent || 0) + parseFloat(formData.food || 0) + parseFloat(formData.transport || 0))} €
                  </span>
                </div>
              </div>
            </div>

            <div className="form-buttons">
              <button type="button" className="button-prev" onClick={prevStep}>
                Previous
              </button>
              <button type="button" className="button-save" onClick={saveData}>
                Save
              </button>
              <button type="submit" className="button-submit">
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}