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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const nextStep = () => {
    setStep(prevStep => prevStep + 1);
  };

  const prevStep = () => {
    setStep(prevStep => prevStep - 1);
  };

  const saveData = () => {
    // Simulate saving data
    localStorage.setItem("budgetFormData", JSON.stringify(formData));
    setSaveMessage("Data saved successfully!");
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setSaveMessage("");
    }, 3000);
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
                />
              </div>
              <div className="form-row right">
                <label htmlFor="firstName">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName" 
                  value={formData.firstName}
                  onChange={handleChange}
                />
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
                />
              </div>
              <div className="form-row right">
                <label htmlFor="email">Email</label>
                <input 
                  type="text" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="university">University</label>
              <select 
                id="university" 
                name="university"
                value={formData.university}
                onChange={handleChange}
              >
                <option value="">--Select--</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
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
                />
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
                  />
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
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="food">How much do you spend on food? (€)</label>
                  <input 
                    type="text" 
                    id="food" 
                    name="food" 
                    value={formData.food}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="transport">How much do you spend on transportation? (€)</label>
                  <input 
                    type="text" 
                    id="transport" 
                    name="transport" 
                    value={formData.transport}
                    onChange={handleChange}
                  />
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