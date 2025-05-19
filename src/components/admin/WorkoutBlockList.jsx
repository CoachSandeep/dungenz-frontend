import React from 'react';
import './WorkoutBlockList.css';

const WorkoutBlockList = ({ groupedWorkouts, onWorkoutToggle, selectedWorkouts, onViewWorkout }) => {
  return (
    <div className="workout-block-list">
      {Object.entries(groupedWorkouts).map(([dateKey, workouts]) => (
        <div key={dateKey} className="workout-date-block">
          <div className="date-heading">
            {new Date(dateKey).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>

          {workouts.map((w) => (
            <div key={w._id} className="workout-card">
              <label>
                <input
                  type="checkbox"
                  checked={selectedWorkouts.includes(w._id)}
                  onChange={() => onWorkoutToggle(w._id)}
                />
              </label>

              <div className="workout-info" onClick={() => onViewWorkout(w)}>
                <span className="workout-title">{w.title}</span>
                {w.capTime && <span className="cap">⏱ {w.capTime}m</span>}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default WorkoutBlockList;
