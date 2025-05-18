import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SettingsPage = () => {
  const [releaseTime, setReleaseTime] = useState('21:00');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('token');
 
  useEffect(() => {

    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/settings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (res.data?.releaseTime) {
          setReleaseTime(res.data.releaseTime);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    console.log("🛡 Sending headers:", {
      Authorization: `Bearer ${token}`
    });
    setSaving(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/settings`,
        { releaseTime },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true, // 👈 Try adding this
        }
      );
      alert("Release time updated successfully!");
    } catch (err) {
      alert("Failed to save release time.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-settings-page" style={{ padding: '20px' }}>
      <h2>Daily Workout Release Time</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>This will control when tomorrow's workout becomes visible to users.</p>
          <label>
            Release Time (IST):
            <input
              type="time"
              value={releaseTime}
              onChange={(e) => setReleaseTime(e.target.value)}
              style={{ marginLeft: '10px' }}
            />
          </label>
          <br /><br />
          <button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Release Time'}
          </button>
        </>
      )}
    </div>
  );
};

export default SettingsPage;
