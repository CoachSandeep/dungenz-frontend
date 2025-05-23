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
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/push/all-tokens`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tokens = await res.json();

      const firebaseKey = 'BCHlImXNmJE5fjxK6Dnc9g74itDxN8KKBtkuQpPHn4HzgPd0AVt7zOFYSw_gvI6oOz9IolQY0AxuUwiIcA2LkBc'; // Replace this with your FCM server key

      const sendAll = tokens.map(tk =>
        fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            Authorization: `key=${firebaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: tk,
            notification: { title, body },
          })
        })
      );

      await Promise.all(sendAll);
      setStatus('✅ Notification sent to all devices!');
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
