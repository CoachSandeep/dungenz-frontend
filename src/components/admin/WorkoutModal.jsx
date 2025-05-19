import React from 'react';
import './../../styles/WorkoutModal.css';

const WorkoutModal = ({ workout, onClose }) => {
  if (!workout) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{workout.title}</h2>
        <p><strong>Version:</strong> {workout.version}</p>
        {workout.capTime && <p><strong>Cap Time:</strong> {workout.capTime} min</p>}
        {workout.customName && <p><strong>Custom Name:</strong> {workout.customName}</p>}
        <p><strong>Description:</strong></p>
        <div
          className="description"
          dangerouslySetInnerHTML={{ __html: workout.description?.replace(/\n/g, '<br/>') }}
        />
        <p><strong>Uploaded By:</strong> {workout.createdBy?.name || 'Unknown'}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default WorkoutModal;
