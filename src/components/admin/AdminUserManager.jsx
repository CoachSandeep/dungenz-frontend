import React, { useEffect, useState } from 'react';
import { PiTrashSimpleBold } from "react-icons/pi";
import { MdAdminPanelSettings } from "react-icons/md";
import { FaUserAlt, FaUserCheck, FaUserTimes } from "react-icons/fa";
import './../../styles/AdminUsers.css';

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

  const toggleIndividualProgram = async (id, value) => {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/${id}/individual-program`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value }),
      });
      fetchUsers();
    } catch (err) {
      console.error("❌ Error updating individual programming:", err);
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
    <div className="user-management-container">
      <h2>👥 Manage Users</h2>
      <div className="user-card-grid">
        {users.map(user => (
          <div key={user._id} className="user-card">
            <div className="user-info">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
            </div>
            <div className="user-controls">
              <div className="user-role">
                <label>Role</label>
                <select
                  value={user.role}
                  onChange={(e) => updateRole(user._id, e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="coach">Coach</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
              <div className="user-individual-checkbox">
  <label>
    <input
      type="checkbox"
      checked={user.isIndividualProgram || false}
      onChange={(e) => toggleIndividualProgram(user._id, e.target.checked)}
    />
    Individual Programming
  </label>
</div>
              <div
                className={`user-status ${user.isActive ? 'active' : 'inactive'}`}
                onClick={() => toggleActive(user._id)}
              >
                {user.isActive ? <FaUserCheck /> : <FaUserTimes />}
                {user.isActive ? ' Active' : ' Inactive'}
              </div>
              <button
                className="delete-user-btn"
                onClick={() => deleteUser(user._id)}
              >
                <PiTrashSimpleBold size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
