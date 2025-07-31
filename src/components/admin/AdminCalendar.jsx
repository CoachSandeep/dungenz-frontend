// ✅ Modified AdminTimeline to support user filtering and display user name with workouts

import React, { useEffect, useState, useRef } from 'react';
import {
  FaEdit, FaTrash, FaCopy, FaStar, FaRegStar, FaBookOpen, FaPlus
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClusterCreateForm from './ClusterCreateForm';
import ClusterEditForm from './ClusterEditForm';
import CopyClusterModal from './CopyClusterModal';
import './../../styles/adminCalendar.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { subMonths, addMonths, format } from 'date-fns';

const versionOrder = ['Ultra Train', 'Super Train', 'Minimal Equipment', 'Beginner'];

const AdminTimeline = () => {
  const [groupedWorkouts, setGroupedWorkouts] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterVersion, setFilterVersion] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [calorieValue, setCalorieValue] = useState('');
  const [userList, setUserList] = useState([]);

  const token = localStorage.getItem('token');
  const scrollRefs = useRef({});

  useEffect(() => {
    fetchUserList();
    fetchMonthWorkouts(selectedMonth);
  }, [selectedMonth, filterUser]);

  const fetchUserList = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUserList(data);
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  const fetchMonthWorkouts = async (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const queryUser = filterUser ? `&user=${filterUser}` : '';

    const [workoutRes, metaRes] = await Promise.all([
      fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts/month?year=${year}&month=${month}${queryUser}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts/daily-meta/month?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ]);

    const data = await workoutRes.json();
    const meta = await metaRes.json();

    const calorieMap = {};
    meta.forEach((entry) => {
      const key = new Date(entry.date).toISOString().split('T')[0];
      calorieMap[key] = entry.calories;
    });

    const grouped = {};
    data.forEach((w) => {
      const key = new Date(w.date).toISOString().split('T')[0];
      if (!grouped[key]) {
        grouped[key] = {
          displayDate: new Date(w.date).toLocaleDateString('en-GB'),
          day: new Date(w.date).toLocaleDateString('en-US', { weekday: 'short' }),
          versions: {},
          calories: calorieMap[key] || ''
        };
      }

      if (!grouped[key].versions[w.version]) {
        grouped[key].versions[w.version] = [];
      }
      grouped[key].versions[w.version].push(w);
    });

    Object.values(grouped).forEach(day => {
      versionOrder.forEach(v => {
        if (day.versions[v]) {
          day.versions[v].sort((a, b) => (a.order || 0) - (b.order || 0));
        }
      });
    });

    setGroupedWorkouts(grouped);

    const todayKey = new Date().toISOString().split('T')[0];
    setSelectedDate(grouped[todayKey] ? todayKey : Object.keys(grouped)[0]);
  };

  const getFilteredGrouped = () => {
    if (!onlyStarred) return groupedWorkouts;
    const filtered = {};
    Object.keys(groupedWorkouts).forEach((date) => {
      const versions = {};
      versionOrder.forEach((v) => {
        const workouts = groupedWorkouts[date].versions[v]?.filter(w => w.isStarred);
        if (workouts?.length) versions[v] = workouts;
      });
      if (Object.keys(versions).length) {
        filtered[date] = { ...groupedWorkouts[date], versions };
      }
    });
    return filtered;
  };

  const filteredGrouped = getFilteredGrouped();
  const filteredDates = Object.keys(filteredGrouped).sort((a, b) => new Date(a) - new Date(b));

  return (
    <div className="admin-timeline-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="timeline-header">
        <h2>DUNGENZ Admin Timeline</h2>
      </div>
  
      <div className="calendar-filter">
        <DatePicker
          selected={selectedMonth}
          onChange={(date) => setSelectedMonth(date)}
          dateFormat="MMMM yyyy"
          showMonthYearPicker
        />
      </div>
  
      <div className="filter-bar">
        <select value={filterVersion} className="selectfilter" onChange={(e) => setFilterVersion(e.target.value)}>
          <option value="">All Versions</option>
          {versionOrder.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
  
        <select value={filterUser} className="selectfilter" onChange={(e) => setFilterUser(e.target.value)}>
          <option value="">All Users</option>
          {userList.map((user) => (
            <option key={user._id} value={user._id}>{user.name || user.email}</option>
          ))}
        </select>
      </div>
  
      <div className="timeline-scroll">
        {filteredDates.map((dateKey) => {
          const dayData = filteredGrouped[dateKey];
          return (
            <div key={dateKey} className="timeline-details-box" ref={(el) => (scrollRefs.current[dateKey] = el)}>
              <div className="admin-date-heading">
                <h3>{dayData.displayDate} ({dayData.day})</h3>
              </div>
  
              {versionOrder.map((version) => {
                if (filterVersion && version !== filterVersion) return null;
                const workouts = dayData.versions[version];
                if (!workouts || !workouts.length) return null;
  
                return (
                  <div key={version} className="version-group">
                    <div className="badge-title-line">
                      <span className={`badge badge-${version.replace(/\s+/g, '').toLowerCase()}`}>{version}</span>
                    </div>
  
                    {workouts.map((w) => (
                      <div key={w._id} className="admin-workout-item">
                        <div className="workout-title-row">
                          <h4>{w.title}</h4>
                          <p style={{ fontSize: '12px', color: '#ccc' }}>
                            By: {w.user?.name || w.user?.email || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminTimeline;
