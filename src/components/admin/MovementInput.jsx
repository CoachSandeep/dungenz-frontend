import React, { useEffect, useState } from 'react';
import './../../styles/MovementInput.css';

const MovementInput = ({ value, onChange }) => {
  const [rawInput, setRawInput] = useState(value || '');
  const [movements, setMovements] = useState([]);
  const [library, setLibrary] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newMovement, setNewMovement] = useState('');
  const [newLink, setNewLink] = useState('');
  const [activeInput, setActiveInput] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    setRawInput(value || '');
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

  useEffect(() => {
    const parsed = rawInput
      .split(',')
      .map(m => m.trim())
      .filter(m => m !== '');
    setMovements(parsed);
  }, [rawInput]);

  const fetchSuggestions = async (query) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/movements/search?q=${query}`);
      if (res.ok) {
        const data = await res.json();
        const currentList = value
          .split(',')
          .map(m => m.trim().toLowerCase())
          .filter(m => m !== '');
  
        // ❌ Filter out already selected movements
        const filtered = data
          .map(item => item.name)
          .filter(name => !currentList.includes(name.toLowerCase()));
  
        setSuggestions(filtered);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  const handleInputChange = (e) => {
    const raw = e.target.value;
    onChange(raw);
  
    const parts = raw.split(',').map(p => p.trim()).filter(Boolean);
    const last = parts[parts.length - 1]; // last part being typed
  
    // If last is already in list, no need to suggest again
    const alreadySelected = parts.slice(0, -1); // all except the one being typed
    const isDuplicate = alreadySelected.some(p => p.toLowerCase() === last.toLowerCase());
  
    if (!isDuplicate && last.length >= 2) {
      fetchSuggestions(last);
    } else {
      setSuggestions([]);
    }
  
    setActiveInput(last);
  };

  const selectSuggestion = (sugg) => {
    const parts = value.split(',').map(p => p.trim());
    parts[parts.length - 1] = sugg; // replace last part with selected suggestion
  
    const deduped = [...new Set(parts.filter(Boolean))]; // remove accidental duplicates
    const updated = deduped.join(', ') + ', ';
    
    onChange(updated);
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
        value={rawInput}
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
