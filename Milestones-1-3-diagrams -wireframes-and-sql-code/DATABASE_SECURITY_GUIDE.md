# TutorUp Database Security Implementation Guide

## Overview
This document explains the database-level security implementation for TutorUp using MySQL's GRANT/REVOKE privilege system to differentiate access levels between developers and different user types.

## Security Architecture

### 1. User Roles Created

#### **Developers (`dev_team`)**
- **Purpose**: Full development and maintenance access
- **Who**: You and your teammates during development
- **Password**: `DevTeam2025!Secure`

#### **Student Application User (`student_app_user`)**
- **Purpose**: Limited access for student-facing operations
- **Who**: Backend when serving student requests
- **Password**: `StudentApp2025!Secure`

#### **Tutor Application User (`tutor_app_user`)**
- **Purpose**: Limited access for tutor-facing operations
- **Who**: Backend when serving tutor requests
- **Password**: `TutorApp2025!Secure`

#### **Backend Application User (`backend_app_user`)**
- **Purpose**: General backend operations (auth, registration, etc.)
- **Who**: Main backend application user
- **Password**: `BackendApp2025!Secure`

#### **Read-Only User (`readonly_user`)**
- **Purpose**: Analytics and reporting without modification rights
- **Who**: Reporting tools, analytics dashboards
- **Password**: `ReadOnly2025!Secure`

---

## Detailed Privilege Breakdown

### Developer Privileges (`dev_team`)

**CAN DO:**
- SELECT, INSERT, UPDATE, DELETE on all tables
- EXECUTE all stored procedures
- CREATE ROUTINE, ALTER ROUTINE (modify procedures/triggers)
- CREATE TEMPORARY TABLES

**CANNOT DO:**
- DROP tables or database (safety measure)

**Use Case:** Development, testing, debugging, schema modifications

---

### Student User Privileges (`student_app_user`)

**CAN DO:**
- **READ (SELECT):**
  - Major (browse majors)
  - Course (view courses)
  - Tutor (view tutor profiles - app must filter passwords)
  - AvailabilitySlot (browse available slots)
  - Student (own data only - app enforces this)
  - StudentCourse (their enrollments)
  - TutorCourse (tutor-course relationships)
  - Booking (their bookings)
  - Review (view reviews)
  - Attendance (their attendance records)

- **WRITE (INSERT):**
  - Booking (create new bookings)
  - Review (submit reviews)

- **EXECUTE PROCEDURES:**
  - `GetStudentSessions` (view their sessions)
  - `cancel_booking` (cancel their bookings)

**CANNOT DO:**
- Modify other students' data
- Delete bookings directly
- Modify tutor information
- Access password hashes
- Create availability slots
- Mark attendance
- UPDATE any table directly (except via procedures)

**Use Case:** When a student is browsing courses, booking sessions, viewing their schedule

---

### Tutor User Privileges (`tutor_app_user`)

**CAN DO:**
- **READ (SELECT):**
  - Major, Course, TutorCourse, StudentCourse
  - Student (limited to students in their sessions)
  - Tutor (own data only - app enforces this)
  - AvailabilitySlot (their slots)
  - Booking (bookings for their slots)
  - Attendance (for their sessions)
  - Review (reviews of their sessions)

- **WRITE:**
  - INSERT, UPDATE on AvailabilitySlot (manage their availability)
  - UPDATE on Attendance (mark attendance)

- **EXECUTE PROCEDURES:**
  - `GetTutorUpcomingSessions` (view their sessions)

**CANNOT DO:**
- Modify student records
- Delete bookings
- Modify reviews
- Access other tutors' data
- Cancel student bookings
- Access password hashes

**Use Case:** When a tutor is managing availability, viewing sessions, marking attendance

---

### Backend Application User (`backend_app_user`)

**CAN DO:**
- **FULL READ/WRITE:**
  - Student, Tutor, Booking, Attendance, Review
  - AvailabilitySlot, StudentCourse, TutorCourse
  
- **READ:**
  - Major, Course

- **EXECUTE:**
  - All stored procedures

**CANNOT DO:**
- DROP, CREATE, ALTER tables
- Create/modify stored procedures
- Grant privileges

**Use Case:** User registration, authentication, general backend operations

---

### Read-Only User (`readonly_user`)

**CAN DO:**
- SELECT on all tables

**CANNOT DO:**
- INSERT, UPDATE, DELETE on any table
- EXECUTE procedures
- Any data modification

**Use Case:** Analytics dashboards, reporting tools, data export

---

## Implementation Steps

### Step 1: Run the Security Script on Aiven

1. **Connect to your Aiven MySQL database** as the admin user (`avnadmin`)

2. **Run the script:**
   ```sql
   -- Navigate to the SQL file
   SOURCE /path/to/DATABASE_SECURITY.sql;
   
   -- Or copy/paste the contents into Aiven web console
   ```

3. **Verify users were created:**
   ```sql
   SELECT User, Host FROM mysql.user 
   WHERE User LIKE '%app%' OR User LIKE '%dev%' OR User LIKE '%readonly%';
   ```

4. **Check privileges:**
   ```sql
   SHOW GRANTS FOR 'student_app_user'@'%';
   SHOW GRANTS FOR 'tutor_app_user'@'%';
   ```

### Step 2: Update Your Application

#### Option A: Single Backend User (Simpler)

Update your `.env` file to use the backend application user:

```env
# back-end/.env
DB_HOST=mysql-306eeb47-nyu-f431.i.aivencloud.com
DB_PORT=26601
DB_NAME=tutorup
DB_USER=backend_app_user
DB_PASSWORD=BackendApp2025!Secure

# Keep admin credentials for migrations
DB_ADMIN_USER=avnadmin
DB_ADMIN_PASSWORD=AVNS_5jd3bghbcWipFRkSJho
```

#### Option B: Context-Specific Users (More Secure)

Create multiple connection pools in `config/database.js`:

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

// Main backend pool
const backendPool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 26601,
  user: 'backend_app_user',
  password: 'BackendApp2025!Secure',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true
});

// Student-specific pool
const studentPool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 26601,
  user: 'student_app_user',
  password: 'StudentApp2025!Secure',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  dateStrings: true
});

// Tutor-specific pool
const tutorPool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 26601,
  user: 'tutor_app_user',
  password: 'TutorApp2025!Secure',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  dateStrings: true
});

module.exports = {
  pool: backendPool,  // Default
  backendPool,
  studentPool,
  tutorPool
};
```

Then use the appropriate pool in controllers:

```javascript
// studentsController.js
const { studentPool } = require('../config/database');

const getStudentSessions = async (req, res) => {
  const { studentId } = req.params;
  
  // Use student pool for student operations
  const [sessions] = await studentPool.query(
    'CALL GetStudentSessions(?, ?)',
    [studentId, sort || 'time']
  );
  // ...
};
```

### Step 3: Development Environment

For development, use the `dev_team` user:

```env
# back-end/.env (development)
DB_USER=dev_team
DB_PASSWORD=DevTeam2025!Secure
```

---

## Security Benefits

### 1. **Defense in Depth**
Even if your application code has a bug, database privileges limit the damage:
- Students can't accidentally delete all bookings
- Tutors can't modify student records
- No one can drop tables

### 2. **Principle of Least Privilege**
Each user has only the minimum permissions needed:
- Students can only perform student operations
- Tutors can only perform tutor operations
- Read-only users can't modify data

### 3. **Audit Trail**
Different database users allow you to track:
- Which type of user performed which operation
- Helps with debugging and compliance

### 4. **Data Integrity**
Prevents unauthorized modifications:
- Students can't mark their own attendance
- Tutors can't modify reviews
- Application layer + database layer security

---

## Testing the Security

### Test Student User Permissions

```sql
-- Try to connect as student user
mysql -h mysql-306eeb47-nyu-f431.i.aivencloud.com -P 26601 -u student_app_user -p tutorup

-- Should work (student can view courses)
SELECT * FROM Course;

-- Should work (student can create booking)
INSERT INTO Booking (Status, SlotID, StudentID) VALUES ('Confirmed', 5, 12);

-- Should FAIL (student can't mark attendance)
UPDATE Attendance SET Attended = 'Yes' WHERE BookingID = 1;
-- Error: UPDATE command denied

-- Should FAIL (student can't create slots)
INSERT INTO AvailabilitySlot (Date, StartTime, EndTime, TutorID, CourseID) 
VALUES ('2025-12-01', '10:00:00', '11:00:00', 1, 1);
-- Error: INSERT command denied
```

### Test Tutor User Permissions

```sql
-- Connect as tutor user
mysql -h mysql-306eeb47-nyu-f431.i.aivencloud.com -P 26601 -u tutor_app_user -p tutorup

-- Should work (tutor can create slots)
INSERT INTO AvailabilitySlot (Date, StartTime, EndTime, TutorID, CourseID, Location, Capacity) 
VALUES ('2025-12-01', '10:00:00', '11:00:00', 3, 3, 'Room A101', 2);

-- Should work (tutor can mark attendance)
UPDATE Attendance SET Attended = 'Yes', MarkedAt = NOW() WHERE BookingID = 5;

-- Should FAIL (tutor can't modify student data)
UPDATE Student SET Email = 'hacked@example.com' WHERE StudentID = 1;
-- Error: UPDATE command denied

-- Should FAIL (tutor can't delete bookings)
DELETE FROM Booking WHERE BookingID = 1;
-- Error: DELETE command denied
```

---

## Maintenance

### Rotating Passwords

```sql
-- Change password for a user
ALTER USER 'student_app_user'@'%' IDENTIFIED BY 'NewSecurePassword2025!';
FLUSH PRIVILEGES;
```

### Removing a User

```sql
DROP USER 'student_app_user'@'%';
FLUSH PRIVILEGES;
```

### Viewing Current Privileges

```sql
SHOW GRANTS FOR 'student_app_user'@'%';
```

### Adding New Privileges

```sql
-- Grant additional privilege to student users
GRANT UPDATE ON tutorup.Student TO 'student_app_user'@'%';
FLUSH PRIVILEGES;
```



