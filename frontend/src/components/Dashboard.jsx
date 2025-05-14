"use client"

import { useState, useEffect } from "react"
import {
  Home,
  CreditCard,
  Wallet,
  Target,
  BarChart2,
  Calendar,
  Settings,
  Bell,
  User,
  LogOut,
  Menu,
  DollarSign,
  PieChart,
  ArrowUpRight,
  LightbulbIcon,
  Sun,
  Moon,
  ShoppingBasket,
  Bot,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import "../css/Dashboard.css"

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [activeTip, setActiveTip] = useState(0)

  const tips = [
    "Track your coffee expenses - small savings add up!",
    "Set a weekly budget for entertainment to avoid overspending",
    "Use student discounts whenever possible - they add up!",
    "Plan meals ahead to reduce food delivery expenses",
    "Consider second-hand textbooks to save on course materials",
  ]

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)

    // Auto-rotate tips every 5 seconds
    const tipInterval = setInterval(() => {
      setActiveTip((prev) => (prev + 1) % tips.length)
    }, 5000)

    return () => {
      window.removeEventListener("resize", handleResize)
      clearInterval(tipInterval)
    }
  }, [tips.length])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  // Function to handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  // Apply dashboard theme class based on darkMode state
  const dashboardClass = `dbDashboard ${darkMode ? "dbDarkTheme" : "dbLightTheme"}`

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview()
      case "expenses":
      case "savings":
      case "goals":
      case "ai-advisor":
      case "weekly-basket":
      case "reports":
      case "calendar":
        return renderComingSoon(activeTab)
      default:
        return renderOverview()
    }
  }

  const renderComingSoon = (pageName) => {
    const pageTitles = {
      "expenses": "Dépenses",
      "savings": "Économies",
      "goals": "Objectifs",
      "ai-advisor": "Conseiller IA",
      "weekly-basket": "Panier hebdomadaire",
      "reports": "Rapports",
      "calendar": "Calendrier"
    }

    return (
      <div className="dbComingSoon">
        <h2>{pageTitles[pageName]}</h2>
        <div className="dbComingSoonContent">
          <div className="dbComingSoonIcon">
            <Sparkles size={48} />
          </div>
          <p>Cette section est en cours de développement et sera bientôt disponible !</p>
          <button 
            className="dbBackButton"
            onClick={() => handleTabChange("overview")}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  const renderOverview = () => {
    return (
      <>
        <div className="dbWelcome">
          <h2>Bonjour, Chai 👋</h2>
          <p>Voici un aperçu de vos finances pour le mois de mai</p>
        </div>

        {/* Tab navigation */}
        <div className="dbTabNav">
          <button 
            className={`dbTabButton ${activeTab === "overview" ? "dbActiveTab" : ""}`}
            onClick={() => handleTabChange("overview")}
          >
            Vue d'ensemble
          </button>
          <button 
            className={`dbTabButton ${activeTab === "expenses" ? "dbActiveTab" : ""}`}
            onClick={() => handleTabChange("expenses")}
          >
            Dépenses
          </button>
          <button 
            className={`dbTabButton ${activeTab === "savings" ? "dbActiveTab" : ""}`}
            onClick={() => handleTabChange("savings")}
          >
            Économies
          </button>
        </div>

        {/* Stats cards */}
        <div className="dbStatsGrid">
          {/* First stat card */}
          <div className="dbStatCard">
            <div className="dbStatHeader">
              <div className="dbStatTitle">Dépensé ce mois</div>
              <div className="dbStatIcon dbPurple">
                <CreditCard size={20} />
              </div>
            </div>
            <div className="dbStatValue">1,250DH</div>
            <div className="dbStatTrend dbPositive">
              <ArrowUpRight size={16} />
              <span>12% de moins que le mois dernier</span>
            </div>
            <div className="dbStatChart">
              <div className="dbChartBars">
                <div className="dbBar" style={{ height: "40%" }}></div>
                <div className="dbBar" style={{ height: "30%" }}></div>
                <div className="dbBar" style={{ height: "60%" }}></div>
                <div className="dbBar" style={{ height: "25%" }}></div>
                <div className="dbBar" style={{ height: "50%" }}></div>
                <div className="dbBar" style={{ height: "70%" }}></div>
                <div className="dbBar" style={{ height: "45%" }}></div>
              </div>
            </div>
          </div>

          {/* Second stat card */}
          <div className="dbStatCard">
            <div className="dbStatHeader">
              <div className="dbStatTitle">Économisé ce mois</div>
              <div className="dbStatIcon dbBlue">
                <Wallet size={20} />
              </div>
            </div>
            <div className="dbStatValue">450DH</div>
            <div className="dbStatTrend dbPositive">
              <ArrowUpRight size={16} />
              <span>8% de plus que le mois dernier</span>
            </div>
            <div className="dbStatChart">
              <div className="dbChartBars">
                <div className="dbBar dbBlue" style={{ height: "20%" }}></div>
                <div className="dbBar dbBlue" style={{ height: "35%" }}></div>
                <div className="dbBar dbBlue" style={{ height: "25%" }}></div>
                <div className="dbBar dbBlue" style={{ height: "45%" }}></div>
                <div className="dbBar dbBlue" style={{ height: "30%" }}></div>
                <div className="dbBar dbBlue" style={{ height: "40%" }}></div>
                <div className="dbBar dbBlue" style={{ height: "50%" }}></div>
              </div>
            </div>
          </div>

          {/* Third stat card */}
          <div className="dbStatCard">
            <div className="dbStatHeader">
              <div className="dbStatTitle">Budget restant</div>
              <div className="dbStatIcon dbGreen">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="dbStatValue">750DH</div>
            <div className="dbStatTrend dbNeutral">
              <span>38% du budget mensuel</span>
            </div>
            <div className="dbProgressContainer">
              <div className="dbProgressBar" style={{ width: "38%" }}></div>
            </div>
            <div className="dbProgressLabels">
              <span>0DH</span>
              <span>2,000DH</span>
            </div>
          </div>
        </div>

        {/* New AI Services Highlight Card */}
        <div className="dbAiServicesCard">
          <div className="dbAiServicesHeader">
            <div className="dbAiServicesIcon">
              <Sparkles size={24} />
            </div>
            <h3>Nouveaux services intelligents</h3>
          </div>
          <div className="dbAiServicesGrid">
            <div 
              className="dbAiServiceItem" 
              onClick={() => handleTabChange("ai-advisor")}
            >
              <div className="dbAiServiceIcon dbPurple">
                <Bot size={24} />
              </div>
              <div className="dbAiServiceContent">
                <h4>Conseiller IA</h4>
                <p>Obtenez des conseils financiers personnalisés basés sur vos habitudes de dépenses</p>
              </div>
              <ChevronRight size={20} className="dbAiServiceArrow" />
            </div>
            <div 
              className="dbAiServiceItem" 
              onClick={() => handleTabChange("weekly-basket")}
            >
              <div className="dbAiServiceIcon dbGreen">
                <ShoppingBasket size={24} />
              </div>
              <div className="dbAiServiceContent">
                <h4>Panier hebdomadaire</h4>
                <p>Découvrez des paniers d'achats optimisés pour économiser sur vos courses</p>
              </div>
              <ChevronRight size={20} className="dbAiServiceArrow" />
            </div>
          </div>
        </div>

        {/* Pro Tip Card */}
        <div className="dbTipCard">
          <div className="dbTipHeader">
            <div className="dbTipIcon">
              <LightbulbIcon size={24} />
            </div>
            <h3>Pro Tip:</h3>
          </div>
          <p className="dbTipText">{tips[activeTip]}</p>
          <div className="dbTipDots">
            {tips.map((_, index) => (
              <span
                key={index}
                className={`dbDot ${index === activeTip ? "dbActiveDot" : ""}`}
                onClick={() => setActiveTip(index)}
              ></span>
            ))}
          </div>
        </div>

        {/* Saving Strategies Card */}
        <div className="dbSavingCard">
          <div className="dbSavingHeader">
            <div className="dbSavingIcon">
              <DollarSign size={24} />
            </div>
            <h3>Smart Saving Strategies</h3>
          </div>
          <p className="dbSavingText">
            Discover personalized saving tips based on your spending habits and student lifestyle.
          </p>
          <button className="dbViewMoreButton">View Strategies</button>
        </div>
      </>
    )
  }

  return (
    <div className={dashboardClass}>
      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && <div className="dbOverlay" onClick={toggleSidebar}></div>}

      {/* Sidebar */}
      <aside className={`dbSidebar ${isMobile && sidebarOpen ? "dbOpen" : ""}`}>
        <div className="dbSidebarHeader">
          <div className="dbLogo">
            <PieChart size={24} />
            <span>Simplified!</span>
          </div>
        </div>

        <nav className="dbNav">
          <div className="dbNavSection">
            <h3 className="dbNavTitle">Menu principal</h3>
            <ul>
              <li className={activeTab === "overview" ? "dbActive" : ""}>
                <button onClick={() => handleTabChange("overview")}>
                  <Home size={20} />
                  <span>Vue d'ensemble</span>
                </button>
              </li>
              <li className={activeTab === "expenses" ? "dbActive" : ""}>
                <button onClick={() => handleTabChange("expenses")}>
                  <CreditCard size={20} />
                  <span>Dépenses</span>
                </button>
              </li>
              <li className={activeTab === "savings" ? "dbActive" : ""}>
                <button onClick={() => handleTabChange("savings")}>
                  <Wallet size={20} />
                  <span>Économies</span>
                </button>
              </li>
              <li className={activeTab === "goals" ? "dbActive" : ""}>
                <button onClick={() => handleTabChange("goals")}>
                  <Target size={20} />
                  <span>Objectifs</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="dbNavSection">
            <h3 className="dbNavTitle">Services intelligents</h3>
            <ul>
              <li className={activeTab === "ai-advisor" ? "dbActive" : ""}>
                <button onClick={() => handleTabChange("ai-advisor")}>
                  <Bot size={20} />
                  <span>Conseiller IA</span>
                </button>
              </li>
              <li className={activeTab === "weekly-basket" ? "dbActive" : ""}>
                <button onClick={() => handleTabChange("weekly-basket")}>
                  <ShoppingBasket size={20} />
                  <span>Panier hebdomadaire</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="dbNavSection">
            <h3 className="dbNavTitle">Analytiques</h3>
            <ul>
              <li className={activeTab === "reports" ? "dbActive" : ""}>
                <button onClick={() => handleTabChange("reports")}>
                  <BarChart2 size={20} />
                  <span>Rapports</span>
                </button>
              </li>
              <li className={activeTab === "calendar" ? "dbActive" : ""}>
                <button onClick={() => handleTabChange("calendar")}>
                  <Calendar size={20} />
                  <span>Calendrier</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <div className="dbSidebarFooter">
          <div className="dbUserInfo">
            <div className="dbAvatar">
              <User size={20} />
            </div>
            <div>
              <p className="dbUserName">Jean Dupont</p>
              <p className="dbUserEmail">jean.dupont@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="dbMain">
        {/* Header */}
        <header className="dbHeader">
          <div className="dbHeaderLeft">
            <button className="dbMenuButton" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <h1>
              {activeTab === "overview" && "Tableau de bord"}
              {activeTab === "expenses" && "Dépenses"}
              {activeTab === "savings" && "Économies"}
              {activeTab === "goals" && "Objectifs"}
              {activeTab === "ai-advisor" && "Conseiller IA"}
              {activeTab === "weekly-basket" && "Panier hebdomadaire"}
              {activeTab === "reports" && "Rapports"}
              {activeTab === "calendar" && "Calendrier"}
            </h1>
          </div>
          <div className="dbHeaderRight">
            <button className="dbThemeToggle" onClick={toggleTheme}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className={`dbIconButton dbNotificationButton`}>
              <Bell size={20} />
              <span className="dbNotificationBadge"></span>
            </button>
            <button className="dbIconButton">
              <Settings size={20} />
            </button>
            <div className="dbUserDropdown">
              <button className="dbUserButton">
                <div className="dbAvatarSmall">
                  <User size={16} />
                </div>
              </button>
              <div className="dbDropdownContent">
                <a href="#">Profil</a>
                <a href="#">Paramètres</a>
                <a href="#">
                  <LogOut size={16} />
                  Déconnexion
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="dbContent">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}