// attendanceService.js

const amqp = require('amqplib');
const express = require('express');
const mysql = require('mysql');

const app = express();
app.use(express.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'attendance'
});

connection.connect();

const QUEUE_NAME = 'attendance_queue';

app.post('/attendance', (req, res) => {
  const { userId, timestamp } = req.body;

  if (!userId || !timestamp) {
    return res.status(400).send('Missing required fields');
  }

  const sql = 'INSERT INTO attendance (user_id, timestamp) VALUES (?, ?)';
  connection.query(sql, [userId, timestamp], (err, result) => {
    if (err) {
      console.error('Error saving attendance:', err);
      return res.status(500).send('Error saving attendance');
    }

    const attendanceData = { userId, timestamp };
    publishToQueue(attendanceData);
    res.status(200).send('Attendance recorded successfully');
  });
});

async function publishToQueue(data) {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME);
    await channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(data)));

    console.log('Attendance data published to the queue');
  } catch (error) {
    console.error('Error publishing attendance data:', error);
  }
}

// Connect to RabbitMQ
amqp.connect('amqp://localhost').then((connection) => {
  return connection.createChannel();
}).then((channel) => {
  const exchange = 'attendance_exchange';
  const key = 'attendance_key';

  // Ensure the exchange exists
  channel.assertExchange(exchange, 'direct', { durable: false });

  // API endpoint to publish attendance data
  app.post('/attendance', async (req, res) => {
    const attendanceData = req.body;

    // Publish attendance data to the exchange
    channel.publish(exchange, key, Buffer.from(JSON.stringify(attendanceData)));

    res.sendStatus(200);
  });
});


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Attendance microservice listening on port ${PORT}`);
});
