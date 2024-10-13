import React, { useState } from 'react';
import './AccountPopup.css';

function AccountPopup({ user, onClose, onUpdatePassword }) {
  const [isViewing, setIsViewing] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State to store error message

  const handleViewClick = () => {
    setIsViewing(!isViewing);
  };

  const handleChangeClick = () => {
    if (isChanging) {
      // Validation: Check if password is empty or just spaces
      if (!passwordInput.trim()) {
        setErrorMessage('Password cannot be empty or just spaces!');
        return;
      }

      // Save new password
      onUpdatePassword(passwordInput);
      setIsChanging(false);
      setPasswordInput('');
      setErrorMessage(''); // Clear error message
    } else {
      setIsChanging(true);
      setIsViewing(false);
    }
  };

  const handleCancelChange = () => {
    setIsChanging(false);
    setPasswordInput('');
    setErrorMessage(''); // Clear error message
  };

  return (
    <div className="account-popup">
      <div className="account-popup-content">
        <button className="close-a-btn" onClick={onClose}>
          &times;
        </button>
        <h2>👤 Account</h2>
        <hr />
        <div className="account-details">
          <label>Username:</label>
          <div className="grey-container">
            <p>{user.username}</p>
          </div>

          <label>Password:</label>
          {errorMessage && <p className="error-message-ap">{errorMessage}</p>}
          <div className="password-container grey-container">
            
            {isChanging ? (
              <>
                <input
                  type="text"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter new password"
                />
                
              </>
            ) : (
              <p className="password-display">
                {isViewing ? user.password : '***'}
              </p>
            )}
            <div className="button-a-container">
              {!isChanging ? (
                <>
                  <button onClick={handleViewClick}>
                    {isViewing ? 'Hide' : 'View'}
                  </button>
                  <button onClick={handleChangeClick}>Change</button>
                </>
              ) : (
                <>
                  <button onClick={handleCancelChange}>Cancel</button>
                  <button onClick={handleChangeClick}>Save</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountPopup;
