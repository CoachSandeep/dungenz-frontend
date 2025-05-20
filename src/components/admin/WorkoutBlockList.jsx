import React from 'react';
import './../../styles/WorkoutBlockList.css';

const WorkoutBlockList = ({ groupedWorkouts, onWorkoutToggle, selectedWorkouts, onViewWorkout }) => {
  const isDateFullySelected = (dateKey) => {
    const allIds = groupedWorkouts[dateKey].map(w => w._id);
    return allIds.every(id => selectedWorkouts.includes(id));
  };

  const handleSmartToggle = (dateKey, workoutId) => {
    const allIds = groupedWorkouts[dateKey].map(w => w._id);
    const alreadySelected = selectedWorkouts.includes(workoutId);

    if (!alreadySelected && !isDateFullySelected(dateKey)) {
      // Select all from this date
      allIds.forEach(id => {
        if (!selectedWorkouts.includes(id)) {
          onWorkoutToggle(id);
        }
      });
    } else {
      // Toggle just this one
      onWorkoutToggle(workoutId);
    }
  };

  return (
    <div className="workout-block-list">
      {Object.entries(groupedWorkouts).map(([dateKey, workouts]) => (
        <div key={dateKey} className="workout-date-block" data-date={dateKey}>
          <div className="date-heading">
            {new Date(dateKey).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>

          {workouts.map((w) => (
            <div key={w._id} className="workout-card">
              <label>
                <input
                  type="checkbox"
                  checked={selectedWorkouts.includes(w._id)}
                  onChange={() => handleSmartToggle(dateKey, w._id)}
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
