const { pool } = require('../config/database');

const createBooking = async (req, res) => {
  let connection;
  try {
    const { slotId, studentId } = req.body;

    if (!slotId || !studentId) {
      return res.status(400).json({
        success: false,
        error: 'SlotID and StudentID are required'
      });
    }

    // Acquire a dedicated connection for transaction/locking
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Lock the slot row to avoid race conditions when checking availability
    const [slots] = await connection.query(
      'SELECT Status FROM AvailabilitySlot WHERE SlotID = ? FOR UPDATE',
      [slotId]
    );

    if (slots.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Slot not found'
      });
    }

    if (slots[0].Status !== 'Open') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'Cannot book: slot is not Open'
      });
    }

    // Try to insert booking. Unique constraint on (StudentID, SlotID) will prevent duplicates.
    const [result] = await connection.query(
      'INSERT INTO Booking (Status, SlotID, StudentID) VALUES (?, ?, ?)',
      ['Confirmed', slotId, studentId]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        bookingId: result.insertId
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    try {
      if (connection) await connection.rollback();
    } catch (rbErr) {
      console.error('Rollback error:', rbErr);
    }

    // MySQL duplicate entry (unique constraint) -> student trying to book same slot twice
    if (
      error && (
        error.code === 'ER_DUP_ENTRY' ||
        error.errno === 1062 ||
        (error.sqlMessage && error.sqlMessage.includes('Duplicate entry'))
      )
    ) {
      return res.status(409).json({
        success: false,
        error: 'You cannot book the same slot twice'
      });
    }

    if (error.message && error.message.includes('slot is not Open')) {
      return res.status(400).json({
        success: false,
        error: 'Cannot book: slot is not Open'
      });
    }

    res.status(500).json({
      success: false,
      error: 'You have already booked this slot!'
    });
  } finally {
    if (connection) connection.release();
  }
};

const cancelBooking = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { bookingId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'StudentID is required'
      });
    }

    await connection.beginTransaction();

    await connection.query(
      'CALL cancel_booking(?, ?)',
      [bookingId, studentId]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Cancel booking error:', error);

    if (error.message && error.message.includes('not found or not Confirmed')) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found or not Confirmed for this student'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error while cancelling booking'
    });
  } finally {
    connection.release();
  }
};

const getStudentUpcomingSessions = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { sort } = req.query;

    const [sessions] = await pool.query(
      'CALL GetStudentSessions(?, ?)',
      [studentId, sort || 'date']
    );

    res.status(200).json({
      success: true,
      count: sessions[0].length,
      data: sessions[0]
    });
  } catch (error) {
    console.error('Get student upcoming sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching sessions'
    });
  }
};

const getStudentPastSessions = async (req, res) => {
  try {
    const { studentId } = req.params;

    const [sessions] = await pool.query(
      `SELECT b.BookingID,
              b.Status,
              s.Date,
              s.StartTime,
              c.CourseName,
              t.FullName AS TutorName,
              r.Rating,
              r.Comment
       FROM Booking b
       JOIN AvailabilitySlot s ON b.SlotID = s.SlotID
       JOIN Course c ON s.CourseID = c.CourseID
       JOIN Tutor t ON s.TutorID = t.TutorID
       LEFT JOIN Review r ON b.BookingID = r.BookingID
       WHERE b.StudentID = ? AND s.Date < CURDATE()
       ORDER BY s.Date DESC, s.StartTime DESC`,
      [studentId]
    );

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    console.error('Get student past sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching past sessions'
    });
  }
};

const getTutorUpcomingSessions = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { sort } = req.query;

    const [sessions] = await pool.query(
      'CALL GetTutorUpcomingSessions(?, ?)',
      [tutorId, sort || 'time']
    );

    res.status(200).json({
      success: true,
      count: sessions[0].length,
      data: sessions[0]
    });
  } catch (error) {
    console.error('Get tutor upcoming sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching sessions'
    });
  }
};

const getTutorPastSessions = async (req, res) => {
  try {
    const { tutorId } = req.params;

    const [sessions] = await pool.query(
      `SELECT 
          b.BookingID,
          s.Date,
          s.StartTime,
          s.Location,
          c.CourseName,
          st.FullName AS StudentName,
          a.Attended AS AttendedStatus,     
          r.Rating,
          r.Comment
       FROM Booking b
       JOIN AvailabilitySlot s ON b.SlotID = s.SlotID
       JOIN Course c ON s.CourseID = c.CourseID
       JOIN Student st ON b.StudentID = st.StudentID
       LEFT JOIN Attendance a ON b.BookingID = a.BookingID   
       LEFT JOIN Review r ON b.BookingID = r.BookingID
       WHERE s.TutorID = ? AND s.Date < CURDATE()
       ORDER BY s.Date DESC, s.StartTime DESC`,
      [tutorId]
    );

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    console.error('Get tutor past sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching past sessions'
    });
  }
};

module.exports = {
  createBooking,
  cancelBooking,
  getStudentUpcomingSessions,
  getStudentPastSessions,
  getTutorUpcomingSessions,
  getTutorPastSessions
};
