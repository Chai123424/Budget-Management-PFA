"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../css/Home.css"

const Home = ({ darkMode }) => {
  const navigate = useNavigate()
  
  const [bounceEmoji, setBounceEmoji] = useState("🚀")
  const emojis = ["🚀", "💰", "💸", "🎓", "✨"]
  const [tipIndex, setTipIndex] = useState(0)
  const [activeTab, setActiveTab] = useState("save")

  const financeTips = [
    "Track your coffee expenses - small savings add up!",
    "Split bills with roommates to save on rent and utilities",
    "Student discounts can save you hundreds each year",
    "Meal prep on weekends to avoid expensive takeout",
    "Use campus resources like free printing and gym access",
  ]

  // Change emoji every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * emojis.length)
      setBounceEmoji(emojis[randomIndex])
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Rotate through finance tips
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prevIndex) => (prevIndex + 1) % financeTips.length)
    }, 5000)

    return () => clearInterval(tipInterval)
  }, [])

  const showSection = (sectionId) => {
    // Function to handle the section navigation
    console.log(`Navigating to ${sectionId}`)
    
    // Handle navigation based on sectionId
    if (sectionId === "register-section") {
      navigate("/auth")
    } else if (sectionId === "how-it-works") {
      navigate("/how-it-works")
    }
  }

  return (
    <section className={`finance-hero ${darkMode ? 'dark-mode' : ''}`}>
      {/* Animated background */}
      <div className="animated-background">
        <div className="gradient-sphere sphere-1"></div>
        <div className="gradient-sphere sphere-2"></div>
        <div className="gradient-sphere sphere-3"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Main content */}
      <div className="hero-container">
        <div className="hero-content">
          {/* Left column - Main content */}
          <div className="main-column">
            <div className="student-badge">By Students, For Students</div>
            
            <h1 className="headline">
              Student Finance <br />
              <span className="accent-text">Simplified!</span>
              <span className="emoji-highlight">{bounceEmoji}</span>
            </h1>
            
            <p className="tagline">
              Say goodbye to empty wallets and "can I borrow $5?" texts. Track expenses, crush financial goals, 
              and still have money for weekend fun!
            </p>
            
            <div className="feature-tabs">
              <div className="tab-buttons">
                <button 
                  className={`tab-button ${activeTab === "save" ? "active" : ""}`}
                  onClick={() => setActiveTab("save")}
                >
                  Save Money
                </button>
                <button 
                  className={`tab-button ${activeTab === "track" ? "active" : ""}`}
                  onClick={() => setActiveTab("track")}
                >
                  Track Expenses
                </button>
                <button 
                  className={`tab-button ${activeTab === "goals" ? "active" : ""}`}
                  onClick={() => setActiveTab("goals")}
                >
                  Set Goals
                </button>
              </div>
              
              <div className="tab-content">
                {activeTab === "save" && (
                  <div className="tab-panel">
                    <div className="feature-icon">💰</div>
                    <h3>Smart Saving Strategies</h3>
                    <p>Discover personalized saving tips based on your spending habits and student lifestyle.</p>
                  </div>
                )}
                
                {activeTab === "track" && (
                  <div className="tab-panel">
                    <div className="feature-icon">📊</div>
                    <h3>Expense Tracking</h3>
                    <p>Easily categorize and visualize where your money goes with intuitive charts and reports.</p>
                  </div>
                )}
                
                {activeTab === "goals" && (
                  <div className="tab-panel">
                    <div className="feature-icon">🎯</div>
                    <h3>Financial Goals</h3>
                    <p>Set achievable financial goals and track your progress with motivating milestones.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="action-area">
              <button 
                className="primary-button"
                onClick={() => showSection("register-section")}
              >
                Start Saving Today <span className="button-emoji">✨</span>
              </button>
              <button 
                className="secondary-button"
                onClick={() => showSection("how-it-works")}
              >
                See How It Works <span className="button-emoji">👀</span>
              </button>
            </div>
          </div>
          
          {/* Right column - Visual elements */}
          <div className="visual-column">
            <div className={`finance-card ${darkMode ? 'dark-card' : ''}`}>
              <div className="card-header">
                <div className="card-title">Track Your Finances</div>
                <div className="card-balance">----</div>
              </div>
              
              <div className="card-chart">
                <div className="chart-bar" style={{ height: "60%" }}></div>
                <div className="chart-bar" style={{ height: "40%" }}></div>
                <div className="chart-bar" style={{ height: "75%" }}></div>
                <div className="chart-bar" style={{ height: "30%" }}></div>
                <div className="chart-bar" style={{ height: "55%" }}></div>
                <div className="chart-bar" style={{ height: "65%" }}></div>
                <div className="chart-bar" style={{ height: "45%" }}></div>
              </div>
              
              <div className="card-stats">
                <div className="stat-item">
                  <div className="stat-label">Spent</div>
                  <div className="stat-value">--</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Saved</div>
                  <div className="stat-value">--</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Budget</div>
                  <div className="stat-value">--</div>
                </div>
              </div>
            </div>
            
            <div className={`tip-box ${darkMode ? 'dark-tip' : ''}`}>
              <div className="tip-icon">💡</div>
              <div className="tip-content">
                <span className="tip-label">Pro Tip:</span>
                <span className="tip-text">{financeTips[tipIndex]}</span>
              </div>
              <div className="tip-indicators">
                {financeTips.map((_, i) => (
                  <span
                    key={i}
                    className={`tip-indicator ${i === tipIndex ? "active" : ""}`}
                    onClick={() => setTipIndex(i)}
                  ></span>
                ))}
              </div>
            </div>
            
            <div className="social-proof">
              <div className="stars">★★★★★</div>
              <div className="rating-text">4.8/5 from 10,000+ students</div>
            </div>
          </div>
        </div>
      </div>

      <footer className={`site-footer ${darkMode ? 'dark-footer' : ''}`}>
        <p className="copyright">© {new Date().getFullYear()} Student Finance Simplified. All rights reserved.</p>
      </footer>

      {/* Decorative elements */}
      <div className="decorative-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>
      
      
    </section>
            
  )
}

export default Home