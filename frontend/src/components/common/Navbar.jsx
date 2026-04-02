"use client"

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importez useNavigate
import "../../css/common/Navbar.css";
import sun_icon from "../../assets/icons/soleil (1).png";
import moon_icon from "../../assets/icons/lune.png";
import search_icon_dark from "../../assets/icons/chercher (1).png";
import search_icon_light from "../../assets/icons/chercher.png";
import logo from "../../assets/icons/money-management.png";


const Navbar = ({ darkMode, toggleTheme }) => {
  // Ajoutez un état pour l'authentification (à remplacer par votre propre logique d'auth)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Hook de navigation pour rediriger vers la page de login/signup
  const navigate = useNavigate();
  
  // Fonction pour rediriger vers la page d'authentification
  const goToAuth = (action) => {
    // Vous pouvez utiliser des paramètres pour définir si vous voulez afficher login ou signup
    navigate('/auth', { state: { initialAction: action } });
  };
  
  
  
  const searchIcon = darkMode ? search_icon_light : search_icon_dark;
  const themeIcon = darkMode ? sun_icon : moon_icon;
  
  // Fonction pour basculer le menu mobile
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <nav className={`navbar ${darkMode ? "dark-mode" : ""}`}>
      <img src={logo} alt="logo" className="logo" />
      
      
      <div className="menu-toggle" onClick={toggleMenu}>
        <div className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      
      <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        {isAuthenticated ? (
          // Menu pour les utilisateurs connectés
          <>
            <li onClick={() => navigate('/dashboard')}>Tableau de bord</li>
            <li onClick={() => navigate('/expenses')}>Dépenses</li>
            <li onClick={() => navigate('/goals')}>Objectifs</li>
            <li onClick={() => navigate('/recommendations')}>Recommandations</li>
            
          </>
        ) : (
          // Menu pour les utilisateurs non connectés
          <>
            <li onClick={() => navigate('/')}>Accueil</li>
            <li onClick={() => navigate('/about')}>À propos</li>
            <li>
              <button onClick={() => goToAuth('Login')} className="login-btn">Login in</button>
            </li>
            <li>
              <button onClick={() => goToAuth('Sign Up')} className="signup-btn">Sign up</button>
            </li>
          </>
        )}
      </ul>
      
      {/* La barre de recherche n'est visible que pour les utilisateurs connectés */}
      {isAuthenticated && (
        <div className="search-box">
          <input type="text" placeholder="Rechercher" />
          <img src={searchIcon} alt="Search" />
        </div>
      )}
      
      <div className="controls-wrapper">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme} 
            aria-label={darkMode ? "Passer au mode clair" : "Passer au mode sombre"}
          >
            <img src={themeIcon} alt="Toggle theme" className="toggle-icon" />
          </button>
          
          
       </div>
    
    </nav>
  );
};

export default Navbar;