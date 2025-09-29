import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      axios.get('http://localhost:8082/todos')
        .then(res => setTodos(res.data))
        .catch(err => console.error('Failed to fetch todos:', err));
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8081/login', { username, password })
      .then(() => setIsLoggedIn(true))
      .catch(err => {
        alert('Login failed! Check credentials or console.');
        console.error('Login error:', err);
      });
  };

  const addTodo = () => {
    if (!title.trim()) return;
    axios.post('http://localhost:8082/todos', { title, done: false })
      .then(res => {
        setTodos([...todos, res.data]);
        setTitle('');
      })
      .catch(err => console.error('Add todo error:', err));
  };

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ width: '100%', padding: '8px', margin: '5px 0' }}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '8px', margin: '5px 0' }}
            />
          </div>
          <button type="submit" style={{ padding: '8px 16px' }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Todo List</h1>
      <div style={{ marginBottom: '20px' }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="New todo"
          style={{ padding: '8px', width: '70%' }}
        />
        <button onClick={addTodo} style={{ padding: '8px 12px', marginLeft: '10px' }}>
          Add
        </button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
            <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
              {todo.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;