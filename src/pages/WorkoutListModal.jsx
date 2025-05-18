import React, { useState } from 'react';
import WorkoutForm from './WorkoutForm';
import './WorkoutListModal.css';

const WorkoutListModal = ({ date, workouts, onClose }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);

  const formattedDate = new Date(date).toLocaleDateString();

  const handleEdit = (workout) => {
    setEditingWorkout(workout);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingWorkout(null); // clear any previous workout
    setShowForm(true);
  };

  // ... delete/star/copy handlers same as before

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Workouts for {formattedDate}</h3>

        <ul className="workout-list">
          {workouts.map((w) => (
            <li key={w._id} className="workout-item-admin">
              <strong>{w.title}</strong> ({w.version})
              <div className="admin-buttons">
                <button onClick={() => handleEdit(w)}>✏️</button>
                <button onClick={() => handleDelete(w._id)}>🗑</button>
                <button onClick={() => handleCopy(w._id)}>📋</button>
                <button onClick={() => handleStar(w._id)}>{w.isStarred ? '⭐' : '☆'}</button>
              </div>
            </li>
          ))}
        </ul>

        <button className="add-workout-btn" onClick={handleAddNew}>+ Add Workout</button>
        <button className="close-modal" onClick={onClose}>Close</button>

        {/* 🟡 FORM COMPONENT GOES HERE */}
        {showForm && (
          <WorkoutForm
            selectedWorkout={editingWorkout}
            selectedDate={date}
            onClose={() => {
              setShowForm(false);
              setEditingWorkout(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default WorkoutListModal;
