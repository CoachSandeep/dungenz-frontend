import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import WorkoutListModal from './WorkoutListModal';

const AdminCalendar = () => {
  const [workouts, setWorkouts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts`, {
        headers: { Authorization: token },
      });
      const data = await res.json();
      setWorkouts(data);
    };
    fetchWorkouts();
  }, []);

  const workoutsOnDate = (date) => {
    const formatted = date.toISOString().split('T')[0];
    return workouts.filter(w => w.date?.startsWith(formatted));
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayWorkouts = workoutsOnDate(date);
      if (dayWorkouts.length > 0) {
        return <div className="calendar-badge">{dayWorkouts.length}</div>;
      }
    }
  };

  const handleDateClick = (value) => {
    setSelectedDate(value);
    setModalOpen(true);
  };

  return (
    <div className="calendar-container">
      <h2>Manage Workouts by Date</h2>
      <Calendar
        onClickDay={handleDateClick}
        tileContent={tileContent}
      />

      {modalOpen && (
        <WorkoutListModal
          date={selectedDate}
          workouts={workoutsOnDate(selectedDate)}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminCalendar;
