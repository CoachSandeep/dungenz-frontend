import React, { useEffect, useRef, useState } from 'react';
import './../styles/workout.css';

const versionOrder = ["Ultra Train", "Super Train", "Minimal Equipment", "Beginner"];

const Workouts = () => {
  const [groupedWorkouts, setGroupedWorkouts] = useState({});
  const [dates, setDates] = useState([]);
  const [fetchedDates, setFetchedDates] = useState(new Set());
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalWorkout, setModalWorkout] = useState(null);
  const [expandedVersions, setExpandedVersions] = useState({});
  const scrollRef = useRef({});
  const scrollContainerRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const todayKey = new Date().toISOString().split('T')[0];

  const getDisplayDate = (dateKey) => {
    const today = new Date();
    const targetDate = new Date(dateKey);
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
    if (fetchedDates.has(dateKey)) return;
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
      const visibleWorkouts = filterVisibleWorkouts(data, settings.releaseTime);
      const grouped = { ...groupedWorkouts };
      const dateObj = new Date(dateKey);
      const displayDate = dateObj.toLocaleDateString("en-GB");
      const day = dateObj.toLocaleDateString("en-US", { weekday: 'short' });
      grouped[dateKey] = { displayDate, day, versions: {} };
      visibleWorkouts.forEach(w => {
        const version = w.version?.trim() || "Uncategorized";
        if (!grouped[dateKey].versions[version]) {
          grouped[dateKey].versions[version] = [];
        }
        grouped[dateKey].versions[version].push(w);
      });
      setGroupedWorkouts(prev => ({ ...prev, ...grouped }));
      setDates(prev => Array.from(new Set([...prev, dateKey])).sort());
      setFetchedDates(prev => new Set(prev).add(dateKey));
    } catch (err) {
      console.error(err);
    }
  };

  const loadInitialDates = () => {
    const base = new Date();
    const start = new Date(base);
    start.setDate(base.getDate() - 4);
    const end = new Date(base);
    end.setDate(base.getDate() + 5);
    const initial = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = new Date(d).toISOString().split('T')[0];
      initial.push(key);
    }
    setDates([...initial]);
    initial.slice(0, 5).forEach(key => fetchWorkoutsByDate(key));
  };

  const handleLoadMore = () => {
    const firstDate = new Date(dates[0]);
    const newDates = [];
    for (let i = 5; i >= 1; i--) {
      const newDate = new Date(firstDate);
      newDate.setDate(newDate.getDate() - i);
      const key = newDate.toISOString().split('T')[0];
      newDates.push(key);
      fetchWorkoutsByDate(key);
    }
    setDates(prev => [...newDates, ...prev]);
  };

  useEffect(() => {
    loadInitialDates();
    setSelectedDate(todayKey);
    setTimeout(() => scrollToCenter(todayKey), 300);
  }, []);

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
        <div className="timeline-date-wrapper">
          <div
            className="timeline-date-circle load-more-circle"
            onClick={handleLoadMore}
          >
            +
          </div>
        </div>
        {dates.map((dateKey, index) => {
          const dateObj = new Date(dateKey);
          const isActive = selectedDate === dateKey;
          const today = new Date();
          const diff = Math.floor((dateObj - today) / (1000 * 60 * 60 * 24));
          const label = getDisplayDate(dateKey);
          const hasWorkouts = Object.keys(groupedWorkouts[dateKey]?.versions || {}).length > 0;

          const showMonthHeading = index === 0 || new Date(dates[index - 1]).getMonth() !== dateObj.getMonth();
          const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });

          return (
            <div key={index} className="timeline-date-wrapper">
              {showMonthHeading && <div className="month-heading">{monthName}</div>}
              <div
                data-date={dateKey}
                className={`timeline-date-circle ${isActive ? 'active' : ''} ${!hasWorkouts && dateObj <= today ? 'disabled' : ''}`}
                onClick={() => dateObj <= today && handleDateSelect(dateKey)}
                ref={(el) => { if (el) scrollRef.current[dateKey] = el; }}
              >
                <div className="circle-date">{groupedWorkouts[dateKey]?.displayDate?.split('/')[0]}</div>
                <div className="circle-day">{groupedWorkouts[dateKey]?.day}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Workouts;
