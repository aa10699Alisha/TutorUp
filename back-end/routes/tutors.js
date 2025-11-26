const express = require('express');
const router = express.Router();
const {
  getTutorById,
  getTutorProfile,
  updateTutorProfile
} = require('../controllers/tutorsController');

const { markAttendanceAsTutor } = require('../controllers/tutorAttendanceController');

// Tutor routes
router.get('/:tutorId', getTutorById);
router.get('/:tutorId/profile', getTutorProfile);
router.put('/:tutorId/profile', updateTutorProfile);

// Tutor marks attendance for a student in a slot/session
router.put('/attendance', markAttendanceAsTutor);

module.exports = router;
