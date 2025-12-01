
--PART1: creating database users
-- 1. DEVELOPERS 
CREATE USER IF NOT EXISTS 'dev_team'@'%' IDENTIFIED BY 'DevTeam2025!Secure';

-- 2. STUDENT APPLICATION USER
CREATE USER IF NOT EXISTS 'student_app_user'@'%' IDENTIFIED BY 'StudentApp2025!Secure';

-- 3. TUTOR APPLICATION USER
CREATE USER IF NOT EXISTS 'tutor_app_user'@'%' IDENTIFIED BY 'TutorApp2025!Secure';

-- 4. BACKEND APPLICATION USER (General)
CREATE USER IF NOT EXISTS 'backend_app_user'@'%' IDENTIFIED BY 'BackendApp2025!Secure';

-- 5. READ-ONLY USER (for reporting/analytics)
CREATE USER IF NOT EXISTS 'readonly_user'@'%' IDENTIFIED BY 'ReadOnly2025!Secure';






-- PART2: developer privileges
-- Developers get full access to all tables and procedures for development
GRANT SELECT, INSERT, UPDATE, DELETE ON tutorup.* TO 'dev_team'@'%';

-- Allow developers to execute all stored procedures
GRANT EXECUTE ON tutorup.* TO 'dev_team'@'%';

-- Allow developers to create/modify stored procedures and triggers (for development)
GRANT CREATE ROUTINE, ALTER ROUTINE ON tutorup.* TO 'dev_team'@'%';

-- Prevent developers from dropping the database or tables (safety measure)
REVOKE DROP ON tutorup.* FROM 'dev_team'@'%';

-- Developers can create temporary tables for testing
GRANT CREATE TEMPORARY TABLES ON tutorup.* TO 'dev_team'@'%';






-- PART3: student user privileges
-- Students can READ from these tables:
-- Major: to browse majors, Course: to view course details, Tutor: to see tutor profiles (but NOT passwords), AvailabilitySlot: to browse available tutoring slots

GRANT SELECT ON tutorup.Major TO 'student_app_user'@'%';
GRANT SELECT ON tutorup.Course TO 'student_app_user'@'%';
GRANT SELECT ON tutorup.AvailabilitySlot TO 'student_app_user'@'%';
GRANT SELECT ON tutorup.StudentCourse TO 'student_app_user'@'%';
GRANT SELECT ON tutorup.TutorCourse TO 'student_app_user'@'%';

-- Students can SELECT from Tutor table (for viewing tutor profiles)
-- Note: Application should filter out HashedPassword field
GRANT SELECT ON tutorup.Tutor TO 'student_app_user'@'%';

-- Students can SELECT their own data from Student table
-- Note: Application should enforce row-level security (only their own data)
GRANT SELECT ON tutorup.Student TO 'student_app_user'@'%';

-- Students can manage their own bookings
GRANT SELECT, INSERT ON tutorup.Booking TO 'student_app_user'@'%';

-- Students can view and create reviews
GRANT SELECT, INSERT ON tutorup.Review TO 'student_app_user'@'%';

-- Students can view attendance (read-only for their sessions)
GRANT SELECT ON tutorup.Attendance TO 'student_app_user'@'%';

-- Students can execute specific stored procedures
GRANT EXECUTE ON PROCEDURE tutorup.GetStudentSessions TO 'student_app_user'@'%';
GRANT EXECUTE ON PROCEDURE tutorup.cancel_booking TO 'student_app_user'@'%';

-- Students CANNOT:
-- Modify other students' data, Delete bookings (only cancel via procedure), Modify tutor data, Access password hashes directly, Create or modify availability slots, Mark attendance






-- PART4: tutor user privileges
-- Tutors can READ from these tables:
GRANT SELECT ON tutorup.Major TO 'tutor_app_user'@'%';
GRANT SELECT ON tutorup.Course TO 'tutor_app_user'@'%';
GRANT SELECT ON tutorup.TutorCourse TO 'tutor_app_user'@'%';
GRANT SELECT ON tutorup.StudentCourse TO 'tutor_app_user'@'%';

-- Tutors can view student information (for their sessions)
-- Note: Application should filter to only show students in their sessions
GRANT SELECT ON tutorup.Student TO 'tutor_app_user'@'%';

-- Tutors can SELECT their own data from Tutor table
-- Note: Application should enforce row-level security
GRANT SELECT ON tutorup.Tutor TO 'tutor_app_user'@'%';

-- Tutors can manage their availability slots
GRANT SELECT, INSERT, UPDATE ON tutorup.AvailabilitySlot TO 'tutor_app_user'@'%';

-- Tutors can view bookings for their slots
GRANT SELECT ON tutorup.Booking TO 'tutor_app_user'@'%';

-- Tutors can mark attendance (UPDATE)
GRANT SELECT, UPDATE ON tutorup.Attendance TO 'tutor_app_user'@'%';

-- Tutors can view reviews
GRANT SELECT ON tutorup.Review TO 'tutor_app_user'@'%';

-- Tutors can execute specific stored procedures
GRANT EXECUTE ON PROCEDURE tutorup.GetTutorUpcomingSessions TO 'tutor_app_user'@'%';

-- Tutors CANNOT:
-- Modify student data, Delete bookings, Modify reviews, Access other tutors' data, Cancel student bookings






-- PART 5: backend application user privileges
-- Backend needs broader access for authentication, user management, etc.
-- This user is used for operations that aren't specific to student/tutor context

-- Full read/write access to most tables
GRANT SELECT, INSERT, UPDATE, DELETE ON tutorup.Student TO 'backend_app_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON tutorup.Tutor TO 'backend_app_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON tutorup.Booking TO 'backend_app_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON tutorup.Attendance TO 'backend_app_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON tutorup.Review TO 'backend_app_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON tutorup.AvailabilitySlot TO 'backend_app_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON tutorup.StudentCourse TO 'backend_app_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON tutorup.TutorCourse TO 'backend_app_user'@'%';

-- Read-only access to reference tables
GRANT SELECT ON tutorup.Major TO 'backend_app_user'@'%';
GRANT SELECT ON tutorup.Course TO 'backend_app_user'@'%';

-- Execute all stored procedures
GRANT EXECUTE ON tutorup.* TO 'backend_app_user'@'%';

-- Backend CANNOT:
-- Drop tables, Create/alter stored procedures, Grant privileges to other users


REVOKE CREATE, DROP, ALTER ON tutorup.* FROM 'backend_app_user'@'%';







-- PART 6: read-only user privileges
-- For analytics, reporting, or auditing purposes
GRANT SELECT ON tutorup.* TO 'readonly_user'@'%';
-- Read-only user CANNOT modify anything
REVOKE INSERT, UPDATE, DELETE ON tutorup.* FROM 'readonly_user'@'%';






-- PART 7: apply all privilege changes
FLUSH PRIVILEGES;






-- PART 8: verification queries
-- View all users and their privileges
SELECT User, Host FROM mysql.user WHERE User LIKE '%app%' OR User LIKE '%dev%' OR User LIKE '%readonly%';

-- Show grants for each user
SHOW GRANTS FOR 'dev_team'@'%';
SHOW GRANTS FOR 'student_app_user'@'%';
SHOW GRANTS FOR 'tutor_app_user'@'%';
SHOW GRANTS FOR 'backend_app_user'@'%';
SHOW GRANTS FOR 'readonly_user'@'%';

