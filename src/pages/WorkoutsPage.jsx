import React, { useEffect, useRef, useState } from 'react';
import PullToRefresh from 'react-pull-to-refresh';
import './../styles/workout.css';
import SandboxedCommentSection from '../components/SandboxedCommentSection';

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
  const [isAtTop, setIsAtTop] = useState(true);

  const today = new Date();
  const todayKey = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = tomorrow.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  const getDisplayDate = (selectedDate) => {
    const targetDate = new Date(selectedDate);
    const todayLocal = new Date(todayKey);
    const diff = Math.floor((targetDate - todayLocal) / (1000 * 60 * 60 * 24));
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
    toDate.setDate(toDate.getDate() + 1);
    await fetchWorkoutsInRange(
      fromDate.toISOString().split('T')[0],
      toDate.toISOString().split('T')[0]
    );
    setSelectedDate(todayKey);
    scrollToCenter(todayKey);
    setIsLoading(false);
  };

  const fetchWorkoutsInRange = async (from, to) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/workouts/range?from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const newGrouped = {};
        data.forEach((w) => {
          const dateKey = new Date(w.date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
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
      } else {
        console.error("❌ Workout API returned non-array:", data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const baseDates = [];
    for (let i = -5; i <= 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      baseDates.push(d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
    }
    setDates(["__load_more__", ...baseDates]);



    const fetchInitial = async () => {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 5);
      const toDate = new Date();
      toDate.setDate(toDate.getDate() + 1);
      await fetchWorkoutsInRange(
        fromDate.toISOString().split('T')[0],
        toDate.toISOString().split('T')[0]
      );
      const resolvedToday = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

      setSelectedDate(resolvedToday);
      setTimeout(() => {
        scrollToCenter(resolvedToday);
        setIsLoading(false);
      }, 300);
    };

    fetchInitial();

    const handleScroll = () => {
      setIsAtTop(window.scrollY < 10);
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleExpandAll = (version) => {
    setExpandedVersions(prev => ({ ...prev, [version]: !prev[version] }));
  };

  const handleDateSelect = (dateKey) => {
    if (groupedWorkouts[dateKey]) {
      setSelectedDate(dateKey);
      scrollToCenter(dateKey);
    }
  };

  const handleLoadMore = async () => {
    const currentDates = dates.filter(d => d !== "__load_more__");
    const firstDate = new Date(currentDates[0]);
    const newDates = [];
    for (let i = 1; i <= 5; i++) {
      const prevDate = new Date(firstDate);
      prevDate.setDate(firstDate.getDate() - i);
      newDates.unshift(prevDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
    }
    const fromDate = newDates[0];
    const toDate = newDates[newDates.length - 1];
    await fetchWorkoutsInRange(fromDate, toDate);
    setDates(["__load_more__", ...newDates, ...currentDates]);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} disabled={!isAtTop} style={{ minHeight: '100vh' }}>
      <div className="horizontal-container">
        <div className="timeline-horizontal" ref={scrollContainerRef}>
          {dates.map((dateKey) => {
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
            const isFutureBeyondTomorrow = dateObj > new Date(tomorrowKey);
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
          <>
            <div className="section-card-indvidual">
            <div className="section-header-row"> <h1>Hi {user.name}</h1>
              <button className="back-to-today-btns" onClick={() => handleDateSelect(todayKey)}>
                Back to Today
              </button>
             
            
            </div>
            <h3 style={{ color: "#ff2c2c", marginBottom: '10px' }}>
                Workout for {getDisplayDate(selectedDate)}
              </h3>
            </div>
             

            <div className="section-card-indvidual">
              <SandboxedCommentSection date={selectedDate} user={user} />
            </div>

            
              {versionOrder.map(version => (
                groupedWorkouts[selectedDate]?.versions[version] ? (
<div className="section-card-indvidual">
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
                                style={{ width: '20px' }}
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
                  </div>
                ) : null
              ))}
            
          </>
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
