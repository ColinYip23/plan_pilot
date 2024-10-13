import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header';
import TaskArea from './TaskArea';
import TaskForm from './TaskForm';
import HistoryModal from './HistoryModal';
import TaskDetails from './TaskDetails';
import ConfirmModal from './ConfirmModal';
import SprintBoard from './SprintBoard';
import SprintDetail from './SprintDetail';
import SprintForm from './SprintForm';
import SprintTaskView from './SprintTaskView';
import ContributionPopup from './ContributionPopup';
import ContributionViewPopup from './ContributionViewPopup';
import AccountPopup from './AccountPopup';
import ManageTeamPopup from './ManageTeamPopup';
import StatisticsPage from './StatisticsPage';
import Login from './Login';
import './index.css';

function App() {

  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      return JSON.parse(savedUsers);
    } else {
      // Default users (admin)
      return [
        { username: 'admin', password: '1234', role: 'Admin' },
      ];
    }
  });

  // Current user
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedLoggedIn = localStorage.getItem('isLoggedIn');
    return savedLoggedIn === 'true';
  });

  // Popups state
  const [isAccountPopupOpen, setAccountPopupOpen] = useState(false);
  const [isManageTeamPopupOpen, setManageTeamPopupOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Authentication Handlers

  const [loginError, setLoginError] = useState('');

  // Handle login
  const handleLogin = (username, password) => {
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      
      setCurrentUser(user);
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify(user));
      setLoginError('');
      
    } else {
      // Handle invalid login
      setLoginError('Incorrect username or password.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    window.location.href = '/';
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('currentUser');
  };

  const changeUserPassword = (username, newPassword) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.username === username ? { ...user, password: newPassword } : user
      )
    );
    
    // If the current user is changing their password, update currentUser as well
    if (currentUser && currentUser.username === username) {
      const updatedUser = { ...currentUser, password: newPassword };
      setCurrentUser(updatedUser);
    }
  };

  // Task Management States and Handlers

  const [tasks, setTasks] = useState(() => {
    // Get initial tasks from localStorage or default to an empty array
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [isFormVisible, setFormVisible] = useState(false);
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const [isTaskDetailsVisible, setTaskDetailsVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [sortOption, setSortOption] = useState('Newest to Oldest');
  const [filterTags, setFilterTags] = useState([]);

  // Sprint Management States and Handlers

  // New state for sprints
  const [sprints, setSprints] = useState(() => {
    const savedSprints = localStorage.getItem('sprints');
    return savedSprints ? JSON.parse(savedSprints) : [];
  });

  const [isSprintFormVisible, setSprintFormVisible] = useState(false);
  const [currentSprint, setCurrentSprint] = useState(null); // Not needed for SprintTaskView
  const [isSecondConfirmVisible, setSecondConfirmVisible] = useState(false);
  const [sprintToDelete, setSprintToDelete] = useState(null);

  // Contribution States

  // State for adding contributions
  const [activeTaskForContribution, setActiveTaskForContribution] = useState(null);

  // State for viewing contributions
  const [activeTaskForContributionView, setActiveTaskForContributionView] = useState(null);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('sprints', JSON.stringify(sprints));
  }, [sprints]);

  // Toggle the visibility of the task form
  const toggleTaskForm = () => {
    setFormVisible(!isFormVisible);
  };

  // Close the task form
  const closeTaskForm = () => {
    setFormVisible(false);
    setCurrentTask(null);
  };

  // Handle saving a new or edited task
  const addOrEditTask = (task) => {
    const existingTask = tasks.find((t) => t.id === task.id);

    if (existingTask) {
      // Check if there are any changes before updating
      const hasChanges = Object.keys(task).some((key) => task[key] !== existingTask[key]);

      if (hasChanges) {
        // If there are changes, update the task
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.id === task.id ? task : t))
        );

        // Add a history log if there are changes
        addHistoryLog(`Edited task "${task.name}"`, task.id, task.assignTo);
      }
    } else {
      // Adding a new task
      const newId = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1;
      const newTask = {
        ...task,
        id: newId,
        createdAt: new Date(),
        history: [],
        sprintId: null, // Initially not assigned to any sprint
        contributions: [],
      };
      setTasks([...tasks, newTask]);
      addHistoryLog(`Created task "${task.name}"`, newId, task.assignTo);
    }
    closeTaskForm();
  };

  // Handle deleting a task
  const deleteTask = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    setTaskToDelete(task);
    setConfirmVisible(true);
  };

  // Confirm deletion
  const confirmDeleteTask = () => {
    const taskId = taskToDelete.id;
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    addHistoryLog(
      `Deleted task "${taskToDelete.name}"`,
      taskId,
      taskToDelete.assignTo
    );
    setConfirmVisible(false);
    setTaskToDelete(null);
  };

  // Cancel deletion
  const cancelDeleteTask = () => {
    setConfirmVisible(false);
    setTaskToDelete(null);
  };

  // Handle opening the edit form with existing task data
  const editTask = (taskId) => {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    setCurrentTask(taskToEdit);
    setFormVisible(true);
  };

  // Handle showing the history modal
  const showHistory = (taskId) => {
    const task = tasks.find((task) => task.id === taskId);
    setCurrentTask(task);
    setHistoryVisible(true);
  };

  // Close the history modal
  const closeHistoryModal = () => {
    setHistoryVisible(false);
    setCurrentTask(null);
  };

  // Handle viewing task details
  const viewTaskDetails = (taskId) => {
    const taskToView = tasks.find((task) => task.id === taskId);
    setCurrentTask(taskToView);
    setTaskDetailsVisible(true);
  };

  // Close the task details modal
  const closeTaskDetails = () => {
    setTaskDetailsVisible(false);
    setCurrentTask(null);
  };

  // Add a history log entry to a task
  const addHistoryLog = (action, taskId, assignTo) => {
    const timestamp = new Date().toISOString();
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              history: [
                ...(task.history || []),
                { action, timestamp, assignTo },
              ],
            }
          : task
      )
    );
  };

  // Apply sorting and filtering to tasks
  const getDisplayedTasks = () => {
    let displayedTasks = [...tasks];

    // Filter out tasks that are assigned to a sprint (sprintId is not null)
    displayedTasks = displayedTasks.filter((task) => task.sprintId === null);

    displayedTasks = displayedTasks.map((task) => ({
      ...task,
      status: 'Not Started',
    }));

    // Apply filtering
    if (filterTags.length > 0) {
      displayedTasks = displayedTasks.filter((task) =>
        filterTags.every((tag) => task.tags.includes(tag))
      );
    }

    // Apply sorting
    switch (sortOption) {
      case 'Newest to Oldest':
        displayedTasks.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case 'Oldest to Newest':
        displayedTasks.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;
      case 'Urgent to Low':
        displayedTasks.sort(
          (a, b) => getPriorityValue(b.priority) - getPriorityValue(a.priority)
        );
        break;
      case 'Low to Urgent':
        displayedTasks.sort(
          (a, b) => getPriorityValue(a.priority) - getPriorityValue(b.priority)
        );
        break;
      default:
        break;
    }

    return displayedTasks;
  };

  // Helper function to assign numerical values to priorities
  const getPriorityValue = (priority) => {
    const priorities = {
      Urgent: 4,
      Important: 3,
      High: 2,
      Medium: 1,
      Low: 0,
    };
    return priorities[priority] || 0;
  };

  // Sprint Management Handlers

  // Toggle Sprint Form
  const toggleSprintForm = () => {
    setSprintFormVisible(!isSprintFormVisible);
    if (!isSprintFormVisible) {
      setCurrentSprint(null);
    }
  };

  // After adding or editing a sprint
  const addOrEditSprint = (sprint) => {
    if (sprint.id) {
      // Editing existing sprint
      setSprints((prevSprints) =>
        prevSprints.map((s) =>
          s.id === sprint.id
            ? {
                ...s,
                ...sprint,
                status: getSprintStatus(sprint),
              }
            : s
        )
      );
    } else {
      // Adding new sprint
      const newId = sprints.length > 0 ? sprints[sprints.length - 1].id + 1 : 1;
      const newSprint = {
        ...sprint,
        id: newId,
        status: getSprintStatus(sprint),
        createdAt: new Date(),
      };
      setSprints([...sprints, newSprint]);
    }
    setSprintFormVisible(false);
  };

  // Helper function to determine sprint status
  const getSprintStatus = (sprint) => {
    const today = new Date();
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    if (today >= start && today <= end) {
      return 'Active';
    } else if (today < start) {
      return 'Inactive';
    } else {
      return 'Completed';
    }
  };

  // Edit Sprint
  const editSprint = (sprintId) => {
    const sprintToEdit = sprints.find((s) => s.id === sprintId);
    setCurrentSprint(sprintToEdit);
    setSprintFormVisible(true);
  };

  // Initial delete sprint: triggers first confirmation
  const initialDeleteSprint = (sprintId) => {
    const sprint = sprints.find((s) => s.id === sprintId);
    setSprintToDelete(sprint);
    setSecondConfirmVisible(true);
  };

  // Confirm sprint deletion
  const confirmDeleteSprint = () => {
    const sprintId = sprintToDelete.id;

    // Set the sprintId of all tasks associated with this sprint to null
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.sprintId === sprintId ? { ...task, sprintId: null, status: 'Not Started' } : task
      )
    );

    // Then, delete the sprint
    setSprints((prevSprints) => prevSprints.filter((s) => s.id !== sprintId));

    setSecondConfirmVisible(false);
    setSprintToDelete(null);
  };

  // Cancel sprint deletion
  const cancelDeleteSprint = () => {
    setSecondConfirmVisible(false);
    setSprintToDelete(null);
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          let updatedTask = { ...task, status: newStatus };
  
          // Initialize history if it doesn't exist
          if (!updatedTask.history) {
            updatedTask.history = [];
          }
  
          const timestamp = new Date().toISOString();
  
          if (newStatus === 'Completed') {
            // Add a history entry for completion
            updatedTask.history.push({
              action: `Updated status to "Completed"`,
              timestamp,
            });
          } else {
            // Remove all "Completed" status entries
            updatedTask.history = updatedTask.history.filter(
              (entry) => entry.action !== `Updated status to "Completed"`
            );
          }
  
          return updatedTask;
        } else {
          return task;
        }
      })
    );
  };
  
  // Contribution Handlers

  // Add contribution to a task
  const addContribution = (taskId, contribution) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === taskId) {
          const contributionWithUser = {
            ...contribution,
            user: t.assignTo, // Assign the assignee of the task
          };
          return {
            ...t,
            contributions: [...(t.contributions || []), contributionWithUser],
          };
        } else {
          return t;
        }
      })
    );
  };

  // Open the contribution popup
  const openContributionPopup = (taskId) => {
    setActiveTaskForContribution(taskId);
  };

  // Close the contribution popup
  const closeContributionPopup = () => {
    setActiveTaskForContribution(null);
  };

  // Functions to open and close the Contribution View Popup
  const openContributionViewPopup = (taskId) => {
    setActiveTaskForContributionView(taskId);
  };

  const closeContributionViewPopup = () => {
    setActiveTaskForContributionView(null);
  };

  // Periodically update sprint statuses based on dates
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date();
      setSprints((prevSprints) =>
        prevSprints.map((sprint) => {
          const startDate = new Date(sprint.startDate);
          const endDate = new Date(sprint.endDate);
          let newStatus = sprint.status;

          if (today >= startDate && today <= endDate) {
            newStatus = 'Active';
          } else if (today < startDate) {
            newStatus = 'Inactive';
          } else {
            newStatus = 'Completed';
          }

          // Only update if the status has changed
          if (newStatus !== sprint.status) {
            return { ...sprint, status: newStatus };
          }
          return sprint;
        })
      );
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Find the task for contribution view
  const taskForContributionView = tasks.find(
    (task) => task.id === activeTaskForContributionView
  );

  const moveTasksBackToBacklog = (sprintId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.sprintId === sprintId && (task.status === 'Not Started' || task.status === 'In Progress')
          ? { ...task, sprintId: null }
          : task
      )
    );
  };

  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);

  const closeStatistics = () => {
    setIsStatisticsOpen(false);
  };

  return (
    <Router>
      <div className="app">
        {isLoggedIn ? (
          <>
            <Header
              onAddTaskClick={toggleTaskForm}
              onAddSprintClick={toggleSprintForm}
              onLogout={handleLogout}
              sprints={sprints}
              currentUser={currentUser} // Pass current user
              onOpenAccount={() => setAccountPopupOpen(true)}
              onOpenManageTeam={() => setManageTeamPopupOpen(true)}

              onOpenStatistics={() => setIsStatisticsOpen(true)} // Open Statistics
              isStatisticsOpen={isStatisticsOpen} // Pass this state to Header
              onCloseStatistics={closeStatistics} // Close Statistics
            />
            <Routes>
              <Route
                path="/"
                element={
                  <TaskArea
                    tasks={getDisplayedTasks()}
                    onEdit={editTask}
                    onDelete={deleteTask}
                    onHistory={showHistory}
                    onView={viewTaskDetails}
                    onSortChange={setSortOption}
                    onFilterChange={setFilterTags}
                    filterTags={filterTags}
                  />
                }
              />
              <Route
                path="/sprint-board"
                element={
                  <SprintBoard
                    sprints={sprints}
                    onAddSprint={toggleSprintForm}
                    onEditSprint={editSprint}
                    onDeleteSprint={initialDeleteSprint}
                    tasks={tasks}
                  />
                }
              />
              <Route
                path="/sprint/:id"
                element={
                  <SprintDetail
                    tasks={tasks}
                    setTasks={setTasks}
                    sprints={sprints}
                    onView={viewTaskDetails}
                    onEdit={editTask}
                  />
                }
              />
              <Route
                path="/sprint-task-view/:id"
                element={
                  <SprintTaskView
                    tasks={tasks} // Pass all tasks
                    sprints={sprints} // Pass all sprints
                    onView={viewTaskDetails}
                    onAddContribution={addContribution}
                    onViewContribution={openContributionViewPopup}
                    onUpdateTaskStatus={updateTaskStatus}
                    onEdit={editTask}
                    onDeleteSprint={initialDeleteSprint} // Pass delete sprint function
                    onMoveTasksBackToBacklog={moveTasksBackToBacklog}
                  />
                }
              />
              <Route
                path="/statistics"
                element={
                  currentUser && currentUser.role === 'Admin' ? (
                    <StatisticsPage tasks={tasks} sprints={sprints} users={users} onClose={closeStatistics}/>
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>

            {isFormVisible && (
              <TaskForm
                onCancel={closeTaskForm}
                onSave={addOrEditTask}
                task={currentTask}
                users={users}
              />
            )}
            {isHistoryVisible && currentTask && (
              <HistoryModal
                onClose={closeHistoryModal}
                history={currentTask.history || []}
                taskName={currentTask.name}
              />
            )}
            {isTaskDetailsVisible && currentTask && (
              <TaskDetails task={currentTask} onClose={closeTaskDetails} />
            )}
            {isConfirmVisible && taskToDelete && (
              <ConfirmModal
                onConfirm={confirmDeleteTask}
                onCancel={cancelDeleteTask}
                message={`Are you sure you want to delete the task "${taskToDelete.name}"?`}
              />
            )}
            {isSecondConfirmVisible && sprintToDelete && (
              <ConfirmModal
                onConfirm={confirmDeleteSprint}
                onCancel={cancelDeleteSprint}
                message={`Are you sure you want to delete the sprint "${sprintToDelete.name}"?`}
              />
            )}
            {isSprintFormVisible && (
              <SprintForm
                onCancel={toggleSprintForm}
                onSave={addOrEditSprint}
                sprint={currentSprint}
                existingSprints={sprints}
                users={users}
              />
            )}
            {/* Contribution Popup */}
            {activeTaskForContribution && (
              <ContributionPopup
                task={tasks.find((task) => task.id === activeTaskForContribution)}
                onClose={closeContributionPopup}
                onAddContribution={(contribution) => {
                  addContribution(activeTaskForContribution, contribution);
                }}
              />
            )}
            {/* Contribution View Popup */}
            {activeTaskForContributionView && taskForContributionView && (
              <ContributionViewPopup
                task={taskForContributionView}
                onClose={closeContributionViewPopup}
              />
            )}
            {/* Account Popup */}
            {isAccountPopupOpen && (
              <AccountPopup
                user={currentUser}
                onClose={() => setAccountPopupOpen(false)}
                onUpdatePassword={(newPassword) => changeUserPassword(currentUser.username, newPassword)}
              />
            )}
            {/* Manage Team Popup (Admin Only) */}
            {isManageTeamPopupOpen && currentUser && currentUser.role === 'Admin' && (
              <ManageTeamPopup
                users={users}
                onClose={() => setManageTeamPopupOpen(false)}
                onAddUser={(newUser) => {
                  setUsers([...users, newUser]);
                }}
                onRemoveUser={(username) => {
                  setUsers(users.filter((u) => u.username !== username));
                }}
                onChangeUserPassword={(username, newPassword) => {
                  // Update users array
                  setUsers((prevUsers) =>
                    prevUsers.map((u) =>
                      u.username === username ? { ...u, password: newPassword } : u
                    )
                  );
                  
                  // Update currentUser if necessary
                  if (currentUser && currentUser.username === username) {
                    const updatedUser = { ...currentUser, password: newPassword };
                    setCurrentUser(updatedUser);
                  }
                }}
              />
            )}
          </>
        ) : (
          <Login onLogin={handleLogin} errorMessage={loginError} />
        )}
      </div>
    </Router>
  );
}

export default App;