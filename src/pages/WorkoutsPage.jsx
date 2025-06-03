// 🧠 Full updated code with:
// 1. Fixed date range (5 past + today + 4 future)
// 2. Workout fetch only till tomorrow
// 3. Future dates shown as inactive
// 4. Back to today bug fixed

import React, { useEffect, useRef, useState } from 'react';
import PullToRefresh from 'react-pull-to-refresh';
import './../styles/workout.css';
import LikeCommentLog from '../components/LikeCommentLog';

const versionOrder = ["Ultra Train", "Super Train", "Minimal Equipment", "Beginner"];

const Workouts = () => {
  const [groupedWorkouts, setGroupedWorkouts] = useState({});
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalWorkout, setModalWorkout] = useState(null);
  const [expandedVersions, setExpandedVersions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef({});
  const scrollContainerRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = today.toISOString().split('T')[0];

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowKey = tomorrow.toISOString().split('T')[0];

  const getDisplayDate = (selectedDate) => {
    const targetDate = new Date(selectedDate);
    targetDate.setHours(0, 0, 0, 0);
    const diff = Math.floor((targetDate - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff === -1) return "Yesterday";
    return targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const scrollToCenter = (dateKey) => {
    const el = scrollRef.current?.[dateKey];
    const container = scrollContainerRef.current;
    if (el && container) {
      const offsetLeft = el.offsetLeft;
      const containerWidth = container.offsetWidth;
      const elWidth = el.offsetWidth;
      container.scrollTo({
        left: offsetLeft - (containerWidth / 2) + (elWidth / 2),
        behavior: 'smooth',
      });
    }
  };

  const fetchWorkoutsInRange = async (from, to) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/workouts/range?from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const newGrouped = {};
      data.forEach((w) => {
        const dateKey = new Date(w.date).toISOString().split('T')[0];
        const dateObj = new Date(dateKey);
        const displayDate = dateObj.toLocaleDateString("en-GB");
        const day = dateObj.toLocaleDateString("en-US", { weekday: 'short' });
        if (!newGrouped[dateKey]) {
          newGrouped[dateKey] = { displayDate, day, versions: {} };
        }
        const version = w.version?.trim() || "Uncategorized";
        if (!newGrouped[dateKey].versions[version]) {
          newGrouped[dateKey].versions[version] = [];
        }
        newGrouped[dateKey].versions[version].push(w);
      });
      setGroupedWorkouts(prev => ({ ...prev, ...newGrouped }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const baseDates = [];
    for (let i = -5; i <= 4; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      baseDates.push(d.toISOString().split('T')[0]);
    }
    setDates(baseDates);

    const fetchInitial = async () => {
      const fromDate = new Date();
      fromDate.setDate(today.getDate() - 5);
      const toDate = new Date();
      toDate.setDate(today.getDate() + 1);

      await fetchWorkoutsInRange(
        fromDate.toISOString().split('T')[0],
        toDate.toISOString().split('T')[0]
      );
      setSelectedDate(todayKey);
      setTimeout(() => {
        scrollToCenter(todayKey);
        setIsLoading(false);
      }, 300);
    };
    fetchInitial();
  }, []);

  const handleDateSelect = (dateKey) => {
    const dateObj = new Date(dateKey);
    if (!groupedWorkouts[dateKey] && dateObj > tomorrow) return;
    setSelectedDate(dateKey);
    scrollToCenter(dateKey);
  };

  return (
    <PullToRefresh onRefresh={() => fetchWorkoutsInRange(todayKey, tomorrowKey)}>
      <div className="horizontal-container">
        <div className="timeline-horizontal" ref={scrollContainerRef}>
          {dates.map((dateKey) => {
            const dateObj = new Date(dateKey);
            const isActive = selectedDate === dateKey;
            const isFutureBeyondTomorrow = dateObj > tomorrow;
            const hasWorkout = groupedWorkouts.hasOwnProperty(dateKey);

            return (
              <div key={dateKey} className="timeline-date-wrapper">
                <div
                  className={`timeline-date-circle ${isActive ? 'active' : ''} ${(!hasWorkout || isFutureBeyondTomorrow) ? 'no-workout' : ''}`}
                  onClick={() => handleDateSelect(dateKey)}
                  ref={el => scrollRef.current[dateKey] = el}
                >
                  <div className="circle-date">{groupedWorkouts[dateKey]?.displayDate?.split('/')[0] || dateKey.split('-')[2]}</div>
                  <div className="circle-day">{groupedWorkouts[dateKey]?.day || dateObj.toLocaleDateString("en-US", { weekday: 'short' })}</div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedDate && groupedWorkouts[selectedDate] && (
          <div className="timeline-details-box">
            <div className="timeline-header-w">
              <h1>Hi {user.name}</h1>
              <h3 style={{ color: "#ff2c2c", marginBottom: '20px' }}>
                Workout for {getDisplayDate(selectedDate)}
              </h3>
              <button className="back-to-today-btn" onClick={() => handleDateSelect(todayKey)}>
                Back to Today
              </button>
            </div>

            {versionOrder.map(version => (
              groupedWorkouts[selectedDate].versions[version] ? (
                <div key={version} className="version-container">
                  <div className="version-header">
                    <span className={`badge badge-${version.replace(/\s+/g, '').toLowerCase()}`}>{version}</span>
                  </div>
                  <div className="workout-list">
                    {groupedWorkouts[selectedDate].versions[version].map(w => (
                      <div key={w._id} className="workout-item">
                        <div className="workout-line">
                          {w.icon && <img src={`/icons/${w.icon}.png`} alt={w.icon} className="workout-icon" />}
                          <div className="workout-text">
                            <strong className="custom-name">{w.customName || w.title}</strong>
                            {w.customName && <div className="sub-title">{w.title}</div>}
                          </div>
                        </div>
                        <LikeCommentLog workoutId={w._id} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            ))}
          </div>
        )}

        {modalWorkout && (
          <div className="modal-overlay" onClick={() => setModalWorkout(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h2>{modalWorkout.customName || modalWorkout.title}</h2>
              <h3>{modalWorkout.title}</h3>
              <div className="modal-inside-content">
                <div dangerouslySetInnerHTML={{ __html: modalWorkout.description.replace(/\n/g, '<br/>') }} />
                <div dangerouslySetInnerHTML={{ __html: modalWorkout.instructions.replace(/\n/g, '<br/>') }} />
                <p>{modalWorkout.capTime}</p>
              </div>
              <button onClick={() => setModalWorkout(null)}>Close</button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="loading-overlay">
            Loading your workouts...
          </div>
        )}
      </div>
    </PullToRefresh>
  );
};

export default Workouts;
