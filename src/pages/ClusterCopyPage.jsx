import React, { useEffect, useState } from 'react';
import DateNavigationHeader from '../components/admin/DateNavigationHeader';
import WorkoutBlockList from '../components/admin/WorkoutBlockList';
import WorkoutModal from '../components/admin/WorkoutModal';
import CopyFooterBar from '../components/admin/CopyFooterBar';
import axios from 'axios';

const versionOptions = ["Ultra Train", "Super Train", "Minimal Equipment", "Beginner"];

const ClusterCopyPage = () => {
  const [allWorkouts, setAllWorkouts] = useState([]);
  const [groupedWorkouts, setGroupedWorkouts] = useState({});
  const [selectedWorkoutIds, setSelectedWorkoutIds] = useState([]);
  const [targetVersions, setTargetVersions] = useState([]);
  const [modalWorkout, setModalWorkout] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedVersion, setSelectedVersion] = useState('Ultra Train');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchWorkouts();
  }, [selectedVersion]);

  const fetchWorkouts = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const filtered = res.data.filter(w => w.version === selectedVersion);
      setAllWorkouts(filtered);

      const grouped = {};
      filtered.forEach(w => {
        const dateKey = new Date(w.date).toISOString().split('T')[0];
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(w);
      });

      setGroupedWorkouts(grouped);
    } catch (err) {
      console.error('Failed to load workouts', err);
    }
  };

  const handleWorkoutToggle = (id) => {
    setSelectedWorkoutIds(prev =>
      prev.includes(id) ? prev.filter(wid => wid !== id) : [...prev, id]
    );
  };

  const handleCopy = async () => {
    try {
      const selected = allWorkouts.filter(w => selectedWorkoutIds.includes(w._id));

      for (let toVersion of targetVersions) {
        for (let w of selected) {
          await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/admin/workouts/${w._id}/copy`,
            { toVersion },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }
      }

      alert(`✅ ${selected.length} workouts copied to ${targetVersions.length} version(s)!`);
      setSelectedWorkoutIds([]);
      setTargetVersions([]);
    } catch (err) {
      console.error('Copy failed:', err);
      alert('❌ Copy failed');
    }
  };

  const jumpToDate = (date) => {
    if (date instanceof Date) {
      setCurrentMonth(date);
      const section = document.querySelector(`[data-date="${date.toISOString().split('T')[0]}"]`);
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    jumpToDate(today);
  };

  const currentMonthLabel = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div style={{ backgroundColor: '#0d0d0d', minHeight: '100vh' }}>
      <DateNavigationHeader
        currentMonth={currentMonthLabel}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onJumpToDate={jumpToDate}
        onToday={handleToday}
        selectedVersion={selectedVersion}
        onVersionChange={setSelectedVersion}
        versionOptions={versionOptions}
      />

      <WorkoutBlockList
        groupedWorkouts={groupedWorkouts}
        selectedWorkouts={selectedWorkoutIds}
        onWorkoutToggle={handleWorkoutToggle}
        onViewWorkout={(w) => setModalWorkout(w)}
      />

      <WorkoutModal workout={modalWorkout} onClose={() => setModalWorkout(null)} />

      {selectedWorkoutIds.length > 0 && (
        <CopyFooterBar
          selectedCount={selectedWorkoutIds.length}
          selectedTargetVersions={targetVersions}
          setSelectedTargetVersions={setTargetVersions}
          onCopy={handleCopy}
        />
      )}
    </div>
  );
};

export default ClusterCopyPage;
