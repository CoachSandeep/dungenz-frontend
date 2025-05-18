import React, { useEffect, useState } from 'react';

const LibraryPicker = ({ onSelect }) => {
  const [libraryWorkouts, setLibraryWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts/library`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setLibraryWorkouts(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch library workouts');
        setLoading(false);
      }
    };

    fetchLibrary();
  }, []);

  if (loading) return <p>Loading library...</p>;

  return (
    <div className="library-picker">
      <h4>📚 Add from Library</h4>
      {libraryWorkouts.length === 0 ? (
        <p>No workouts saved to library.</p>
      ) : (
        <ul>
          {libraryWorkouts.map((w) => (
            <li key={w._id} className="library-item">
              <span>{w.title}</span>
              <button onClick={() => onSelect(w)}>➕ Add</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LibraryPicker;
