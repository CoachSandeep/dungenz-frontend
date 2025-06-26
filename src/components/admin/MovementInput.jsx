import React, { useEffect, useState } from 'react';
import './../../styles/MovementInput.css';

const MovementInput = ({ value, onChange }) => {
  const [movements, setMovements] = useState([]);
  const [library, setLibrary] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newMovement, setNewMovement] = useState('');
  const [newLink, setNewLink] = useState('');
  const [activeInput, setActiveInput] = useState('');

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

  const fetchSuggestions = async (query) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/movements/search?q=${query}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.map(item => item.name));
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  const handleInputChange = (e) => {
    const raw = e.target.value;
    onChange(raw);

    const last = raw.split(',').pop().trim();
    setActiveInput(last);

    if (last.length >= 2) {
      fetchSuggestions(last);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (sugg) => {
    const parts = value.split(',');
    parts[parts.length - 1] = sugg;
    const updated = parts.join(', ');
    onChange(updated);
    setSuggestions([]);
  };

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
        onChange={handleInputChange}
        placeholder="e.g. Push-Up, Air Squat"
        autoComplete="off"
      />

      {suggestions.length > 0 && (
        <ul className="suggestion-list">
          {suggestions.map((s, idx) => (
            <li key={idx} onClick={() => selectSuggestion(s)}>{s}</li>
          ))}
        </ul>
      )}

      <div className="movement-tags">
        {movements.map((m, idx) => {
          const exists = library.some(l => l.name.toLowerCase() === m.toLowerCase());
          return (
            <span key={idx} className="tag">
              {m} {!exists && (
                <span className="add-icon" onClick={() => {
                  setNewMovement(m);
                  setShowModal(true);
                }}>➕</span>
              )}
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
