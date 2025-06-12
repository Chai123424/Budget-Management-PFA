"use client"

import { useState } from "react"
import { DollarSign, ChefHat, Clock, Users, Calculator, Sparkles, TrendingUp } from "lucide-react"
import "../css/recommendation.css"

const recipes = [
  {
    id: 1,
    name: "Lasagne",
    price: 100,
    priceDisplay: "100DH total",
    time: "20 mins",
    servings: 4,
    category: "Italian",
    difficulty: "Medium",
    image: "http://localhost:5000/pictures/lasagne.jpg", // URL vers votre service Flask
    ingredients: ["Pasta", "Ground beef", "Cheese", "Tomato sauce"],
    nutrition: { calories: 450, protein: 25, carbs: 35 },
  },
  {
    id: 2,
    name: "Ramen Upgrade",
    price: 50,
    priceDisplay: "50DH total",
    time: "10 mins",
    servings: 2,
    category: "Asian",
    difficulty: "Easy",
    image: "http://localhost:5000/pictures/ramen.jpg", // URL vers votre service Flask
    ingredients: ["Ramen noodles", "Egg", "Vegetables", "Soy sauce"],
    nutrition: { calories: 320, protein: 15, carbs: 45 },
  },
  {
    id: 3,
    name: "Bulk Meal Prep",
    price: 130,
    priceDisplay: "130DH total",
    time: "45 mins",
    servings: 8,
    category: "Healthy",
    difficulty: "Medium",
    image: "http://localhost:5000/pictures/bulk_meal.jpg", // URL vers votre service Flask
    ingredients: ["Chicken", "Rice", "Vegetables", "Spices"],
    nutrition: { calories: 380, protein: 30, carbs: 40 },
  },
  {
    id: 4,
    name: "Microwave Mug Meals",
    price: 70,
    priceDisplay: "70DH total",
    time: "5 mins",
    servings: 1,
    category: "Quick",
    difficulty: "Easy",
    image: "http://localhost:5000/pictures/mug_meal.jpg", // URL vers votre service Flask
    ingredients: ["Pasta", "Cheese", "Butter", "Milk"],
    nutrition: { calories: 280, protein: 12, carbs: 32 },
  },
]

export default function Recommendation({ darkMode = true }) {
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [numberOfPeople, setNumberOfPeople] = useState(4)
  const [compareMode, setCompareMode] = useState(false)
  const [selectedRecipes, setSelectedRecipes] = useState([])

  const dashboardClass = `recipeRecommendDashboard ${darkMode ? "recipeRecommendDarkTheme" : "recipeRecommendLightTheme"}`

  const calculatePrice = (recipe, people) => {
    const pricePerServing = recipe.price / recipe.servings
    return Math.round(pricePerServing * people)
  }

  const handleRecipeSelect = (recipe) => {
    if (compareMode) {
      if (selectedRecipes.find((r) => r.id === recipe.id)) {
        setSelectedRecipes(selectedRecipes.filter((r) => r.id !== recipe.id))
      } else if (selectedRecipes.length < 3) {
        setSelectedRecipes([...selectedRecipes, recipe])
      }
    } else {
      setSelectedRecipe(recipe)
    }
  }

  const toggleCompareMode = () => {
    setCompareMode(!compareMode)
    setSelectedRecipes([])
    setSelectedRecipe(null)
  }

  const renderRecipeCard = (recipe) => {
    const isSelected = compareMode ? selectedRecipes.find((r) => r.id === recipe.id) : selectedRecipe?.id === recipe.id

    const calculatedPrice = calculatePrice(recipe, numberOfPeople)

    return (
      <div
        key={recipe.id}
        className={`recipeRecommendCard ${isSelected ? "recipeRecommendSelected" : ""}`}
        onClick={() => handleRecipeSelect(recipe)}
      >
        <div className="recipeRecommendImage">
          <img 
            src={recipe.image} 
            alt={recipe.name}
            onError={(e) => {
              // Image de fallback si l'image ne charge pas
              e.target.src = "/placeholder.svg"
            }}
          />
          <div className="recipeRecommendCategory">{recipe.category}</div>
          <div className={`recipeRecommendDifficulty ${recipe.difficulty.toLowerCase()}`}>{recipe.difficulty}</div>
        </div>

        <div className="recipeRecommendContent">
          <h4 className="recipeRecommendName">{recipe.name}</h4>

          <div className="recipeRecommendStats">
            <div className="recipeRecommendStat">
              <DollarSign size={16} />
              <span>{calculatedPrice}DH</span>
            </div>
            <div className="recipeRecommendStat">
              <Clock size={16} />
              <span>{recipe.time}</span>
            </div>
            <div className="recipeRecommendStat">
              <Users size={16} />
              <span>{numberOfPeople} people</span>
            </div>
          </div>

          <div className="recipeRecommendNutrition">
            <div className="recipeRecommendNutritionItem">
              <span className="recipeRecommendNutritionLabel">Calories</span>
              <span className="recipeRecommendNutritionValue">{recipe.nutrition.calories}</span>
            </div>
            <div className="recipeRecommendNutritionItem">
              <span className="recipeRecommendNutritionLabel">Protein</span>
              <span className="recipeRecommendNutritionValue">{recipe.nutrition.protein}g</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderSelectedRecipeDetails = () => {
    if (!selectedRecipe) return null

    const calculatedPrice = calculatePrice(selectedRecipe, numberOfPeople)
    const pricePerServing = calculatedPrice / numberOfPeople

    return (
      <div className="recipeRecommendSelectedDetails">
        <div className="recipeRecommendSelectedHeader">
          <div className="recipeRecommendSelectedIcon">
            <ChefHat size={24} />
          </div>
          <h3>Recipe Details</h3>
        </div>

        <div className="recipeRecommendSelectedContent">
          <div className="recipeRecommendSelectedInfo">
            <h4>{selectedRecipe.name}</h4>
            <div className="recipeRecommendSelectedMetrics">
              <div className="recipeRecommendMetric">
                <span className="recipeRecommendMetricLabel">Total Cost</span>
                <span className="recipeRecommendMetricValue">{calculatedPrice}DH</span>
              </div>
              <div className="recipeRecommendMetric">
                <span className="recipeRecommendMetricLabel">Cost Per Person</span>
                <span className="recipeRecommendMetricValue">{pricePerServing}DH</span>
              </div>
              <div className="recipeRecommendMetric">
                <span className="recipeRecommendMetricLabel">Prep Time</span>
                <span className="recipeRecommendMetricValue">{selectedRecipe.time}</span>
              </div>
            </div>
          </div>

          <div className="recipeRecommendSelectedIngredients">
            <h5>Ingredients needed:</h5>
            <ul>
              {selectedRecipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  const renderComparisonTable = () => {
    if (!compareMode || selectedRecipes.length === 0) return null

    return (
      <div className="recipeRecommendComparisonTable">
        <div className="recipeRecommendComparisonHeader">
          <div className="recipeRecommendComparisonIcon">
            <TrendingUp size={24} />
          </div>
          <h3>Recipe Comparison</h3>
        </div>

        <div className="recipeRecommendComparisonGrid">
          {selectedRecipes.map((recipe) => {
            const calculatedPrice = calculatePrice(recipe, numberOfPeople)
            const pricePerServing = calculatedPrice / numberOfPeople

            return (
              <div key={recipe.id} className="recipeRecommendComparisonCard">
                <h4>{recipe.name}</h4>
                <div className="recipeRecommendComparisonMetrics">
                  <div className="recipeRecommendComparisonMetric">
                    <span className="recipeRecommendLabel">Total Cost</span>
                    <span className="recipeRecommendValue">{calculatedPrice}DH</span>
                  </div>
                  <div className="recipeRecommendComparisonMetric">
                    <span className="recipeRecommendLabel">Per Person</span>
                    <span className="recipeRecommendValue">{pricePerServing}DH</span>
                  </div>
                  <div className="recipeRecommendComparisonMetric">
                    <span className="recipeRecommendLabel">Time</span>
                    <span className="recipeRecommendValue">{recipe.time}</span>
                  </div>
                  <div className="recipeRecommendComparisonMetric">
                    <span className="recipeRecommendLabel">Calories</span>
                    <span className="recipeRecommendValue">{recipe.nutrition.calories}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={dashboardClass}>
      <div className="recipeRecommendContent">
        <div className="recipeRecommendCalculatorCard">
          <div className="recipeRecommendCalculatorHeader">
            <div className="recipeRecommendCalculatorIcon">
              <Calculator size={24} />
            </div>
            <h3>Recipe Cost Calculator</h3>
          </div>

          <p className="recipeRecommendCalculatorSubtext">Select recipes and adjust servings to optimize your meal budget</p>

          <div className="recipeRecommendCalculatorControls">
            <div className="recipeRecommendSliderSection">
              <label className="recipeRecommendSliderLabel">
                Number of People: <span className="recipeRecommendSliderValue">{numberOfPeople}</span>
              </label>
              <input
                type="range"
                min="1"
                max="12"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(Number.parseInt(e.target.value))}
                className="recipeRecommendSlider"
              />
              <div className="recipeRecommendSliderLabels">
                <span>1</span>
                <span>12</span>
              </div>
            </div>

            <div className="recipeRecommendCompareToggle">
              <button className={`recipeRecommendToggleButton ${compareMode ? "recipeRecommendActive" : ""}`} onClick={toggleCompareMode}>
                {compareMode ? "Exit Compare" : "Compare Recipes"}
              </button>
              {compareMode && <span className="recipeRecommendCompareCount">{selectedRecipes.length}/3 selected</span>}
            </div>
          </div>

          <div className="recipeRecommendGrid">{recipes.map(renderRecipeCard)}</div>

          {renderSelectedRecipeDetails()}

          {renderComparisonTable()}
        </div>

        <div className="recipeRecommendBudgetInsights">
          <div className="recipeRecommendInsightsHeader">
            <div className="recipeRecommendInsightsIcon">
              <Sparkles size={24} />
            </div>
            <h3>Budget Insights</h3>
          </div>

          <div className="recipeRecommendInsightsGrid">
            <div className="recipeRecommendInsightItem">
              <div className="recipeRecommendInsightMetric">
                <span className="recipeRecommendInsightValue">25DH</span>
                <span className="recipeRecommendInsightLabel">Avg cost per meal</span>
              </div>
            </div>
            <div className="recipeRecommendInsightItem">
              <div className="recipeRecommendInsightMetric">
                <span className="recipeRecommendInsightValue">180DH</span>
                <span className="recipeRecommendInsightLabel">Weekly meal budget</span>
              </div>
            </div>
            <div className="recipeRecommendInsightItem">
              <div className="recipeRecommendInsightMetric">
                <span className="recipeRecommendInsightValue">15%</span>
                <span className="recipeRecommendInsightLabel">Savings vs eating out</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}