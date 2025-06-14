import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Workouts from './pages/WorkoutsPage';
import Login from './pages/LoginPage';
import Caccount from './pages/RegisterPage';
import './styles/App.css';
import UploadWorkout from './pages/UploadWorkoutPage';
import AdminCalendar from './components/admin/AdminCalendar';
import LibraryPage from './pages/LibraryPage';
import Settings from './components/admin/settings';
import ClusterCopyPage from './pages/ClusterCopyPage';
import AdminPushPage from './components/admin/AdminPushPage';
import AdminUserManager from './components/admin/AdminUserManager';
import UserProfile from './pages/UserProfile';
import { messaging, getToken, onMessage } from './firebase';
import PrivateRoute from './utils/PrivateRoute';
import TokenWatcher from './components/TokenWatcher';
import PublicOnlyRoute from './utils/PublicOnlyRoute';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState('idle');

  // 🔔 Foreground notification listener
  React.useEffect(() => {
    if (Notification.permission === 'granted') {
      setNotificationStatus('enabled');
    }

    onMessage(messaging, (payload) => {
      console.log('🔔 Foreground Message:', payload);
      alert(`🔔 New Notification: ${payload.notification?.title}`);
    });
  }, []);

  const handleEnableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert("❌ Notification permission denied.");
        return;
      }

      setNotificationStatus('requesting');

      const currentToken = await getToken(messaging, {
        vapidKey: "BCHlImXNmJE5fjxK6Dnc9g74itDxN8KKBtkuQpPHn4HzgPd0AVt7zOFYSw_gvI6oOz9IolQY0AxuUwiIcA2LkBc"
      });

      if (currentToken) {
        console.log('📬 FCM Token:', currentToken);

        await fetch(`${process.env.REACT_APP_API_BASE_URL}/push/register-token`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: currentToken }),
        });

        setNotificationStatus('enabled');
        alert("✅ Notifications enabled!");
      } else {
        alert("⚠️ No token generated.");
      }
    } catch (err) {
      console.error('❌ Error enabling notifications:', err);
      setNotificationStatus('error');
    }
  };

  return (
    <Router>
      <Navbar />
      <TokenWatcher setIsLoggedIn={setIsLoggedIn} />
      {isLoggedIn && notificationStatus !== 'enabled' && Notification.permission !== 'granted' && (
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#1f1f1f',
          color: '#fff',
          textAlign: 'center',
          borderBottom: '2px solid #ff2c2c',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          position: 'sticky',
          top: 0,
          zIndex: 999
        }}>
          <span>🚀 Stay updated with new workouts!</span>
          <button
            onClick={handleEnableNotifications}
            style={{
              backgroundColor: '#ff2c2c',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔔 Enable Notifications
          </button>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route
  path="/workouts"
  element={
    <PrivateRoute>
      <Workouts /> {/* ✅ This must be a valid element */}
    </PrivateRoute>
  }
/>
<Route
    path="/login"
    element={
      <PublicOnlyRoute>
        <Login />
      </PublicOnlyRoute>
    }
  />

  <Route
    path="/caccount"
    element={
      <PublicOnlyRoute>
        <Caccount />
      </PublicOnlyRoute>
    }
  />
        <Route path="/upload" element={<UploadWorkout />} />
        <Route path="/admin" element={<AdminCalendar />} />
        <Route path="/admin/cluster-copy" element={<ClusterCopyPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin/push" element={<AdminPushPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/admin/users" element={<AdminUserManager />} />
        <Route path="*" element={<Workouts />} />
      </Routes>
    </Router>
  );
};

export default App;
