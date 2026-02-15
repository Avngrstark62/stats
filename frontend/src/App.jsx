import { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";

const API = "http://localhost:5000/api/tasks";
const SETTINGS_API = "http://localhost:5000/api/settings";

function App() {
  const [records, setRecords] = useState([]);
  const [taskNames, setTaskNames] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [windowOffset, setWindowOffset] = useState(0);
  const [startDate, setStartDate] = useState(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  };

  const generateDates = () => {
    const days = [];
    for (let i = 9; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i - windowOffset);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  };

  const dates = generateDates();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  const tasksRes = await axios.get(API);
  setRecords(tasksRes.data);

  const unique = [...new Set(tasksRes.data.map(r => r.title))];
  setTaskNames(unique);

  const settingsRes = await axios.get(SETTINGS_API);

  if (settingsRes.data && settingsRes.data.startDate) {
    setStartDate(settingsRes.data.startDate);
  }
};

  const addTask = async () => {
    if (!newTask.trim()) return;
    if (taskNames.includes(newTask)) return alert("Task exists");

    await axios.post(API, {
      title: newTask,
      date: todayStr,
      completed: false
    });

    setNewTask("");
    setShowInput(false);
    fetchData();
  };

  const toggle = async (task, date) => {
    const existing = records.find(
      r => r.title === task && r.date === date
    );

    if (existing) {
      await axios.patch(`${API}/${existing._id}`);
    } else {
      await axios.post(API, { title: task, date });
    }

    fetchData();
  };

  const isChecked = (task, date) => {
    const r = records.find(
      r => r.title === task && r.date === date
    );
    return r ? r.completed : false;
  };

  const calculatePercentage = (task) => {
    const filteredDates = dates.filter(d => d >= startDate);
    if (filteredDates.length === 0) return 0;

    const completedCount = filteredDates.filter(d =>
      isChecked(task, d)
    ).length;

    return Math.round((completedCount / filteredDates.length) * 100);
  };

  const moveLeft = () => setWindowOffset(prev => prev + 10);

  const moveRight = () => {
    if (windowOffset === 0) return;
    setWindowOffset(prev => Math.max(prev - 10, 0));
  };

  const calculateColumnPercentage = (date) => {
  if (date < startDate) return null;
  if (taskNames.length === 0) return 0;

  const completedCount = taskNames.filter(task =>
    isChecked(task, date)
  ).length;

  return Math.round((completedCount / taskNames.length) * 100);
};

  return (
    <div className="app">
      <h2>Progress Grid</h2>

      {/* Navigation */}
      <div className="nav">
        <button onClick={moveLeft}>←</button>
        <span className="range">
          {formatDate(dates[0])} → {formatDate(dates[9])}
        </span>
        <button onClick={moveRight} disabled={windowOffset === 0}>
          →
        </button>
      </div>

      {/* Start Date Selector */}
      <div className="start-date">
        <label>Stats From:</label>
        <input
          type="date"
          value={startDate || ""}
          min={dates[0]}
          max={todayStr}
    onChange={async (e) => {
  const value = e.target.value;
  setStartDate(value);
  await axios.post(SETTINGS_API, { startDate: value });
}}
        />
      </div>

      <div className="grid-container">
        {/* Header */}
        <div className="grid header">
          <div className="task-header">Task</div>
          {dates.map(d => (
            <div
              key={d}
              className={`date-header ${d === todayStr ? "today-header" : ""}`}
            >
              {formatDate(d)}
              {d === todayStr && <div className="today-dot" />}
            </div>
          ))}
          <div className="percent-header">%</div>
        </div>

        {/* Rows */}
        {taskNames.map(task => (
          <div key={task} className="grid row">
            <div className="task-cell">{task}</div>

            {dates.map(date => (
              <div
                key={date}
                className={`checkbox 
                  ${isChecked(task, date) ? "checked" : ""} 
                  ${!isChecked(task, date) && date !== todayStr ? "missed" : ""} 
                  ${date === todayStr ? "today-cell" : ""}
                `}
                onClick={() => toggle(task, date)}
              />
            ))}

            <div className="percent-cell">
              {calculatePercentage(task)}%
            </div>
          </div>
        ))}

    {/* Column Percentage Row */}
<div className="grid summary-row">
  <div className="task-cell percent-label">Daily %</div>

  {dates.map(date => {
    const value = calculateColumnPercentage(date);
    return (
      <div key={date} className="percent-cell">
        {value === null ? "-" : `${value}%`}
      </div>
    );
  })}

  <div className="percent-cell">-</div>
</div>

        {/* Add Task */}
        <div className="add-section">
          {showInput ? (
            <div className="input-row">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="New Task"
              />
              <button onClick={addTask}>Add</button>
            </div>
          ) : (
            <button className="add-btn" onClick={() => setShowInput(true)}>
              + Add Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
