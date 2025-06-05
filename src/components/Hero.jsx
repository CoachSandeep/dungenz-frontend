import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Hero.css';
import dp from '../assets/dp.png';
import logo from '../assets/logo.png';

const quotes = [
  "One rep won't break you. But showing up will make you.",
  "Discipline doesn’t shout. It shows up.",
  "You're one workout away from a better mindset.",
  "Weak excuses build nothing. Strong reps build everything.",
  "Don't wait for motivation. Move — and let momentum take over."
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Redirect if already logged in
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/workouts');
    }

    // Set a random quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, [navigate]);

  const handleClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/workouts');
    } else {
      navigate('/login');
    }
  };

  return (
    <section className="hero">
      <div className="hero-overlay">
        <div>
      <img src={logo} alt="DUNGENZ Logo" className="logo" />
      </div>
      <div>
        <img src={dp} alt="DUNGENZ" className="navbar-logo" />
      </div>
        <h1 className="hero-title">{quote}</h1>
        <button className="hero-btn" onClick={handleClick}>Enter The Arena</button>
      </div>
    </section>
  );
};

export default HeroSection;
