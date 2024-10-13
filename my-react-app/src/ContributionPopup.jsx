import React, { useState } from 'react';
import './ContributionPopup.css';

function ContributionPopup({ task, onClose, onAddContribution }) {
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddContribution = (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (date && duration) {
      // Create the contribution object without description
      const contribution = { date, duration: parseInt(duration, 10) };
      console.log('Adding contribution:', contribution); // Debug log

      // Show success message
      setIsSuccess(true);

      // Automatically close the popup after a few seconds
      setTimeout(() => {
        onAddContribution(contribution);
        // Close the popup
        onClose();
        console.log('Popup closed'); // Debug log
      }, 4000); // 4 seconds
    } else {
      alert('Please fill in all fields.');
    }
  };

  // Determine the content to display
  let content;
  if (isSuccess) {
    content = (
      <div className="contribution-popup-success-message">
        <img src="/sp-gif.gif" alt="Success" className="contribution-popup-success-gif" />
        <p className="contribution-popup-success-text">Great Job!</p>
      </div>
    );
  } else {
    content = (
      <>
        <h2 className="contribution-popup-title">Add Contribution: {task.name}</h2>
        <form onSubmit={handleAddContribution}>
          <div className="contribution-popup-form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="contribution-popup-form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>

          <div className="contribution-popup-form-actions">
            <button
              type="button"
              className="contribution-popup-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="contribution-popup-save-btn"
            >
              Add Contribution
            </button>
          </div>
        </form>
      </>
    );
  }

  return (
    <div className="contribution-popup-outer-container">
      <div className="contribution-popup-content">
        {content}
      </div>
    </div>
  );
}

export default ContributionPopup;
