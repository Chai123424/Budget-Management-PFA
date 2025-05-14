import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/Authentification/LoginSignup.css';
import user_icon from '../../assets/icons/etudiant.png';
import email_icon from '../../assets/icons/gmail.png';
import password_icon from '../../assets/icons/cadenas.png';
import money_icon from '../../assets/icons/money-management.png';
import dollar_icon from '../../assets/icons/dollar.png';
import piggy_icon from '../../assets/icons/tirelire.png';
import mobile_icon from '../../assets/icons/mobil.png';
import sun_icon from '../../assets/icons/soleil.png';
import moon_icon from '../../assets/icons/lune.png';

const LoginSignup = () => {
  const [action, setAction] = useState("Sign Up");
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') setDarkMode(true);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

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
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    } else if (!regex.test(password)) {
      setPasswordError('Password must contain uppercase, number, and special character');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength++;
    return strength;
  };

  const handleSubmit = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      if (action === 'Sign Up') {
        const fakeUser = { email, password };
        localStorage.setItem('user', JSON.stringify(fakeUser));
        navigate('/dashboard');
      }

      if (action === 'Login') {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.email === email && storedUser.password === password) {
          navigate('/dashboard');
        } else {
          alert("Identifiants incorrects");
        }
      }
    }
  };

  const handlePasswordReset = () => {
    if (validateEmail(email)) {
      alert(`Si un compte est associé à ${email}, un lien de réinitialisation a été envoyé.`);
      setForgotPasswordMode(false);
      setAction("Login");
    }
  };

  return (
    <div className={`container ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      <button className="theme-toggle" onClick={toggleTheme}>
        <img src={darkMode ? sun_icon : moon_icon} alt="Toggle Theme" className="theme-icon" />
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
          <div className='inputs'>
            <h3 className="reset-title">Reset Your Password</h3>
            <p className="reset-instructions">Enter your email to receive reset instructions.</p>

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
              <button className="reset-button" onClick={handlePasswordReset}>Send Reset Link</button>
              <button className="cancel-button" onClick={() => { setForgotPasswordMode(false); setEmailError(''); }}>Cancel</button>
            </div>
          </div>
        ) : (
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
                placeholder='Email'
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
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => validatePassword(password)}
              />
            </div>
            {passwordError && <div className="error-message">{passwordError}</div>}

            {password && (
              <div className="password-strength">
                <div className="strength-meter">
                  <div
                    className={`strength-value ${
                      getPasswordStrength(password) === 1 ? 'weak' :
                      getPasswordStrength(password) === 2 ? 'medium' :
                      getPasswordStrength(password) === 3 ? 'good' : 'strong'
                    }`}
                    style={{ width: `${getPasswordStrength(password) * 25}%` }}
                  ></div>
                </div>
                <span className="strength-text">
                  {['Very weak', 'Weak', 'Medium', 'Good', 'Strong'][getPasswordStrength(password)]}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {action === "Login" && !forgotPasswordMode && (
        <div className="forgot-password">
          Lost Password? <span onClick={() => setForgotPasswordMode(true)}>click here!</span>
        </div>
      )}

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

      <div className="benefits">
        <div className="benefit"><img src={dollar_icon} alt="" /><span>Expense tracking</span></div>
        <div className="benefit"><img src={piggy_icon} alt="" /><span>Money Saving Tips</span></div>
        <div className="benefit"><img src={mobile_icon} alt="" /><span>Desktop & Mobile</span></div>
      </div>
    </div>
  );
};

export default LoginSignup;
