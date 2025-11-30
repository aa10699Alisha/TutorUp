// import and instantiate express
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// Middleware
app.use(
  morgan("dev", { skip: (req, res) => process.env.NODE_ENV === "test" })
);

// CORS configuration for production deployment
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Import routes
const authRoutes = require("./routes/auth");
const tutorsRoutes = require("./routes/tutors");
const coursesRoutes = require("./routes/courses");
const bookingsRoutes = require("./routes/bookings");
const slotsRoutes = require("./routes/slots");
const studentsRoutes = require("./routes/students");
const healthRoutes = require("./routes/health");

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tutors", tutorsRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/slots", slotsRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/health", healthRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "TutorUp Backend API - Peer Tutoring Sessions Database",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      tutors: "/api/tutors",
      courses: "/api/courses",
      bookings: "/api/bookings",
      slots: "/api/slots",
      students: "/api/students"
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error"
  });
});

module.exports = app;
