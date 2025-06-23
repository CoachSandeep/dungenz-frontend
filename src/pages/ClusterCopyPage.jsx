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
  const [targetDate, setTargetDate] = useState(new Date());

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchWorkouts();
  }, [selectedVersion, currentMonth]);

  const fetchWorkouts = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;

      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts/month?year=${year}&month=${month}`, {
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
      
       // 🔥 Sort workouts inside each date group by 'order'
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => (a.order || 0) - (b.order || 0));
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
            {
              toVersion,
              targetDate: targetDate.toISOString().split('T')[0]
            },
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

      {selectedWorkoutIds.length > 0 && (
        <CopyFooterBar
          selectedCount={selectedWorkoutIds.length}
          selectedTargetVersions={targetVersions}
          setSelectedTargetVersions={setTargetVersions}
          onCopy={handleCopy}
          targetDate={targetDate}
          setTargetDate={setTargetDate}
        />
      )}

<WorkoutBlockList
  groupedWorkouts={Object.fromEntries(
    Object.entries(groupedWorkouts)
      .sort(([a], [b]) => new Date(b) - new Date(a)) // 🔽 descending by date
  )}
  selectedWorkouts={selectedWorkoutIds}
  onWorkoutToggle={handleWorkoutToggle}
  onViewWorkout={(w) => setModalWorkout(w)}
/>

      <WorkoutModal workout={modalWorkout} onClose={() => setModalWorkout(null)} />
    </div>
  );
};

export default ClusterCopyPage;
