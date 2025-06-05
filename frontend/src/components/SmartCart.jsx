"use client"

import { useState, useEffect } from "react"
import {
  ShoppingCart,
  DollarSign,
  Calendar,
  Sparkles,
  Plus,
  Check,
  Star,
  TrendingUp,
  AlertCircle,
  Download,
  Edit3,
  Filter,
  Search,
  Loader,
  RefreshCw,
} from "lucide-react"
import "../css/SmartCart.css"

const SmartCart = ({ darkMode = true }) => {
  // Constants
  const CURRENCY_SYMBOL = "DH";
  const STUDENT_MAX_PRICE = 25; // 250 DH instead of $25
  const PRODUCT_SERVICE_URL = process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || "http://localhost:5002/api"

  // State
  const [selectedWeek, setSelectedWeek] = useState("current")
  const [budget, setBudget] = useState(800) // Adjusted for DH
  const [selectedBasket, setSelectedBasket] = useState(null)
  const [customItems, setCustomItems] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [favorites, setFavorites] = useState([])
  const [showBudgetEdit, setShowBudgetEdit] = useState(false)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [popularProducts, setPopularProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [basketProducts, setBasketProducts] = useState([])
  const [debugInfo, setDebugInfo] = useState({})
  const [isUsingMockData, setIsUsingMockData] = useState(false)

  // Product helpers
  const getProductName = (product) => {
    return product.name || product.product_name || product.brand_name || "Unknown Product"
  }

  const getProductPrice = (product) => {
    return parseFloat(product.price) || 0
  }

  const getProductCategory = (product) => {
    return product.category || product.food_group || "Other"
  }

  // Enhanced product filtering
  const filterStudentFriendlyProducts = (productList) => {
    if (!productList || !Array.isArray(productList)) return []
    
    return productList.filter((product) => {
      const price = getProductPrice(product)
      return price > 0 && price <= STUDENT_MAX_PRICE
    })
  }

  // More diversified product selection
  const getDiverseProducts = (productList, maxCount = 15) => {
    const studentProducts = filterStudentFriendlyProducts(productList)
    if (studentProducts.length === 0) return []

    // Group by category
    const productsByCategory = {}
    studentProducts.forEach(product => {
      const category = getProductCategory(product).toLowerCase()
      if (!productsByCategory[category]) {
        productsByCategory[category] = []
      }
      productsByCategory[category].push(product)
    })

    // Get balanced selection from each category
    const categories = Object.keys(productsByCategory)
    const productsPerCategory = Math.ceil(maxCount / categories.length)
    
    let diverseProducts = []
    
    categories.forEach(category => {
      const categoryProducts = productsByCategory[category]
        .sort((a, b) => getProductPrice(a) - getProductPrice(b))
        .slice(0, productsPerCategory)
      
      diverseProducts = [...diverseProducts, ...categoryProducts]
    })

    // Shuffle and limit
    return diverseProducts
      .sort(() => Math.random() - 0.5)
      .slice(0, maxCount)
  }

  // API calls
  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${PRODUCT_SERVICE_URL}/products`, {
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      const receivedProducts = data.products || data

      if (!Array.isArray(receivedProducts)) {
        throw new Error("Invalid products data format")
      }

      setDebugInfo({
        status: receivedProducts.length ? "success" : "empty_database",
        message: receivedProducts.length ? "Products loaded" : "Empty database",
        productCount: receivedProducts.length,
        sampleProduct: receivedProducts[0]
      })

      setProducts(receivedProducts)
      setIsUsingMockData(false)
      
    } catch (err) {
      console.error("API fetch failed:", err)
      setError(`Failed to fetch: ${err.message}`)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${PRODUCT_SERVICE_URL}/categories`, {
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      setCategories(data.categories || data || [])
    } catch (err) {
      console.warn("Categories fetch failed:", err.message)
      setCategories([])
    }
  }

  // Basket generation with DH
  const generateSmartBaskets = () => {
    const essentialCategories = ["dairy", "grains", "protein", "vegetables", "fruits", "bread", "beverages"]

    const currentWeekProducts = getDiverseProducts(products, 12)
    const nextWeekProducts = getDiverseProducts(
      products.filter((p) => !currentWeekProducts.find(c => c._id === p._id || c.id === p.id)),
      10
    )

    const createBasketItems = (productList) => {
      return productList.map((product) => {
        const price = getProductPrice(product)
        const name = getProductName(product)
        const category = getProductCategory(product)

        const isEssential = essentialCategories.some(cat => 
          category.toLowerCase().includes(cat) || 
          name.toLowerCase().includes(cat)
        ) || price <= 80 // 80 DH instead of $8

        return {
          id: product._id || product.id,
          name,
          price,
          category,
          essential: isEssential,
          brand: product.brand_name || "Generic",
          studentFriendly: true,
        }
      })
    }

    const currentItems = createBasketItems(currentWeekProducts)
    const nextItems = createBasketItems(nextWeekProducts)

    return {
      current: {
        title: "Student Basket - This Week",
        description: "Diverse and economical selection",
        totalCost: currentItems.reduce((sum, item) => sum + item.price, 0),
        savings: `Save ${CURRENCY_SYMBOL}${Math.floor(Math.random() * 200 + 150)}`, // DH values
        items: currentItems,
      },
      next: {
        title: "Balanced Basket - Next Week",
        description: "Variety and great value",
        totalCost: nextItems.reduce((sum, item) => sum + item.price, 0),
        savings: `Save ${CURRENCY_SYMBOL}${Math.floor(Math.random() * 180 + 120)}`, // DH values
        items: nextItems,
      },
    }
  }

  const weeklyBaskets = generateSmartBaskets()

  // Other helper functions
  const addToBasket = (product) => {
    setBasketProducts([...basketProducts, {
      id: product._id || product.id,
      name: getProductName(product),
      price: getProductPrice(product),
      category: getProductCategory(product),
      brand: product.brand_name || "Generic",
    }])
  }

  const getTotalWithCustom = () => {
    const basketTotal = selectedBasket ? weeklyBaskets[selectedBasket]?.totalCost || 0 : 0
    const customTotal = customItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
    const additionalTotal = basketProducts.reduce((sum, item) => sum + item.price, 0)
    return basketTotal + customTotal + additionalTotal
  }

  const getDisplayProducts = () => {
    let productsToDisplay = getDiverseProducts(products, 20)

    if (searchTerm.trim()) {
      productsToDisplay = productsToDisplay.filter((product) => {
        const name = getProductName(product).toLowerCase()
        const category = getProductCategory(product).toLowerCase()
        return name.includes(searchTerm.toLowerCase()) || 
               category.includes(searchTerm.toLowerCase())
      })
    }

    if (selectedCategory !== "all") {
      productsToDisplay = productsToDisplay.filter(
        (product) => getProductCategory(product).toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    return productsToDisplay.slice(0, 8)
  }

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      await fetchProducts()
      await fetchCategories()
    }
    loadData()
  }, [])

  return (
    <div className={`sc-container ${darkMode ? "sc-dark-theme" : "sc-light-theme"}`}>
      <div className="sc-header">
        <div className="sc-header-content">
          <div className="sc-header-icon">
            <ShoppingCart size={32} />
          </div>
          <div className="sc-header-text">
            <h1>Smart Student Cart</h1>
            <p>MongoDB-powered product selection</p>
          </div>
        </div>
        <div className="sc-ai-badge">
          <Sparkles size={16} />
          <span>Database Connected</span>
        </div>
      </div>

      {/* Debug Section */}
      <div className="sc-debug-section">
        <h3>🐛 Debug Information</h3>
        <div>
          <p><strong>API URL:</strong> {PRODUCT_SERVICE_URL}</p>
          <p><strong>Products:</strong> {products.length}</p>
          <p><strong>Categories:</strong> {categories.length}</p>
          <p><strong>Status:</strong> {debugInfo.status || 'Not set'}</p>
        </div>
      </div>

      {/* Budget Section */}
      <div className="sc-budget-section">
        <div className="sc-budget-display">
          <DollarSign size={20} />
          <span>Budget: </span>
          {showBudgetEdit ? (
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
              onBlur={() => setShowBudgetEdit(false)}
              autoFocus
            />
          ) : (
            <span onClick={() => setShowBudgetEdit(true)} className="sc-budget-value">
              {CURRENCY_SYMBOL}{budget.toFixed(2)}
            </span>
          )}
          <Edit3 size={16} onClick={() => setShowBudgetEdit(true)} />
        </div>
        <div className="sc-budget-tip">
          <span>💡 Tip: Products selected under {STUDENT_MAX_PRICE}{CURRENCY_SYMBOL}</span>
        </div>
      </div>

      {loading && (
        <div className="sc-loading">
          <Loader size={20} className="sc-spinner" />
          <span>Loading products...</span>
        </div>
      )}

      {error && (
        <div className="sc-error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={fetchProducts} className="sc-retry-btn">
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      )}

      {!loading && (
        <>
          {/* Search and Filter */}
          <div className="sc-search-section">
            <div className="sc-search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="sc-filter-section">
              <Filter size={18} />
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Week Selector */}
          <div className="sc-week-selector">
            <button
              className={`sc-week-btn ${selectedWeek === "current" ? "active" : ""}`}
              onClick={() => setSelectedWeek("current")}
            >
              <Calendar size={16} />
              This week
            </button>
            <button
              className={`sc-week-btn ${selectedWeek === "next" ? "active" : ""}`}
              onClick={() => setSelectedWeek("next")}
            >
              <Calendar size={16} />
              Next week
            </button>
          </div>

          {/* Baskets */}
          <div className="sc-baskets-grid">
            {Object.entries(weeklyBaskets).map(([key, basket]) => (
              <div
                key={key}
                className={`sc-basket-card ${selectedBasket === key ? "selected" : ""}`}
                onClick={() => setSelectedBasket(selectedBasket === key ? null : key)}
              >
                <div className="sc-basket-header">
                  <h3>{basket.title}</h3>
                  <p>{basket.description}</p>
                  <div className="sc-basket-price">
                    <span className="sc-price">{CURRENCY_SYMBOL}{basket.totalCost.toFixed(2)}</span>
                    <span className="sc-savings">{basket.savings}</span>
                  </div>
                </div>
                {selectedBasket === key && (
                  <div className="sc-basket-details">
                    {basket.items.map((item, index) => (
                      <div key={index} className={`sc-item-row ${item.essential ? "essential" : ""}`}>
                        <span className="sc-item-name">{item.name}</span>
                        <span className="sc-item-price">{CURRENCY_SYMBOL}{item.price.toFixed(2)}</span>
                        {item.essential && <Check size={14} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Products Grid */}
          <div className="sc-products-section">
            <h3>Available Products ({products.length})</h3>
            <div className="sc-products-grid">
              {getDisplayProducts().map((product) => {
                const productName = getProductName(product)
                const productPrice = getProductPrice(product)
                const productCategory = getProductCategory(product)

                return (
                  <div key={product._id || product.id} className="sc-product-card">
                    <div className="sc-product-info">
                      <h4>{productName}</h4>
                      <p className="sc-product-category">{productCategory}</p>
                      <div className="sc-product-price">
                        <span className="sc-price">{CURRENCY_SYMBOL}{productPrice.toFixed(2)}</span>
                        {productPrice <= 100 && <span className="sc-good-deal">Good deal!</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => addToBasket(product)} 
                      className="sc-add-to-basket-btn"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Cart Summary */}
      <div className="sc-cart-summary">
        <div className="sc-summary-content">
          <div className="sc-total-section">
            <span className="sc-total-label">Total:</span>
            <span className="sc-total-amount">{CURRENCY_SYMBOL}{getTotalWithCustom().toFixed(2)}</span>
          </div>
          <div className="sc-budget-status">
            {getTotalWithCustom() <= budget ? (
              <span className="sc-within-budget">
                <Star size={16} />
                Within budget
              </span>
            ) : (
              <span className="sc-over-budget">
                <AlertCircle size={16} />
                Over by {CURRENCY_SYMBOL}{(getTotalWithCustom() - budget).toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <div className="sc-action-buttons">
          <button className="sc-generate-list-btn">
            <Download size={16} />
            Download
          </button>
          <button className="sc-optimize-btn">
            <TrendingUp size={16} />
            Optimize
          </button>
        </div>
      </div>
    </div>
  )
}

export default SmartCart