import React, { useEffect, useRef, useState } from 'react';
import PullToRefresh from 'react-pull-to-refresh';
import './../styles/workout.css';

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
 // const todayKey = new Date().toISOString().split('T')[0];

// ✅ Declare today here so it's available everywhere
// const today = new Date();
// today.setHours(0, 0, 0, 0);
// const todayKey = today.toISOString().split('T')[0];

const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

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

  const handleRefresh = async () => {
    setIsLoading(true);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 5);
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 5);
  
    await fetchWorkoutsInRange(
      fromDate.toISOString().split('T')[0],
      toDate.toISOString().split('T')[0]
    );
  
    setIsLoading(false);
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
      // 🧠 Merge with existing groupedWorkouts
    setGroupedWorkouts(prev => ({ ...prev, ...newGrouped }));

    } catch (err) {
      console.error(err);
    }
  };

  const handleLoadMore = async () => {
    const currentDates = dates.filter(d => d !== "__load_more__");
    const firstDate = new Date(currentDates[0]);
    const newDates = [];
    for (let i = 1; i <= 5; i++) {
      const prevDate = new Date(firstDate);
      prevDate.setDate(firstDate.getDate() - i);
      newDates.unshift(prevDate.toISOString().split('T')[0]);
    }
    const fromDate = newDates[0];
    const toDate = newDates[newDates.length - 1];
    await fetchWorkoutsInRange(fromDate, toDate);
    setDates(["__load_more__", ...newDates, ...currentDates]);
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
      toDate.setDate(today.getDate() + 1); // 👈 Yahi tak hona chahiye
  
      await fetchWorkoutsInRange(
        fromDate.toISOString().split('T')[0],
        toDate.toISOString().split('T')[0]
      );
  
      setSelectedDate(todayKey);
      setTimeout(() => {
        scrollToCenter(todayKey);
      }, 0);
  
      setIsLoading(false);
    };
  
    fetchInitial();
  }, []);

  const toggleExpandAll = (version) => {
    setExpandedVersions(prev => ({ ...prev, [version]: !prev[version] }));
  };

  const handleDateSelect = async (dateKey) => {
    const isSameDate = selectedDate === dateKey;
    scrollToCenter(dateKey);
    if (!isSameDate) {
      setSelectedDate(dateKey);
    } else {
      setSelectedDate(null);
      setTimeout(() => setSelectedDate(dateKey), 0);
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} style={{ minHeight: '100vh' }}>
    <div className="horizontal-container">
      <div className="timeline-horizontal" ref={scrollContainerRef}>
        {dates.map((dateKey, index) => {
          if (dateKey === "__load_more__") {
            return (
              <div key="__load_more__" className="timeline-date-wrapper">
                <div className="timeline-date-circle load-more-circle" onClick={handleLoadMore}>
                  <div className="circle-date">⇤</div>
                  <div className="circle-day">More</div>
                </div>
              </div>
            );
          }

          const dateObj = new Date(dateKey);
          const isActive = selectedDate === dateKey;
          // const hasWorkouts = Object.keys(groupedWorkouts[dateKey]?.versions || {}).length > 0;
          const hasWorkouts = groupedWorkouts.hasOwnProperty(dateKey);
          const showMonthHeading = index === 0 || new Date(dates[index - 1]).getMonth() !== dateObj.getMonth();
          const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });

          return (
            <div key={index} className="timeline-date-wrapper">
              {showMonthHeading && <div className="month-heading">{monthName}</div>}
              <div
  data-date={dateKey}
  className={`timeline-date-circle ${isActive ? 'active' : ''} ${!hasWorkouts ? 'no-workout' : ''}`}
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
                      <div className="workout-line">
                        {w.icon && (
                          <img
                            src={`/icons/${w.icon}.png`}
                            alt={w.icon}
                            className="workout-icon"
                            style={{ width: '20px', marginRight: '10px' }}
                          />
                        )}
                        <div className="workout-text">
                          <strong className="custom-name">
                            {w.customName || w.title}
                          </strong>
                          {w.customName && (
                            <div className="sub-title">
                              {w.title}
                            </div>
                          )}
                        </div>
                      </div>

                      {expandedVersions[version] && (
                        <div className="inline-details">
                          <div dangerouslySetInnerHTML={{ __html: w.description.replace(/\n/g, "<br/>") }} />
                          <div>{w.capTime}</div>
                          <div>{w.instructions}</div>
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
