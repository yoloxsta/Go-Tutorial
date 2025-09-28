// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

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
    axios.post('http://localhost:8080/tasks', { text: newTask, done: false })
      .then(res => {
        setTasks([...tasks, res.data]);
        setNewTask('');
      })
      .catch(err => console.error(err));
  };

  const toggleTask = (id) => {
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
    axios.delete(`http://localhost:8080/tasks/${id}`)
      .then(() => {
        setTasks(tasks.filter(t => t.id !== id));
      })
      .catch(err => console.error(err));
  };

  const completedCount = tasks.filter(t => t.done).length;
  const totalCount = tasks.length;

  return (
    <div className="app-container">
      <div className="header">
        <h1>🎨 Graffiti Tasks</h1>
        <p>{totalCount} tasks • {completedCount} done</p>
      </div>

      <div className="content">
        <div className="input-group">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a street-art task..."
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <button onClick={addTask}>Add</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div className="spinner"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">🖌️</div>
            <p>No tags yet! Add your first task.</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className={`task-item ${task.done ? 'done' : ''}`}>
              <div 
                className={`checkbox ${task.done ? 'checked' : ''}`} 
                onClick={() => toggleTask(task.id)}
              >
                {task.done && '✓'}
              </div>
              <span 
                className={`task-text ${task.done ? 'done' : ''}`}
                onClick={() => toggleTask(task.id)}
              >
                {task.text}
              </span>
              <button 
                className="delete-btn"
                onClick={() => deleteTask(task.id)}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;