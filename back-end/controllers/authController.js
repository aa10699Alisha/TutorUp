const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * POST /api/auth/student/signup
 * Student registration
 */
const studentSignup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    const [existingStudents] = await pool.query(
      'SELECT StudentID FROM Student WHERE Email = ?',
      [email]
    );

    if (existingStudents.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO Student (FullName, Email, HashedPassword, DateJoined) VALUES (?, ?, ?, CURDATE())',
      [fullName, email, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: {
        StudentID: result.insertId,
        fullName,
        email,
        userType: 'student'
      }
    });
  } catch (error) {
    console.error('Student signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
};

/**
 * POST /api/auth/tutor/signup
 * Tutor registration
 */
const tutorSignup = async (req, res) => {
  try {
    const { fullName, email, password, bio, experienceYears } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      });
    }

    const [existingTutors] = await pool.query(
      'SELECT TutorID FROM Tutor WHERE Email = ?',
      [email]
    );

    if (existingTutors.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO Tutor (FullName, Email, HashedPassword, Bio, ExperienceYears, RatingAverage) VALUES (?, ?, ?, ?, ?, 0.00)',
      [fullName, email, hashedPassword, bio || '', experienceYears || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Tutor registered successfully',
      data: {
        TutorID: result.insertId,
        fullName,
        email,
        userType: 'tutor'
      }
    });
  } catch (error) {
    console.error('Tutor signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
};

/**
 * POST /api/auth/student/signin
 * Student login
 */
const studentSignin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const [students] = await pool.query(
      'SELECT StudentID, FullName, Email, HashedPassword FROM Student WHERE Email = ?',
      [email]
    );

    if (students.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const student = students[0];
    const passwordMatch = await bcrypt.compare(password, student.HashedPassword);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        StudentID: student.StudentID,
        fullName: student.FullName,
        email: student.Email,
        userType: 'student'
      }
    });
  } catch (error) {
    console.error('Student signin error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

/**
 * POST /api/auth/tutor/signin
 * Tutor login
 */
const tutorSignin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const [tutors] = await pool.query(
      'SELECT TutorID, FullName, Email, HashedPassword FROM Tutor WHERE Email = ?',
      [email]
    );

    if (tutors.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const tutor = tutors[0];
    const passwordMatch = await bcrypt.compare(password, tutor.HashedPassword);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        TutorID: tutor.TutorID,
        fullName: tutor.FullName,
        email: tutor.Email,
        userType: 'tutor'
      }
    });
  } catch (error) {
    console.error('Tutor signin error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

module.exports = {
  studentSignup,
  tutorSignup,
  studentSignin,
  tutorSignin
};
