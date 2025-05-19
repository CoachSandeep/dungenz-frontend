// ClusterCopyPage.jsx
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

const versions = ["Ultra Train", "Super Train", "Minimal Equipment", "Beginner"];

const ClusterCopyPage = () => {
  const [workouts, setWorkouts] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selected, setSelected] = useState({});
  const [targetDate, setTargetDate] = useState(new Date());
  const [targetVersions, setTargetVersions] = useState([]);

  useEffect(() => {
    fetchWorkouts();
  }, [currentMonth]);

  const fetchWorkouts = async () => {
    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();
    const res = await axios.get(`/api/workouts/by-month?month=${month}&year=${year}`);
    setWorkouts(res.data);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const toggleSelect = (dateKey, version, workoutId) => {
    setSelected(prev => {
      const current = prev[dateKey]?.[version] || [];
      const alreadySelected = current.includes(workoutId);
      const newSelection = alreadySelected
        ? current.filter(id => id !== workoutId)
        : [...current, workoutId];

      return {
        ...prev,
        [dateKey]: {
          ...(prev[dateKey] || {}),
          [version]: newSelection
        }
      };
    });
  };

  const selectAllInGroup = (dateKey, version) => {
    const ids = workouts[dateKey]?.[version]?.map(w => w._id) || [];
    setSelected(prev => ({
      ...prev,
      [dateKey]: {
        ...(prev[dateKey] || {}),
        [version]: ids
      }
    }));
  };

  const toggleTargetVersion = version => {
    setTargetVersions(prev =>
      prev.includes(version)
        ? prev.filter(v => v !== version)
        : [...prev, version]
    );
  };

  const handleCopy = async () => {
    for (const [dateKey, versionsMap] of Object.entries(selected)) {
      for (const [version, ids] of Object.entries(versionsMap)) {
        if (ids.length === 0) continue;

        await axios.post('/api/workouts/copy-cluster', {
          sourceDate: dateKey,
          version,
          workoutIds: ids,
          targetDate: targetDate.toISOString().split('T')[0],
          targetVersions
        });
      }
    }
    alert('Workouts copied successfully!');
    setSelected({});
    setTargetVersions([]);
  };

  return (
    <div className="p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth}>&lt;</button>
        <h2 className="text-xl font-bold">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={handleNextMonth}>&gt;</button>
      </div>

      {Object.keys(workouts).map(dateKey => (
        <div key={dateKey} className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{dateKey}</h3>
          {versions.map(version => (
            workouts[dateKey]?.[version]?.length ? (
              <div key={version} className="mb-2">
                <div className="flex items-center">
                  <h4 className="font-semibold mr-2">{version}</h4>
                  <button onClick={() => selectAllInGroup(dateKey, version)} className="text-sm underline">
                    Select All
                  </button>
                </div>
                {workouts[dateKey][version].map(workout => (
                  <div key={workout._id} className="flex items-center ml-4">
                    <input
                      type="checkbox"
                      checked={selected[dateKey]?.[version]?.includes(workout._id) || false}
                      onChange={() => toggleSelect(dateKey, version, workout._id)}
                    />
                    <span className="ml-2">{workout.customName || workout.name}</span>
                  </div>
                ))}
              </div>
            ) : null
          ))}
        </div>
      ))}

      <div className="mt-8">
        <label className="block font-bold mb-2">Select Target Date:</label>
        <DatePicker selected={targetDate} onChange={setTargetDate} className="text-black" />

        <div className="mt-4">
          <label className="block font-bold mb-2">Copy to Versions:</label>
          {versions.map(v => (
            <div key={v}>
              <label>
                <input
                  type="checkbox"
                  checked={targetVersions.includes(v)}
                  onChange={() => toggleTargetVersion(v)}
                />
                <span className="ml-2">{v}</span>
              </label>
            </div>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="mt-6 bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
        >
          Copy Selected Workouts
        </button>
      </div>
    </div>
  );
};

export default ClusterCopyPage;
