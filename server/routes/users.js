const express = require('express');
const db = require('../db');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, name, email, status, created_at, updated_at FROM users');
    res.send(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});


router.post('/unblock', async (req, res) => {
  const { userIds } = req.body;
  try {
    await db.query('UPDATE users SET status = ? WHERE id IN (?)', ['active', userIds]);
    res.send('Users unblocked');
  } catch (err) {
    res.status(500).send('Server error');
  }
});



router.get('/me', async (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).send('No access');
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const currentUserId = decoded.id;

    // Предположим, что у вас есть функция для получения пользователя по ID
    const [rows] = await db.query('SELECT name FROM users WHERE id = ?', [currentUserId]);

    if (rows.length === 0) {
      return res.status(404).send('User not found');
    }

    res.send({ name: rows[0].name });
  } catch (err) {
    res.status(500).send('Server error');
  }
});


router.post('/block', async (req, res) => {
  const { userIds } = req.body;

  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if(!token){
    return res.status(401).send('No access');
  }

  
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const currentUserId = decoded.id;

    await db.query('UPDATE users SET status = ? WHERE id IN (?)', ['blocked', userIds]);

    if (userIds.includes(currentUserId)) {
      return res.status(200).send({ message: 'user blocked himself', selfBlocked: true });
    }

    res.send('Users blocked');
  } catch (err) {
    res.status(500).send('Server error');
  }
});



/*router.post('/delete', async (req, res) => {
  const { userIds } = req.body;
  try {
    await db.query('DELETE FROM users WHERE id IN (?)', [userIds]);
    res.send('Users deleted');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

*/


router.post('/delete', async (req, res) => {
  const { userIds } = req.body;

  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).send('No access');
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const currentUserId = decoded.id;

    await db.query('DELETE FROM users WHERE id IN (?)', [userIds]);

    if (userIds.includes(currentUserId)) {
      return res.status(200).send({ message: 'user deleted himself', selfDeleted: true });
    }

    res.send('Users deleted');
  } catch (err) {
    res.status(500).send('Server error');
  }
});





module.exports = router;