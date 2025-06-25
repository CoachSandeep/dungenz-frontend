import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './../../styles/MovementInput.css';

const ClusterEditForm = ({ version, workouts, onSave, onCancel }) => {
  const [items, setItems] = useState(workouts);
  const [library, setLibrary] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newMovement, setNewMovement] = useState('');
  const [newLink, setNewLink] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/movements`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setLibrary(data);
      } catch (err) {
        console.error('Error loading library:', err);
      }
    };
    fetchLibrary();
  }, [token]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    setItems(newItems);
  };

  const handleChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    try {
      await Promise.all(
        updatedItems.map((w) =>
          fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/workouts/${w._id}/edit`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(w),
          })
        )
      );
      alert('✅ Workouts updated!');
      onSave();
    } catch (err) {
      console.error(err);
      alert('❌ Failed to update workouts.');
    }
  };

  const handleAddMovement = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/movements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newMovement, youtubeUrl: newLink }),
      });
      if (res.ok) {
        const updatedLibrary = [...library, { name: newMovement, youtubeUrl: newLink }];
        setLibrary(updatedLibrary);
        setShowModal(false);
        setNewMovement('');
        setNewLink('');
      }
    } catch (err) {
      console.error('Failed to add new movement:', err);
    }
  };

  return (
    <div className="cluster-edit-box">
      <h3>Edit {version} Workouts</h3>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="cluster">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((w, index) => (
                <Draggable key={w._id} draggableId={w._id} index={index}>
                  {(provided) => (
                    <div
                      className="cluster-item"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <input
                        value={w.customName || ''}
                        placeholder="Custom Name"
                        onChange={(e) => handleChange(index, 'customName', e.target.value)}
                      />
                      <input
                        value={w.title}
                        placeholder="Title"
                        onChange={(e) => handleChange(index, 'title', e.target.value)}
                      />
                      <textarea
                        rows={4}
                        value={w.description}
                        placeholder="Description"
                        onChange={(e) => handleChange(index, 'description', e.target.value)}
                        style={{ minHeight: '250px' }}
                      />
                      <textarea
                        rows={3}
                        value={w.instructions || ''}
                        placeholder="Instructions"
                        onChange={(e) => handleChange(index, 'instructions', e.target.value)}
                        style={{ minHeight: '150px' }}
                      />
                      <input
                        value={w.capTime || ''}
                        onChange={(e) => handleChange(index, 'capTime', e.target.value)}
                        placeholder="Cap Time (in mins)"
                      />
                      
                      <input
                        placeholder="Movements (comma separated)"
                        value={w.movements?.join(', ') || ''}
                        onChange={(e) => handleChange(index, 'movements', e.target.value.split(',').map(m => m.trim()))}
                      />
                      <div className="movement-tags">
                        {(w.movements || []).map((m, i) => {
                          const exists = library.some(l => l.name.toLowerCase() === m.toLowerCase());
                          return (
                            <span key={i} className="tag">
                              {m} {!exists && (
                                <span className="add-icon" onClick={() => {
                                  setNewMovement(m);
                                  setShowModal(true);
                                }}>➕</span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleSave} className="save-btn">💾 Save All</button>
        <button onClick={onCancel} className="cancel-btn">❌ Cancel</button>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h4>Add Movement</h4>
            <p><strong>{newMovement}</strong></p>
            <input
              type="text"
              placeholder="YouTube Link"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
            />
            <button onClick={handleAddMovement}>Save</button>
            <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClusterEditForm;
