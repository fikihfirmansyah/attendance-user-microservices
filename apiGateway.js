const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const ATTENDANCE_SERVICE_URL = 'http://localhost:3001/attendance';
const USER_SERVICE_URL = 'http://localhost:3002/users';

app.post('/attendance', async (req, res) => {
  try {
    const { userId, timestamp } = req.body;
    await axios.post(ATTENDANCE_SERVICE_URL, { userId, timestamp });
    res.status(200).send('Attendance recorded successfully');
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).send('Error recording attendance');
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await axios.get(USER_SERVICE_URL);
    res.status(200).json(users.data);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Error fetching users');
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
