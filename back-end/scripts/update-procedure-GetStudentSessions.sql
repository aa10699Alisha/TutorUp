-- Updated GetStudentSessions procedure to use a local datetime parameter for filtering
DROP PROCEDURE IF EXISTS GetStudentSessions;
DELIMITER //
CREATE PROCEDURE GetStudentSessions (
    IN p_student_id INT,
    IN p_sort VARCHAR(20),
    IN p_local_datetime DATETIME
)
BEGIN
    DECLARE filter_datetime DATETIME;
    IF p_local_datetime IS NOT NULL THEN
        SET filter_datetime = p_local_datetime;
    ELSE
        SET filter_datetime = NOW();
    END IF;
    IF p_sort = 'tutor' THEN
        SELECT b.BookingID, b.Status, s.Date, s.StartTime, s.EndTime, s.Location, c.CourseName, t.FullName AS TutorName
        FROM Booking b
        JOIN AvailabilitySlot s ON b.SlotID = s.SlotID
        JOIN Course c ON s.CourseID = c.CourseID
        JOIN Tutor t ON s.TutorID = t.TutorID
        WHERE b.StudentID = p_student_id
          AND CONCAT(s.Date, ' ', s.StartTime) >= filter_datetime
          AND b.Status <> 'Cancelled'
        ORDER BY t.FullName, s.Date, s.StartTime;
    ELSEIF p_sort = 'course' THEN
        SELECT b.BookingID, b.Status, s.Date, s.StartTime, s.EndTime, s.Location, c.CourseName, t.FullName AS TutorName
        FROM Booking b
        JOIN AvailabilitySlot s ON b.SlotID = s.SlotID
        JOIN Course c ON s.CourseID = c.CourseID
        JOIN Tutor t ON s.TutorID = t.TutorID
        WHERE b.StudentID = p_student_id
          AND CONCAT(s.Date, ' ', s.StartTime) >= filter_datetime
          AND b.Status <> 'Cancelled'
        ORDER BY c.CourseName, s.Date, s.StartTime;
    ELSE
        SELECT b.BookingID, b.Status, s.Date, s.StartTime, s.EndTime, s.Location, c.CourseName, t.FullName AS TutorName
        FROM Booking b
        JOIN AvailabilitySlot s ON b.SlotID = s.SlotID
        JOIN Course c ON s.CourseID = c.CourseID
        JOIN Tutor t ON s.TutorID = t.TutorID
        WHERE b.StudentID = p_student_id
          AND CONCAT(s.Date, ' ', s.StartTime) >= filter_datetime
          AND b.Status <> 'Cancelled'
        ORDER BY s.Date, s.StartTime;
    END IF;
END //
DELIMITER ;
