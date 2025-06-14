import React, { useEffect, useState } from 'react';
import './../../styles/UserManagement.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (id, role) => {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/${id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role })
      });
      fetchUsers();
    } catch (err) {
      console.error("❌ Error updating role:", err);
    }
  };

  const toggleActive = async (id) => {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/${id}/toggle-active`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      fetchUsers();
    } catch (err) {
      console.error("❌ Error toggling active state:", err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers();
    } catch (err) {
      console.error("❌ Error deleting user:", err);
    }
  };

  if (loading) return <div className="admin-section">Loading users...</div>;

  return (
    <div className="admin-section">
      <h2>User Management</h2>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => updateRole(user._id, e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="coach">Coach</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </td>
              <td>
                <span
                  className={user.isActive ? 'badge-active' : 'badge-inactive'}
                  onClick={() => toggleActive(user._id)}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <button className="delete-btn" onClick={() => deleteUser(user._id)}>🗑️ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
