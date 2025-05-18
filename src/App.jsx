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

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
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
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/settings" element={<Settings />} />
         {/* Default route */}
         <Route path="*" element={<Workouts />} />
      </Routes>
    </Router>
  );
};

export default App;
