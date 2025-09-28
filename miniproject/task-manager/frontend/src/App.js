import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const DAYS = [
  { key: 'monday', name: 'Monday', color: '#ff2d75' },
  { key: 'tuesday', name: 'Tuesday', color: '#4ecdc4' },
  { key: 'wednesday', name: 'Wednesday', color: '#ffd166' },
  { key: 'thursday', name: 'Thursday', color: '#9d4edd' },
  { key: 'friday', name: 'Friday', color: '#06d6a0' },
  { key: 'saturday', name: 'Saturday', color: '#ff6b6b' },
  { key: 'sunday', name: 'Sunday', color: '#118ab2' }
];

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedDay, setSelectedDay] = useState('monday');
  const [loading, setLoading] = useState(true);
  const [dragOverDay, setDragOverDay] = useState(null);
  const [deletingTasks, setDeletingTasks] = useState(new Set());
  const [togglingTasks, setTogglingTasks] = useState(new Set());
  
  const todayKey = new Date().toLocaleDateString('en-us', { weekday: 'long' }).toLowerCase();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    setLoading(true);
    axios.get('http://localhost:8080/tasks')
      .then(res => {
        setTasks(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    axios.post('http://localhost:8080/tasks', { 
      text: newTask, 
      done: false,
      day: selectedDay
    })
      .then(res => {
        setTasks([...tasks, res.data]);
        setNewTask('');
      })
      .catch(err => console.error(err));
  };

  const toggleTask = (id) => {
    if (deletingTasks.has(id) || togglingTasks.has(id)) return;
    
    // Add toggle animation
    setTogglingTasks(prev => new Set(prev).add(id));
    setTimeout(() => {
      setTogglingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 200);

    const task = tasks.find(t => t.id === id);
    axios.put(`http://localhost:8080/tasks/${id}`, { 
      ...task, 
      done: !task.done 
    })
      .then(res => {
        setTasks(tasks.map(t => t.id === id ? res.data : t));
      })
      .catch(err => console.error(err));
  };

  const deleteTask = (id) => {
    if (deletingTasks.has(id)) return;
    setDeletingTasks(prev => new Set(prev).add(id));
    
    setTimeout(() => {
      axios.delete(`http://localhost:8080/tasks/${id}`)
        .then(() => {
          setTasks(tasks.filter(t => t.id !== id));
          setDeletingTasks(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        })
        .catch(err => {
          console.error(err);
          setDeletingTasks(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        });
    }, 350);
  };

  const moveTask = (taskId, newDay) => {
    if (deletingTasks.has(taskId)) return;
    const task = tasks.find(t => t.id === taskId);
    axios.put(`http://localhost:8080/tasks/${taskId}`, { 
      ...task, 
      day: newDay 
    })
      .then(res => {
        setTasks(tasks.map(t => t.id === taskId ? res.data : t));
        setDragOverDay(null);
      })
      .catch(err => console.error(err));
  };

  const tasksByDay = DAYS.reduce((acc, day) => {
    acc[day.key] = tasks.filter(task => task.day === day.key);
    return acc;
  }, {});

  return (
    <div className="app-container">
      <div className="header">
        <h1>✨ Weekly Planner</h1>
        <p>Monday to Sunday • {tasks.length} tasks</p>
      </div>

      <div className="content">
        <div className="input-group">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add an animated task! 🎯"
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
            {DAYS.map(day => (
              <option key={day.key} value={day.key}>{day.name}</option>
            ))}
          </select>
          <button onClick={addTask}>Add ✨</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="week-grid">
            {DAYS.map(day => (
              <div 
                key={day.key}
                className={`day-card ${day.key === todayKey ? 'today' : ''} ${dragOverDay === day.key ? 'drag-over' : ''}`}
                style={{ '--day-color': day.color }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverDay(day.key);
                }}
                onDragLeave={() => setDragOverDay(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId = parseInt(e.dataTransfer.getData('taskId'));
                  moveTask(taskId, day.key);
                }}
              >
                <div className="day-header">{day.name}</div>
                <div style={{ flex: 1 }}>
                  {tasksByDay[day.key].map(task => (
                    <div 
                      key={task.id}
                      className={`task-item 
                        ${deletingTasks.has(task.id) ? 'delete-animation' : ''} 
                        ${togglingTasks.has(task.id) ? 'toggle-animation' : ''} 
                        ${task.done ? 'done' : ''}`}
                      style={{ 
                        opacity: deletingTasks.has(task.id) ? 0.7 : 1,
                        pointerEvents: deletingTasks.has(task.id) ? 'none' : 'auto'
                      }}
                      draggable={!deletingTasks.has(task.id)}
                      onDragStart={(e) => {
                        if (!deletingTasks.has(task.id)) {
                          e.dataTransfer.setData('taskId', task.id.toString());
                        }
                      }}
                    >
                      <span 
                        style={{ 
                          flex: 1, 
                          textDecoration: task.done ? 'line-through' : 'none',
                          color: task.done ? '#999' : 'inherit',
                          cursor: 'pointer'
                        }}
                        onClick={() => toggleTask(task.id)}
                      >
                        {task.text}
                      </span>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#ef4444', 
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                          opacity: deletingTasks.has(task.id) ? 0.3 : 1
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {tasksByDay[day.key].length === 0 && (
                    <div className="empty-placeholder">
                      {day.name === 'Sunday' ? '🌞 Sunday vibes!' : 'Drag tasks here'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;