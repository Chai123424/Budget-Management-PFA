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
  Search,
  MapPin,
} from "lucide-react"
import "../css/Dashboard.css"
import logo from "../assets/icons/money-management.png";
import Expenses from "./Expenses";
import Savings from "./Savings";
import GoalsPage  from "./Goals";
import GroceryMap from "./GroceryMap";


export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [activeTip, setActiveTip] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)

  const tips = [
    "Track your coffee expenses - small savings add up!",
    "Set a weekly budget for entertainment to avoid overspending",
    "Use student discounts whenever possible - they add up!",
    "Plan meals ahead to reduce food delivery expenses",
    "Consider second-hand textbooks to save on course materials",
  ]

  // Faux résultats de recherche pour la démonstration
  const searchResults = [
   { id: 1, type: "expense", title: "Expense - Grocery", amount: "120DH", date: "May 15, 2025" },
    { id: 2, type: "expense", title: "Expense - Restaurant", amount: "85DH", date: "May 12, 2025" },
    { id: 3, type: "savings", title: "Savings - Vacation Goal", amount: "200DH", date: "May 10, 2025" },
    { id: 4, type: "goals", title: "Goal - New Laptop", amount: "1500DH", date: "In progress" },
  ].filter(item => 
    searchQuery && item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  // Effet pour gérer l'affichage des résultats de recherche
  useEffect(() => {
    if (searchQuery) {
      setShowSearchResults(true)
    } else {
      setShowSearchResults(false)
    }
  }, [searchQuery])

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
    // Reset search when changing tabs
    setSearchQuery("")
    setShowSearchResults(false)
  }

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    // Logique de recherche ici
    console.log("Recherche soumise:", searchQuery)
  }

  // Gérer le clic sur un résultat de recherche
  const handleSearchResultClick = (result) => {
    console.log("Résultat sélectionné:", result)
    // Naviguer vers la page appropriée selon le type de résultat
    if (result.type === "expense") {
      setActiveTab("expenses")
    } else if (result.type === "savings") {
      setActiveTab("savings")
    } else if (result.type === "goals") {
      setActiveTab("goals")
    }
    // Fermer les résultats
    setShowSearchResults(false)
  }

  // Apply dashboard theme class based on darkMode state
  const dashboardClass = `dbDashboard ${darkMode ? "dbDarkTheme" : "dbLightTheme"}`

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview()
      case "expenses":
        return (
          <div className="content-page">
            <Expenses darkMode={darkMode} />
          </div>
        )
      case "savings":
        return (
          <div className="content-page">
            <Savings darkMode={darkMode} />
          </div>
        )
      case "goals":
        return (
          <div className="content-page">
            <GoalsPage darkMode={darkMode} />
          </div>
        )
      // Add this case for the grocery map
      case "grocery-map":
        return (
          <div className="content-page">
            <GroceryMap darkMode={darkMode} />
          </div>
        )
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
      "grocery-map": "Localisateur de magasins", 
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
          <p>This section is under development and will be available soon!</p>
          <button 
            className="dbBackButton"
            onClick={() => handleTabChange("overview")}
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const renderOverview = () => {
    return (
      <>
        <div className="dbWelcome">
          <h2>Hello, Student 👋</h2>
          <p>Here's your financial overview for May</p>
        </div>

        {/* Tab navigation */}
        <div className="dbTabNav">
          <button 
            className={`dbTabButton ${activeTab === "overview" ? "dbActiveTab" : ""}`}
            onClick={() => handleTabChange("overview")}
          >
            Overview
          </button>
          <button 
            className={`dbTabButton ${activeTab === "expenses" ? "dbActiveTab" : ""}`}
            onClick={() => handleTabChange("expenses")}
          >
            Expenses
          </button>
          <button 
            className={`dbTabButton ${activeTab === "savings" ? "dbActiveTab" : ""}`}
            onClick={() => handleTabChange("savings")}
          >
            Savings
          </button>
        </div>

        {/* Stats cards */}
        <div className="dbStatsGrid">
          {/* First stat card */}
          <div className="dbStatCard">
            <div className="dbStatHeader">
              <div className="dbStatTitle">Spent this month</div>
              <div className="dbStatIcon dbPurple">
                <CreditCard size={20} />
              </div>
            </div>
            <div className="dbStatValue">1,250DH</div>
            <div className="dbStatTrend dbPositive">
              <ArrowUpRight size={16} />
              <span>12% less than last month</span>
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
              <div className="dbStatTitle">Saved this month</div>
              <div className="dbStatIcon dbBlue">
                <Wallet size={20} />
              </div>
            </div>
            <div className="dbStatValue">450DH</div>
            <div className="dbStatTrend dbPositive">
              <ArrowUpRight size={16} />
              <span>8% more than last month</span>
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
              <div className="dbStatTitle">Remaining budget</div>
              <div className="dbStatIcon dbGreen">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="dbStatValue">750DH</div>
            <div className="dbStatTrend dbNeutral">
              <span>38% of monthly budget</span>
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
            <h3>New Smart Services</h3>
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
                 <h4>AI Advisor</h4>
                <p>Get personalized financial advice based on your spending habits</p>
              </div>
              <ChevronRight size={20} className="dbAiServiceArrow" />
            </div>
            <div 
              className="dbAiServiceItem" 
              onClick={() => handleTabChange("Smart-cart")}
            >
              <div className="dbAiServiceIcon dbGreen">
                <ShoppingBasket size={24} />
              </div>
              <div className="dbAiServiceContent">
                 <h4>Smart cart </h4>
                <p>Discover optimized shopping baskets to save on your groceries</p>
              </div>
              <ChevronRight size={20} className="dbAiServiceArrow" />
            </div>
          </div>

          <div className="dbAiServiceItem" onClick={() => handleTabChange("grocery-map")}>
              <div className="dbAiServiceIcon dbBlue">
                <MapPin size={24} />
              </div>
              <div className="dbAiServiceContent">
                <h4>Simplify Map</h4>
                <p>Find nearby grocery stores and get directions in Fès</p>
              </div>
              <ChevronRight size={20} className="dbAiServiceArrow" />
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

  // Rendu des résultats de recherche
  const renderSearchResults = () => {
    if (!showSearchResults || searchResults.length === 0) return null;

    return (
      <div className="dbSearchResults">
        <h4>Résultats de recherche</h4>
        <ul>
          {searchResults.map((result) => (
            <li key={result.id} onClick={() => handleSearchResultClick(result)}>
              <div className="dbSearchResultContent">
                <div className="dbSearchResultTitle">{result.title}</div>
                <div className="dbSearchResultDetails">
                  <span className="dbSearchResultAmount">{result.amount}</span>
                  <span className="dbSearchResultDate">{result.date}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className={dashboardClass}>
      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && <div className="dbOverlay" onClick={toggleSidebar}></div>}

      {/* Sidebar */}
      <aside className={`dbSidebar ${isMobile && sidebarOpen ? "dbOpen" : ""}`}>
        <div className="dbSidebarHeader">
          <div className="dbLogo">
            <img src={logo} alt="logo" className="logo"  />
            <span>Simplified!</span>
          </div>
        </div>

        <nav className="dbNav">
          <div className="dbNavSection">
            <h3 className="dbNavTitle">Main Menu</h3>
            <ul>
              <li className={activeTab === "overview" ? "dbActive" : ""}>
                <button onClick={() => handleTabChange("overview")}>
                  <Home size={20} />
                  <span>Overview</span>
                </button>
              </li>
              <li className={activeTab === "expenses" ? "dbActive" : ""}>
                <button onClick={() => handleTabChange("expenses")}>
                  <CreditCard size={20} />
                  <span>Expenses</span>
                </button>
              </li>
              <li className={activeTab === "savings" ? "dbActive" : ""}>
                <button onClick={() => handleTabChange("savings")}>
                  <Wallet size={20} />
                  <span>Savings</span>
                </button>
              </li>
              <li className={activeTab === "goals" ? "dbActive" : ""}>
                <button onClick={() => handleTabChange("goals")}>
                  <Target size={20} />
                  <span>Goals</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="dbNavSection">
            <h3 className="dbNavTitle">Smart Services</h3>
            <ul>
              <li className={activeTab === "ai-advisor" ? "dbActive" : ""}>
                <button onClick={() => handleTabChange("ai-advisor")}>
                  <Bot size={20} />
                  <span>AI Advisor</span>
                </button>
              </li>
              <li className={activeTab === "weekly-basket" ? "dbActive" : ""}>
                <button onClick={() => handleTabChange("weekly-basket")}>
                  <ShoppingBasket size={20} />
                  <span>Smart cart</span>
                </button>
              </li>
              <li className={activeTab === "grocery-map" ? "dbActive" : ""}>
                <button onClick={() => handleTabChange("grocery-map")}>
                  <MapPin size={20} />
                  <span>Simplify Map</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="dbNavSection">
            <h3 className="dbNavTitle">Analytics</h3>
            <ul>
              <li className={activeTab === "reports" ? "dbActive" : ""}>
                <button onClick={() => handleTabChange("reports")}>
                  <BarChart2 size={20} />
                  <span>Reports</span>
                </button>
              </li>
              <li className={activeTab === "calendar" ? "dbActive" : ""}>
                <button onClick={() => handleTabChange("calendar")}>
                  <Calendar size={20} />
                  <span>Calendar</span>
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
              <p className="dbUserName">Faiz Chaimae</p>
              <p className="dbUserEmail">chaimaefaiz24@gmail.com</p>
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
            
          </div>
          
          {/* Nouvelle barre de recherche */}
          <div className="dbSearchContainer">
            <form onSubmit={handleSearchSubmit} className="dbSearchForm">
              <div className="dbSearchInputWrapper">
                <Search size={18} className="dbSearchIcon" />
                <input
                  type="text"
                  placeholder=""
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="dbSearchInput"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    className="dbSearchClearButton"
                    onClick={() => setSearchQuery("")}
                  >
                    ×
                  </button>
                )}
              </div>
              {renderSearchResults()}
            </form>
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
                <a href="#">Profile</a>
                <a href="#">Settings</a>
                <a href="#">
                  <LogOut size={16} />
                  Logout
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