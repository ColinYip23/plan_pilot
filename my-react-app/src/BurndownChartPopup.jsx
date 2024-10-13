import React from 'react';
import { Line } from 'react-chartjs-2';
import './BurndownChartPopup.css';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

function BurndownChartPopup({ sprint, tasks, onClose }) {
  if (!sprint) {
    return null;
  }

  // Filter tasks that belong to this sprint
  const sprintTasks = tasks.filter((task) => task.sprintId === sprint.id);

  // Calculate total story points
  const totalStoryPoints = sprintTasks.reduce(
    (total, task) => total + parseInt(task.storyPoint, 10),
    0
  );

  // Prepare data for the chart
  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);

  // Generate dates from start to end date
  const dateArray = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dateArray.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Ideal line data: straight line from totalStoryPoints to 0 over sprint duration
  const idealDataPoints = dateArray.map((date, index) => {
    const remainingStoryPoints =
      totalStoryPoints -
      (totalStoryPoints / (dateArray.length - 1)) * index;
    return { x: date, y: remainingStoryPoints };
  });

  // Actual data points: Remaining story points over time

  // Extract the latest valid completion date per task
  const taskCompletionDates = {};

  sprintTasks.forEach((task) => {
    if (task.history && task.history.length > 0) {
      // Sort the history by timestamp
      const sortedHistory = [...task.history].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      let status = 'Not Started'; // Default status
      let completionDate = null;

      sortedHistory.forEach((historyEntry) => {
        if (historyEntry.action.startsWith('Updated status to')) {
          // Extract the new status from the action string
          const matches = historyEntry.action.match(/"(.+?)"/);
          if (matches && matches[1]) {
            const newStatus = matches[1];
            status = newStatus;
            if (status === 'Completed') {
              // Task moved to Completed, record the date
              completionDate = new Date(historyEntry.timestamp);
            } else {
              // Task moved away from Completed, reset completion date
              completionDate = null;
            }
          }
        }
      });

      // If task is currently completed and we have a completion date
      if (status === 'Completed' && completionDate) {
        // Only consider completion dates within the sprint duration
        if (
          completionDate >= startDate &&
          completionDate <= endDate
        ) {
          taskCompletionDates[task.id] = {
            date: completionDate,
            storyPoint: parseInt(task.storyPoint, 10),
          };
        }
      }
    }
  });

  // Accumulate completed story points by date
  const completedStoryPointsByDate = {};

  Object.values(taskCompletionDates).forEach(({ date, storyPoint }) => {
    const dateStr = date.toISOString().split('T')[0];
    if (completedStoryPointsByDate[dateStr]) {
      completedStoryPointsByDate[dateStr] += storyPoint;
    } else {
      completedStoryPointsByDate[dateStr] = storyPoint;
    }
  });

  // Calculate cumulative completed story points up to each date
  const cumulativeCompletedStoryPointsByDate = {};
  let cumulativeCompletedStoryPoints = 0;

  // Create an array of date strings in order
  const dateStrings = dateArray.map((date) => date.toISOString().split('T')[0]);

  dateStrings.forEach((dateStr) => {
    if (completedStoryPointsByDate[dateStr]) {
      cumulativeCompletedStoryPoints += completedStoryPointsByDate[dateStr];
    }
    cumulativeCompletedStoryPointsByDate[dateStr] = cumulativeCompletedStoryPoints;
  });

  // Build actual remaining story points data
  const actualDataPoints = dateArray.map((date) => {
    const dateStr = date.toISOString().split('T')[0];
    const cumulativeCompleted =
      cumulativeCompletedStoryPointsByDate[dateStr] || 0;
    let remainingStoryPoints = totalStoryPoints - cumulativeCompleted;
    // Ensure remaining story points don't go negative
    if (remainingStoryPoints < 0) remainingStoryPoints = 0;
    return { x: date, y: remainingStoryPoints };
  });

  const chartData = {
    datasets: [
      {
        label: 'Ideal',
        data: idealDataPoints,
        fill: false,
        borderColor: 'blue',
        tension: 0,
      },
      {
        label: 'Actual',
        data: actualDataPoints,
        fill: false,
        borderColor: 'red',
        tension: 0,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'dd/MM/yyyy',
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Story Points Remaining',
        },
        beginAtZero: true,
        suggestedMax: totalStoryPoints,
      },
    },
    plugins: {
      legend: {
        display: true,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="burndown-chart-modal">
      <div className="modal-c-content">
        <div className="modal-header">
          <h2>Burndown Chart</h2>
          <button className="close-btn" onClick={onClose}>
            ✖
          </button>
        </div>
        <hr />
        <div className="modal-body">
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BurndownChartPopup;
