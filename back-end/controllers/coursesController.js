const { pool } = require('../config/database');

const getAllMajors = async (req, res) => {
  try {
    const [majors] = await pool.query(
      'SELECT MajorID, MajorName FROM Major ORDER BY MajorName'
    );

    res.status(200).json({
      success: true,
      count: majors.length,
      data: majors
    });
  } catch (error) {
    console.error('Get majors error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching majors'
    });
  }
};

const getAllCoursesWithMajors = async (req, res) => {
  try {
    const [courses] = await pool.query(
      `SELECT c.CourseID, c.CourseCode, c.CourseName, c.MajorID, m.MajorName
       FROM Course c
       JOIN Major m ON c.MajorID = m.MajorID
       ORDER BY c.CourseName`
    );

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching courses'
    });
  }
};

const getCoursesByMajor = async (req, res) => {
  try {
    const { majorId } = req.params;

    const [courses] = await pool.query(
      `SELECT CourseID, CourseCode, CourseName, Description 
       FROM Course 
       WHERE MajorID = ? 
       ORDER BY CourseCode`,
      [majorId]
    );

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Get courses by major error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching courses'
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const [courses] = await pool.query(
      'SELECT CourseName, Description FROM Course WHERE CourseID = ?',
      [courseId]
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: courses[0]
    });
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching course'
    });
  }
};

const getAvailableSlotsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const [slots] = await pool.query(
      `SELECT s.SlotID,
              s.Date,
              s.StartTime,
              s.EndTime,
              s.Location,
              s.Capacity,
              s.Status,
              t.FullName AS TutorName,
              t.TutorID,
              (SELECT COUNT(*) FROM Booking WHERE SlotID = s.SlotID AND Status != 'Cancelled') AS BookedCount
       FROM AvailabilitySlot s
       JOIN Tutor t ON s.TutorID = t.TutorID
       WHERE s.CourseID = ? 
         AND s.Status = 'Open'
         AND CONCAT(s.Date, ' ', s.StartTime) >= NOW()
       ORDER BY s.Date, s.StartTime`,
      [courseId]
    );

    // Filter out fully booked slots
    const availableSlots = slots.filter(slot => slot.BookedCount < slot.Capacity);

    res.status(200).json({
      success: true,
      count: availableSlots.length,
      data: availableSlots
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching slots'
    });
  }
};

module.exports = {
  getAllMajors,
  getAllCoursesWithMajors,
  getCoursesByMajor,
  getCourseById,
  getAvailableSlotsByCourse
};
