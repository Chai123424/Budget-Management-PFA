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
import "./App.css"
import "./css/Home.css"

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
        React.createElement(Route, { path: "/auth", element: React.createElement(LoginSignup) }),

        // Profile completion
        React.createElement(Route, {
          path: "/form",
          element:
            localStorage.getItem("pendingSignup") === "true"
              ? renderLayout(false, React.createElement(Formulaire, { darkMode: darkMode, toggleTheme: toggleTheme }))
              : React.createElement(Navigate, { to: "/auth", replace: true }),
        }),

        // Protected routes
        React.createElement(Route, {
          path: "/dashboard",
          element:
            localStorage.getItem("isAuthenticated") === "true"
              ? renderLayout(false, React.createElement(Dashboard))
              : React.createElement(Navigate, { to: "/auth", replace: true }),
        }),

        React.createElement(Route, {
          path: "/expenses",
          element:
            localStorage.getItem("isAuthenticated") === "true"
              ? renderLayout(false, React.createElement(Expenses))
              : React.createElement(Navigate, { to: "/auth", replace: true }),
        }),

        React.createElement(Route, {
          path: "/savings",
          element:
            localStorage.getItem("isAuthenticated") === "true"
              ? renderLayout(false, React.createElement(Savings))
              : React.createElement(Navigate, { to: "/auth", replace: true }),
        }),

        // Default route
        React.createElement(Route, { path: "*", element: React.createElement(Navigate, { to: "/", replace: true }) }),
      ),
    ),
  )
}

export default App
