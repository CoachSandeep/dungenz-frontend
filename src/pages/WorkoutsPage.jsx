import React, { useEffect, useRef, useState } from 'react';
import PullToRefresh from 'react-pull-to-refresh';
import './../styles/workout.css';
import SandboxedCommentSection from '../components/SandboxedCommentSection';
import CalorieShadeBar from '../components/CalorieShadeBar';
import { FiRefreshCw } from 'react-icons/fi';
import DailyNoteSection from '../components/DailyNoteSection';

const versionOrder = ["Ultra Train", "Super Train", "Minimal Equipment", "Beginner"];

// Simple CalendarGrid component (no external deps) — shows a month and lets you pick a date
function CalendarGrid({ monthDate, onDateClick, markedDates = {} }) {
  // monthDate is a Date set to the first of the month
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  // get first day of week for the month and number of days
  const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks = [];
  let day = 1 - firstDay; // start from the first calendar cell

  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(year, month, day);
      const inMonth = cellDate.getMonth() === month;
      const iso = cellDate.toISOString().split('T')[0];
      week.push({ date: new Date(cellDate), inMonth, iso });
      day++;
    }
    weeks.push(week);
  }

  return (
    <div className="calendar-grid">
      <div className="calendar-weeknames">
        {['S','M','T','W','T','F','S'].map((n) => (
          <div key={n} className="calendar-weekname">{n}</div>
        ))}
      </div>
      {weeks.map((week, i) => (
        <div className="calendar-week" key={i}>
          {week.map((cell) => (
            <button
              key={cell.iso}
              disabled={!cell.inMonth}
              className={`calendar-cell ${cell.inMonth ? '' : 'calendar-cell-disabled'}`}
              onClick={() => onDateClick(cell.iso)}
            >
              <div className="calendar-cell-number">{cell.date.getDate()}</div>
              {markedDates[cell.iso] && (
                <div className="calendar-dot">{markedDates[cell.iso]}</div>
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

const Workouts = () => {
  const [groupedWorkouts, setGroupedWorkouts] = useState({});
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalWorkout, setModalWorkout] = useState(null);
  const [expandedVersions, setExpandedVersions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef({});
  const scrollContainerRef = useRef(null);
  const scrollWrapperRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [isAtTop, setIsAtTop] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [dailyMeta, setDailyMeta] = useState({});
  const [movementVideo, setMovementVideo] = useState(null);

  // Calendar-specific state
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' or 'calendar'
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [calendarModalDate, setCalendarModalDate] = useState(null); // iso string

  const today = new Date();
  const todayKey = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = tomorrow.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  const fetchMonthWorkouts = async (date) => {
    const token = localStorage.getItem('token');
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const [workoutRes, metaRes] = await Promise.all([
      fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts/month?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts/daily-meta/month?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ]);

    const workoutData = await workoutRes.json();
    const metaData = await metaRes.json();

    const metaMap = {};
    metaData.forEach((entry) => {
      const key = new Date(entry.date).toISOString().split('T')[0];
      metaMap[key] = entry.calories;
    });
    setDailyMeta(prev => ({ ...prev, ...metaMap }));

    // Also merge workoutData into groupedWorkouts so calendar can mark days
    if (Array.isArray(workoutData)) {
      const newGrouped = {};
      workoutData.forEach((w) => {
        const dateKey = new Date(w.date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        const dateObj = new Date(dateKey);
        const displayDate = dateObj.toLocaleDateString("en-GB");
        const day = dateObj.toLocaleDateString("en-US", { weekday: 'short' });
        if (!newGrouped[dateKey]) {
          newGrouped[dateKey] = { displayDate, day, versions: {} };
        }
        const version = w.version?.trim() || "Uncategorized";
        if (!newGrouped[dateKey].versions[version]) newGrouped[dateKey].versions[version] = [];
        newGrouped[dateKey].versions[version].push(w);
      });
      setGroupedWorkouts(prev => ({ ...prev, ...newGrouped }));
    }
  };

  const viewingUser = selectedUserId
    ? users.find(u => u._id === selectedUserId)
    : user;

  const isIndividual = viewingUser?.isIndividualProgram;

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

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleRefresh = async () => {
    const prevSelectedDate = selectedDate || todayKey;
    setIsLoading(true);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 5);
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 1);
    await fetchWorkoutsInRange(
      fromDate.toISOString().split('T')[0],
      toDate.toISOString().split('T')[0]
    );
    setSelectedDate(prevSelectedDate);
    setTimeout(() => {
      scrollToCenter(prevSelectedDate);
      setIsLoading(false);
    }, 300);
  };

  const fetchWorkoutsInRange = async (from, to) => {
    const token = localStorage.getItem('token');
    try {
      const userParam = selectedUserId ? `&user=${selectedUserId}` : '';
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/workouts/range?from=${from}&to=${to}${userParam}`, {
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
    const now = new Date();
    const baseDates = [];
    for (let i = -5; i <= 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      baseDates.push(d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
    }
    setDates(["__load_more__", ...baseDates]);

    const fetchInitial = async () => {
      await fetchUsers();
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
    fetchMonthWorkouts(now);
    fetchInitial();

    setTimeout(() => {
      const wrapper = scrollWrapperRef.current;
      if (!wrapper) return;

      let timeout;
      const handleScroll = () => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          setIsAtTop(wrapper.scrollTop < 10);
        }, 100);
      };

      wrapper.addEventListener('scroll', handleScroll);
      return () => wrapper.removeEventListener('scroll', handleScroll);
    }, 400);
  }, [selectedUserId]);

  const toggleExpandAll = (version) => {
    setExpandedVersions(prev => ({ ...prev, [version]: !prev[version] }));
  };

  const handleDateSelect = (dateKey) => {
    if (groupedWorkouts[dateKey]) {
      setSelectedDate(dateKey);
      setActiveTab('timeline');
      scrollToCenter(dateKey);
    } else {
      // No workouts loaded for that date yet — attempt to fetch surrounding range and then select
      setIsLoading(true);
      const fromDate = new Date(dateKey);
      fromDate.setDate(fromDate.getDate() - 2);
      const toDate = new Date(dateKey);
      toDate.setDate(toDate.getDate() + 2);
      fetchWorkoutsInRange(fromDate.toISOString().split('T')[0], toDate.toISOString().split('T')[0]).then(() => {
        setSelectedDate(dateKey);
        setActiveTab('timeline');
        setTimeout(() => scrollToCenter(dateKey), 200);
        setIsLoading(false);
      });
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

  const selectedDateObj = selectedDate ? new Date(selectedDate) : null;
  const dayName = selectedDateObj ? selectedDateObj.toLocaleDateString("en-US", { weekday: 'long', timeZone: 'Asia/Kolkata' }) : '';
  const isRestDay =
    selectedDate &&
    (dayName === "Sunday" || dayName === "Thursday") &&
    (!groupedWorkouts[selectedDate] || versionOrder.every(
      version => !groupedWorkouts[selectedDate]?.versions?.[version]?.length
    ));

  // calendar helpers
  const markedDates = {}; // show calories or a small dot count
  Object.keys(dailyMeta).forEach(k => { markedDates[k] = dailyMeta[k] ? '•' : '' });
  Object.keys(groupedWorkouts).forEach(k => { markedDates[k] = markedDates[k] ? markedDates[k] : (Object.keys(groupedWorkouts[k].versions).length ? '•' : '') });

  const openCalendarModalFor = (isoDate) => {
    setCalendarModalDate(isoDate);
    setActiveTab('calendar');
  }

  const handleCalendarDateClick = (isoDate) => {
    // If clicking calendar should open modal with that date's workouts
    setCalendarModalDate(isoDate);
  }

  const calendarPrev = () => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const calendarNext = () => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  return (
    <div className="horizontal-container" style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Tabs (Timeline / Calendar) */}
      <div className="top-tabs" style={{ display: 'flex', padding: 8, gap: 8, background: '#111827' }}>
        <button
          className={`tab-btn ${activeTab === 'timeline' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </button>
        <button
          className={`tab-btn ${activeTab === 'calendar' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar
        </button>
      </div>

      {/* Timeline view (keeps existing timeline at top) */}
      {activeTab === 'timeline' && (
        <>
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

              return (
                <div key={dateKey} className="timeline-date-wrapper">
                  <div
                    className={`timeline-date-circle ${isActive ? 'active' : ''} ${isFutureBeyondTomorrow ? 'disabled' : ''}`}
                    onClick={() => handleDateSelect(dateKey)}
                    ref={(el) => (scrollRef.current[dateKey] = el)}
                  >
                    <div className="circle-date">
                      {groupedWorkouts[dateKey]?.displayDate?.split('/')[0] || dateKey.split('-')[2]}
                    </div>
                    <div className="circle-day">
                      {groupedWorkouts[dateKey]?.day || dateObj.toLocaleDateString("en-US", { weekday: 'short' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div ref={scrollWrapperRef} style={{ overflowY: 'auto', flex: 1 }}>

            {user?.role === 'superadmin' && (
              <div className="section-card-indvidual">
                <label style={{ fontWeight: 'bold', color: 'white' }}>Target User:</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  style={{ padding: '5px 10px', marginTop: '5px' }}
                >
                  <option value="">All (Daily Programming)</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._1d}>{u.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ minHeight: '100%' }}>
              {selectedDate && (
                <>
                  <div className="section-card-indvidual">
                    <div className="section-header-row">
                      <div>
                        <h1>Hi {user.name}</h1>
                      </div>
                      <div>
                        <FiRefreshCw
                          size={24}
                          style={{ cursor: 'pointer', color: '#ff2c2c' }}
                          title="Reload Workouts"
                          onClick={handleRefresh}
                        />
                      </div>
                      <div>
                        <button className="back-to-today-btns" onClick={() => handleDateSelect(todayKey)}>Back to Today</button>
                      </div>
                    </div>
                    <h3 style={{ color: "#ff2c2c", marginBottom: '10px' }}>Workout for {getDisplayDate(selectedDate)}</h3>
                  </div>

                  {dailyMeta[selectedDate] && (
                    <CalorieShadeBar calorie={dailyMeta[selectedDate]} />
                  )}

                  {isRestDay ? (
                    <div className="section-card-indvidual">
                      <div style={{ textAlign: 'center', fontStyle: 'italic', padding: '10px', color: '#ff2c2c' }}>
                        {dayName === "Thursday"
                          ? "It's Thursday – you've earned this pause 💩"
                          : "Sundays are for stretching the soul, not the hamstrings ☀️"}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="section-card-indvidual">
                        {isIndividual ? (
                          <DailyNoteSection
                            date={selectedDate}
                            selectedUserId={viewingUser._id}
                            selectedUser={viewingUser}
                          />
                        ) : (
                          <SandboxedCommentSection date={selectedDate} user={viewingUser} />
                        )}
                      </div>

                      {versionOrder.map((version) =>
                        groupedWorkouts[selectedDate]?.versions?.[version]?.length > 0 ? (
                          <div className="section-card-indvidual" key={version}>
                            <div className="version-container">
                              <div className="version-header">
                                <span className={`badge badge-${version.replace(/\s+/g, '').toLowerCase()}`}>{version}</span>
                              </div>
                              <div className="workout-list">
                                {groupedWorkouts[selectedDate].versions[version]
                                  .sort((a, b) => a.order - b.order)
                                  .map((w) => (
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
                                          <strong className="custom-name">{w.customName || w.title}</strong>
                                          {w.customName && <div className="sub-title">{w.title}</div>}
                                        </div>
                                      </div>
                                      {expandedVersions[version] && (
                                        <div className="inline-details">
                                          <div dangerouslySetInnerHTML={{ __html: w.description.replace(/\n/g, '<br/>') }} />

                                          {w.capTime && ( <div className="wod-instructions">
                                            TIME CAP:
                                            <div>{w.capTime}</div>
                                          </div>)}

                                          {w.instructions && (

                                            <div className="wod-instructions">
                                              INSTRUCTIONS:
                                              <div dangerouslySetInnerHTML={{ __html: w.instructions.replace(/\n/g, '<br/>') }} />
                                            </div>
                                          )}

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
                      )}
                    </>
                  )}
                </>
              )}
            </div>

          </div>
        </>
      )}

      {/* Calendar full-center tab */}
      {activeTab === 'calendar' && (
        <div className="calendar-fullscreen" style={{ padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: 720, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <button onClick={calendarPrev} className="ghost-btn">◀</button>
            <div style={{ fontWeight: '700' }}>{calendarMonth.toLocaleString('default', { month: 'long' })} {calendarMonth.getFullYear()}</div>
            <button onClick={calendarNext} className="ghost-btn">▶</button>
          </div>

          <div style={{ width: '100%', maxWidth: 720 }}>
            <CalendarGrid
              monthDate={calendarMonth}
              onDateClick={(iso) => handleCalendarDateClick(iso)}
              markedDates={markedDates}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <button className="primary-btn" onClick={() => {
              if (calendarModalDate) {
                // if a date already selected inside calendar, open the workout modal for that date
                // ensure workouts around that date are loaded
                handleDateSelect(calendarModalDate);
              }
            }}>Open Selected Date in Timeline</button>
          </div>
        </div>
      )}

      {/* Workout modal (timeline click) */}
      {modalWorkout && (
        <div className="modal-overlay" onClick={() => setModalWorkout(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ marginBottom: 0 }}>{modalWorkout.customName || modalWorkout.title}</h2>
                {modalWorkout.customName && <h3 style={{ marginTop: 4, fontWeight: 'normal' }}>{modalWorkout.title}</h3>}
              </div>

              <div style={{ textAlign: 'right' }}>
                {modalWorkout.version && (
                  <span
                    className={`badge badge-${modalWorkout.version.replace(/\s+/g, '').toLowerCase()}`}
                    style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '8px', marginBottom: '4px', display: 'inline-block' }}
                  >
                    {modalWorkout.version}
                  </span>
                )}
                {modalWorkout.date && (
                  <div style={{ fontSize: '0.75rem', color: '#aaa' }}>
                    {new Date(modalWorkout.date).toLocaleDateString('en-GB')}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-inside-content">
              <div className="wod-desp" dangerouslySetInnerHTML={{ __html: modalWorkout.description.replace(/\n/g, '<br/>') }} />
              {modalWorkout.instructions && (
                <div className="wod-instructions">
                  INSTRUCTIONS:
                  <div dangerouslySetInnerHTML={{ __html: modalWorkout.instructions.replace(/\n/g, '<br/>') }} />
                </div>
              )}

              {modalWorkout.capTime && (
                <div className="wod-instructions">
                  TIME CAP:
                  <div>{modalWorkout.capTime}</div>
                </div>
              )}
              {modalWorkout.movements?.length > 0 && (
                <div className="movement-demo-section">
                  <h4>📽 Movement Demos</h4>
                  <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                    {modalWorkout.movements.map((m, idx) => (
                      <li key={idx} style={{ marginBottom: '8px' }}>
                        {m.name}
                        {m.url && (
                          <span
                            style={{ marginLeft: '10px', cursor: 'pointer' }}
                            onClick={() => setMovementVideo(m)}
                            title="Watch Demo"
                          >
                            🔗
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button onClick={() => setModalWorkout(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Calendar date modal (when tapping a date in calendar we show workouts for that day in a modal) */}
      {calendarModalDate && (
        <div className="modal-overlay" onClick={() => setCalendarModalDate(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{new Date(calendarModalDate).toLocaleDateString('en-GB')}</h3>
              <div>
                <button className="ghost-btn" onClick={() => {
                  // open in timeline (will fetch if required)
                  handleDateSelect(calendarModalDate);
                  setCalendarModalDate(null);
                }}>Open in Timeline</button>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              {groupedWorkouts[calendarModalDate] ? (
                Object.keys(groupedWorkouts[calendarModalDate].versions).map((v) => (
                  <div key={v} style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 700 }}>{v}</div>
                    {groupedWorkouts[calendarModalDate].versions[v].map(w => (
                      <div key={w._id} className="modal-workout-row" onClick={() => setModalWorkout(w)}>
                        <div>{w.customName || w.title}</div>
                        <div style={{ color: '#666' }}>{w.calories ? `${w.calories} cal` : ''}</div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div style={{ padding: 12 }}>
                  <div style={{ color: '#777' }}>No workouts loaded for this date.
                    <div style={{ marginTop: 8 }}>
                      <button onClick={() => {
                        // try to fetch nearby workouts and then re-open modal
                        const fromDate = new Date(calendarModalDate);
                        fromDate.setDate(fromDate.getDate() - 2);
                        const toDate = new Date(calendarModalDate);
                        toDate.setDate(toDate.getDate() + 2);
                        setIsLoading(true);
                        fetchWorkoutsInRange(fromDate.toISOString().split('T')[0], toDate.toISOString().split('T')[0]).then(() => {
                          setIsLoading(false);
                        });
                      }}>Load nearby workouts</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <button onClick={() => setCalendarModalDate(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {movementVideo && (
        <div className="modal-overlay" onClick={() => setMovementVideo(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{movementVideo.name}</h3>
            <div className="youtube-embed-container" style={{ marginTop: '10px' }}>
              <iframe
                width="100%"
                height="315"
                src={movementVideo.url.replace("watch?v=", "embed/")}
                title={movementVideo.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <button onClick={() => setMovementVideo(null)} style={{ marginTop: '15px' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="loading-overlay">Loading your workouts...</div>
      )}

    </div>
  );
};

export default Workouts;
