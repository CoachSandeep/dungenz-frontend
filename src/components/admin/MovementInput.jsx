import React, { useEffect, useState } from 'react';
import './../../styles/MovementInput.css';

const MovementInput = ({ value = [], onChange }) => {
  const [movements, setMovements] = useState([]);
  const [library, setLibrary] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newMovement, setNewMovement] = useState('');
  const [newLink, setNewLink] = useState('');
  const [activeInput, setActiveInput] = useState('');
  const [inputText, setInputText] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    setMovements(value);
  }, [value]);

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

  const fetchSuggestions = async (query) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/movements/search?q=${query}`);
      if (res.ok) {
        const data = await res.json();
        const currentNames = movements.map(m => m.name.toLowerCase());
        const filtered = data.filter(item => !currentNames.includes(item.name.toLowerCase()));
        setSuggestions(filtered);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  const handleInputChange = (e) => {
    const raw = e.target.value;
    setInputText(raw);
    const last = raw.split(',').pop().trim();
    setActiveInput(last);

    if (last.length >= 2) {
      fetchSuggestions(last);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (selected) => {
    const updated = [...movements, selected];
    setMovements(updated);
    onChange(updated);
    setInputText('');
    setSuggestions([]);
    setActiveInput('');
  };

  const handleAddMovement = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/movements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newMovement, url: newLink }),
      });
      if (res.ok) {
        const data = await res.json();
        const updatedLibrary = [...library, data.video];
        setLibrary(updatedLibrary);
        const updated = [...movements, data.video];
        setMovements(updated);
        onChange(updated);
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
        value={inputText}
        onChange={handleInputChange}
        placeholder="e.g. Push-Up, Air Squat"
        autoComplete="off"
      />

      {suggestions.length > 0 && (
        <ul className="suggestion-list">
          {suggestions.map((s, idx) => (
            <li key={idx} onClick={() => selectSuggestion(s)}>{s.name}</li>
          ))}
        </ul>
      )}

      <div className="movement-tags">
        {movements.map((m, idx) => (
          <span key={idx} className="tag">
            {m.name}
            {!m.url && (
              <span className="add-icon" onClick={() => {
                setNewMovement(m.name);
                setShowModal(true);
              }}>➕</span>
            )}
          </span>
        ))}
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
