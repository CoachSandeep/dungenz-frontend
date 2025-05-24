// frontend/src/pages/AdminPushPage.jsx
import React, { useState } from 'react';

const AdminPushPage = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('');

  const sendNotification = async () => {
    setStatus('Sending...');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/push/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, body })
      });
  
      const result = await res.json();
      if (res.ok) {
        setStatus('✅ Notification sent to all devices!');
      } else {
        console.error(result);
        setStatus('❌ Failed: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to send notifications.');
    }
  };

  return (
    <div className="admin-push-container">
      <h2>🔔 Send Push Notification</h2>
      <input
        type="text"
        placeholder="Notification Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        rows="3"
        placeholder="Notification Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button onClick={sendNotification}>🚀 Send to All</button>
      <p>{status}</p>
    </div>
  );
};

export default AdminPushPage;
