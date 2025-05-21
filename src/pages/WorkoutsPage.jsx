import React, { useEffect, useRef, useState } from 'react';
import './../styles/workout.css';

const versionOrder = ["Ultra Train", "Super Train", "Minimal Equipment", "Beginner"];

const Workouts = () => {
  const [groupedWorkouts, setGroupedWorkouts] = useState({});
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [modalWorkout, setModalWorkout] = useState(null);
  const [expandedVersions, setExpandedVersions] = useState({});
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

  const filterVisibleWorkouts = (allWorkouts, releaseTimeString) => {
    if (user?.role === 'admin' || user?.role === 'superadmin') return allWorkouts;
    if (!releaseTimeString) return [];
    const [releaseHour, releaseMinute] = releaseTimeString.split(':').map(Number);
    const now = new Date();
    const nowIST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const releaseTimeIST = new Date(nowIST);
    releaseTimeIST.setHours(releaseHour, releaseMinute, 0, 0);
    const tomorrowKey = new Date();
    tomorrowKey.setDate(nowIST.getDate() + 1);
    const tomorrowDateKey = tomorrowKey.toISOString().split('T')[0];
    return allWorkouts.filter(w => {
      if (!w.date) return false;
      const workoutDateKey = new Date(w.date).toISOString().split('T')[0];
      if (workoutDateKey < tomorrowDateKey) return true;
      if (workoutDateKey === tomorrowDateKey && nowIST >= releaseTimeIST) return true;
      return false;
    });
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
    console.log('📅 Fetching date:', dateKey);
    

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/workouts?date=${dateKey}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const settingsRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const settings = await settingsRes.json();
      console.log('📥 Raw workouts:', data);
      const visibleWorkouts = filterVisibleWorkouts(data, settings.releaseTime);
      console.log('🎯 After releaseTime filter:', visibleWorkouts);
      const grouped = { ...groupedWorkouts };
      const dateObj = new Date(dateKey);
      const displayDate = dateObj.toLocaleDateString("en-GB");
      const day = dateObj.toLocaleDateString("en-US", { weekday: 'short' });
      grouped[dateKey] = { displayDate, day, versions: {} };
      visibleWorkouts.forEach(w => {
        const version = w.version?.trim() || "Uncategorized";
        console.log("📌 Workout:", w.title, "| version:", version);
      
        
        if (!grouped[dateKey].versions[version]) {
          grouped[dateKey].versions[version] = [];
        }
        grouped[dateKey].versions[version].push(w);
      });
      setGroupedWorkouts(prev => {
        const updated = { ...prev, ...grouped };
        setDates(prevDates => {
          const allKeys = Object.keys(updated);
          return Array.from(new Set([...prevDates, ...allKeys])).sort();
        });
        return updated;
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      const base = new Date();
      const start = new Date(base);
      start.setDate(base.getDate() - 5);
      const end = new Date(base);
      end.setDate(base.getDate() + 5);
      setStartDate(start);
      setEndDate(end);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = new Date(d).toISOString().split('T')[0];
        await fetchWorkoutsByDate(key);
      }
      setSelectedDate(todayKey);
      setTimeout(() => {
        if (scrollRef.current[todayKey]) {
          scrollToCenter(todayKey);
        } else {
          console.warn('⚠️ todayKey not in scrollRef');
        }
      }, 300);
    };
    init();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container || !startDate) return;
      if (container.scrollLeft < 50) {
        const newStart = new Date(startDate);
        newStart.setDate(newStart.getDate() - 5);
        for (let d = new Date(newStart); d < startDate; d.setDate(d.getDate() + 1)) {
          const key = new Date(d).toISOString().split('T')[0];
          if (!groupedWorkouts[key]) fetchWorkoutsByDate(key);
        }
        setStartDate(newStart);
      }
    };

    const container = scrollContainerRef.current;
    if (container) container.addEventListener('scroll', handleScroll);
    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, [startDate, groupedWorkouts]);

  const toggleExpandAll = (version) => {
    setExpandedVersions(prev => ({
      ...prev,
      [version]: !prev[version]
    }));
  };

  const handleDateSelect = async (dateKey) => {
    if (!groupedWorkouts[dateKey]) {
      await fetchWorkoutsByDate(dateKey);
    }
    setSelectedDate(dateKey);
    scrollToCenter(dateKey);
  };


  return (
    <div className="horizontal-container">
      <div className="timeline-horizontal" ref={scrollContainerRef}>
        {dates.map((dateKey, index) => {
          console.log("✅ Rendering dateKey:", dateKey, groupedWorkouts[dateKey]);
          console.log(`🔎 [Timeline] ${dateKey}`, groupedWorkouts[dateKey]);
          const dateObj = new Date(dateKey);
          const isActive = selectedDate === dateKey;
          const hasWorkouts = Object.keys(groupedWorkouts[dateKey]?.versions || {}).length > 0;

          const today = new Date();
          const diff = Math.floor((dateObj - today) / (1000 * 60 * 60 * 24));
          let label = '';
          if (diff === 0) label = 'Today';
          else if (diff === 1) label = 'Tomorrow';
          else if (diff === -1) label = 'Yesterday';
          else label = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

          const showMonthHeading = index === 0 || new Date(dates[index - 1]).getMonth() !== dateObj.getMonth();
          const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });

          return (
            <div key={index} className="timeline-date-wrapper">
              {showMonthHeading && <div className="month-heading">{monthName}</div>}
              <div
                data-date={dateKey}
                className={`timeline-date-circle ${isActive ? 'active' : ''} ${!hasWorkouts ? 'disabled' : ''}`}
                onClick={() => hasWorkouts && handleDateSelect(dateKey)}
                ref={(el) => {
                  if (el) scrollRef.current[dateKey] = el;
                }}
              >
                <div className="circle-date">{groupedWorkouts[dateKey]?.displayDate.split('/')[0]}</div>
                <div className="circle-day">{groupedWorkouts[dateKey]?.day}</div>
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
            <button
              className="back-to-today-btn"
              onClick={() => {
                if (dates.includes(todayKey)) {
                  setSelectedDate(todayKey);
                  scrollToCenter(todayKey);
                } else {
                  alert("Today's workout not found.");
                }
              }}
            >
              Back to Today
            </button>
          </div>

          {versionOrder.map((version) =>
            groupedWorkouts[selectedDate]?.versions[version] ? (
              <div key={version} className="version-container">
                <div className="version-header">
                  <span className={`badge badge-${version.replace(/\s+/g, '').toLowerCase()}`}>
                    {version}
                  </span>
                </div>

                <div className="workout-list">
                  {groupedWorkouts[selectedDate].versions[version]
                    .sort((a, b) => a.order - b.order)
                    .map((w) => (
                      <div key={w._id} className="workout-item" onClick={() => setModalWorkout(w)}>
                        <div>
                          {w.icon && (
                            <img
                              src={`/icons/${w.icon}.png`}
                              alt={w.icon}
                              className="workout-icon"
                              style={{ width: '20px', marginRight: '10px' }}
                            />
                          )}
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

                <button
                  className="expand-btn"
                  onClick={() => toggleExpandAll(version)}
                >
                  {expandedVersions[version] ? "Hide Workouts" : "Show Full Workout"}
                </button>
              </div>
            ) : null
          )}
        </div>
      )}

      {modalWorkout && (
        <div className="modal-overlay" onClick={() => setModalWorkout(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
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
