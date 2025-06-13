import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import 'react-datepicker/dist/react-datepicker.css';
import './../../styles/ClusterForm.css';

const iconOptions = [
  { label: '🔥 Warm-up', value: 'warmup' },
  { label: '💪 Main Workout', value: 'main' },
  { label: '🧊 Cool Down', value: 'cooldown' },
];

const ClusterCreateForm = ({ defaultDate, onSaved }) => {
  const [version, setVersion] = useState('Ultra Train');
  const [selectedDate, setSelectedDate] = useState(new Date(defaultDate));
  const [workouts, setWorkouts] = useState([
    { title: '', description: '', capTime: '', instructions: '', customName: '', icon: '' }
  ]);
  const [targetUserId, setTargetUserId] = useState('');
  const [userList, setUserList] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUserList(data);
        }
      } catch (err) {
        console.error("❌ Failed to fetch user list", err);
      }
    };
    fetchUsers();
  }, [token]);

  const handleAddWorkout = () => {
    setWorkouts([...workouts, { title: '', description: '', capTime: '', instructions: '', customName: '', icon: '' }]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...workouts];
    updated[index][field] = value;
    setWorkouts(updated);
  };

  const handleRemove = (index) => {
    const updated = workouts.filter((_, i) => i !== index);
    setWorkouts(updated);
  };

  const handleSave = async () => {
    const formattedDate = selectedDate.toISOString();
    const payloads = workouts.map(w => ({ ...w, version, date: formattedDate, targetUser: targetUserId || null }));

    try {
      const responses = await Promise.all(
        payloads.map(w =>
          fetch(`${process.env.REACT_APP_API_BASE_URL}/workouts/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(w),
          })
        )
      );

      if (responses.every(res => res.ok)) {
        alert('✅ All workouts saved!');
        onSaved();
      } else {
        alert('⚠️ Some workouts failed to save.');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error saving workouts.');
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(workouts);
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);
    setWorkouts(reordered);
  };

  return (
    <div className="cluster-create-box">
      <h2 className="form-title">📋 Create Workout Cluster</h2>

      <label>Assign to Specific User (optional)</label>
      <select value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)}>
        <option value="">-- Daily Program (default) --</option>
        {userList.map(u => (
          <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
        ))}
      </select>

      <div className="form-row">
        <label>Date:</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy"
          className="datepicker"
        />

        <label>Version:</label>
        <select value={version} onChange={(e) => setVersion(e.target.value)}>
          <option>Ultra Train</option>
          <option>Super Train</option>
          <option>Minimal Equipment</option>
          <option>Beginner</option>
        </select>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="workoutList">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="workout-block-list">
              {workouts.map((w, index) => (
                <Draggable key={index} draggableId={`w-${index}`} index={index}>
                  {(provided) => (
                    <div
                      className="workout-block"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div className="form-section">
                        <label>Workout Icon:</label>
                        <div className="icon-options">
                          {iconOptions.map(icon => (
                            <label key={icon.value} className="icon-label">
                              <input
                                type="radio"
                                name={`icon-${index}`}
                                value={icon.value}
                                checked={w.icon === icon.value}
                                onChange={(e) => handleChange(index, 'icon', e.target.value)}
                              />
                              <img src={`/icons/${icon.value}.png`} alt={icon.label} className="icon-img" />
                            </label>
                          ))}
                        </div>
                      </div>

                      <input
                        placeholder="🏷️ Title"
                        value={w.title}
                        onChange={(e) => handleChange(index, 'title', e.target.value)}
                      />
                      <textarea
                        placeholder="📝 Description"
                        rows={3}
                        value={w.description}
                        onChange={(e) => handleChange(index, 'description', e.target.value)}
                      />
                      <input
                        placeholder="⏱️ Cap Time"
                        value={w.capTime}
                        onChange={(e) => handleChange(index, 'capTime', e.target.value)}
                      />
                      <input
                        placeholder="🏷️ Custom Name"
                        value={w.customName}
                        onChange={(e) => handleChange(index, 'customName', e.target.value)}
                      />
                      <textarea
                        placeholder="📋 Instructions"
                        rows={3}
                        value={w.instructions}
                        onChange={(e) => handleChange(index, 'instructions', e.target.value)}
                      />
                      {index > 0 && (
                        <button className="remove-btn" onClick={() => handleRemove(index)}>🗑️ Remove</button>
                      )}
                      <hr />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="action-buttons">
        <button onClick={handleAddWorkout}>➕ Add Another Workout</button>
        <button className="save-btn" onClick={handleSave}>💾 Save All</button>
      </div>
    </div>
  );
};

export default ClusterCreateForm;
