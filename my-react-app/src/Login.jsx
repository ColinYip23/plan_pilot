import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Login.css';

function Login({ onLogin, errorMessage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate a network request with a 1-second delay
    setTimeout(() => {
      onLogin(username, password);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="login-page">
      {/* Overlay */}
      <div className="overlay"></div>

      {/* Login Form */}
      <form className={`login-form ${isLoading ? 'expand' : ''}`} onSubmit={handleSubmit}>
        <header className="login-header">
          <img src="/hat.png" className="logo" />
          <h1 className="website-name">Plan Pilot</h1>
        </header>
        {!isLoading && errorMessage && <p className="error-message">{errorMessage}</p>}
        {!isLoading ? (
          <>
            <div className="form-lg-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="login-input"
                required
                autoComplete="off"
              />
            </div>
            <div className="form-lg-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                required
                autoComplete="off"
              />
            </div>
            <button type="submit" className="login-button">
              Login
            </button>
          </>
        ) : (
          <div className="loading-container">
            <p className="loading-text">Logging in...</p>
            <div className="spinner"></div>
          </div>
        )}
      </form>
    </div>
  );
}

export default Login;
