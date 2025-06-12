"use client"

import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Navbar from "./components/common/Navbar"
import LoginSignup from "./components/Authentification/LoginSignup"
import Home from "./components/Home"
import HowItWorks from "./components/HowItWorks"
import Dashboard from "./components/Dashboard"
import Expenses from "./components/Expenses"
import Savings from "./components/Savings"
import Formulaire from "./components/Form"
import Recommendation from "./components/Recommendation"
import "./App.css"
import "./css/Home.css"

// Protected Route Component
const ProtectedRoute = ({ children, redirectTo = "/auth" }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null) // null = loading
  
  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated")
      const currentUser = localStorage.getItem("currentUser")
      
      console.log("Protected Route Check:", { 
        authStatus, 
        hasCurrentUser: !!currentUser 
      })
      
      setIsAuthenticated(authStatus === "true" && currentUser)
    }
    
    checkAuth()
    
    // Listen for storage changes
    const handleStorageChange = () => {
      checkAuth()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  // Show loading or handle redirect
  if (isAuthenticated === null) {
    return <div>Loading...</div>
  }
  
  return isAuthenticated ? children : <Navigate to={redirectTo} replace />
}

// Signup Protection Component
const SignupProtectedRoute = ({ children }) => {
  const [canAccess, setCanAccess] = useState(null)
  
  useEffect(() => {
    const checkAccess = () => {
      const pendingSignup = localStorage.getItem("pendingSignup")
      const currentUser = localStorage.getItem("currentUser")
      
      console.log("Signup Route Check:", { 
        pendingSignup, 
        hasCurrentUser: !!currentUser 
      })
      
      setCanAccess(pendingSignup === "true" && currentUser)
    }
    
    checkAccess()
    
    const handleStorageChange = () => {
      checkAccess()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  if (canAccess === null) {
    return <div>Loading...</div>
  }
  
  return canAccess ? children : <Navigate to="/auth" replace />
}

function App() {
  const [darkMode, setDarkMode] = useState(false)

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setDarkMode(true)
      document.body.classList.add("dark-mode")
    }
  }, [])

  const toggleTheme = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem("theme", newDarkMode ? "dark" : "light")
    document.body.classList.toggle("dark-mode", newDarkMode)
  }

  const renderLayout = (withNavbar, content) =>
    React.createElement(
      "div",
      { className: `app-container ${darkMode ? "dark-mode" : ""}` },
      withNavbar && React.createElement(Navbar, { darkMode: darkMode, toggleTheme: toggleTheme }),
      React.createElement("main", { className: "main-content" }, content),
    )

  return React.createElement(
    BrowserRouter,
    null,
    React.createElement(
      "div",
      { className: `app ${darkMode ? "dark-mode" : ""}` },
      React.createElement(
        Routes,
        null,
        // Public routes
        React.createElement(Route, {
          path: "/",
          element: renderLayout(true, React.createElement(Home, { darkMode: darkMode, toggleTheme: toggleTheme })),
        }),
        React.createElement(Route, {
          path: "/how-it-works",
          element: renderLayout(
            true,
            React.createElement(HowItWorks, { darkMode: darkMode, toggleTheme: toggleTheme }),
          ),
        }),

        // Authentication
        React.createElement(Route, { 
          path: "/auth", 
          element: React.createElement(LoginSignup) 
        }),

        // Profile completion (protected by signup state)
        React.createElement(Route, {
          path: "/form",
          element: React.createElement(
            SignupProtectedRoute,
            null,
            renderLayout(false, React.createElement(Formulaire, { darkMode: darkMode, toggleTheme: toggleTheme }))
          )
        }),

        // Protected routes (protected by authentication)
        React.createElement(Route, {
          path: "/dashboard",
          element: React.createElement(
            ProtectedRoute,
            null,
            renderLayout(false, React.createElement(Dashboard))
          )
        }),

        React.createElement(Route, {
          path: "/expenses",
          element: React.createElement(
            ProtectedRoute,
            null,
            renderLayout(false, React.createElement(Expenses))
          )
        }),

        React.createElement(Route, {
          path: "/savings",
          element: React.createElement(
            ProtectedRoute,
            null,
            renderLayout(false, React.createElement(Savings))
          )
        }),

        // Recommendation route WITHOUT navbar
        React.createElement(Route, {
          path: "/recommendation",
          element: React.createElement(
            ProtectedRoute,
            null,
            renderLayout(false, React.createElement(Recommendation, { darkMode: darkMode, toggleTheme: toggleTheme }))
          )
        }),

        // Default route
        React.createElement(Route, { 
          path: "*", 
          element: React.createElement(Navigate, { to: "/", replace: true }) 
        }),
      ),
    ),
  )
}

export default App