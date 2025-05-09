"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../css/HowItWorks.css"

export default function HowItWorks({ darkMode }) {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(1)
  const [tipIndex, setTipIndex] = useState(0)
  const [bounceEmoji, setBounceEmoji] = useState("🚀")
  const emojis = ["🚀", "💰", "💸", "🎓", "✨"]

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

  return (
    <section className={`hiw-page ${darkMode ? 'dark-mode' : ''}`}>
      {/* Animated background */}
      <div className="hiw-animated-background">
        <div className="hiw-gradient-sphere hiw-sphere-1"></div>
        <div className="hiw-gradient-sphere hiw-sphere-2"></div>
        <div className="hiw-gradient-sphere hiw-sphere-3"></div>
        <div className="hiw-grid-overlay"></div>
      </div>

      {/* Main content */}
      <div className="hiw-container">
        {/* Hero section */}
        <div className="hiw-hero-section">
          <h1 className="hiw-page-title">
            How It Works <br />
            <span className="hiw-accent-text">Simplified!</span>
            <span className="hiw-emoji-highlight">{bounceEmoji}</span>
          </h1>
          <p className="hiw-page-description">
            Say goodbye to empty wallets and "can I borrow $5?" texts. Learn how our app helps you track expenses, crush
            financial goals, and still have money for weekend fun!
          </p>
          <div className="hiw-action-buttons">
            <button className="hiw-primary-button" onClick={() => navigate("/auth")}>
              Get Started <span className="hiw-button-emoji">✨</span>
            </button>
            <button className="hiw-secondary-button" onClick={() => navigate("/demo")}>
              Watch Demo <span className="hiw-button-emoji">👀</span>
            </button>
          </div>
        </div>

        {/* Steps section */}
        <div className="hiw-section-container">
          <h2 className="hiw-section-title">Three Simple Steps</h2>
          <div className="hiw-steps-container">
            <div className={`hiw-step-card ${activeStep === 1 ? "active-step" : ""} ${darkMode ? 'dark-card' : ''}`} onClick={() => setActiveStep(1)}>
              <div className="hiw-step-header">
                <div className="hiw-step-icon wallet-icon">💰</div>
                <h3 className="hiw-step-title">Set Up Your Profile</h3>
              </div>
              <p className="hiw-step-description">
                Create your account and add your income sources (part-time jobs, allowances, scholarships) and recurring
                expenses (rent, subscriptions).
              </p>
            </div>

            <div className={`hiw-step-card ${activeStep === 2 ? "active-step" : ""} ${darkMode ? 'dark-card' : ''}`} onClick={() => setActiveStep(2)}>
              <div className="hiw-step-header">
                <div className="hiw-step-icon target-icon">🎯</div>
                <h3 className="hiw-step-title">Set Financial Goals</h3>
              </div>
              <p className="hiw-step-description">
                Define what you're saving for - textbooks, spring break, or post-graduation plans. Our app helps you
                visualize and track progress.
              </p>
            </div>

            <div className={`hiw-step-card ${activeStep === 3 ? "active-step" : ""} ${darkMode ? 'dark-card' : ''}`} onClick={() => setActiveStep(3)}>
              <div className="hiw-step-header">
                <div className="hiw-step-icon chart-icon">📊</div>
                <h3 className="hiw-step-title">Track & Analyze</h3>
              </div>
              <p className="hiw-step-description">
                Log your daily expenses and income. Our smart analytics show where your money goes and suggests ways to
                improve your habits.
              </p>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="hiw-section-container">
          <h2 className="hiw-section-title">Key Features</h2>
          <div className="hiw-features-grid">
            <div className={`hiw-feature-card ${darkMode ? 'dark-card' : ''}`}>
              <div className="hiw-feature-icon">🧮</div>
              <div className="hiw-feature-content">
                <h3 className="hiw-feature-title">Smart Budget Calculator</h3>
                <p className="hiw-feature-description">
                  Our AI-powered calculator suggests optimal budget allocations based on your income, location, and
                  student status.
                </p>
              </div>
            </div>

            <div className={`hiw-feature-card ${darkMode ? 'dark-card' : ''}`}>
              <div className="hiw-feature-icon">💳</div>
              <div className="hiw-feature-content">
                <h3 className="hiw-feature-title">Expense Categorization</h3>
                <p className="hiw-feature-description">
                  Automatically categorizes your spending into essentials, education, entertainment, and more for better
                  insights.
                </p>
              </div>
            </div>

            <div className={`hiw-feature-card ${darkMode ? 'dark-card' : ''}`}>
              <div className="hiw-feature-icon">📚</div>
              <div className="hiw-feature-content">
                <h3 className="hiw-feature-title">Financial Education</h3>
                <p className="hiw-feature-description">
                  Meet your AI money coach who analyzes your spending instantly, then gives hyper-personalized tips
                </p>
              </div>
            </div>

            <div className={`hiw-feature-card ${darkMode ? 'dark-card' : ''}`}>
              <div className="hiw-feature-icon">💵</div>
              <div className="hiw-feature-content">
                <h3 className="hiw-feature-title">Meal Planning</h3>
                <p className="hiw-feature-description">
                  Plan meals week by week, focusing on budget-friendly staples, buying in bulk, and cooking in batches to save money.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="hiw-section-container">
          <h2 className="hiw-section-title">See It In Action</h2>
          <div className="hiw-dashboard-preview">
            <div className="hiw-preview-content">
              <h3 className="hiw-preview-title">Track Your Finances</h3>
              <p className="hiw-preview-description">
                Our intuitive dashboard gives you a complete overview of your financial health at a glance. Monitor your
                spending, track your savings goals, and see your budget allocation in real-time.
              </p>
              <ul className="hiw-feature-list">
                <li className="hiw-feature-item">Visual spending breakdowns by category</li>
                <li className="hiw-feature-item">Progress bars for savings goals</li>
                <li className="hiw-feature-item">Monthly comparison charts</li>
                <li className="hiw-feature-item">Customizable budget limits with alerts</li>
              </ul>
            </div>

            <div className={`hiw-finance-card ${darkMode ? 'dark-card' : ''}`}>
              <div className="hiw-card-header">
                <div className="hiw-card-title">Track Your Finances</div>
                <div className="hiw-card-balance">----</div>
              </div>

              <div className="hiw-card-chart">
                <div className="hiw-chart-bar" style={{ height: "60%" }}></div>
                <div className="hiw-chart-bar" style={{ height: "40%" }}></div>
                <div className="hiw-chart-bar" style={{ height: "75%" }}></div>
                <div className="hiw-chart-bar" style={{ height: "30%" }}></div>
                <div className="hiw-chart-bar" style={{ height: "55%" }}></div>
                <div className="hiw-chart-bar" style={{ height: "65%" }}></div>
                <div className="hiw-chart-bar" style={{ height: "45%" }}></div>
              </div>

              <div className="hiw-card-stats">
                <div className="hiw-stat-item">
                  <div className="hiw-stat-label">Spent</div>
                  <div className="hiw-stat-value">--</div>
                </div>
                <div className="hiw-stat-item">
                  <div className="hiw-stat-label">Saved</div>
                  <div className="hiw-stat-value">--</div>
                </div>
                <div className="hiw-stat-item">
                  <div className="hiw-stat-label">Budget</div>
                  <div className="hiw-stat-value">--</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pro tips section */}
        <div className="hiw-section-container">
          <h2 className="hiw-section-title">Pro Tips</h2>
          <div className={`hiw-tip-box ${darkMode ? 'dark-tip' : ''}`}>
            <div className="hiw-tip-content">
              <div className="hiw-tip-icon">💡</div>
              <div>
                <span className="hiw-tip-label">Pro Tip:</span>
                <span className="hiw-tip-text">{financeTips[tipIndex]}</span>
              </div>
            </div>
            <div className="hiw-tip-indicators">
              {financeTips.map((_, i) => (
                <span
                  key={i}
                  className={`hiw-tip-indicator ${i === tipIndex ? "active" : ""}`}
                  onClick={() => setTipIndex(i)}
                ></span>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="hiw-section-container">
          <h2 className="hiw-section-title">Student Success Stories</h2>
          <div className="hiw-testimonials-container">
            <div className={`hiw-testimonial-card ${darkMode ? 'dark-card' : ''}`}>
              <p className="hiw-testimonial-text">
                "I saved enough for my study abroad semester by using the goal tracking feature. It made the impossible
                seem achievable!"
              </p>
              <div className="hiw-testimonial-author">- Emma, 21</div>
              <div className="hiw-stars">★★★★★</div>
            </div>

            <div className={`hiw-testimonial-card ${darkMode ? 'dark-card' : ''}`}>
              <p className="hiw-testimonial-text">
                "The expense categorization helped me realize I was spending too much on takeout. I cut back and saved
                $200 a month!"
              </p>
              <div className="hiw-testimonial-author">- Marcus, 19</div>
              <div className="hiw-stars">★★★★★</div>
            </div>

            <div className={`hiw-testimonial-card ${darkMode ? 'dark-card' : ''}`}>
              <p className="hiw-testimonial-text">
                "As a first-gen student, I had no idea how to manage money. This app taught me everything I needed to
                know."
              </p>
              <div className="hiw-testimonial-author">- Sophia, 22</div>
              <div className="hiw-stars">★★★★★</div>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className={`hiw-cta-container ${darkMode ? 'dark-cta' : ''}`}>
          <h2 className="hiw-cta-title">Ready to Take Control of Your Finances?</h2>
          <p className="hiw-cta-description">
            Join thousands of students who are mastering their money management skills with our app.
          </p>
          <button className="hiw-primary-button large" onClick={() => navigate("/auth")}>
            Get Started Now <span className="hiw-button-emoji">🚀</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className={`hiw-site-footer ${darkMode ? 'dark-footer' : ''}`}>
        <p className="hiw-copyright">© {new Date().getFullYear()} Student Finance Simplified. All rights reserved.</p>
      </footer>

      {/* Decorative elements */}
      <div className="hiw-decorative-shapes">
        <div className="hiw-shape hiw-shape-1"></div>
        <div className="hiw-shape hiw-shape-2"></div>
        <div className="hiw-shape hiw-shape-3"></div>
        <div className="hiw-shape hiw-shape-4"></div>
      </div>
    </section>
  )
}