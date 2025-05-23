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
import LibraryPage from './pages/LibraryPage'; // ✅
import Settings from './components/admin/settings'; // ✅
import ClusterCopyPage from './pages/ClusterCopyPage';
import { messaging, getToken, onMessage } from './firebase';

const App = () => {

  
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // ✅ Ask Notification Permission
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('✅ Notification permission granted.');
  
          getToken(messaging, {
            vapidKey: "BCHlImXNmJE5fjxK6Dnc9g74itDxN8KKBtkuQpPHn4HzgPd0AVt7zOFYSw_gvI6oOz9IolQY0AxuUwiIcA2LkBc"
          })
            .then((currentToken) => {
              if (currentToken) {
                console.log('📬 FCM Token:', currentToken);
                // ✅ Optionally save to your backend
              } else {
                console.warn('No registration token available. Request permission to generate one.');
              }
            })
            .catch((err) => {
              console.error('An error occurred while retrieving token. ', err);
            });
        }
      });
    }
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

  {/* 🔐 Superadmin-only routes */}
  <Route path="/admin" element={<AdminCalendar />} />
  <Route path="/admin/cluster-copy" element={<ClusterCopyPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/settings" element={<Settings />} />
         {/* Default route */}
         <Route path="*" element={<Workouts />} />
      </Routes>
    </Router>
  );
};

export default App;
