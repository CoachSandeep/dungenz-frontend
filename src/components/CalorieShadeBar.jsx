import React from 'react';
import './../styles/CalorieShadeBar.css';

const CalorieShadeBar = ({ calorie }) => {
  const minCalBound = 200;
  const maxCalBound = 800;

  let min = null;
  let max = null;

  if (typeof calorie === 'string' && calorie.includes('-')) {
    const parts = calorie.split('-');
    min = parseInt(parts[0], 10);
    max = parseInt(parts[1], 10);
  } else {
    const val = parseInt(calorie, 10);
    min = val;
    max = val;
  }

  const minPercent = Math.min(100, Math.max(0, ((min - minCalBound) / (maxCalBound - minCalBound)) * 100));
  const maxPercent = Math.min(100, Math.max(0, ((max - minCalBound) / (maxCalBound - minCalBound)) * 100));

  return (
    <div className="shade-wrapper">
      <div className="shade-bar">
        {/* Min Marker */}
        <div className="calorie-marker" style={{ left: `${minPercent}%` }}>
          <div className="marker-line"></div>
          <div className="marker-label">{min} </div>
        </div>

        {/* Show second marker only if range */}
        {min !== max && (
          <div className="calorie-marker" style={{ left: `${maxPercent}%` }}>
            <div className="marker-line"></div>
            <div className="marker-label">{max} cal</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalorieShadeBar;
