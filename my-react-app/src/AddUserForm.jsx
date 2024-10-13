import React, { useState } from 'react';
import './AddUserForm.css';

function AddUserForm({ onCancel, onAddUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      const newUser = { username, password, role: 'User' }; // Role is set to 'User' by default
      onAddUser(newUser);
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <div className="add-user-form-popup">
      <div className="add-user-form-content">
        <button className="close-uf-btn" onClick={onCancel}>
          &times;
        </button>
        <h2>👤 Add User</h2>
        <hr />
        <form onSubmit={handleSubmit}>
          <div className="form-uf-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter username"
            />
          </div>
          <div className="form-uf-group">
            <label>Password:</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
            />
          </div>
          <div className="form-uf-actions">
            <button type="button" onClick={onCancel} className="cancel-uf-btn">
              Cancel
            </button>
            <button type="submit" className="add-uf-btn">
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUserForm;
