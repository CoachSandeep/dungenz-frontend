import React, { useState, useEffect } from 'react';
import '../../styles/workoutForm.css';

const WorkoutForm = ({ selectedWorkout, selectedDate, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customName, setCustomName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [capTime, setCapTime] = useState('');
  const [capEnabled, setCapEnabled] = useState(false);
  const [version, setVersion] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (selectedWorkout) {
      setTitle(selectedWorkout.title || '');
      setDescription(selectedWorkout.description || '');
      setCustomName(selectedWorkout.customName || '');
      setInstructions(selectedWorkout.instructions || '');
      setCapTime(selectedWorkout.capTime || '');
      setCapEnabled(!!selectedWorkout.capTime);
      setVersion(selectedWorkout.version || '');
    }
  }, [selectedWorkout]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title,
      description,
      customName,
      instructions,
      capTime: capEnabled ? capTime : '',
      version,
      date: selectedWorkout?.date || selectedDate,
    };

    const url = selectedWorkout
      ? `${process.env.REACT_APP_API_BASE_URL}/admin/workouts/${selectedWorkout._id}/edit`
      : `${process.env.REACT_APP_API_BASE_URL}/workouts/upload`;

    const method = selectedWorkout ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(selectedWorkout ? 'Workout updated!' : 'Workout added!');
        onClose();
      } else {
        alert('Failed to save workout');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{selectedWorkout ? 'Edit Workout' : 'Add Workout'}</h3>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Title *" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea
            placeholder="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="text"
            placeholder="Custom Name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
          <textarea
            placeholder="Instructions"
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />

          <select value={version} onChange={(e) => setVersion(e.target.value)} required>
            <option value="">Select Version</option>
            <option value="Ultra Train">Ultra Train</option>
            <option value="Super Train">Super Train</option>
            <option value="Minimal Equipment">Minimal Equipment</option>
            <option value="Beginner">Beginner</option>
          </select>

          <label className="checkbox-label">
            <input type="checkbox" checked={capEnabled} onChange={() => setCapEnabled(!capEnabled)} />
            Add Cap Time
          </label>

          {capEnabled && (
            <input
              type="text"
              placeholder="Cap Time (e.g. 12:00)"
              value={capTime}
              onChange={(e) => setCapTime(e.target.value)}
            />
          )}

          <div className="button-group">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkoutForm;
