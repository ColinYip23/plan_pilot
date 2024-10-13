// src/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

function Header({
  onAddTaskClick,
  onAddSprintClick,
  sprints,
  onLogout,
  currentUser,
  onOpenAccount,
  onOpenManageTeam,
  onOpenStatistics,
  onCloseStatistics,
  isStatisticsOpen,
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('Product Backlog');
  const settingsDropdownRef = useRef(null);

  useEffect(() => {
    if (location.pathname === '/sprint-board') {
      setCurrentPage('Sprint Board');
    } else if (location.pathname.startsWith('/sprint/')) {
      setCurrentPage('Sprint Backlog');
    } else if (location.pathname.startsWith('/sprint-task-view')) {
      setCurrentPage('Sprint Backlog');
    } else if (location.pathname === '/statistics') {
      setCurrentPage('Statistics');
    } else {
      setCurrentPage('Product Backlog');
    }
  }, [location.pathname]);

  useEffect(() => {
    // Close the settings dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (
        settingsDropdownRef.current &&
        !settingsDropdownRef.current.contains(event.target)
      ) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleLogoutClick = () => {
    setIsLogoutConfirmOpen(true); // Open the logout confirmation
  };

  const confirmLogout = () => {
    setIsLogoutConfirmOpen(false); // Close the confirmation
    onLogout(); // Call the logout function
  };

  const cancelLogout = () => {
    setIsLogoutConfirmOpen(false); // Close the confirmation
  };

  const handleDropdownChange = (e) => {
    const selected = e.target.value;
    if (selected === 'Product Backlog') {
      navigate('/');
    } else if (selected === 'Sprint Board') {
      navigate('/sprint-board');
    } else if (selected === 'Sprint Backlog') {
      // Handle navigation to the appropriate sprint
      let targetSprint = null;
      const today = new Date();

      // Find the oldest active sprint
      const activeSprints = sprints.filter((sprint) => {
        const startDate = new Date(sprint.startDate);
        const endDate = new Date(sprint.endDate);
        return (
          sprint.status === 'Active' ||
          (today >= startDate && today <= endDate)
        );
      });

      if (activeSprints.length > 0) {
        // Sort by startDate ascending
        activeSprints.sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate)
        );
        targetSprint = activeSprints[0];
      } else {
        // No active sprints, find the oldest not started sprint
        const notStartedSprints = sprints.filter((sprint) => {
          const startDate = new Date(sprint.startDate);
          return sprint.status === 'Inactive' || today < startDate;
        });

        if (notStartedSprints.length > 0) {
          // Sort by startDate ascending
          notStartedSprints.sort(
            (a, b) => new Date(a.startDate) - new Date(b.startDate)
          );
          targetSprint = notStartedSprints[0];
        }
      }

      if (targetSprint) {
        // Check if the sprint is active
        if (targetSprint.status === 'Active') {
          // Navigate to sprint task view page for active sprint
          navigate(`/sprint-task-view/${targetSprint.id}`, {
            state: { from: location.pathname },
          });
        } else {
          // Navigate to sprint detail page for non-active sprint
          navigate(`/sprint/${targetSprint.id}`, {
            state: { from: location.pathname },
          });
        }
      } else {
        // No active or not started sprints, navigate to sprint backlog
        navigate('/sprint-board', { state: { from: location.pathname } });
      }
    }
  };

  const handleStatisticsNavigation = () => {
    if (!isStatisticsOpen) {
      onOpenStatistics();
      navigate('/statistics', { state: { from: location.pathname } });
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{currentPage}</h1>
        {/* Render Add Task/Add Sprint buttons in Product Backlog and Sprint Board */}
        {currentPage === 'Product Backlog' && (
          <button className="add-task-btn" onClick={onAddTaskClick}>
            Add Task
          </button>
        )}
        {currentPage === 'Sprint Board' && (
          <button className="add-task-btn" onClick={onAddSprintClick}>
            Add Sprint
          </button>
        )}
      </div>
      <div className="header-right">
        {!isStatisticsOpen && (
          <select
            className="dropdown-btn"
            onChange={handleDropdownChange}
            value={currentPage}
          >
            <option value="Product Backlog">Product Backlog</option>
            <option value="Sprint Board">Sprint Board</option>
            <option value="Sprint Backlog">Sprint Backlog</option>
          </select>
        )}

        {currentPage === 'Statistics' && (
          <button
            className="return-btn"
            onClick={() => {
              const from = location.state?.from || '/';
              onCloseStatistics();
              navigate(from);
            }}
          >
            Return to Previous Page
          </button>
        )}

        <button className="settings-btn" onClick={toggleSettings}>
          ⚙️
        </button>
        {isSettingsOpen && (
          <div ref={settingsDropdownRef} className="settings-dropdown">
            <ul>
              <li
                onClick={() => {
                  onOpenAccount();
                  setIsSettingsOpen(false);
                }}
              >
                Account
              </li>
              {currentUser && currentUser.role === 'Admin' && (
                <>
                  <li
                    onClick={() => {
                      handleStatisticsNavigation();
                      setIsSettingsOpen(false);
                    }}
                  >
                    Statistics
                  </li>
                  <li
                    onClick={() => {
                      onOpenManageTeam();
                      setIsSettingsOpen(false);
                    }}
                  >
                    Manage Team
                  </li>
                </>
              )}
              <li onClick={handleLogoutClick} className="logout-option">
                Logout
              </li>
            </ul>
          </div>
        )}
        {/* Logout Confirmation Modal */}
        {isLogoutConfirmOpen && (
          <div className="logout-confirmation">
            <div className="logout-content">
              <p className="logout-message">
                Are you sure you want to logout?
              </p>
              <div className="logout-actions">
                <button className="logout-confirm-btn" onClick={confirmLogout}>
                  Yes
                </button>
                <button className="logout-cancel-btn" onClick={cancelLogout}>
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
