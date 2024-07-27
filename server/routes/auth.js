const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

// Маршрут для регистрации
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const currentTime = new Date();

    const query = 'INSERT INTO users (name, email, password, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)';
    await db.execute(query, [name, email, password, 'active', currentTime, currentTime]);

    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Маршрут для логина
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      console.log('User not found:', email);
      return res.status(404).send({ message: 'User not found' });
    }

    if (user.status === 'blocked') {
      return res.status(403).send({ message: 'User is blocked' });
    }

    console.log('User found:', user);
    console.log('User password in DB:', user.password);
    console.log('Password provided:', password);

    if (password !== user.password) {
      console.log('Invalid credentials for user:', email);
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    const currentTime = new Date();
    await db.execute('UPDATE users SET updated_at = ? WHERE id = ?', [currentTime, user.id]);

    const token = jwt.sign({ id: user.id, email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });
    res.send({ token });
    //res.send({ token: 'token', userId: user.id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

module.exports = router;