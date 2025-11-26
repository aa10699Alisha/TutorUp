const { pool } = require('../config/database');

const getTodaySlots = async (req, res) => {
  try {
    const [slots] = await pool.query(
      `SELECT 
          s.SlotID,
          s.Date,
          s.StartTime,
          s.EndTime,
          s.Capacity,
          s.Status,
          s.Location,
          c.CourseName,
          t.FullName AS TutorName
       FROM AvailabilitySlot s
       JOIN Course c ON s.CourseID = c.CourseID
       JOIN Tutor t ON s.TutorID = t.TutorID
       WHERE s.Date = CURDATE()
       ORDER BY s.StartTime`
    );

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots
    });
  } catch (error) {
    console.error('Get today slots error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching today\'s slots'
    });
  }
};

const getTomorrowSlots = async (req, res) => {
  try {
    const [slots] = await pool.query(
      `SELECT 
          s.SlotID,
          s.Date,
          s.StartTime,
          s.EndTime,
          s.Capacity,
          s.Status,
          s.Location,
          c.CourseName,
          t.FullName AS TutorName
       FROM AvailabilitySlot s
       JOIN Course c ON s.CourseID = c.CourseID
       JOIN Tutor t ON s.TutorID = t.TutorID
       WHERE s.Date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
       ORDER BY s.StartTime`
    );

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots
    });
  } catch (error) {
    console.error('Get tomorrow slots error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching tomorrow\'s slots'
    });
  }
};

const getSlotsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const futureOnly = req.query.futureOnly === 'true';
    const localTime = req.query.localTime; // Expect format 'HH:MM:SS'
    const baseQuery = `SELECT 
          s.SlotID,
          s.Date,
          s.StartTime,
          s.EndTime,
          s.Capacity,
          s.Status,
          s.Location,
          c.CourseName,
          t.FullName AS TutorName,
          (SELECT COUNT(*) FROM Booking WHERE SlotID = s.SlotID AND Status != 'Cancelled') AS BookedCount
       FROM AvailabilitySlot s
       JOIN Course c ON s.CourseID = c.CourseID
       JOIN Tutor t ON s.TutorID = t.TutorID
       WHERE s.Date = ?\n`;

    let fullQuery;
    let queryParams = [date];
    // Always filter by localTime if futureOnly and localTime are provided
    if (futureOnly && localTime) {
      fullQuery = baseQuery + ` AND s.StartTime > ? AND s.Status = 'Open' ORDER BY s.StartTime`;
      queryParams.push(localTime);
    } else {
      fullQuery = baseQuery + ` AND s.Status = 'Open' ORDER BY s.StartTime`;
    }

    const [slots] = await pool.query(fullQuery, queryParams);

    const availableSlots = slots.filter(slot => slot.BookedCount < slot.Capacity);

    res.status(200).json({
      success: true,
      count: availableSlots.length,
      data: availableSlots
    });
  } catch (error) {
    console.error('Get slots by date error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching slots'
    });
  }
};

module.exports = {
  getTodaySlots,
  getTomorrowSlots,
  getSlotsByDate
};
