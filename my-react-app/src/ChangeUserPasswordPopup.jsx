import React, { useState } from 'react';
import './ChangeUserPasswordPopup.css';

function ChangeUserPasswordPopup({ username, currentPassword, onClose, onChangePassword }) {
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setErrorMessage('Please enter a valid password.');
    } else if (newPassword === currentPassword) {
      setErrorMessage('The new password must be different from the current password.');
    } else {
      onChangePassword(newPassword);
      setErrorMessage('');
      onClose();
    }
  };

  return (
    <div className="change-password-popup">
      <div className="change-password-content">
        <button className="close-cp-btn" onClick={onClose}>
          &times;
        </button>
        <h2>🔐 Change Password: {username}</h2>
        <hr />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="form-up-group">
          <label>Current Password:</label>
          <p className="current-password-display">
            {currentPassword ? currentPassword : 'No password found.'}
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-up-group">
            <label>New Password:</label>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setErrorMessage(''); // Clear error message on input change
              }}
              required
              placeholder="Enter new password"
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose}>
              Back
            </button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangeUserPasswordPopup;
