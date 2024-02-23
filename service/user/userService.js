const express = require('express');
const mysql = require('mysql');
const amqp = require('amqplib');

const app = express();
const port = 3002;

// MySQL connection configuration
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'attendance'
  });

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database as id ' + connection.threadId);
});

// API endpoint to fetch users along with their check-ins for today
app.get('/users', (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  const sql = `SELECT id, name, email, check_in_time_today FROM users `;
  connection.query(sql, [today], (error, results) => {
    if (error) {
      console.error('Error fetching users from database: ' + error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(results);
  });
});

// Connect to RabbitMQ
amqp.connect('amqp://localhost').then((connection) => {
  return connection.createChannel();
}).then((channel) => {
  const exchange = 'attendance_exchange';
  const queue = 'attendance_queue';
  const key = 'attendance_key';

  // Consume messages from the queue
  channel.consume(queue, async (msg) => {
    const attendanceData = JSON.parse(msg.content.toString());
    console.log(attendanceData);
    const userId = attendanceData.userId;
    const checkInTime = attendanceData.timestamp;

    // Update the clock-in time for the user in the database
    const sql = `UPDATE users SET check_in_time_today = ? WHERE id = ?`;
    connection.query(sql, [checkInTime, userId], (error, results) => {
      if (error) {
        console.error('Error updating clock-in time: ' + error);
        return;
      }
      console.log(`Clock-in time updated for user ${userId}`);
    });

    channel.ack(msg); // Acknowledge the message
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(`User service listening at http://localhost:${port}`);
});
