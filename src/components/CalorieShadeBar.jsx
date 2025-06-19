import React from 'react';
import './../styles/CalorieShadeBar.css';

const CalorieShadeBar = ({ calorie }) => {
  const minCal = 200;
  const maxCal = 800;

  // ✅ Check if it's a range like "400-450"
  let label = calorie;
  let average = parseInt(calorie);

  if (typeof calorie === 'string' && calorie.includes('-')) {
    const parts = calorie.split('-').map(p => parseInt(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      average = (parts[0] + parts[1]) / 2;
      label = `${parts[0]}-${parts[1]} cal`;
    }
  } else if (!isNaN(parseInt(calorie))) {
    average = parseInt(calorie);
    label = `${average} cal`;
  }

  const percentage = Math.min(100, Math.max(0, ((average - minCal) / (maxCal - minCal)) * 100));

  return (
    <div className="shade-wrapper">
      <div className="shade-bar">
        <div className="calorie-marker" style={{ left: `${percentage}%` }}>
          <div className="marker-line"></div>
          <div className="marker-label">{label}</div>
        </div>
      </div>
    </div>
  );
};

export default CalorieShadeBar;
