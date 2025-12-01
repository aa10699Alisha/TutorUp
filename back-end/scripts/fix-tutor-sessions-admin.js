/**
 * Fix for tutor upcoming sessions bug - Run with admin credentials
 * This script drops and recreates the GetTutorUpcomingSessions procedure
 * with the correct TIMESTAMP comparison instead of CONCAT
 */

const mysql = require('mysql2/promise');

async function fixTutorSessionsProcedure() {
    console.log('Fixing GetTutorUpcomingSessions procedure...\n');
    
    // Use admin credentials to modify stored procedure
    const connection = await mysql.createConnection({
        host: 'mysql-306eeb47-nyu-f431.i.aivencloud.com',
        port: 26601,
        user: 'avnadmin',  // Admin user with procedure modification rights
        password: 'AVNS_5jd3bghbcWipFRkSJho',
        database: 'tutorup'
    });
    
    try {
        // Drop existing procedure
        console.log('1. Dropping old procedure...');
        await connection.query('DROP PROCEDURE IF EXISTS GetTutorUpcomingSessions');
        console.log('Old procedure dropped\n');
        
        // Create new procedure with TIMESTAMP fix
        console.log('2. Creating new procedure with TIMESTAMP fix...');
        await connection.query(`
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
        console.log('New procedure created\n');
        
        // Test the procedure
        const [results] = await connection.query('CALL GetTutorUpcomingSessions(?, ?)', [1, 'time']);
    
    } catch (error) {
        console.error('Error fixing procedure:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

fixTutorSessionsProcedure();
