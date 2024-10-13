import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import './StatisticsPage.css';

Chart.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

function StatisticsPage({ tasks, sprints, users }) {
  // Top Container State
  const [selectedMember, setSelectedMember] = useState('');
  const [contributionData, setContributionData] = useState([]);

  // Bottom Container State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [averageContributions, setAverageContributions] = useState([]);

  // Error state for date validation
  const [error, setError] = useState('');

  // Process data for the bar chart when selectedMember changes
  useEffect(() => {
    if (selectedMember) {
      const memberContributions = [];

      tasks.forEach((task) => {
        if (task.contributions && task.contributions.length > 0) {
          task.contributions.forEach((contribution) => {
            if (contribution.user === selectedMember) {
              const date = new Date(contribution.date);
              const dateStr = date.toISOString().split('T')[0];
              const minutes = parseInt(contribution.duration, 10);
              const hours = minutes / 60;

              const existing = memberContributions.find((item) => item.date === dateStr);
              if (existing) {
                existing.hours += hours;
              } else {
                memberContributions.push({ date: dateStr, hours });
              }
            }
          });
        }
      });

      memberContributions.sort((a, b) => new Date(a.date) - new Date(b.date));

      setContributionData(memberContributions);
    } else {
      setContributionData([]);
    }
  }, [selectedMember, tasks]);

  // Prepare data for the bar chart
  const barChartData = {
    labels: contributionData.map((item) => item.date),
    datasets: [
      {
        label: 'Hours Contributed',
        data: contributionData.map((item) => item.hours),
        backgroundColor: contributionData.map((item) => getBarColor(item.hours)),
      },
    ],
  };

  const barChartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date (yyyy-mm-dd)',
        },
        ticks: {
          maxRotation: 90,
          minRotation: 45,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Hours Contributed',
        },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  };

  // Function to get bar color based on hours contributed
  function getBarColor(hours) {
    if (hours >= 8) {
      return '#FF0500';
    } else if (hours >= 6) {
      return '#FF3652';
    } else if (hours >= 4) {
      return '#FFA500';
    } else if (hours >= 2) {
      return '#D5B60A';
    } else {
      return '#008000';
    }
  }

  // Process data for the average contributions table when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      const memberTotals = {};

      tasks.forEach((task) => {
        if (task.contributions && task.contributions.length > 0) {
          task.contributions.forEach((contribution) => {
            const contribDate = new Date(contribution.date);
            if (contribDate >= start && contribDate <= end) {
              const username = contribution.user;
              const minutes = parseInt(contribution.duration, 10);
              const hours = minutes / 60;

              if (memberTotals[username]) {
                memberTotals[username] += hours;
              } else {
                memberTotals[username] = hours;
              }
            }
          });
        }
      });

      const averages = users.map((user) => {
        const totalHours = memberTotals[user.username] || 0;
        const averageHours = totalHours / totalDays;
        return {
          username: user.username,
          averageHours,
        };
      });

      setAverageContributions(averages);
    } else {
      setAverageContributions([]);
    }
  }, [startDate, endDate, tasks, users]);

  // Handle start date change
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    if (endDate && new Date(newStartDate) > new Date(endDate)) {
      setError('Start date cannot be after the end date!');
    } else {
      setError('');
      setStartDate(newStartDate);
    }
  };

  // Handle end date change
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    if (startDate && new Date(newEndDate) < new Date(startDate)) {
      setError('End date cannot be before the start date!');
    } else {
      setError('');
      setEndDate(newEndDate);
    }
  };

  return (
    <div className="statistics-page">
      {/* Top Container */}
      <div className="top-container">
        <h2>Team Member Contributions</h2>
        <div className="dropdown-container">
          <label htmlFor="member-select" className="member-label">
            Team Member:
          </label>
          <select
            id="member-select"
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="member-dropdown"
          >
            <option value="">Choose Team Member</option>
            {users.map((user) => (
              <option key={user.username} value={user.username}>
                {user.username}
              </option>
            ))}
          </select>
        </div>
        {selectedMember && (
          <div className="bar-chart-container">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        )}
      </div>

      {/* Bottom Container */}
      <div className="bottom-container">
        <h2>Average Contributions</h2>
        <div className="date-inputs-container">
        <div className="date-input-container">
            <label htmlFor="start-date">Start Date:</label>
            <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={handleStartDateChange}
            className="large-date-input"
            />
        </div>
        <div className="date-input-container">
            <label htmlFor="end-date">End Date:</label>
            <input
            type="date"
            id="end-date"
            value={endDate}
            min={startDate}
            onChange={handleEndDateChange}
            className="large-date-input"
            />
        </div>
        </div>
        {error && <p className="error-message-sp">{error}</p>}
        {startDate && endDate && !error && (
          <div className="table-container">
            <table className="contribution-table">
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Average Time Spent (Hours)</th>
                </tr>
              </thead>
              <tbody>
                {averageContributions.map((item) => (
                  <tr key={item.username}>
                    <td>{item.username}</td>
                    <td>{item.averageHours.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatisticsPage;
