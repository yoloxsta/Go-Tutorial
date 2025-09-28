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

  // ✨ Modern UI Styles (no Tailwind, no CSS file needed!)
  const styles = {
    app: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)',
      padding: '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    container: {
      maxWidth: '500px',
      margin: '0 auto',
      backgroundColor: '#fff',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
      overflow: 'hidden',
    },
    header: {
      background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
      color: 'white',
      padding: '1.5rem',
      textAlign: 'center',
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '700',
      margin: 0,
    },
    stats: {
      fontSize: '0.95rem',
      opacity: 0.9,
      marginTop: '0.4rem',
    },
    content: {
      padding: '1.5rem',
    },
    inputGroup: {
      display: 'flex',
      gap: '0.75rem',
      marginBottom: '1.5rem',
    },
    input: {
      flex: 1,
      padding: '0.85rem 1rem',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '1rem',
      transition: 'border-color 0.2s',
    },
    inputFocus: {
      borderColor: '#818cf8',
      outline: 'none',
    },
    addButton: {
      backgroundColor: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '0.85rem 1.25rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background 0.2s, transform 0.1s',
    },
    addButtonHover: {
      backgroundColor: '#4338ca',
      transform: 'scale(1.03)',
    },
    taskItem: (isDone) => ({
      display: 'flex',
      alignItems: 'center',
      padding: '1rem',
      marginBottom: '0.75rem',
      backgroundColor: isDone ? '#f0fdf4' : '#ffffff',
      border: isDone ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
      borderRadius: '12px',
      transition: 'all 0.2s',
    }),
    checkbox: (isDone) => ({
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      border: isDone ? 'none' : '2px solid #cbd5e1',
      backgroundColor: isDone ? '#10b981' : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '1rem',
      cursor: 'pointer',
    }),
    taskText: (isDone) => ({
      flex: 1,
      fontSize: '1.05rem',
      color: isDone ? '#6b7280' : '#1e293b',
      textDecoration: isDone ? 'line-through' : 'none',
      cursor: 'pointer',
    }),
    deleteButton: {
      background: 'none',
      border: 'none',
      color: '#ef4444',
      fontSize: '1.2rem',
      cursor: 'pointer',
      marginLeft: '0.5rem',
      opacity: 0.7,
      transition: 'opacity 0.2s',
    },
    emptyState: {
      textAlign: 'center',
      padding: '2rem 1rem',
      color: '#94a3b8',
    },
    spinner: {
      width: '24px',
      height: '24px',
      border: '3px solid rgba(124, 58, 237, 0.2)',
      borderTop: '3px solid #7c3aed',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    '@keyframes spin': {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
  };

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>✨ Task Manager</h1>
          <p style={styles.stats}>
            {totalCount} tasks • {completedCount} done
          </p>
        </div>

        <div style={styles.content}>
          <div style={styles.inputGroup}>
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#818cf8'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
            <button
              onClick={addTask}
              style={styles.addButton}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.addButtonHover)}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4f46e5'}
            >
              Add
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={styles.spinner} />
            </div>
          ) : tasks.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <p>No tasks yet! Add your first one.</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} style={styles.taskItem(task.done)}>
                <div
                  style={styles.checkbox(task.done)}
                  onClick={() => toggleTask(task.id)}
                >
                  {task.done && (
                    <span style={{ color: 'white', fontSize: '14px' }}>✓</span>
                  )}
                </div>
                <span
                  style={styles.taskText(task.done)}
                  onClick={() => toggleTask(task.id)}
                >
                  {task.text}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  style={styles.deleteButton}
                  onMouseEnter={(e) => e.target.style.opacity = '1'}
                  onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;