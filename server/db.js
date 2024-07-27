const mysql = require('mysql2');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '6909169anton',
  database: 'task4_users'
});

module.exports = pool.promise();
