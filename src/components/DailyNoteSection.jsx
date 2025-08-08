import React, { useEffect, useState } from 'react';

const DailyNoteSection = ({ date, selectedUserId, selectedUser }) => {
  const [userNote, setUserNote] = useState('');
  const [coachNote, setCoachNote] = useState('');
  const [loading, setLoading] = useState(false);

  // Current logged-in user (from localStorage)
  const token = localStorage.getItem('token');
  const localUser = JSON.parse(localStorage.getItem('user') || '{}');
  const loggedInUser = { ...localUser, _id: localUser.id };

  // Role checks and ownership
  const isCoach = ['coach', 'superadmin'].includes(loggedInUser?.role);
  const isSameUser = loggedInUser._id === selectedUserId; // ✅ fix: compare with selectedUserId
  const isIndividual = selectedUser?.isIndividualProgram;

  // Show notes if user is on an individual programme or viewer is coach
  const showNotes = isIndividual || isCoach;

  // Fetch the note data
  const fetchNote = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/daily-notes?user=${localUser.id}&date=${date}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data) {
        setUserNote(data.userNote || '');
        setCoachNote(data.coachNote || '');
      } else {
        setUserNote('');
        setCoachNote('');
      }
    } catch (err) {
      console.error('Error fetching daily note:', err);
    }
  };

  // Save a note (user or coach)
  const saveNote = async (type) => {
    setLoading(true);
    try {
      const payload = {
        user: selectedUserId,
        date,
        ...(type === 'user' && { userNote }),
        ...(type === 'coach' && { coachNote }),
      };

      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/daily-notes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error('Save error:', err.message);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a note (user or coach)
  const deleteNote = async (type) => {
    try {
      await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/daily-notes?user=${selectedUserId}&date=${date}&type=${type}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (type === 'user') setUserNote('');
      else setCoachNote('');
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Fetch note whenever date or selectedUserId changes
  useEffect(() => {
    if (showNotes) {
      fetchNote();
    }
  }, [date, selectedUserId]);

  return (
    <div className="section-card-indvidual" style={{ marginBottom: '10px' }}>
      {showNotes && <h3 style={{ color: 'white' }}>📝 Daily Notes</h3>}

      {/* User's note section (editable only for the same user) */}
      {showNotes && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: '#bbb' }}>Your Note</label>
          <textarea
            value={userNote}
            onChange={(e) => setUserNote(e.target.value)}
            rows={3}
            placeholder="What did you feel today? Injuries? Mood? Performance?"
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
          <div style={{ marginTop: '5px' }}>
            <button onClick={() => saveNote('user')} disabled={loading}>Save</button>
            {userNote && (
              <button
                onClick={() => deleteNote('user')}
                style={{ marginLeft: '10px', background: '#ff2c2c', color: 'white' }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      {/* Coach note section: editable for coach/superadmin, read-only for users */}
      {showNotes && (
        <div>
          <label style={{ color: '#bbb' }}>Coach Note</label>
          {isCoach ? (
            <textarea
              value={coachNote}
              onChange={(e) => setCoachNote(e.target.value)}
              rows={3}
              placeholder="Observations, changes, injuries, adjustments..."
              style={{ width: '100%', padding: '10px', marginTop: '5px' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '5px',
                color: '#eee',
                border: '1px solid #444',
                borderRadius: '4px',
                minHeight: '60px',
              }}
            >
              {coachNote || 'No coach note yet.'}
            </div>
          )}
          {isCoach && (
            <div style={{ marginTop: '5px' }}>
              <button onClick={() => saveNote('coach')} disabled={loading}>Save</button>
              {coachNote && (
                <button
                  onClick={() => deleteNote('coach')}
                  style={{ marginLeft: '10px', background: '#ff2c2c', color: 'white' }}
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyNoteSection;
