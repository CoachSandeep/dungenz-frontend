// MovementInput.js
import React, { useEffect, useState } from 'react';
import './../../styles/MovementInput.css';

const MovementInput = ({ value, onChange }) => {
  const [movements, setMovements] = useState([]);
  const [library, setLibrary] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newMovement, setNewMovement] = useState('');
  const [newLink, setNewLink] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/movements`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setLibrary(data);
      } catch (err) {
        console.error('Error loading library:', err);
      }
    };
    fetchLibrary();
  }, [token]);

  useEffect(() => {
    const parsed = value
      .split(',')
      .map(m => m.trim())
      .filter(m => m !== '');
    setMovements(parsed);
  }, [value]);

  const handleAddMovement = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/movements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newMovement, youtubeUrl: newLink }),
      });
      if (res.ok) {
        const updatedLibrary = [...library, { name: newMovement, youtubeUrl: newLink }];
        setLibrary(updatedLibrary);
        setShowModal(false);
        setNewMovement('');
        setNewLink('');
      }
    } catch (err) {
      console.error('Failed to add new movement:', err);
    }
  };

  return (
    <div className="movement-input-wrapper">
      <label>Movements:</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Push-Up, Air Squat"
      />
      <div className="movement-tags">
        {movements.map((m, idx) => {
          const exists = library.some(l => l.name.toLowerCase() === m.toLowerCase());
          return (
            <span key={idx} className="tag">
              {m} { !exists && <span className="add-icon" onClick={() => {
                setNewMovement(m);
                setShowModal(true);
              }}>➕</span> }
            </span>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h4>Add Movement</h4>
            <p><strong>{newMovement}</strong></p>
            <input
              type="text"
              placeholder="YouTube Link"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
            />
            <button onClick={handleAddMovement}>Save</button>
            <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovementInput;
