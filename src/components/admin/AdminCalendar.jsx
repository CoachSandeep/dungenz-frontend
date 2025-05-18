import React, { useEffect, useState, useRef } from 'react';
import {
  FaEdit, FaTrash, FaCopy, FaStar, FaRegStar, FaBookOpen, FaPlus
} from 'react-icons/fa';
import ClusterCreateForm from './ClusterCreateForm';
import ClusterEditForm from './ClusterEditForm';
import './../../styles/adminCalendar.css';

const versionOrder = ['Ultra Train', 'Super Train', 'Minimal Equipment', 'Beginner'];

const AdminTimeline = () => {
  const [groupedWorkouts, setGroupedWorkouts] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterVersion, setFilterVersion] = useState('');
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const token = localStorage.getItem('token');
  const scrollRefs = useRef({});

  // Fetch data
  useEffect(() => {
    fetchWorkouts();
  }, []);

  // Scroll to center date
  useEffect(() => {
    if (selectedDate && scrollRefs.current[selectedDate]) {
      scrollRefs.current[selectedDate].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [selectedDate]);

  // Auto-correct selected date if starred filter active
  useEffect(() => {
    const starredDates = Object.keys(getFilteredGrouped()).sort((a, b) => new Date(a) - new Date(b));
    if (onlyStarred && !starredDates.includes(selectedDate)) {
      setSelectedDate(starredDates[0] || null);
    }
  }, [onlyStarred, groupedWorkouts]);

  const fetchWorkouts = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const grouped = {};
    const today = new Date();

    for (let i = -7; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dateKey = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-GB');
      const day = d.toLocaleDateString('en-US', { weekday: 'short' });

      grouped[dateKey] = { displayDate, day, versions: {} };
    }

    data.forEach((w) => {
      const key = new Date(w.date).toISOString().split('T')[0];
      if (!grouped[key]) {
        grouped[key] = {
          displayDate: new Date(w.date).toLocaleDateString('en-GB'),
          day: new Date(w.date).toLocaleDateString('en-US', { weekday: 'short' }),
          versions: {}
        };
      }

      if (!grouped[key].versions[w.version]) {
        grouped[key].versions[w.version] = [];
      }
      grouped[key].versions[w.version].push(w);
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
        if (workouts?.length) {
          versions[v] = workouts;
        }
      });

      if (Object.keys(versions).length) {
        filtered[date] = {
          ...groupedWorkouts[date],
          versions
        };
      }
    });

    return filtered;
  };

  const filteredGrouped = getFilteredGrouped();
  const filteredDates = Object.keys(filteredGrouped).sort((a, b) => new Date(a) - new Date(b));

  const toggleStar = async (id) => {
    await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts/${id}/star`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchWorkouts();
  };

  const toggleLibrary = async (id) => {
    await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts/${id}/library`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchWorkouts();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete workout?')) {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts/${id}/delete`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWorkouts();
    }
  };

  const handleCopy = async (id) => {
    await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts/${id}/copy`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchWorkouts();
  };

  return (
    <div className="admin-timeline-container">
      <div className="timeline-header">
        <h2>DUNGENZ Admin Timeline</h2>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select value={filterVersion} className="selectfilter" onChange={(e) => setFilterVersion(e.target.value)}>
          <option value="">All Versions</option>
          {versionOrder.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
        </div>
        <div className="filter-starred">
        <label>
          <input
            type="checkbox"
            checked={onlyStarred}
            onChange={(e) => setOnlyStarred(e.target.checked)}
          
          />
          ⭐ Show only Starred
        </label>
      </div>

      {/* Timeline */}
      <div className="timeline-horizontal" style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory' }}>
        {filteredDates.map((dateKey) => (
          <div
            key={dateKey}
            ref={(el) => (scrollRefs.current[dateKey] = el)}
            className={`timeline-date-circle ${selectedDate === dateKey ? 'active' : ''}`}
            onClick={() => setSelectedDate(dateKey)}
            style={{ flex: '0 0 auto', scrollSnapAlign: 'center' }}
          >
            <div className="circle-date">{filteredGrouped[dateKey].displayDate.split('/')[0]}</div>
            <div className="circle-day">{filteredGrouped[dateKey].day}</div>
          </div>
        ))}
      </div>

      {/* Timeline Details */}
      {selectedDate && filteredGrouped[selectedDate] && (
        <div className="timeline-details-box">
          <div className="admin-date-heading">
            <h3>Workouts for {filteredGrouped[selectedDate].displayDate}</h3>
            <button className="add-btn" onClick={() => setShowAdd(!showAdd)}>
              <FaPlus /> Add
            </button>
          </div>

          {showAdd && (
            <ClusterCreateForm
              defaultDate={selectedDate}
              onSaved={() => {
                fetchWorkouts();
                setShowAdd(false);
              }}
            />
          )}

          {versionOrder.map((version) => {
            if (filterVersion && version !== filterVersion) return null;
            const workouts = filteredGrouped[selectedDate].versions[version];
            if (!workouts || !workouts.length) return null;

            return (
              <div key={version} className="version-group">
                <div className="badge-title-line">
                  <span className={`badge badge-${version.replace(/\s+/g, '').toLowerCase()}`}>
                    {version}
                  </span>
                </div>

                {workouts.map((w) => (
                  <div key={w._id} className="admin-workout-item">
                    {editingWorkoutId === w._id ? (
                      <ClusterEditForm
                        version={version}
                        workouts={filteredGrouped[selectedDate].versions[version]}
                        onSave={() => {
                          setEditingWorkoutId(null);
                          fetchWorkouts();
                        }}
                        onCancel={() => setEditingWorkoutId(null)}
                      />
                    ) : (
                      <div className="workout-title-row">
                        <h4>{w.title}</h4>
                        <div className="icon-actions">
                          <FaEdit onClick={() => setEditingWorkoutId(w._id)} />
                          <FaTrash onClick={() => handleDelete(w._id)} />
                          <FaCopy onClick={() => handleCopy(w._id)} />
                          {w.isStarred
                            ? <FaStar onClick={() => toggleStar(w._id)} />
                            : <FaRegStar onClick={() => toggleStar(w._id)} />}
                          <FaBookOpen onClick={() => toggleLibrary(w._id)} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminTimeline;
