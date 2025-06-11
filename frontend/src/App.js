import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import LoginSignup from './components/Authentification/LoginSignup';
import Home from './components/Home';
import HowItWorks from './components/HowItWorks';
import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import Savings from './components/Savings';


const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

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
        {/* Render Navbar only on public routes (home and how-it-works) */}
        <Routes>
          {/* Routes publiques avec Navbar */}
          <Route 
            path="/" 
            element={
              <>
                <Navbar
                  darkMode={darkMode}
                  toggleTheme={toggleTheme}
                  isAuthenticated={isAuthenticated}
                  setIsAuthenticated={setIsAuthenticated}
                />
                <Home darkMode={darkMode} />
              </>
            } 
          />
          
          <Route 
            path="/how-it-works" 
            element={
              <>
                <Navbar
                  darkMode={darkMode}
                  toggleTheme={toggleTheme}
                  isAuthenticated={isAuthenticated}
                  setIsAuthenticated={setIsAuthenticated}
                />
                <HowItWorks darkMode={darkMode} />
              </>
            } 
          />
          
          {/* Route d'authentification sans Navbar */}
          <Route 
            path="/auth" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <LoginSignup setIsAuthenticated={setIsAuthenticated} />
            } 
          />
          
          {/* Routes protégées sans Navbar */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Dashboard 
                  darkMode={darkMode} 
                  toggleTheme={toggleTheme}
                  isAuthenticated={isAuthenticated}
                  setIsAuthenticated={setIsAuthenticated}
                />
              </ProtectedRoute>
            } 
          />
          
          {/* Routes supplémentaires pour les fonctionnalités utilisateur */}
          <Route 
            path="/expenses" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Expenses darkMode={darkMode} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/savings" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Savings darkMode={darkMode} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/goals" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <div className="content-page">
                  <h1>Objectifs financiers</h1>
                  <p>Cette page est en cours de développement.</p>
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/recommendations" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <div className="content-page">
                  <h1>Recommandations</h1>
                  <p>Cette page est en cours de développement.</p>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Route par défaut - redirection vers l'accueil */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;