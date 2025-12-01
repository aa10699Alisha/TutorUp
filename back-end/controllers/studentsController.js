// studentsController.js
// This controller manages student profile and account operations

const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

const getStudentProfile = async (req, res) => {
  try {
    const { studentId } = req.params;

    const [students] = await pool.query(
      `SELECT 
          s.FullName AS name,
          s.Email AS email,
          YEAR(s.DateJoined) AS joined_year,
          s.DateJoined
       FROM Student s
       WHERE s.StudentID = ?`,
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: students[0]
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching student profile'
    });
  }
};

const updateStudentPassword = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    const [students] = await pool.query(
      'SELECT HashedPassword FROM Student WHERE StudentID = ?',
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, students[0].HashedPassword);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE Student SET HashedPassword = ? WHERE StudentID = ?',
      [newHashedPassword, studentId]
    );

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update student password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating password'
    });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { attended } = req.body;

    if (!attended || !['Yes', 'No'].includes(attended)) {
      return res.status(400).json({
        success: false,
        error: 'Attended status must be "Yes" or "No"'
      });
    }

    await pool.query(
      'UPDATE Attendance SET Attended = ?, MarkedAt = NOW() WHERE BookingID = ?',
      [attended, bookingId]
    );

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully'
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while marking attendance'
    });
  }
};

const submitReview = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    const [attendance] = await pool.query(
      'SELECT Attended FROM Attendance WHERE BookingID = ?',
      [bookingId]
    );

    if (attendance.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      });
    }

    if (attendance[0].Attended !== 'Yes') {
      return res.status(400).json({
        success: false,
        error: 'Cannot review: student did not attend this session'
      });
    }

    const [existingReview] = await pool.query(
      'SELECT BookingID FROM Review WHERE BookingID = ?',
      [bookingId]
    );

    if (existingReview.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Review already submitted for this booking'
      });
    }

    await pool.query(
      'INSERT INTO Review (BookingID, Rating, Comment, ReviewDate) VALUES (?, ?, ?, NOW())',
      [bookingId, rating, comment || '']
    );

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully'
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while submitting review'
    });
  }
};

const deleteStudentAccount = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { studentId } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required to delete account'
      });
    }

    await connection.beginTransaction();

    const [students] = await connection.query(
      'SELECT HashedPassword FROM Student WHERE StudentID = ?',
      [studentId]
    );

    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    const passwordMatch = await bcrypt.compare(password, students[0].HashedPassword);

    if (!passwordMatch) {
      await connection.rollback();
      return res.status(401).json({
        success: false,
        error: 'Password is incorrect'
      });
    }

    await connection.query(
      'DELETE FROM Review WHERE BookingID IN (SELECT BookingID FROM Booking WHERE StudentID = ?)',
      [studentId]
    );

    await connection.query(
      'DELETE FROM Attendance WHERE BookingID IN (SELECT BookingID FROM Booking WHERE StudentID = ?)',
      [studentId]
    );

    await connection.query(
      'DELETE FROM Booking WHERE StudentID = ?',
      [studentId]
    );

    await connection.query(
      'DELETE FROM StudentCourse WHERE StudentID = ?',
      [studentId]
    );

    await connection.query(
      'DELETE FROM Student WHERE StudentID = ?',
      [studentId]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Delete student account error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting account'
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  getStudentProfile,
  updateStudentPassword,
  markAttendance,
  submitReview,
  deleteStudentAccount
};
