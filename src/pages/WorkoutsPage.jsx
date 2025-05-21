import React, { useEffect, useRef, useState } from 'react';
import './../styles/workout.css';

const versionOrder = ["Ultra Train", "Super Train", "Minimal Equipment", "Beginner"];

const Workouts = () => {
  const [groupedWorkouts, setGroupedWorkouts] = useState({});
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalWorkout, setModalWorkout] = useState(null);
  const [expandedVersions, setExpandedVersions] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [highlightedDate, setHighlightedDate] = useState(null);
  const scrollRef = useRef({});
  const scrollContainerRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const todayKey = new Date().toISOString().split('T')[0];

  const getDisplayDate = (selectedDate) => {
    const today = new Date();
    const targetDate = new Date(selectedDate);
    today.setHours(0, 0, 0, 0);
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

  const fetchWorkoutsByDate = async (dateKey) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/workouts?date=${dateKey}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const grouped = { ...groupedWorkouts };
      const dateObj = new Date(dateKey);
      const displayDate = dateObj.toLocaleDateString("en-GB");
      const day = dateObj.toLocaleDateString("en-US", { weekday: 'short' });
      grouped[dateKey] = { displayDate, day, versions: {} };
      data.forEach(w => {
        const version = w.version?.trim() || "Uncategorized";
        if (!grouped[dateKey].versions[version]) {
          grouped[dateKey].versions[version] = [];
        }
        grouped[dateKey].versions[version].push(w);
      });
      setGroupedWorkouts(prev => ({ ...prev, ...grouped }));
    } catch (err) {
      console.error(err);
    }
  };

  const loadPreviousDates = async () => {
    const newStart = new Date(startDate);
    newStart.setDate(startDate.getDate() - 5);
    for (let d = new Date(newStart); d < startDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      await fetchWorkoutsByDate(dateKey);
    }
    const updatedDates = [];
    for (let d = new Date(newStart); d <= new Date(); d.setDate(d.getDate() + 1)) {
      updatedDates.push(new Date(d).toISOString().split('T')[0]);
    }
    setDates([...new Set([...updatedDates, ...dates])].sort());
    setStartDate(newStart);
  };

  useEffect(() => {
    const today = new Date();
    const baseDates = [];
    for (let i = -5; i <= 5; i++) {
      const newDate = new Date(today);
      newDate.setDate(today.getDate() + i);
      baseDates.push(newDate.toISOString().split('T')[0]);
    }
    setDates(baseDates);
    setStartDate(new Date(today.setDate(today.getDate() - 5)));

    const fetchInitialDates = async () => {
      for (let i = -5; i <= 0; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const dateKey = d.toISOString().split('T')[0];
        await fetchWorkoutsByDate(dateKey);
      }
      setSelectedDate(todayKey);
      setHighlightedDate(todayKey);
      setTimeout(() => scrollToCenter(todayKey), 300);
    };
    fetchInitialDates();
  }, []);

  const toggleExpandAll = (version) => {
    setExpandedVersions(prev => ({ ...prev, [version]: !prev[version] }));
  };

  const handleDateSelect = async (dateKey) => {
    if (!groupedWorkouts[dateKey]) {
      await fetchWorkoutsByDate(dateKey);
    }
    setSelectedDate(null);
    setHighlightedDate(dateKey);
    setTimeout(() => {
      setSelectedDate(dateKey);
      scrollToCenter(dateKey);
    }, 0);
  };

  return (
    <div className="horizontal-container">
      <div className="timeline-horizontal" ref={scrollContainerRef}>
        <div className="timeline-date-wrapper">
          <div className="timeline-date-circle load-more-circle" onClick={loadPreviousDates}>+ Load</div>
        </div>
        {dates.map((dateKey, index) => {
          const dateObj = new Date(dateKey);
          const isActive = selectedDate === dateKey || highlightedDate === dateKey;
          const hasWorkouts = Object.keys(groupedWorkouts[dateKey]?.versions || {}).length > 0;
          const showMonthHeading = index === 0 || new Date(dates[index - 1]).getMonth() !== dateObj.getMonth();
          const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });

          return (
            <div key={index} className="timeline-date-wrapper">
              {showMonthHeading && <div className="month-heading">{monthName}</div>}
              <div
                data-date={dateKey}
                className={`timeline-date-circle ${isActive ? 'active' : ''} ${!hasWorkouts ? 'disabled' : ''}`}
                onClick={() => handleDateSelect(dateKey)}
                ref={el => { if (el) scrollRef.current[dateKey] = el; }}
              >
                <div className="circle-date">{groupedWorkouts[dateKey]?.displayDate?.split('/')[0] || dateKey.split('-')[2]}</div>
                <div className="circle-day">{groupedWorkouts[dateKey]?.day || dateObj.toLocaleDateString("en-US", { weekday: 'short' })}</div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedDate && (
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
            groupedWorkouts[selectedDate]?.versions[version] ? (
              <div key={version} className="version-container">
                <div className="version-header">
                  <span className={`badge badge-${version.replace(/\s+/g, '').toLowerCase()}`}>{version}</span>
                </div>
                <div className="workout-list">
                  {groupedWorkouts[selectedDate].versions[version].sort((a, b) => a.order - b.order).map(w => (
                    <div key={w._id} className="workout-item" onClick={() => setModalWorkout(w)}>
                      <div>
                        {w.icon && <img src={`/icons/${w.icon}.png`} alt={w.icon} className="workout-icon" style={{ width: '20px', marginRight: '10px' }} />}
                        {w.title}
                      </div>
                      {expandedVersions[version] && (
                        <div className="inline-details">
                          <p><strong>Description:</strong> {w.description}</p>
                          <div dangerouslySetInnerHTML={{ __html: w.description.replace(/\n/g, '<br/>') }} />
                          <p><strong>Uploaded By:</strong> {w.createdBy?.name || 'Unknown'}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button className="expand-btn" onClick={() => toggleExpandAll(version)}>
                  {expandedVersions[version] ? "Hide Workouts" : "Show Full Workout"}
                </button>
              </div>
            ) : null
          ))}
        </div>
      )}

      {modalWorkout && (
        <div className="modal-overlay" onClick={() => setModalWorkout(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>{modalWorkout.title}</h2>
            <p><strong>Version:</strong> {modalWorkout.version}</p>
            <p><strong>Description:</strong> {modalWorkout.description}</p>
            <p><strong>Uploaded By:</strong> {modalWorkout.createdBy?.name || 'Unknown'}</p>
            <p><strong>Date:</strong> {new Date(modalWorkout.date).toLocaleDateString()}</p>
            <button onClick={() => setModalWorkout(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workouts;
