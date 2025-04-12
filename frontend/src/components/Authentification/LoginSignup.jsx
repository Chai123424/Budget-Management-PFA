import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Ajout des hooks de React Router

import '../../css/Authentification/LoginSignup.css'
import user_icon from '../../assets/icons/etudiant.png'
import email_icon from '../../assets/icons/gmail.png'
import password_icon from '../../assets/icons/cadenas.png'
import money_icon from '../../assets/icons/money-management.png'
import dollar_icon from '../../assets/icons/dollar.png'
import piggy_icon from '../../assets/icons/tirelire.png'
import mobile_icon from '../../assets/icons/mobil.png'
import sun_icon from '../../assets/icons/soleil.png';
import moon_icon from '../../assets/icons/lune.png';

const LoginSignup = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialAction = location.state?.initialAction || "Sign Up";


  const [action, setAction] = useState("Sign Up");
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (location.state?.initialAction) {
      setAction(location.state.initialAction);
    }
  }, [location.state]);
  
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!regex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password) => {
    // Au moins 8 caractères, une majuscule, un chiffre et un caractère spécial
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    } else if (!regex.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter, one number, and one special character');
      return false;
    }
    setPasswordError('');
    return true;
  };
  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    
    // Longueur minimum
    if (password.length >= 8) strength += 1;
    
    // Contient des lettres majuscules et minuscules
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
    
    // Contient des chiffres
    if (/\d/.test(password)) strength += 1;
    
    // Contient des caractères spéciaux
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength += 1;
    
    return strength;
  };

  // Fonction de soumission
  const handleSubmit = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      // Tout est valide, vous pouvez continuer avec la connexion ou l'inscription
      console.log('Form is valid, proceeding with', action);
      
      // Simulez une authentification réussie
      localStorage.setItem('isAuthenticated', 'true');
      
      // Rediriger vers le tableau de bord après connexion/inscription
      navigate('/dashboard');
    } else {
      console.log('Form has errors, please correct them');
    }
  };

  const handlePasswordReset = () => {
    // Valider que l'email est correct avant d'envoyer la demande
    if (validateEmail(email)) {
      // Ici, vous ajouteriez la logique pour envoyer un email de réinitialisation
      console.log('Password reset request sent to:', email);
      alert(`Si un compte est associé à l'adresse ${email}, un email de réinitialisation sera envoyé.`);
      // Retour à l'interface de connexion
      setForgotPasswordMode(false);
      setAction("Login");
    } else {
      console.log('Please enter a valid email address');
    }
  };

  return (
    <div className={`container ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Bouton de changement de thème */}
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label={darkMode ? "Passer au mode clair" : "Passer au mode sombre"}
      >
        {darkMode ? 
          <img src={sun_icon} alt="Mode clair" className="theme-icon" /> : 
          <img src={moon_icon} alt="Mode sombre" className="theme-icon" />
        }
      </button>
      
      <div className='header'>
        <div className='logo-container'>
          <img src={money_icon} alt="Logo" className='logo' />
        </div>
        
        <div className='title'>
          <h2>Budget Management</h2>
          <div className='underline'></div>
          <p className="subtitle">Manage your finances easily</p>
        </div>
        
        {forgotPasswordMode ? (
          /* Interface de récupération de mot de passe */
          <div className='inputs'>
            <h3 className="reset-title">Reset Your Password</h3>
            <p className="reset-instructions">Enter your email address and we'll send you instructions to reset your password.</p>
            
            <div className='input'>
              <img src={email_icon} alt="" />
              <input 
                type="email" 
                placeholder='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => validateEmail(email)}
              />
            </div>
            {emailError && <div className="error-message">{emailError}</div>}
            
            <div className="reset-buttons">
              <button 
                className="reset-button"
                onClick={handlePasswordReset}
              >
                Send Reset Link
              </button>
              <button 
                className="cancel-button"
                onClick={() => {
                  setForgotPasswordMode(false);
                  setEmailError('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Interface normale de connexion/inscription */
          <div className='inputs'>
            {action === "Sign Up" && (
              <div className='input'>
                <img src={user_icon} alt="" />
                <input type="text" placeholder='Name' />
              </div>
            )}
            
            <div className='input'>
              <img src={email_icon} alt="" />
              <input 
                type="email" 
                placeholder='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => validateEmail(email)}
              />
            </div>
            {emailError && <div className="error-message">{emailError}</div>}
            
            <div className='input'>
              <img src={password_icon} alt="" />
              <input 
                type="password" 
                placeholder='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => validatePassword(password)}
              />
            </div>
            {passwordError && <div className="error-message">{passwordError}</div>}
            
            {/* Indicateur de force du mot de passe */}
            {password && (
              <div className="password-strength">
                <div className="strength-meter">
                  <div 
                    className={`strength-value ${
                      getPasswordStrength(password) === 1 ? 'weak' : 
                      getPasswordStrength(password) === 2 ? 'medium' : 
                      getPasswordStrength(password) === 3 ? 'good' : 
                      getPasswordStrength(password) === 4 ? 'strong' : ''
                    }`}
                    style={{ width: `${getPasswordStrength(password) * 25}%` }}
                  ></div>
                </div>
                <span className="strength-text">
                  {getPasswordStrength(password) === 0 ? 'Very weak' :
                   getPasswordStrength(password) === 1 ? 'Weak' :
                   getPasswordStrength(password) === 2 ? 'Medium' :
                   getPasswordStrength(password) === 3 ? 'Good' :
                   'Strong'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Le texte "Lost Password" apparaît uniquement en mode Login et pas en mode récupération */}
      {action === "Login" && !forgotPasswordMode && (
        <div className="forgot-password">
          Lost Password? <span onClick={() => setForgotPasswordMode(true)}>click here!</span>
        </div>
      )}
      
      {/* Les boutons de soumission sont cachés en mode récupération de mot de passe */}
      {!forgotPasswordMode && (
        <div className="submitcontainer">
          <div 
            className={action === "Sign Up" ? "submit" : "submit gray"}
            onClick={() => {
              setAction("Sign Up");
              if (action === "Sign Up") handleSubmit();
            }}
          >
            Sign up
          </div>
          <div 
            className={action === "Login" ? "submit" : "submit gray"}
            onClick={() => {
              setAction("Login");
              if (action === "Login") handleSubmit();
            }}
          >
            Login
          </div>
        </div>
      )}
      
      {/* Les avantages restent visibles que l'on soit en mode récupération ou pas */}
      <div className="benefits">
        <div className="benefit">
          <div className="benefit-icon">
            <img src={dollar_icon} alt="" />
          </div>
          <span>expense tracking</span>
        </div>
        <div className="benefit">
          <div className="benefit-icon">
            <img src={piggy_icon} alt="" />
          </div>
          <span>Money Saving Tips</span>
        </div>
        <div className="benefit">
          <div className="benefit-icon">
            <img src={mobile_icon} alt="" />
          </div>
          <span>Desktop & Mobile</span>
        </div>
      </div>
    </div>
  );
}

export default LoginSignup