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
        setStatus(`✅ Sent: ${result.successCount} success, ${result.failureCount} failed`);
      } else {
        console.error(result);
        setStatus('❌ Failed: ' + (result.error || result.message));
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to send notifications.');
    }
  };

  return (
    <div className="admin-push-container" style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h2>🔔 Send Push Notification</h2>
      <input
        type="text"
        placeholder="Notification Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
      />
      <textarea
        rows="3"
        placeholder="Notification Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
      />
      <button
        onClick={sendNotification}
        style={{ padding: '10px 20px', backgroundColor: '#ff2c2c', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        🚀 Send to All
      </button>
      <p style={{ marginTop: '1rem' }}>{status}</p>
    </div>
  );
};

export default AdminPushPage;
