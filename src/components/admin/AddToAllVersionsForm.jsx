import React, { useState } from 'react';

const AddToAllVersionsForm = ({ date, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [capTime, setCapTime] = useState('');
  const [instructions, setInstructions] = useState('');
  const [customName, setCustomName] = useState('');

  const token = localStorage.getItem('token');
  const versions = ['Ultra Train', 'Super Train', 'Minimal Equipment', 'Beginner'];

  const handleAdd = async () => {
    const promises = versions.map((version) =>
      fetch(`${process.env.REACT_APP_API_BASE_URL}/workouts/upload`, {
        method: 'POST',
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
          date,
          version,
        }),
      })
    );

    try {
      await Promise.all(promises);
      alert('Workout added to all versions!');
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Failed to add workouts');
    }
  };

  return (
    <div className="add-form-box">
      <h3>Add Workout to All Versions</h3>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Custom Name" />
      <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Instructions" />
      <input value={capTime} onChange={(e) => setCapTime(e.target.value)} placeholder="Cap Time" />

      <button onClick={handleAdd}>Add to All Versions</button>
    </div>
  );
};

export default AddToAllVersionsForm;
