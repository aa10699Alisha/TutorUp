// tutorAttendanceController.js
// This controller manages tutor marking attendance for students

const { pool } = require('../config/database');

// Tutor marks attendance for a student in a slot/session
const markAttendanceAsTutor = async (req, res) => {
  console.log('DEBUG: Incoming attendance mark:', req.body);
  try {
    const { studentId, slotId, attended } = req.body;
    if (!studentId || !slotId || !['Yes', 'No'].includes(attended)) {
      return res.status(400).json({ success: false, error: 'Missing or invalid parameters' });
    }
    // Find the booking for this student and slot
    const [bookings] = await pool.query(
      'SELECT BookingID FROM Booking WHERE StudentID = ? AND SlotID = ?',
      [studentId, slotId]
    );
    console.log('DEBUG: Booking query result:', bookings);
    if (bookings.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    const bookingId = bookings[0].BookingID;
    // Upsert attendance record
    await pool.query(
      `INSERT INTO Attendance (BookingID, Attended)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE Attended = VALUES(Attended)`,
      [bookingId, attended]
    );
    res.status(200).json({ success: true, message: 'Attendance updated' });
  } catch (error) {
    console.error('Tutor mark attendance error:', error);
    res.status(500).json({ success: false, error: 'Server error while updating attendance' });
  }
};

module.exports = { markAttendanceAsTutor };
