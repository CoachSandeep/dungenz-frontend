import React, { useState } from 'react';
import axios from 'axios';

const versionOptions = ["Ultra Train", "Super Train", "Minimal Equipment", "Beginner"];

const ClusterCopyForm = () => {
  const [date, setDate] = useState('');
  const [fromVersion, setFromVersion] = useState('Ultra Train');
  const [toVersions, setToVersions] = useState([]);
  const [status, setStatus] = useState('');

  const token = localStorage.getItem('token');

  const handleCheckboxChange = (version) => {
    setToVersions((prev) =>
      prev.includes(version)
        ? prev.filter((v) => v !== version)
        : [...prev, version]
    );
  };

  const handleSubmit = async () => {
    if (!date || !fromVersion || toVersions.length === 0) {
      setStatus('⚠️ Please fill all fields');
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/admin/workouts/cluster-copy`,
        {
          date,
          fromVersion,
          toVersions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStatus(`✅ Copied ${res.data.copies.length} workouts successfully!`);
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to copy workouts');
    }
  };

  return (
    <div className="cluster-copy-form" style={{ padding: '20px', maxWidth: '500px' }}>
      <h3>🧱 Cluster Copy Workouts</h3>

      <label>
        Date:
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ marginLeft: '10px' }}
        />
      </label>

      <br /><br />

      <label>
        Copy From:
        <select
          value={fromVersion}
          onChange={(e) => setFromVersion(e.target.value)}
          style={{ marginLeft: '10px' }}
        >
          {versionOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </label>

      <br /><br />

      <label>Copy To:</label>
      <div style={{ marginTop: '5px' }}>
        {versionOptions
          .filter((v) => v !== fromVersion)
          .map((v) => (
            <label key={v} style={{ display: 'block' }}>
              <input
                type="checkbox"
                checked={toVersions.includes(v)}
                onChange={() => handleCheckboxChange(v)}
              />{' '}
              {v}
            </label>
          ))}
      </div>

      <br />

      <button onClick={handleSubmit} style={{ padding: '8px 16px' }}>
        🚀 Copy Cluster
      </button>

      {status && (
        <p style={{ marginTop: '15px', color: status.startsWith('✅') ? 'green' : 'red' }}>
          {status}
        </p>
      )}
    </div>
  );
};

export default ClusterCopyForm;
