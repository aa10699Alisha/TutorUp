#!/usr/bin/env node
require("dotenv").config();
const server = require("./app");
const { testConnection } = require("./config/database");

const port = process.env.PORT || 3001;

let listener;

async function startServer() {
  // Test database connection
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.error("Failed to connect to database. Server will not start.");
    process.exit(1);
  }

  listener = server.listen(port, function () {
    console.log(`\nTutorUp Server running on port: ${port}`);
    console.log(`Available APIs:`);
    console.log(`  - Auth:     http://localhost:${port}/api/auth`);
    console.log(`  - Tutors:   http://localhost:${port}/api/tutors`);
    console.log(`  - Courses:  http://localhost:${port}/api/courses`);
    console.log(`  - Bookings: http://localhost:${port}/api/bookings`);
    console.log(`  - Slots:    http://localhost:${port}/api/slots`);
    console.log(`  - Students: http://localhost:${port}/api/students`);
    console.log(`\n`);
  });
}

const close = () => {
  if (listener) {
    listener.close();
  }
};

module.exports = { close };

startServer();
