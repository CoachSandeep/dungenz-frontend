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
  const [modalWorkout, setModalWorkout] = useState(null);


  const token = localStorage.getItem('token');
  const scrollRefs = useRef({});

  useEffect(() => {
    fetchUserList();
  }, []);

  useEffect(() => {
    fetchMonthWorkouts(selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    const filtered = getFilteredGrouped();
    const filteredDates = Object.keys(filtered).sort((a, b) => new Date(a) - new Date(b));
    if (!filtered[selectedDate]) {
      setSelectedDate(filteredDates[0] || null);
    }
  }, [filterUser, onlyStarred, groupedWorkouts]);

  const WorkoutDetailModal = ({ workout, onClose }) => {
    if (!workout) return null;
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content workout-modal" onClick={(e) => e.stopPropagation()}>
          <h2>{workout.customName || workout.title}</h2>
          <p><strong>Version:</strong> {workout.version}</p>
          {workout.icon && <p><strong>Icon:</strong> {workout.icon}</p>}
          {workout.timeCap && <p><strong>Time Cap:</strong> {workout.timeCap} minutes</p>}
          <p><strong>Description:</strong></p>
          <p dangerouslySetInnerHTML={{ __html: workout.description?.replace(/\n/g, '<br />') }} />
          {workout.instructions && (
            <>
              <p><strong>Instructions:</strong></p>
              <p dangerouslySetInnerHTML={{ __html: workout.instructions.replace(/\n/g, '<br />') }} />
            </>
          )}
          <button onClick={onClose} className="close-btn">Close</button>
        </div>
      </div>
    );
  };



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

    const [workoutRes, metaRes] = await Promise.all([
      fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts/month?year=${year}&month=${month}`, {
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

  const handleSaveCalories = async () => {
    if (!selectedDate || !calorieValue) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts/daily-meta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date: selectedDate,
          calories: calorieValue
        })
      });
      if (res.ok) {
        toast.success('Calories saved!');
        fetchMonthWorkouts(selectedMonth);
      } else {
        toast.error('Failed to save calories');
      }
    } catch (err) {
      console.error('Error saving calories', err);
      toast.error('Error saving calories');
    }
  };

  const handleDeleteCalories = async () => {
    if (!selectedDate) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts/daily-meta?date=${selectedDate}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        toast.success('Calories deleted!');
        fetchMonthWorkouts(selectedMonth);
      } else {
        toast.error('Failed to delete calories');
      }
    } catch (err) {
      console.error('Error deleting calories', err);
      toast.error('Error deleting calories');
    }
  };

  
 

  const getFilteredGrouped = () => {
    const filtered = {};
  
    Object.keys(groupedWorkouts).forEach((date) => {
      const versions = {};
  
      versionOrder.forEach((v) => {
        const allWorkouts = groupedWorkouts[date].versions[v];
        if (!allWorkouts) return;
  
        const filteredWorkouts = allWorkouts.filter((w) => {
          // ✅ If no user selected, show only workouts without targetUser
          if (!filterUser) {
            if (w.targetUser) return false;
          } else {
            // ✅ If user selected, show only their workouts
            if (!(w.targetUser === filterUser || w.targetUser?._id === filterUser)) return false;
          }
  
          // ✅ Handle starred filter
          if (onlyStarred && !w.isStarred) return false;
  
          return true;
        });
  
        if (filteredWorkouts.length > 0) {
          versions[v] = filteredWorkouts;
        }
      });
  
      if (Object.keys(versions).length > 0) {
        filtered[date] = { ...groupedWorkouts[date], versions };
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
      if (!allSelected && idx === -1) newSelection.push(w._id);
      else if (allSelected && idx !== -1) newSelection.splice(idx, 1);
    });
    setSelectedWorkouts(newSelection);
  };

  const filteredGrouped = getFilteredGrouped();
  const filteredDates = Object.keys(filteredGrouped).sort((a, b) => new Date(a) - new Date(b));
  
  const handleDelete = async (id, date, version) => {
    if (window.confirm('Delete workout?')) {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts/${id}/delete`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          toast.success('🗑️ Workout deleted');
          setGroupedWorkouts(prev => {
            const updated = { ...prev };
            if (!updated[date]) return prev;

            const versionList = updated[date].versions[version];
            if (!versionList) return prev;

            updated[date].versions[version] = versionList.filter(w => w._id !== id);
            return updated;
          });
        } else {
          toast.error('❌ Failed to delete workout');
        }
      } catch (err) {
        toast.error('❌ Error deleting workout');
      }
    }
  };

  const toggleStar = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts/${id}/star`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('⭐ Workout starred/unstarred');
        fetchMonthWorkouts(selectedMonth);
      } else {
        toast.error('❌ Failed to update star');
      }
    } catch (err) {
      toast.error('❌ Error toggling star');
    }
  };

  const toggleLibrary = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts/${id}/library`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('📚 Workout added/removed from Library');
        fetchMonthWorkouts(selectedMonth);
      } else {
        toast.error('❌ Failed to update library status');
      }
    } catch (err) {
      toast.error('❌ Error toggling library');
    }
  };


  const isChecked = (date, version) => {
    const workouts = filteredGrouped[date]?.versions?.[version] || [];
    return workouts.every((w) => selectedWorkouts.includes(w._id));
  };


  return (
    <div className="admin-timeline-container">
      <ToastContainer position="top-right" autoClose={3000} />

      {modalWorkout && (
        <WorkoutDetailModal
          workout={modalWorkout}
          onClose={() => setModalWorkout(null)}
        />
      )}
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

      <div style={{ margin: '10px 0', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label style={{ color: 'white' }}>🔥 Set Cals</label>
        <input
          type="text"
          value={calorieValue}
          onChange={(e) => setCalorieValue(e.target.value)}
          placeholder="e.g. 400-500"
          style={{ padding: '5px', width: '100px' }}
        />
        <button className="save-btn" onClick={handleSaveCalories}>Save</button>
        <button
    className="delete-btn"
    style={{ background: '#ff2c2c', color: 'white', padding: '5px 10px' }}
    onClick={handleDeleteCalories}
  >
    Delete
  </button>
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
                setSelectedDate(selectedDate); // ✅ Re-select previously selected date
                setShowAdd(false);
              }}
            />
          )}

{showCopyModal && (
        <CopyClusterModal
          selectedWorkoutIds={selectedWorkouts}
          onCopy={(payload) => handleClusterCopy(payload)} // ✅ yeh function define karna hoga
          onClose={() => {
            setShowCopyModal(false);
            setSelectedWorkouts([]);
            fetchMonthWorkouts(selectedMonth);
            
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
  <div key={w._id} className="admin-workout-item" onClick={() => setModalWorkout(w)}>
    {editingWorkoutId === w._id ? (
      <ClusterEditForm
        version={version}
        workouts={filteredGrouped[selectedDate].versions[version]}
        onSave={() => {
          setEditingWorkoutId(null);
          fetchMonthWorkouts(selectedMonth);
          setSelectedDate(selectedDate); // ✅ Preserve selected date
        }}
        onCancel={() => setEditingWorkoutId(null)}
      />
    ) : (
      <div className="workout-title-row" >
       <div>
        {w.customName && (
    <div style={{ fontSize: '0.9rem', color: '#bbb', fontWeight: '500' }}>
      {w.customName}
    </div>
  )}
        <h4>{w.title}</h4>
        </div>
        <div className="icon-actions">
    <FaEdit onClick={(e) => { e.stopPropagation(); setEditingWorkoutId(w._id); }} />
    <FaTrash onClick={(e) => { e.stopPropagation(); handleDelete(w._id, w.date.split('T')[0], w.version); }} />
    <FaStar onClick={(e) => { e.stopPropagation(); toggleStar(w._id); }} />
    <FaBookOpen onClick={(e) => { e.stopPropagation(); toggleLibrary(w._id); }} />
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
