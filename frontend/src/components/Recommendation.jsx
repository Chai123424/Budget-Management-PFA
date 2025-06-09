import React from 'react';
import '../css/recommendation.css';

const recipes = [
  {
    name: 'Lasagne',
    price: '$10.00 total',
    time: '20 mins',
    servings: '4 servings',
    image: 'http://localhost:5000/pictures/lasagne.jpg',
  },
  {
    name: 'Ramen Upgrade',
    price: '$5.00 total',
    time: '10 mins',
    servings: '4 servings',
    image: 'http://localhost:5000/pictures/ramen.jpg',
  },
  {
    name: 'Bulk Meal Prep',
    price: '$13.00 total',
    time: '45 mins',
    servings: '4 servings',
    image: 'http://localhost:5000/pictures/bulk_meal.jpg',
  },
  {
    name: 'Microwave Mug Meals',
    price: '$7.00 total',
    time: '5 mins',
    servings: '4 servings',
    image: 'http://localhost:5000/pictures/mug_meal.jpg',
  },
];

export default function Recommendation() {
  return (
    <div className="recommend-container">
      <nav className="nav">
        <div className="logo">💰 <span>UniFinance</span></div>
        <ul className="nav-links">
          <li>Home</li>
          <li>Expenses</li>
          <li>Goals</li>
          <li className="active">Recommendations</li>
        </ul>
        <button className="logout-btn">Logout</button>
      </nav>

      <div className="recommend-content">
        <h2>Recommendations</h2>

        <div className="calculator-card">
          <div className="calculator-title">
            <span className="icon">$</span>
            <h3>Recipe Cost Calculator</h3>
          </div>

          <p className="subtext">Select a Recipe and Number of People</p>

          <div className="recipe-grid">
            {recipes.map((recipe, index) => (
              <div className="recipe-card" key={index}>
                <img src={recipe.image} alt={recipe.name} />
                <h4>{recipe.name}</h4>
                <p className="price">{recipe.price}</p>
                <div className="recipe-details">
                  <span>{recipe.servings}</span>
                  <span>{recipe.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="slider-section">
            <label>Number of People:</label>
            <input type="range" min="1" max="10" defaultValue="4" />
          </div>

          <button className="compare-btn">Compare Recipes</button>
        </div>
      </div>
    </div>
  );
}