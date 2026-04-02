"use client"

import { useState, useEffect } from "react"
import {
  ShoppingCart,
  DollarSign,
  Calendar,
  ChefHat,
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
  Trash2,
  X,
} from "lucide-react"
import "../css/SmartCart.css"
import { useNavigate } from 'react-router-dom';

const SmartCart = ({ darkMode = true }) => {
  // Add the navigate hook here
  const navigate = useNavigate();

  // Constants - moved from backend to frontend
  const CURRENCY_SYMBOL = "DH";
  const STUDENT_MAX_PRICE = 25; 
  const PRODUCT_SERVICE_URL = process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || "http://localhost:5002/api"
  const ALLOWED_FOOD_GROUPS = ["dairy", "vegetables", "protein", "carbs", "condiments", "fruits"];
  const ALLOWED_PRICE_CATEGORIES = ["very_cheap", "cheap"];

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
  const [removedOriginalItems, setRemovedOriginalItems] = useState({})

  const handleRecipesRedirect = () => {
    navigate('/recommendation'); 
  }

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

  const getProductFoodGroup = (product) => {
    return product.food_group || product.category || "other"
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
    if (!productList || productList.length === 0) return []
  
    // Products are already filtered and diverse from backend
    // Just shuffle and limit
    return productList
      .sort(() => Math.random() - 0.5)
      .slice(0, maxCount)
  }
  

  // API calls
  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Use backend filtering instead of frontend filtering
      const response = await fetch(`${PRODUCT_SERVICE_URL}/products?student_filter=true&limit=100`, {
        headers: { "Content-Type": "application/json" },
      })
  
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  
      const data = await response.json()
      const receivedProducts = data.products || data
  
      if (!Array.isArray(receivedProducts)) {
        throw new Error("Invalid products data format")
      }
  
      // Products are already filtered by backend
      setDebugInfo({
        status: receivedProducts.length ? "success" : "empty_filtered",
        message: receivedProducts.length ? "Backend filtered products loaded" : "No products match criteria",
        totalCount: receivedProducts.length,
        sampleProduct: receivedProducts[0],
        allowedFoodGroups: data.allowed_food_groups || ALLOWED_FOOD_GROUPS,
        allowedPriceCategories: data.allowed_price_categories || ALLOWED_PRICE_CATEGORIES,
        backendFiltered: data.student_filtered || false
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


  const filterAllowedProducts = (productList) => {
    if (!productList || !Array.isArray(productList)) return []
    
    // Products are already filtered by backend, just validate
    return productList.filter((product) => {
      const price = getProductPrice(product)
      const foodGroup = getProductFoodGroup(product).toLowerCase()
      
      return price > 0 && price <= STUDENT_MAX_PRICE && 
             ALLOWED_FOOD_GROUPS.includes(foodGroup)
    })
  }
  

  const fetchStudentConfig = async () => {
    try {
      const response = await fetch(`${PRODUCT_SERVICE_URL}/student/config`, {
        headers: { "Content-Type": "application/json" },
      })
  
      if (response.ok) {
        const config = await response.json()
        // Update constants with backend values
        console.log("Student config loaded:", config)
        return config
      }
    } catch (err) {
      console.warn("Student config fetch failed, using defaults:", err.message)
    }
    return null
  }


  const fetchCategories = async () => {
    try {
      const response = await fetch(`${PRODUCT_SERVICE_URL}/categories`, {
        headers: { "Content-Type": "application/json" },
      })
  
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  
      const data = await response.json()
      const allCategories = data.categories || data || []
      
      // Filter categories to only show allowed food groups
      const filteredCategories = allCategories.filter(category => 
        ALLOWED_FOOD_GROUPS.some(allowed => 
          category.toLowerCase().includes(allowed.toLowerCase())
        )
      )
      
      setCategories(filteredCategories.length > 0 ? filteredCategories : ALLOWED_FOOD_GROUPS)
    } catch (err) {
      console.warn("Categories fetch failed:", err.message)
      setCategories(ALLOWED_FOOD_GROUPS) // Fallback to allowed food groups
    }
  }

  // Enhanced Smart Basket Generation with 10 essential products
  const generateSmartBaskets = () => {
    // Expanded essential categories for better coverage
    const essentialCategories = [
      "dairy", "grains", "protein", "vegetables", "fruits", 
      "bread", "beverages", "oils", "snacks", "legumes", 
      "meat", "fish", "eggs", "cereals", "pasta", "rice",
      "milk", "cheese", "yogurt", "chicken", "beef", "beans"
    ]

    // Affordable price categories
    const affordablePriceCategories = ["very_cheap", "cheap", "moderate"]

    // Enhanced function to get 10 essential products
    const getEssentialProducts = (excludeIds = [], targetCount = 10) => {
      const essentialProducts = []
      const usedCategories = new Set()
      
      // Step 1: Get one product from each essential category (prioritize diversity)
      essentialCategories.forEach(category => {
        if (essentialProducts.length >= targetCount) return
        
        const categoryProducts = products.filter(product => {
          const productCategory = (product.category || product.food_group || "").toLowerCase()
          const priceCategory = (product.price_category || "").toLowerCase()
          const productId = product._id || product.id
          
          return (
            (productCategory === category.toLowerCase() || 
             productCategory.includes(category.toLowerCase()) ||
             category.toLowerCase().includes(productCategory)) &&
            affordablePriceCategories.includes(priceCategory) &&
            !excludeIds.includes(productId) &&
            getProductPrice(product) > 0 &&
            getProductPrice(product) <= STUDENT_MAX_PRICE
          )
        })

        if (categoryProducts.length > 0) {
          // Sort by price and priority
          const sortedProducts = categoryProducts.sort((a, b) => {
            const priceA = getProductPrice(a)
            const priceB = getProductPrice(b)
            
            // Prioritize very_cheap over cheap over moderate
            const priorityA = a.price_category === "very_cheap" ? 3 : 
                            a.price_category === "cheap" ? 2 : 1
            const priorityB = b.price_category === "very_cheap" ? 3 : 
                            b.price_category === "cheap" ? 2 : 1
            
            if (priorityA !== priorityB) return priorityB - priorityA
            return priceA - priceB
          })
          
          essentialProducts.push(sortedProducts[0])
          usedCategories.add(category.toLowerCase())
          excludeIds.push(sortedProducts[0]._id || sortedProducts[0].id)
        }
      })

      // Step 2: If we have less than 10 products, add more from any available affordable products
      if (essentialProducts.length < targetCount) {
        const remainingProducts = products.filter(product => {
          const priceCategory = (product.price_category || "").toLowerCase()
          const productId = product._id || product.id
          
          return affordablePriceCategories.includes(priceCategory) &&
                 !excludeIds.includes(productId) &&
                 getProductPrice(product) > 0 &&
                 getProductPrice(product) <= STUDENT_MAX_PRICE
        })

        // Sort remaining products by price and add them
        const sortedRemaining = remainingProducts.sort((a, b) => {
          const priceA = getProductPrice(a)
          const priceB = getProductPrice(b)
          
          const priorityA = a.price_category === "very_cheap" ? 3 : 
                          a.price_category === "cheap" ? 2 : 1
          const priorityB = b.price_category === "very_cheap" ? 3 : 
                          b.price_category === "cheap" ? 2 : 1
          
          if (priorityA !== priorityB) return priorityB - priorityA
          return priceA - priceB
        })

        const needed = targetCount - essentialProducts.length
        essentialProducts.push(...sortedRemaining.slice(0, needed))
      }

      return essentialProducts.slice(0, targetCount) // Ensure we don't exceed target
    }

    // Get 10 essential products for current week
    const currentWeekEssentials = getEssentialProducts([], 10)
    const currentWeekIds = currentWeekEssentials.map(p => p._id || p.id)

    // Get different 10 essential products for next week
    const nextWeekEssentials = getEssentialProducts(currentWeekIds, 10)

    // Create basket items with proper categorization
    const createBasketItems = (productList) => {
      return productList.map((product) => {
        const price = getProductPrice(product)
        const name = getProductName(product)
        const category = getProductCategory(product)
        const priceCategory = product.price_category || "moderate"

        return {
          id: product._id || product.id,
          name,
          price,
          category: category.charAt(0).toUpperCase() + category.slice(1),
          essential: true, // All products in smart basket are essential
          brand: product.brand_name || "Generic",
          studentFriendly: true,
          priceCategory,
          isAffordable: affordablePriceCategories.includes(priceCategory.toLowerCase()),
          nutritionValue: "High"
        }
      })
    }

    const currentItems = createBasketItems(currentWeekEssentials)
    const nextItems = createBasketItems(nextWeekEssentials)

    // Calculate realistic savings based on price categories
    const calculateSavings = (items) => {
      const potentialSavings = items.reduce((sum, item) => {
        if (item.priceCategory === "very_cheap") return sum + (item.price * 0.3)
        if (item.priceCategory === "cheap") return sum + (item.price * 0.2)
        return sum + (item.price * 0.1)
      }, 0)
      return Math.floor(potentialSavings)
    }

    return {
      current: {
        title: "Essential Student Basket - This Week",
        description: `${currentItems.length} essential products for students`,
        totalCost: currentItems.reduce((sum, item) => sum + item.price, 0),
        savings: `Save ${CURRENCY_SYMBOL}${calculateSavings(currentItems)}`,
        items: currentItems,
        categoriesCount: new Set(currentItems.map(item => item.category.toLowerCase())).size,
      },
     
    }
  }

  const weeklyBaskets = generateSmartBaskets()

  // Enhanced basket management functions
  const addProductToBasket = (product) => {
    const newProduct = {
      id: product._id || product.id,
      name: getProductName(product),
      price: getProductPrice(product),
      category: getProductCategory(product),
      brand: product.brand_name || "Generic",
    }
    
    setBasketProducts(prev => [...prev, newProduct])
  }

  const removeOriginalItem = (basketKey, itemIndex) => {
    setRemovedOriginalItems(prev => ({
      ...prev,
      [`${basketKey}-${itemIndex}`]: true
    }))
  }

  const removeProductFromBasket = (productId) => {
    setBasketProducts(prev => prev.filter(product => product.id !== productId))
  }

  const getTotalWithCustom = () => {
    let basketTotal = 0
    if (selectedBasket) {
      const currentBasket = weeklyBaskets[selectedBasket]
      if (currentBasket && currentBasket.items) {
        // Calculate total for non-removed original items
        basketTotal = currentBasket.items.reduce((sum, item, index) => {
          const itemKey = `${selectedBasket}-${index}`
          if (!removedOriginalItems[itemKey]) {
            return sum + item.price
          }
          return sum
        }, 0)
      }
    }
    
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

  const searchProducts = async (searchTerm, category = 'all') => {
    if (!searchTerm && category === 'all') {
      await fetchProducts() // Reset to all products
      return
    }
  
    setLoading(true)
    try {
      const params = new URLSearchParams({
        student_filter: 'true',
        limit: '50'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (category !== 'all') params.append('category', category)
  
      const response = await fetch(`${PRODUCT_SERVICE_URL}/products?${params}`, {
        headers: { "Content-Type": "application/json" },
      })
  
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (err) {
      console.error("Search failed:", err)
    } finally {
      setLoading(false)
    }
  }

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      const config = await fetchStudentConfig()
      if (config) {
        // Update any dynamic configuration if needed
        console.log("Using backend student config")
      }
      
      await fetchProducts()
      await fetchCategories()
    }
    loadData()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm || selectedCategory !== 'all') {
        searchProducts(searchTerm, selectedCategory)
      }
    }, 500) // 500ms debounce
  
    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCategory])
  
  return (
    <div className={`sc-container ${darkMode ? "sc-dark-theme" : "sc-light-theme"}`}>
      <div className="sc-header">
        <div className="sc-header-content">
          <div className="sc-header-icon">
            <ShoppingCart size={32} />
          </div>
          <div className="sc-header-text">
            <h1>Smart Student Cart</h1>
          </div>
        </div>
        <button 
          className="sc-recipes-badge"
          onClick={handleRecipesRedirect}
          title="Get recipe recommendations based on your cart"
        >
          <ChefHat size={16} />
          <span>Recipe Ideas</span>
        </button>
      </div>

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
                  {basket.categoriesCount && (
                    <div className="sc-categories-count">
                      <span className="sc-category-badge">
                        {basket.categoriesCount} categories
                      </span>
                    </div>
                  )}
                </div>
                {selectedBasket === key && (
                  <div className="sc-basket-details">
                    {/* Original basket items with delete option */}
                    {basket.items.map((item, index) => {
                      const itemKey = `${key}-${index}`
                      const isRemoved = removedOriginalItems[itemKey]
                      
                      if (isRemoved) return null
                      
                      return (
                        <div key={`original-${index}`} className={`sc-item-row ${item.essential ? "essential" : ""}`}>
                          <div className="sc-item-info">
                            <span className="sc-item-name">{item.name}</span>
                            <span className="sc-item-category">({item.category})</span>
                          </div>
                          <div className="sc-item-actions">
                            <span className="sc-item-price">{CURRENCY_SYMBOL}{item.price.toFixed(2)}</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeOriginalItem(key, index);
                              }}
                              className="sc-delete-btn"
                              title="Remove from basket"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                    
                    {/* Additional products added manually */}
                    {basketProducts.length > 0 && (
                      <>
                        <div className="sc-divider">
                          <span>Added Products</span>
                        </div>
                        {basketProducts.map((item, index) => (
                          <div key={`added-${index}`} className="sc-item-row added-item">
                            <div className="sc-item-info">
                              <span className="sc-item-name">{item.name}</span>
                              <span className="sc-item-category">({item.category})</span>
                            </div>
                            <div className="sc-item-actions">
                              <span className="sc-item-price">{CURRENCY_SYMBOL}{item.price.toFixed(2)}</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeProductFromBasket(item.id);
                                }}
                                className="sc-delete-btn"
                                title="Remove from basket"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
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
                      <div className="sc-product-price">
                        <span className="sc-price">{CURRENCY_SYMBOL}{productPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => addProductToBasket(product)} 
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