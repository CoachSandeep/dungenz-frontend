import React from 'react';
import '../styles/App.css';

const WorkoutCard = ({ title, description, imageUrl, badge }) => {
  return (
    <div className="workout-card">
      <div style={{ position: 'relative' }}>
        <img src={imageUrl} alt={title} />
        {badge && <div className="badge">{badge}</div>}
      </div>
      <div className="workout-card-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default WorkoutCard;
