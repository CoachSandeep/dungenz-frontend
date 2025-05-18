import React, { useState } from 'react';

const InlineEditForm = ({ workout, onCancel, onSaved }) => {
  const [title, setTitle] = useState(workout.title);
  const [description, setDescription] = useState(workout.description || '');
  const [capTime, setCapTime] = useState(workout.capTime || '');
  const [instructions, setInstructions] = useState(workout.instructions || '');
  const [customName, setCustomName] = useState(workout.customName || '');
  const [version, setVersion] = useState(workout.version);

  const token = localStorage.getItem('token');

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts/${workout._id}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          capTime,
          instructions,
          customName,
          version,
        }),
      });

      if (res.ok) {
        alert('Workout updated');
        onSaved();
      } else {
        alert('Update failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="inline-edit-box">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Custom Name" />
      <input value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Instructions" />
      <input value={capTime} onChange={(e) => setCapTime(e.target.value)} placeholder="Cap Time" />

      <select value={version} onChange={(e) => setVersion(e.target.value)}>
        <option>Ultra Train</option>
        <option>Super Train</option>
        <option>Minimal Equipment</option>
        <option>Beginner</option>
      </select>

      <div style={{ marginTop: '10px' }}>
        <button onClick={handleUpdate} className="save-btn">Save</button>
        <button onClick={onCancel} className="cancel-btn">Cancel</button>
      </div>
    </div>
  );
};

export default InlineEditForm;
