import React from 'react';
import './../styles/CalorieShadeBar.css';

const CalorieShadeBar = ({ calorie }) => {
  const minCal = 100;
  const maxCal = 500;
  const percentage = Math.min(100, Math.max(0, ((calorie - minCal) / (maxCal - minCal)) * 100));

  return (
    <div className="shade-wrapper">
      <div className="shade-bar">
        <div className="calorie-marker" style={{ left: `${percentage}%` }}>
          <div className="marker-line"></div>
          <div className="marker-label">{calorie} cal</div>
        </div>
      </div>
    </div>
  );
};

export default CalorieShadeBar;
