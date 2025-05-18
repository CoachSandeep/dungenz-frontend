import React, { useState } from 'react';

const UploadWorkout = () => {
  const [title, setTitle] = useState('');
  const [customName, setCustomName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [date, setDate] = useState('');
  const [version, setVersion] = useState('');
  const [hasCapTime, setHasCapTime] = useState(false);
  const [capTime, setCapTime] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const workoutData = {
      title,
      customName,
      description,
      instructions,
      date,
      version,
      ...(hasCapTime && { capTime }),
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/workouts/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(workoutData),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Workout uploaded!');
        setTitle('');
        setCustomName('');
        setDescription('');
        setInstructions('');
        setDate('');
        setVersion('');
        setCapTime('');
        setHasCapTime(false);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Upload Workout</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input type="text" placeholder="Workout Title" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <input type="text" placeholder="Custom Name (Optional)" value={customName} onChange={(e) => setCustomName(e.target.value)} />

        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />

        <textarea placeholder="Instructions (Optional)" value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} />

        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

        <select value={version} onChange={(e) => setVersion(e.target.value)} required>
          <option value="">Select Version</option>
          <option value="Ultra Train">Ultra Train</option>
          <option value="Super Train">Super Train</option>
          <option value="Minimal Equipment">Minimal Equipment</option>
          <option value="Beginner">Beginner</option>
        </select>

        <label className="checkbox-line">
          <input type="checkbox" checked={hasCapTime} onChange={() => setHasCapTime(!hasCapTime)} />
          Include Cap Time?
        </label>

        {hasCapTime && (
          <input type="text" placeholder="Cap Time (e.g. 12:00 mins)" value={capTime} onChange={(e) => setCapTime(e.target.value)} />
        )}

        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default UploadWorkout;
