import React, { useState } from 'react';
import '../../css/Authentification/LoginSignup.css'
import user_icon from '../../assets/icons/etudiant.png'
import email_icon from '../../assets/icons/gmail.png'
import password_icon from '../../assets/icons/cadenas.png'
import money_icon from '../../assets/icons/money-management.png'
import dollar_icon from '../../assets/icons/dollar.png'
import piggy_icon from '../../assets/icons/tirelire.png'
import mobile_icon from '../../assets/icons/mobil.png'

const LoginSignup = () => {
  const [action, setAction] = useState("Sign Up");
  
  return (
    <div className='container'>
      <div className='header'>
        <div className='logo-container'>
          <img src={money_icon} alt="Logo" className='logo' />
        </div>
        
        <div className='title'>
          <h2>Budget Management</h2>
          <div className='underline'></div>
          <p className="subtitle">Manage your finances easily</p>
        </div>
        
        <div className='inputs'>
          {action === "Sign Up" && (
            <div className='input'>
              <img src={user_icon} alt="" />
              <input type="text" placeholder='Name' />
            </div>
          )}
          
          <div className='input'>
            <img src={email_icon} alt="" />
            <input type="email" placeholder='email ' />
          </div>
          
          <div className='input'>
            <img src={password_icon} alt="" />
            <input type="password" placeholder='password' />
          </div>
        </div>
      </div>
      
      {/* Le texte "Lost Password" apparaît uniquement en mode Login */}
      {action === "Login" && (
        <div className="forgot-password">Lost Password? <span>click here!</span></div>
      )}
      
      <div className="submitcontainer">
        <div 
          className={action === "Sign Up" ? "submit" : "submit gray"}
          onClick={() => setAction("Sign Up")}
        >
          Sign up
        </div>
        <div 
          className={action === "Login" ? "submit" : "submit gray"}
          onClick={() => setAction("Login")}
        >
          Login
        </div>
      </div>
      
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
          <span> Desktop & Mobile</span>
        </div>
      </div>
    </div>
  )
}

export default LoginSignup