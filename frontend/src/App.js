import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import LoginSignup from './components/Authentification/LoginSignup';
import Home from './components/Home';
import HowItWorks from './components/HowItWorks';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    
    // Vérifier le thème enregistré
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);
  
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('theme', !darkMode ? 'dark' : 'light');
    
    // Apply theme to body for global styles
    if (!darkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  };
  
  return (
    <BrowserRouter>
      <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
        <Navbar
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />
        
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Home darkMode={darkMode} />} />
          <Route path="/auth" element={<LoginSignup setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/how-it-works" element={<HowItWorks darkMode={darkMode} />} /> 
          {/* Routes protégées */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;