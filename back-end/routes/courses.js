const express = require('express');
const router = express.Router();
const {
  getAllMajors,
  getAllCoursesWithMajors,
  getCoursesByMajor,
  getCourseById,
  getAvailableSlotsByCourse
} = require('../controllers/coursesController');

// Course routes
router.get('/majors', getAllMajors);
router.get('/all-courses', getAllCoursesWithMajors);
router.get('/by-major/:majorId', getCoursesByMajor);
router.get('/:courseId', getCourseById);
router.get('/:courseId/slots', getAvailableSlotsByCourse);

module.exports = router;
