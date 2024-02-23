# Attendance and User Microservices

This project consists of three microservices: API Gateway, Attendance Service, and User Service. The API Gateway acts as a central point for handling incoming requests and routing them to the appropriate microservices. The Attendance Service records attendance data and publishes it to a message queue. The User Service listens for messages from the queue and updates the check-in time for users in the database.

### API Gateway
- The API Gateway provides endpoints for recording attendance and fetching users along with their check-ins for today.
- The attendance endpoint accepts a POST request to record attendance for a user.
- The users endpoint accepts a GET request to fetch users along with their check-ins for today.

### Attendance Service
- The Attendance Service records attendance by receiving POST requests from the API Gateway.
- It publishes attendance data to RabbitMQ after recording it in the database.

### User Service
- The User Service fetches users from the database and updates their clock-in time based on attendance records received from RabbitMQ.
- It listens for messages from RabbitMQ and updates the clock-in time for users accordingly.

## Prerequisites

- Node.js
- Docker (for running RabbitMQ)
- Express.js - Web framework for Node.js
- MySQL - MySQL database driver
- AMQP - Library for working with RabbitMQ

## Project Structure

- `apiGateway.js`: API Gateway service
- `attendanceService.js`: Attendance microservice
- `userService.js`: User microservice

## Running the Services

### 1. Start RabbitMQ Container

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq
```

### 2. Create Table
```sql
CREATE TABLE `attendance` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `user_id` int(11) NOT NULL,
 `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1

users	CREATE TABLE `users` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `name` varchar(32) DEFAULT NULL,
 `email` varchar(32) DEFAULT NULL,
 `check_in_time_today` datetime DEFAULT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1
```

### 3. Install Dependencies
```bash
(in root folder)
npm install 

cd service/attendance
npm install
cd ..

cd user
npm install
```

### 4. Run Services
```bash
# Run API Gateway
cd 
node apiGateway.js

# Run Attendance Service
cd service/attendance
node attendanceService.js

# Run User Service
cd service/user
node userService.js
```

## Usage

### 1. Recording Attendance
To record attendance, send a POST request to the API Gateway endpoint /attendance with the following JSON payload:

```json
{
  "userId": "user_id_here",
  "timestamp": "current_timestamp_here"
}
```

### 2. Fetching Users
To fetch users along with their check-ins for today, send a GET request to the API Gateway endpoint /users.

### License
This project is licensed under the MIT License - see the LICENSE file for details.

