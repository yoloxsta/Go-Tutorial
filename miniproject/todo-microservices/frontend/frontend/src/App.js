import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      loadTodos();
    }
  }, [isLoggedIn]);

  const loadTodos = () => {
    axios.get('http://localhost:8082/todos')
      .then(res => setTodos(res.data))
      .catch(err => console.error('Failed to fetch todos:', err));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8081/login', { username, password })
      .then(() => setIsLoggedIn(true))
      .catch(() => alert('Login failed! Use: admin / password'));
  };

  const addTodo = () => {
    if (!title.trim()) return;
    axios.post('http://localhost:8082/todos', { title, done: false })
      .then(() => {
        setTitle('');
        loadTodos();
      });
  };

  const toggleDone = (todo) => {
    const updated = { ...todo, done: !todo.done };
    axios.put(`http://localhost:8082/todos/${todo.id}`, updated)
      .then(() => loadTodos());
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.title);
  };

  const saveEdit = (id) => {
    // Preserve current `done` state when editing title only
    const currentTodo = todos.find(t => t.id === id);
    axios.put(`http://localhost:8082/todos/${id}`, { title: editText, done: currentTodo.done })
      .then(() => {
        setEditingId(null);
        loadTodos();
      });
  };

  const deleteTodo = (id) => {
    if (window.confirm('Delete this todo?')) {
      axios.delete(`http://localhost:8082/todos/${id}`)
        .then(() => loadTodos());
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <h2 style={styles.loginTitle}>My Todo List</h2>
          <form onSubmit={handleLogin} style={styles.form}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.button}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1 style={styles.title}>My Todo List</h1>
        <button onClick={() => setIsLoggedIn(false)} style={styles.logoutBtn}>
          Logout
        </button>
      </header>

      <div style={styles.inputSection}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          style={styles.todoInput}
        />
        <button onClick={addTodo} style={styles.addButton}>Add</button>
      </div>

      <ul style={styles.todoList}>
        {todos.map(todo => (
          <li key={todo.id} style={styles.todoItem}>
            {editingId === todo.id ? (
              <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                <input
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  style={{ ...styles.todoInput, fontSize: '0.95rem', padding: '6px' }}
                  autoFocus
                />
                <button onClick={() => saveEdit(todo.id)} style={{ ...styles.button, padding: '6px 10px', fontSize: '0.9rem' }}>
                  Save
                </button>
              </div>
            ) : (
              <>
                <label style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => toggleDone(todo)}
                    style={{ marginRight: '10px', transform: 'scale(1.2)' }}
                  />
                  <span style={{
                    textDecoration: todo.done ? 'line-through' : 'none',
                    color: todo.done ? '#888' : '#333',
                  }}>
                    {todo.title}
                  </span>
                </label>
                <button onClick={() => startEdit(todo)} style={styles.editBtn}>✏️</button>
                <button onClick={() => deleteTodo(todo.id)} style={styles.deleteBtn}>🗑️</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {todos.length === 0 && (
        <p style={{ textAlign: 'center', color: '#888', marginTop: '30px' }}>
          No todos yet. Add one above!
        </p>
      )}
    </div>
  );
}

// ✨ Styles (same as before, with minor tweaks)
const styles = {
  appContainer: { maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '2rem', color: '#2c3e50', margin: 0 },
  logoutBtn: { background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.9rem' },
  inputSection: { display: 'flex', gap: '10px', marginBottom: '24px' },
  todoInput: { flex: 1, padding: '12px', fontSize: '1rem', border: '1px solid #ddd', borderRadius: '6px', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  addButton: { padding: '12px 20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' },
  todoList: { listStyle: 'none', padding: 0, margin: 0 },
  todoItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#fff', border: '1px solid #eee', borderRadius: '6px', marginBottom: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  loginContainer: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8f9fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  loginCard: { background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '350px', textAlign: 'center' },
  loginTitle: { color: '#2c3e50', marginBottom: '24px' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  input: { padding: '12px', fontSize: '1rem', border: '1px solid #ddd', borderRadius: '6px', outline: 'none' },
  button: { padding: '12px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' },
  editBtn: { background: '#f1c40f', border: 'none', borderRadius: '4px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px' },
  deleteBtn: { background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px' },
};

export default App;