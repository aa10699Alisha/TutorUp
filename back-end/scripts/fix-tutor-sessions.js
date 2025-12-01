/**
 * Fix for tutor upcoming sessions bug
 * This script drops and recreates the GetTutorUpcomingSessions procedure
 * with the correct TIMESTAMP comparison instead of CONCAT
 */

require('dotenv').config();
const { pool } = require('../config/database');

async function fixTutorSessionsProcedure() {
    console.log('Fixing GetTutorUpcomingSessions procedure...\n');
    
    try {
        // Drop existing procedure
        console.log('1. Dropping old procedure...');
        await pool.query('DROP PROCEDURE IF EXISTS GetTutorUpcomingSessions');
        console.log('Old procedure dropped\n');
        
        // Create new procedure with TIMESTAMP fix
        console.log('2. Creating new procedure with TIMESTAMP fix...');
        await pool.query(`
            CREATE PROCEDURE GetTutorUpcomingSessions (
                IN p_tutor_id INT, 
                IN p_sort_by VARCHAR(20)
            ) 
            BEGIN 
                SELECT 
                    b.BookingID,
                    s.Date,
                    s.StartTime,
                    s.EndTime,
                    s.Location,
                    c.CourseName,
                    st.FullName AS StudentName,
                    b.Status 
                FROM Booking b 
                JOIN AvailabilitySlot s ON b.SlotID = s.SlotID 
                JOIN Course c ON s.CourseID = c.CourseID 
                JOIN Student st ON b.StudentID = st.StudentID 
                WHERE s.TutorID = p_tutor_id 
                  AND TIMESTAMP(s.Date, s.StartTime) >= NOW() 
                  AND b.Status = 'Confirmed' 
                ORDER BY 
                    CASE WHEN p_sort_by='time' OR p_sort_by IS NULL OR p_sort_by='' THEN s.Date END ASC, 
                    CASE WHEN p_sort_by='time' OR p_sort_by IS NULL OR p_sort_by='' THEN s.StartTime END ASC, 
                    CASE WHEN p_sort_by='student' THEN st.FullName END ASC, 
                    CASE WHEN p_sort_by='student' THEN s.Date END ASC, 
                    CASE WHEN p_sort_by='student' THEN s.StartTime END ASC, 
                    CASE WHEN p_sort_by='course' THEN c.CourseName END ASC, 
                    CASE WHEN p_sort_by='course' THEN s.Date END ASC, 
                    CASE WHEN p_sort_by='course' THEN s.StartTime END ASC; 
            END
        `);
        console.log('   ✓ New procedure created\n');
        
        // Test the procedure
        console.log('3. Testing procedure...');
        const [results] = await pool.query('CALL GetTutorUpcomingSessions(1, "time")');
        
        console.log('Fix applied successfully!');
        console.log('\nWhat changed:');
        console.log(' Old: CONCAT(s.Date, \' \', s.StartTime) >= NOW()');
        console.log(' New: TIMESTAMP(s.Date, s.StartTime) >= NOW()');
        console.log('\nThis now properly shows sessions booked for today in the future.\n');
        
    } catch (error) {
        console.error('Error fixing procedure:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

fixTutorSessionsProcedure();
