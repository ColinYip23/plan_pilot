import React, { useState } from 'react';
import './ManageTeamPopup.css';
import ConfirmModal from './ConfirmModal';
import AddUserForm from './AddUserForm';
import ChangeUserPasswordPopup from './ChangeUserPasswordPopup';

function ManageTeamPopup({
  users,
  onClose,
  onAddUser,
  onRemoveUser,
  onChangeUserPassword,
}) {
  const [userToRemove, setUserToRemove] = useState(null);
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [isAddUserVisible, setAddUserVisible] = useState(false);
  const [userToChangePassword, setUserToChangePassword] = useState(null);

  const handleRemoveClick = (username) => {
    setUserToRemove(username);
    setConfirmVisible(true);
  };

  const confirmRemoveUser = () => {
    onRemoveUser(userToRemove);
    setConfirmVisible(false);
    setUserToRemove(null);
  };

  const cancelRemoveUser = () => {
    setConfirmVisible(false);
    setUserToRemove(null);
  };

  return (
    <div className="manage-team-popup">
      <div className="manage-team-content">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <div className="manage-team-header">
          <h2 className="manage-team-title">👨🏻‍💻 Manage Team</h2>
          <button className="add-user-btn" onClick={() => setAddUserVisible(true)}>
            Add User
          </button>
        </div>
        <hr />
        <div className="user-list">
          {users.map((user) => (
            <div key={user.username} className="user-item grey-container">
              <span>👤 {user.username} ({user.role})</span>
              <div className="user-actions">
                <button onClick={() => setUserToChangePassword(user.username)}>
                  Password
                </button>
                <button
                  className='remove-btn'
                  onClick={() => handleRemoveClick(user.username)}
                  disabled={user.role === 'Admin'}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Modal for Removal */}
      {isConfirmVisible && (
        <ConfirmModal
          onConfirm={confirmRemoveUser}
          onCancel={cancelRemoveUser}
          message={`Are you sure you want to remove "${userToRemove}"?`}
        />
      )}

      {/* Add User Form */}
      {isAddUserVisible && (
        <AddUserForm
          onCancel={() => setAddUserVisible(false)}
          onAddUser={(newUser) => {
            onAddUser(newUser);
            setAddUserVisible(false);
          }}
        />
      )}

      {/* Change User Password Popup */}
      {userToChangePassword && (
        <ChangeUserPasswordPopup
          username={userToChangePassword}
          currentPassword={users.find(user => user.username === userToChangePassword)?.password}
          onClose={() => setUserToChangePassword(null)}
          onChangePassword={(newPassword) => {
            onChangeUserPassword(userToChangePassword, newPassword);
            setUserToChangePassword(null);
          }}
        />
      )}
    </div>
  );
}

export default ManageTeamPopup;
