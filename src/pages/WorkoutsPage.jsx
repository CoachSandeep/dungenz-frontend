import React, { useEffect, useState, useRef } from 'react';
import { FiCalendar, FiRefreshCw } from 'react-icons/fi';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Workouts.css'; // apni CSS file me add karna

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [groupedWorkouts, setGroupedWorkouts] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalWorkout, setModalWorkout] = useState(null);
  const [movementVideo, setMovementVideo] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const timelineRef = useRef(null);

  const fetchWorkouts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/workouts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setWorkouts(data);

        const grouped = data.reduce((acc, w) => {
          const dateKey = new Date(w.date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
          if (!acc[dateKey]) acc[dateKey] = [];
          acc[dateKey].push(w);
          return acc;
        }, {});
        setGroupedWorkouts(grouped);

        const todayKey = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        setSelectedDate(todayKey);
      }
    } catch (err) {
      console.error('❌ Error fetching workouts:', err);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  useEffect(() => {
    if (selectedDate && timelineRef.current) {
      const el = document.getElementById(`day-${selectedDate}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedDate]);

  const handleDateSelect = (key) => {
    setSelectedDate(key);
  };

  const handleRefresh = () => {
    fetchWorkouts();
  };

  return (
    <div className="workouts-container">
      {/* Header with Calendar + Refresh */}
      <div className="header-row">
        <h2>Workouts Timeline</h2>
        <div>
          <FiCalendar
            size={24}
            style={{ cursor: 'pointer', color: '#ff2c2c', marginRight: '10px' }}
            title="Open Calendar"
            onClick={() => setShowCalendar(true)}
          />
          <FiRefreshCw
            size={24}
            style={{ cursor: 'pointer', color: '#ff2c2c' }}
            title="Reload Workouts"
            onClick={handleRefresh}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="timeline" ref={timelineRef}>
        {Object.keys(groupedWorkouts).length === 0 && <p>No workouts found</p>}
        {Object.entries(groupedWorkouts).map(([date, wodList]) => (
          <div key={date} id={`day-${date}`} className="day-section">
            <h3 className={date === selectedDate ? 'highlight-date' : ''}>
              {new Date(date).toDateString()}
            </h3>
            {wodList.map((wod) => (
              <div
                key={wod._id}
                className="wod-card"
                onClick={() => setModalWorkout(wod)}
              >
                <h4>{wod.title}</h4>
                <p>{wod.description.slice(0, 80)}...</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Workout Modal */}
      {modalWorkout && (
        <div className="modal-overlay" onClick={() => setModalWorkout(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{modalWorkout.title}</h3>
            <div
              style={{ marginTop: '10px' }}
              dangerouslySetInnerHTML={{
                __html: modalWorkout.description.replace(/\n/g, '<br/>'),
              }}
            />
            {modalWorkout.capTime && (
              <div className="wod-instructions">
                TIME CAP:
                <div>{modalWorkout.capTime}</div>
              </div>
            )}
            {modalWorkout.instructions && (
              <div className="wod-instructions">
                INSTRUCTIONS:
                <div
                  dangerouslySetInnerHTML={{
                    __html: modalWorkout.instructions.replace(/\n/g, '<br/>'),
                  }}
                />
              </div>
            )}
            {modalWorkout.videoUrl && (
              <div className="video-wrapper">
                <iframe
                  width="100%"
                  height="315"
                  src={modalWorkout.videoUrl}
                  title="Workout Video"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Movement Video Modal */}
      {movementVideo && (
        <div className="modal-overlay" onClick={() => setMovementVideo(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <iframe
              width="100%"
              height="315"
              src={movementVideo}
              title="Movement Video"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="modal-overlay" onClick={() => setShowCalendar(false)}>
          <div
            className="modal-box"
            style={{ maxWidth: '350px', background: '#111' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Calendar
              value={selectedDate ? new Date(selectedDate) : new Date()}
              onChange={(date) => {
                const key = date.toLocaleDateString('en-CA', {
                  timeZone: 'Asia/Kolkata',
                });
                handleDateSelect(key);
                setShowCalendar(false); // close after selecting
              }}
              tileClassName={({ date }) => {
                const key = date.toLocaleDateString('en-CA', {
                  timeZone: 'Asia/Kolkata',
                });
                return groupedWorkouts[key] ? 'has-workout' : '';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Workouts;
