const jwt = require('jsonwebtoken');
const db = require('../db');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    const user = rows[0];
    if (!user || user.status === 'blocked') return res.sendStatus(403);
    req.user = user;
    next();
  } catch (err) {
    res.sendStatus(403);
  }
};

module.exports = { authenticateToken };
