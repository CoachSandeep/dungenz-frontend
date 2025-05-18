
import React from 'react';
import '../styles/Hero.css';

const HeroSection = () => {
  return (
    <section className="hero">
      <div className="hero-overlay">
        <h1 className="hero-title">The stronger do what they can, the weaker suffer what they must.</h1>
        <a href="/workouts" className="hero-btn">Enter The Arena</a>
      </div>
    </section>
  );
};

export default HeroSection;
