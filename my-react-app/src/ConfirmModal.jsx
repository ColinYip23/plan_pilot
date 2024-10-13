import React from 'react';
import './ConfirmModal.css';

function ConfirmModal({ onConfirm, onCancel, message }) {
  // Extract the name to be deleted from the message
  const nameToDelete = message.match(/"(.*?)"/)?.[1];

  return (
    <div className="confirm-modal">
      <div className="modal-content">
        <p className="confirm-message">
          Are you sure you want to remove{' '}
          <span className="tag">{nameToDelete}</span>?
        </p>
        <div className="modal-actions">
          <button className="confirm-btn" onClick={onConfirm}>
            Yes
          </button>
          <button className="cancel-btn" onClick={onCancel}>
            No
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
