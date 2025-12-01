const express = require('express');
const router = express.Router();
const {
  studentSignup,
  studentSignin,
  tutorSignin
} = require('../controllers/authController');

// Student authentication
router.post('/student/signup', studentSignup);
router.post('/student/signin', studentSignin);

// Tutor authentication
// Note: Tutors cannot sign up - they are created by admins
router.post('/tutor/signin', tutorSignin);

module.exports = router;
