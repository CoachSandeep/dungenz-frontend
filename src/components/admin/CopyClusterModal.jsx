import React, { useEffect, useState } from 'react';

const CopyClusterModal = ({ onClose, onCopy, defaultVersion = 'Ultra Train', defaultUser = 'all' }) => {
  const [date, setDate] = useState('');
  const [version, setVersion] = useState(defaultVersion);
  const [user, setUser] = useState(defaultUser);
  const [usersList, setUsersList] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUsersList(data);
      } catch (err) {
        console.error('❌ Failed to fetch users:', err);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = () => {
    onCopy({ date, version, user });
    onClose();
  };

  return (
    <div className="copy-cluster-modal">
      <h3>📋 Copy All Workouts</h3>

      <label>Date</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <label>Version</label>
      <select value={version} onChange={(e) => setVersion(e.target.value)}>
        <option value="Ultra Train">Ultra Train</option>
        <option value="Super Train">Super Train</option>
        <option value="Minimal Equipment">Minimal Equipment</option>
        <option value="Beginner">Beginner</option>
      </select>

      <label>Assign to User</label>
      <select value={user} onChange={(e) => setUser(e.target.value)}>
        <option value="all">All Users</option>
        {usersList.map(u => (
          <option key={u._id} value={u._id}>
            {u.name} ({u.email})
          </option>
        ))}
      </select>

      <div className="modal-actions">
        <button onClick={handleSubmit}>✅ Copy</button>
        <button onClick={onClose}>❌ Cancel</button>
      </div>
    </div>
  );
};

export default CopyClusterModal;
