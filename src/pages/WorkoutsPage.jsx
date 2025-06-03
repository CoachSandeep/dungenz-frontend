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

  const handleRefresh = async () => {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 5);
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 1); // only fetch till tomorrow

    await fetchWorkoutsInRange(
      fromDate.toISOString().split('T')[0],
      toDate.toISOString().split('T')[0]
    );
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
    const today = new Date();
    const baseDates = [];
    for (let i = -5; i <= 5; i++) {
      const newDate = new Date(today);
      newDate.setDate(today.getDate() + i);
      baseDates.push(newDate.toISOString().split('T')[0]);
    }
    baseDates.unshift("__load_more__");
    setDates(baseDates);

    const fetchInitial = async () => {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 5);
      const toDate = new Date();
      toDate.setDate(toDate.getDate() + 5);
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
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dateToCheck = new Date(dateKey);
            dateToCheck.setHours(0, 0, 0, 0);

            let hasWorkouts = false;
            if (groupedWorkouts.hasOwnProperty(dateKey)) {
              if (dateToCheck <= today) {
                hasWorkouts = true;
              } else if (dateToCheck.getTime() === today.getTime() + 86400000) {
                hasWorkouts = true;
              }
            }

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
      </div>
    </PullToRefresh>
  );
};

export default Workouts;
