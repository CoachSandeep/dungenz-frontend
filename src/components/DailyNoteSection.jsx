import React, { useEffect, useState } from 'react';

const DailyNoteSection = ({ date, selectedUserId, selectedUser }) => {
  const [userNote, setUserNote] = useState('');
  const [coachNote, setCoachNote] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const localUser = JSON.parse(localStorage.getItem('user') || '{}');
  const loggedInUser = { ...localUser, _id: localUser.id };

  const isCoach = ['coach', 'superadmin'].includes(loggedInUser?.role);
  const isSameUser = loggedInUser._id === selectedUserId;
  const isIndividual = selectedUser?.isIndividualProgram;

  useEffect(() => {
    if (date && selectedUserId) {
      fetchNote();
    }
  }, [date, selectedUserId]);

  // 👇👇👇 This becomes the main logic
  const showNotes = isIndividual || isCoach;

  return (
    <div className="section-card-indvidual" style={{ marginBottom: '10px' }}>
      {showNotes && <h3 style={{ color: 'white' }}>📝 Daily Notes</h3>}

      {isSameUser && showNotes && (
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
              <button onClick={() => deleteNote('user')} style={{ marginLeft: '10px', background: '#ff2c2c', color: 'white' }}>Delete</button>
            )}
          </div>
        </div>
      )}

      {isCoach && showNotes && (
        <div>
          <label style={{ color: '#bbb' }}>Coach Note</label>
          <textarea
            value={coachNote}
            onChange={(e) => setCoachNote(e.target.value)}
            rows={3}
            placeholder="Observations, changes, injuries, adjustments..."
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
          <div style={{ marginTop: '5px' }}>
            <button onClick={() => saveNote('coach')} disabled={loading}>Save</button>
            {coachNote && (
              <button onClick={() => deleteNote('coach')} style={{ marginLeft: '10px', background: '#ff2c2c', color: 'white' }}>Delete</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyNoteSection;
