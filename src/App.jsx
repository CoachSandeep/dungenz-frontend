import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Workouts from './pages/WorkoutsPage';
import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';
import './styles/App.css';
import UploadWorkout from './pages/UploadWorkoutPage';
import AdminCalendar from './components/admin/AdminCalendar';
import LibraryPage from './pages/LibraryPage';
import Settings from './components/admin/settings';
import ClusterCopyPage from './pages/ClusterCopyPage';
import AdminPushPage from './components/admin/AdminPushPage'
import { messaging, getToken, onMessage } from './firebase';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('✅ Notification permission granted.');

          getToken(messaging, {
            vapidKey: "BCHlImXNmJE5fjxK6Dnc9g74itDxN8KKBtkuQpPHn4HzgPd0AVt7zOFYSw_gvI6oOz9IolQY0AxuUwiIcA2LkBc"
          })
            .then((currentToken) => {
              if (currentToken) {
                console.log('📬 FCM Token:', currentToken);
                // Optional: Send token to backend
   // ✅ Token save yahan initiate hota hai
   fetch(`${process.env.REACT_APP_API_BASE_URL}/push/save`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: currentToken }),
  });

              } else {
                console.warn('No registration token available.');
              }
            })
            .catch((err) => {
              console.error('❌ Error retrieving token:', err);
            });
        } else {
          console.warn('🚫 Notification permission denied.');
        }
      });
    }

    // Listen for foreground notifications
    onMessage(messaging, (payload) => {
      console.log('🔔 Foreground Message:', payload);
      alert(`🔔 New Notification: ${payload.notification?.title}`);
    });
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload" element={<UploadWorkout />} />
        <Route path="/admin" element={<AdminCalendar />} />
        <Route path="/admin/cluster-copy" element={<ClusterCopyPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin/push" element={<AdminPushPage />} />
        <Route path="*" element={<Workouts />} />
      </Routes>
    </Router>
  );
};

export default App;
