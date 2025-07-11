import React, { useEffect, useState } from 'react';
import './../../styles/MovementInput.css';

const MovementInput = ({ value = [], onChange }) => {
  const [movements, setMovements] = useState([]);
  const [library, setLibrary] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newMovement, setNewMovement] = useState('');
  const [newLink, setNewLink] = useState('');
  const [isShorts, setIsShorts] = useState(false);
  const [activeInput, setActiveInput] = useState('');
  const [inputText, setInputText] = useState('');

  const token = localStorage.getItem('token');

  // Normalize incoming value
  useEffect(() => {
    if (Array.isArray(value)) {
      const normalized = value.map(item => {
        if (typeof item === 'string') {
          const matched = library.find(m => m._id === item);
          return matched ? matched : { name: item, url: '' };
        }
        return item;
      });
      setMovements(normalized);
    } else {
      setMovements([]);
    }
  }, [value, library]);

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
      let finalLink = newLink.trim();

      if (isShorts && finalLink.includes('shorts/')) {
        const id = finalLink.split('shorts/')[1].split('?')[0];
        finalLink = `https://www.youtube.com/watch?v=${id}`;
      }

      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/movements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newMovement, url: finalLink }),
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
        setIsShorts(false);
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

      {(suggestions.length > 0 || (inputText.trim().length >= 2 && !suggestions.find(s => s.name.toLowerCase() === inputText.trim().toLowerCase()))) && (
        <ul className="suggestion-list">
          {suggestions.map((s, idx) => (
            <li key={idx} onClick={() => selectSuggestion(s)}>{s.name}</li>
          ))}

          {!suggestions.find(s => s.name.toLowerCase() === inputText.trim().toLowerCase()) && inputText.trim().length >= 2 && (
            <li className="add-new" onClick={() => {
              setNewMovement(inputText.trim());
              setShowModal(true);
            }}>
              ➕ Add "{inputText.trim()}"
            </li>
          )}
        </ul>
      )}

      <div className="movement-tags">
        {movements.map((m, idx) => (
          <span key={idx} className="tag">
            {m.name}
            {!m.url && (
              <span className="add-icon" title="Add YouTube link" onClick={() => {
                setNewMovement(m.name);
                setShowModal(true);
              }}>➕</span>
            )}
            <span className="delete-icon" title="Remove from workout" onClick={() => {
              const updated = movements.filter((_, i) => i !== idx);
              setMovements(updated);
              onChange(updated);
            }}>❌</span>
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
            <div style={{ marginTop: '8px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={isShorts}
                  onChange={(e) => setIsShorts(e.target.checked)}
                  style={{ marginRight: '6px' }}
                />
                This is a YouTube Shorts link (auto convert for embed)
              </label>
            </div>
            <button onClick={handleAddMovement}>Save</button>
            <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovementInput;
