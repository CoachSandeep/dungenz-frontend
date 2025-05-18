import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const ClusterEditForm = ({ version, workouts, onSave, onCancel }) => {
  const [items, setItems] = useState(workouts);

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
      alert('Workouts updated!');
      onSave(); // callback
    } catch (err) {
      console.error(err);
      alert('Failed to update workouts.');
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
                        value={w.title}
                        onChange={(e) => handleChange(index, 'title', e.target.value)}
                      />
                      <textarea
                        value={w.description}
                        onChange={(e) => handleChange(index, 'description', e.target.value)}
                      />
                      <input
                        value={w.capTime || ''}
                        onChange={(e) => handleChange(index, 'capTime', e.target.value)}
                        placeholder="Cap Time"
                      />
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
        <button onClick={handleSave} className="save-btn">Save All</button>
        <button onClick={onCancel} className="cancel-btn">Cancel</button>
      </div>
    </div>
  );
};

export default ClusterEditForm;
