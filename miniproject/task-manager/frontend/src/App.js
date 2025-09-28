import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  // Fetch tasks on load
  useEffect(() => {
    axios.get('http://localhost:8080/tasks')
      .then(res => setTasks(res.data))
      .catch(err => console.error(err));
  }, []);

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

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Task Manager</h1>
      
      {/* Add Task Form */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter new task"
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          style={{ flex: 1, padding: '8px' }}
        />
        <button onClick={addTask} style={{ padding: '8px 16px' }}>
          Add
        </button>
      </div>

      {/* Task List */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map(task => (
          <li 
            key={task.id} 
            style={{ 
              padding: '10px', 
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span 
              onClick={() => toggleTask(task.id)}
              style={{ 
                textDecoration: task.done ? 'line-through' : 'none',
                cursor: 'pointer',
                flex: 1
              }}
            >
              {task.text}
            </span>
            <button 
              onClick={() => deleteTask(task.id)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'red',
                cursor: 'pointer'
              }}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;