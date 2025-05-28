"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../../css/Authentification/LoginSignup.css"

import user_icon from "../../assets/icons/etudiant.png"
import email_icon from "../../assets/icons/gmail.png"
import password_icon from "../../assets/icons/cadenas.png"
import money_icon from "../../assets/icons/money-management.png"
import dollar_icon from "../../assets/icons/dollar.png"
import piggy_icon from "../../assets/icons/tirelire.png"
import mobile_icon from "../../assets/icons/mobil.png"
import sun_icon from "../../assets/icons/soleil.png"
import moon_icon from "../../assets/icons/lune.png"

const LoginSignup = () => {
  const navigate = useNavigate()
  const [action, setAction] = useState("Sign Up")
  const [darkMode, setDarkMode] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setDarkMode(true)
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("auth-dark-mode")
      localStorage.setItem("theme", "dark")
    } else {
      document.body.classList.remove("auth-dark-mode")
      localStorage.setItem("theme", "light")
    }
  }, [darkMode])

  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }))
      return false
    } else if (!regex.test(email)) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }))
      return false
    }
    setErrors((prev) => ({ ...prev, email: undefined }))
    return true
  }

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/

    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }))
      return false
    } else if (password.length < 8) {
      setErrors((prev) => ({ ...prev, password: "Password must be at least 8 characters" }))
      return false
    } else if (!regex.test(password)) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must contain at least one uppercase letter, one number, and one special character",
      }))
      return false
    }
    setErrors((prev) => ({ ...prev, password: undefined }))
    return true
  }

  const validateName = (name) => {
    if (!name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Name is required" }))
      return false
    }
    setErrors((prev) => ({ ...prev, name: undefined }))
    return true
  }

  const getPasswordStrength = (password) => {
    if (!password) return 0
    let strength = 0

    if (password.length >= 8) strength += 1
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1
    if (/\d/.test(password)) strength += 1
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength += 1

    return strength
  }

  const getPasswordStrengthLabel = (strength) => {
    if (strength === 0) return "Very weak"
    if (strength === 1) return "Weak"
    if (strength === 2) return "Medium"
    if (strength === 3) return "Good"
    return "Strong"
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    let isValid = true
  
    // Clear previous errors
    setErrors({})
  
    // Validate form
    if (action === "Sign Up") {
      isValid = validateName(formData.name) && isValid
    }
    isValid = validateEmail(formData.email) && isValid
    isValid = validatePassword(formData.password) && isValid
  
    if (isValid) {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        
        if (action === "Sign Up") {
          // Clear any previous authentication state
          localStorage.removeItem("isAuthenticated")
          localStorage.removeItem("pendingSignup")
          
          // Set new signup state
          localStorage.setItem("pendingSignup", "true")
          localStorage.setItem("userData", JSON.stringify({
            name: formData.name,
            email: formData.email
          }))
          
          // Reset form for next use
          setFormData({
            name: "",
            email: "",
            password: ""
          })
          
          // Navigate to form page
          navigate("/form", { replace: true })
        } else {
          // Clear any previous signup state
          localStorage.removeItem("pendingSignup")
          
          // Set authenticated state
          localStorage.setItem("isAuthenticated", "true")
          localStorage.setItem("userData", JSON.stringify({
            name: formData.name || "User", // Fallback for login
            email: formData.email
          }))
          
          // Reset form for next use
          setFormData({
            name: "",
            email: "",
            password: ""
          })
          
          // Navigate to dashboard
          navigate("/dashboard", { replace: true })
        }
      } catch (error) {
        console.error("Authentication error:", error)
        alert("An error occurred. Please try again.")
      }
    }
    setIsSubmitting(false)
  }

  const handlePasswordReset = async () => {
    if (validateEmail(formData.email)) {
      setIsSubmitting(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert(`If an account is associated with ${formData.email}, a reset email will be sent.`)
      setForgotPasswordMode(false)
      setAction("Login")
      setIsSubmitting(false)
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className={`auth-container ${darkMode ? "auth-dark-theme" : "auth-light-theme"}`}>
      <button className="auth-theme-toggle" onClick={toggleTheme}>
        {darkMode ? (
          <img src={sun_icon || "/placeholder.svg"} alt="Light mode" className="auth-theme-icon" />
        ) : (
          <img src={moon_icon || "/placeholder.svg"} alt="Dark mode" className="auth-theme-icon" />
        )}
      </button>

      <div className="auth-header">
        <div className="auth-logo-container">
          <img src={money_icon || "/placeholder.svg"} alt="Logo" className="auth-logo" />
        </div>

        <div className="auth-title">
          <h2>Budget Management</h2>
          <div className="auth-underline"></div>
          <p className="auth-subtitle">Manage your finances easily</p>
        </div>

        {forgotPasswordMode ? (
          <div className="auth-inputs">
            <h3 className="auth-reset-title">Reset Your Password</h3>
            <p className="auth-reset-instructions">
              Enter your email address and we'll send you instructions to reset your password.
            </p>

            <div className="auth-input">
              <img src={email_icon || "/placeholder.svg"} alt="Email" />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onBlur={() => validateEmail(formData.email)}
              />
            </div>
            {errors.email && <div className="auth-error-message">{errors.email}</div>}

            <div className="auth-reset-buttons">
              <button className="auth-reset-button" onClick={handlePasswordReset} disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>
              <button
                className="auth-cancel-button"
                onClick={() => {
                  setForgotPasswordMode(false)
                  setErrors({})
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="auth-inputs">
            {action === "Sign Up" && (
              <div className="auth-input">
                <img src={user_icon || "/placeholder.svg"} alt="User" />
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  onBlur={() => validateName(formData.name)}
                />
              </div>
            )}
            {action === "Sign Up" && errors.name && <div className="auth-error-message">{errors.name}</div>}

            <div className="auth-input">
              <img src={email_icon || "/placeholder.svg"} alt="Email" />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onBlur={() => validateEmail(formData.email)}
              />
            </div>
            {errors.email && <div className="auth-error-message">{errors.email}</div>}

            <div className="auth-input">
              <img src={password_icon || "/placeholder.svg"} alt="Password" />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                onBlur={() => validatePassword(formData.password)}
              />
            </div>
            {errors.password && <div className="auth-error-message">{errors.password}</div>}

            {formData.password && (
              <div className="auth-password-strength">
                <div className="auth-strength-meter">
                  <div
                    className={`auth-strength-value ${
                      passwordStrength === 1
                        ? "auth-weak"
                        : passwordStrength === 2
                          ? "auth-medium"
                          : passwordStrength === 3
                            ? "auth-good"
                            : passwordStrength === 4
                              ? "auth-strong"
                              : ""
                    }`}
                    style={{ width: `${passwordStrength * 25}%` }}
                  ></div>
                </div>
                <span className="auth-strength-text">{getPasswordStrengthLabel(passwordStrength)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {action === "Login" && !forgotPasswordMode && (
        <div className="auth-forgot-password">
          Lost Password?{" "}
          <span onClick={() => setForgotPasswordMode(true)} className="auth-forgot-link">
            Click here!
          </span>
        </div>
      )}

      {!forgotPasswordMode && (
        <div className="auth-submitcontainer">
          <div
            className={action === "Sign Up" ? "auth-submit auth-active" : "auth-submit auth-gray"}
            onClick={() => {
              setAction("Sign Up")
              if (action === "Sign Up") handleSubmit()
            }}
          >
            {isSubmitting && action === "Sign Up" ? "Processing..." : "Sign up"}
          </div>
          <div
            className={action === "Login" ? "auth-submit auth-active" : "auth-submit auth-gray"}
            onClick={() => {
              setAction("Login")
              if (action === "Login") handleSubmit()
            }}
          >
            {isSubmitting && action === "Login" ? "Processing..." : "Login"}
          </div>
        </div>
      )}

      <div className="auth-benefits">
        <div className="auth-benefit">
          <div className="auth-benefit-icon">
            <img src={dollar_icon || "/placeholder.svg"} alt="Dollar" />
          </div>
          <span>Expense Tracking</span>
        </div>
        <div className="auth-benefit">
          <div className="auth-benefit-icon">
            <img src={piggy_icon || "/placeholder.svg"} alt="Piggy Bank" />
          </div>
          <span>Money Saving Tips</span>
        </div>
        <div className="auth-benefit">
          <div className="auth-benefit-icon">
            <img src={mobile_icon || "/placeholder.svg"} alt="Mobile" />
          </div>
          <span>Desktop & Mobile</span>
        </div>
      </div>
    </div>
  )
}

export default LoginSignup