// bookingsController.js
// This controller manages booking operations for students and tutors 
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

    // Fetch the slot date/time so we can check for overlaps
    const [slots] = await connection.query(
      'SELECT Status, Date, StartTime, EndTime, TutorID, CourseID FROM AvailabilitySlot WHERE SlotID = ? FOR UPDATE',
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

    // Prevent overlapping bookings for the same student.
    const slot = slots[0];
    const slotDate = slot.Date; // format 'YYYY-MM-DD'
    const slotStart = slot.StartTime; // time string 'HH:MM:SS'
    const slotEnd = slot.EndTime;
  const slotTutorId = slot.TutorID;
  const slotCourseId = slot.CourseID;

    // Acquire a named lock for this student (timeout 5 seconds)
    const lockName = `student_booking_${studentId}`;
    const [lockRows] = await connection.query('SELECT GET_LOCK(?, 5) AS got_lock', [lockName]);
    const gotLock = lockRows && lockRows[0] && lockRows[0].got_lock;
    if (!gotLock) {
      await connection.rollback();
      return res.status(503).json({ success: false, error: 'Server busy; please try again' });
    }

    try {
      // 1. Check for duplicate booking (same slot) FIRST
      const [existingBookings] = await connection.query(
        'SELECT BookingID, Status FROM Booking WHERE StudentID = ? AND SlotID = ?',
        [studentId, slotId]
      );
      const confirmedBooking = existingBookings.find(b => b.Status === 'Confirmed');
      if (confirmedBooking) {
        await connection.query('SELECT RELEASE_LOCK(?)', [lockName]);
        await connection.rollback();
        return res.status(409).json({
          success: false,
          error: 'You have already booked this session.'
        });
      }
      // If there's a cancelled booking for this same slot, delete it to allow rebooking
      const cancelledBooking = existingBookings.find(b => b.Status === 'Cancelled');
      if (cancelledBooking) {
        await connection.query('DELETE FROM Booking WHERE BookingID = ?', [cancelledBooking.BookingID]);
      }

      // 2. Block if the existing confirmed booking is with the same tutor AND same course on the same date (regardless of time)
      if (slotTutorId) {
        const [sameTutorSameCourse] = await connection.query(
          `SELECT b.BookingID
           FROM Booking b
           JOIN AvailabilitySlot s ON b.SlotID = s.SlotID
           WHERE b.StudentID = ?
             AND b.Status = 'Confirmed'
             AND s.TutorID = ?
             AND s.Date = ?
             AND s.CourseID = ?`,
          [studentId, slotTutorId, slotDate, slotCourseId]
        );
        if (sameTutorSameCourse.length > 0) {
          await connection.query('SELECT RELEASE_LOCK(?)', [lockName]);
          await connection.rollback();
          return res.status(409).json({
            success: false,
            error: 'You cannot attend the same course tutoring more than once on the same day.'
          });
        }
      }

      // 3. Find any confirmed bookings for this student that overlap the same date/time
      // Overlap condition: NOT (existing.EndTime <= new.StartTime OR existing.StartTime >= new.EndTime)
      const [overlaps] = await connection.query(
        `SELECT b.BookingID, b.Status, s.Date, s.StartTime, s.EndTime
         FROM Booking b
         JOIN AvailabilitySlot s ON b.SlotID = s.SlotID
         WHERE b.StudentID = ?
           AND b.Status = 'Confirmed'
           AND s.Date = ?
           AND NOT (s.EndTime <= ? OR s.StartTime >= ?)`,
        [studentId, slotDate, slotStart, slotEnd]
      );

      if (overlaps.length > 0) {
        // Release the lock before returning
        await connection.query('SELECT RELEASE_LOCK(?)', [lockName]);
        await connection.rollback();
        return res.status(409).json({
          success: false,
          error: 'You already have a confirmed booking that overlaps this time'
        });
      }

      // 4. Block if the existing confirmed booking is for the same course on the same date (regardless of tutor or time)
      const [sameCourseSameDay] = await connection.query(
        `SELECT b.BookingID
         FROM Booking b
         JOIN AvailabilitySlot s ON b.SlotID = s.SlotID
         WHERE b.StudentID = ?
           AND b.Status = 'Confirmed'
           AND s.Date = ?
           AND s.CourseID = ?`,
        [studentId, slotDate, slotCourseId]
      );
      if (sameCourseSameDay.length > 0) {
        await connection.query('SELECT RELEASE_LOCK(?)', [lockName]);
        await connection.rollback();
        return res.status(409).json({
          success: false,
          error: 'You cannot book the same course more than once on one day'
        });
      }

      // Create the new booking
      const [result] = await connection.query(
        'INSERT INTO Booking (Status, SlotID, StudentID) VALUES (?, ?, ?)',
        ['Confirmed', slotId, studentId]
      );

      // Release named lock before committing
      await connection.query('SELECT RELEASE_LOCK(?)', [lockName]);

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: { bookingId: result.insertId }
      });
      return;
    } catch (innerErr) {
      // Attempt to release lock if an error occurs inside the lock scope
      try {
        await connection.query('SELECT RELEASE_LOCK(?)', [lockName]);
      } catch (rerr) {
        console.error('Error releasing lock after inner error:', rerr);
      }
      throw innerErr; // let outer catch handle rollback/response
    }

    // NOTE: the insertion and commit are handled inside the locking block above
  } catch (error) {
    console.error('Create booking error:', error);
    try {
      if (connection) await connection.rollback();
    } catch (rbErr) {
      console.error('Rollback error:', rbErr);
    }

    if (error.message && error.message.includes('slot is not Open')) {
      return res.status(400).json({
        success: false,
        error: 'Cannot book: slot is not Open'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error while creating booking'
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
    const { sort, localDateTime } = req.query;

    // Pass localDateTime to the stored procedure if provided, else fallback to NOW()
    const filterDateTime = localDateTime || null;
    const [sessions] = await pool.query(
      'CALL GetStudentSessions(?, ?, ?)',
      [studentId, sort || 'date', filterDateTime]
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
    const { localDateTime } = req.query;

    let sql = `SELECT b.BookingID,
              b.Status,
              s.Date,
              s.StartTime,
              s.EndTime,
              s.Location,
              c.CourseName,
              t.FullName AS TutorName,
              a.Attended,
              r.Rating,
              r.Comment
       FROM Booking b
       JOIN AvailabilitySlot s ON b.SlotID = s.SlotID
       JOIN Course c ON s.CourseID = c.CourseID
       JOIN Tutor t ON s.TutorID = t.TutorID
       LEFT JOIN Attendance a ON b.BookingID = a.BookingID
       LEFT JOIN Review r ON b.BookingID = r.BookingID
       WHERE b.StudentID = ?
         AND TIMESTAMP(s.Date, s.EndTime) < `;

    const params = [studentId];
    if (localDateTime) {
      sql += `?`;
      params.push(localDateTime);
    } else {
      sql += `NOW()`;
    }

    sql += ` AND b.Status <> 'Cancelled'
       ORDER BY s.Date DESC, s.StartTime DESC`;

    const [sessions] = await pool.query(sql, params);

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
          b.StudentID,
          b.SlotID,
          s.Date,
          s.StartTime,
          s.EndTime,
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
       WHERE s.TutorID = ? 
         AND TIMESTAMP(s.Date, s.StartTime) < NOW()
         AND b.Status = 'Confirmed'
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
