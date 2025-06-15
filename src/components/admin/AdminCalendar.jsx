import React, { useEffect, useState, useRef } from 'react';
import {
  FaEdit, FaTrash, FaCopy, FaStar, FaRegStar, FaBookOpen, FaPlus
} from 'react-icons/fa';
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
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [showCopyModal, setShowCopyModal] = useState(false);

  const token = localStorage.getItem('token');
  const scrollRefs = useRef({});

  useEffect(() => {
    fetchMonthWorkouts(selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    if (selectedDate && scrollRefs.current[selectedDate]) {
      scrollRefs.current[selectedDate].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [selectedDate]);

  useEffect(() => {
    const starredDates = Object.keys(getFilteredGrouped()).sort((a, b) => new Date(a) - new Date(b));
    if (onlyStarred && !starredDates.includes(selectedDate)) {
      setSelectedDate(starredDates[0] || null);
    }
  }, [onlyStarred, groupedWorkouts]);

  const fetchMonthWorkouts = async (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts/month?year=${year}&month=${month}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const grouped = {};
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

  const toggleWorkoutSelection = (workout, date, version) => {
    const key = `${date}-${version}`;
    const versionWorkouts = groupedWorkouts[date]?.versions[version] || [];
    const allSelected = versionWorkouts.every(w => selectedWorkouts.includes(w._id));
    const newSelection = [...selectedWorkouts];

    versionWorkouts.forEach(w => {
      const idx = newSelection.indexOf(w._id);
      if (!allSelected && idx === -1) {
        newSelection.push(w._id);
      } else if (allSelected && idx !== -1) {
        newSelection.splice(idx, 1);
      }
    });

    setSelectedWorkouts(newSelection);
  };

  const filteredGrouped = getFilteredGrouped();
  const filteredDates = Object.keys(filteredGrouped).sort((a, b) => new Date(a) - new Date(b));

  const isChecked = (date, version) => {
    const versionWorkouts = groupedWorkouts[date]?.versions[version] || [];
    return versionWorkouts.every(w => selectedWorkouts.includes(w._id));
  };

  return (
    <div className="admin-timeline-container">
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

      {selectedWorkouts.length > 0 && (
        <div className="copy-selected-btn">
          <button onClick={() => setShowCopyModal(true)}>📋 Copy Selected ({selectedWorkouts.length})</button>
        </div>
      )}

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
                fetchMonthWorkouts(selectedMonth);
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
                  <label>
                    <input
                      type="checkbox"
                      checked={isChecked(selectedDate, version)}
                      onChange={() => toggleWorkoutSelection(null, selectedDate, version)}
                    />
                    <span className={`badge badge-${version.replace(/\s+/g, '').toLowerCase()}`}>{version}</span>
                  </label>
                </div>

                {workouts.map((w) => (
                  <div key={w._id} className="admin-workout-item">
                    <div className="workout-title-row">
                      <h4>{w.title}</h4>
                      <div className="icon-actions">
                        <FaEdit onClick={() => setEditingWorkoutId(w._id)} />
                        <FaTrash onClick={() => handleDelete(w._id)} />
                        <FaStar onClick={() => toggleStar(w._id)} />
                        <FaBookOpen onClick={() => toggleLibrary(w._id)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {showCopyModal && (
        <CopyClusterModal
          selectedWorkoutIds={selectedWorkouts}
          onClose={() => {
            setShowCopyModal(false);
            setSelectedWorkouts([]);
            fetchMonthWorkouts(selectedMonth);
          }}
        />
      )}
    </div>
  );
};

export default AdminTimeline;
