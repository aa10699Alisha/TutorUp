require('dotenv').config();
const { pool } = require('../config/database');

// Helper executes a statement and logs result
async function exec(label, sql) {
  try {
    await pool.query(sql);
    console.log(`✔ ${label}`);
  } catch (err) {
    if (err.code === 'ER_TABLE_EXISTS_ERROR' || /already exists/i.test(err.message)) {
      console.log(`↺ ${label} (exists)`);
    } else if (err.sqlMessage && /Duplicate entry|exists/.test(err.sqlMessage)) {
      console.log(`↺ ${label} (duplicate)`);
    } else {
      console.log(`✖ ${label}: ${err.sqlMessage || err.message}`);
    }
  }
}

async function tableExists(name) {
  const [rows] = await pool.query('SHOW TABLES LIKE ?', [name]);
  return rows.length > 0;
}

async function triggerExists(name) {
  const [rows] = await pool.query(
    'SELECT TRIGGER_NAME FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = ? AND TRIGGER_NAME = ?',
    [process.env.DB_NAME, name]
  );
  return rows.length > 0;
}

async function procedureExists(name) {
  const [rows] = await pool.query(
    'SELECT ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = "PROCEDURE" AND ROUTINE_NAME = ?',
    [process.env.DB_NAME, name]
  );
  return rows.length > 0;
}

async function migrate() {
  console.log('\n=== TutorUp Migration Start ===');

  // 1. Tables
  const tables = [
    {
      name: 'Major',
      sql: `CREATE TABLE Major (\n        MajorID INT AUTO_INCREMENT PRIMARY KEY,\n        MajorName VARCHAR(100) NOT NULL\n      )`
    },
    {
      name: 'Student',
      sql: `CREATE TABLE Student (\n        StudentID INT AUTO_INCREMENT PRIMARY KEY,\n        FullName VARCHAR(150) NOT NULL,\n        Email VARCHAR(150) NOT NULL UNIQUE,\n        HashedPassword VARCHAR(255) NOT NULL,\n        DateJoined DATE NOT NULL\n      )`
    },
    {
      name: 'Tutor',
      sql: `CREATE TABLE Tutor (\n        TutorID INT AUTO_INCREMENT PRIMARY KEY,\n        FullName VARCHAR(150) NOT NULL,\n        Email VARCHAR(150) NOT NULL UNIQUE,\n        HashedPassword VARCHAR(255) NOT NULL,\n        Bio TEXT,\n        ExperienceYears INT DEFAULT 0,\n        RatingAverage DECIMAL(3,2) DEFAULT 0.00\n      )`
    },
    {
      name: 'Course',
      sql: `CREATE TABLE Course (\n        CourseID INT AUTO_INCREMENT PRIMARY KEY,\n        CourseCode VARCHAR(50) NOT NULL UNIQUE,\n        CourseName VARCHAR(150) NOT NULL,\n        Description TEXT,\n        Level VARCHAR(50),\n        MajorID INT,\n        FOREIGN KEY (MajorID) REFERENCES Major(MajorID)\n      )`
    },
    {
      name: 'TutorCourse',
      sql: `CREATE TABLE TutorCourse (\n        TutorID INT NOT NULL,\n        CourseID INT NOT NULL,\n        PRIMARY KEY (TutorID, CourseID),\n        FOREIGN KEY (TutorID) REFERENCES Tutor(TutorID),\n        FOREIGN KEY (CourseID) REFERENCES Course(CourseID)\n      )`
    },
    {
      name: 'StudentCourse',
      sql: `CREATE TABLE StudentCourse (\n        StudentID INT NOT NULL,\n        CourseID INT NOT NULL,\n        PRIMARY KEY (StudentID, CourseID),\n        FOREIGN KEY (StudentID) REFERENCES Student(StudentID),\n        FOREIGN KEY (CourseID) REFERENCES Course(CourseID)\n      )`
    },
    {
      name: 'AvailabilitySlot',
      sql: `CREATE TABLE AvailabilitySlot (\n        SlotID INT AUTO_INCREMENT PRIMARY KEY,\n        Date DATE NOT NULL,\n        StartTime TIME NOT NULL,\n        EndTime TIME NOT NULL,\n        Capacity INT NOT NULL DEFAULT 1,\n        Location VARCHAR(150),\n        Status ENUM('Open','Closed') NOT NULL DEFAULT 'Open',\n        TutorID INT NOT NULL,\n        CourseID INT NOT NULL,\n        FOREIGN KEY (TutorID) REFERENCES Tutor(TutorID),\n        FOREIGN KEY (CourseID) REFERENCES Course(CourseID)\n      )`
    },
    {
      name: 'Booking',
      sql: `CREATE TABLE Booking (\n        BookingID INT AUTO_INCREMENT PRIMARY KEY,\n        Status ENUM('Confirmed','Completed','Cancelled') NOT NULL DEFAULT 'Confirmed',\n        CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,\n        SlotID INT NOT NULL,\n        StudentID INT NOT NULL,\n        FOREIGN KEY (SlotID) REFERENCES AvailabilitySlot(SlotID),\n        FOREIGN KEY (StudentID) REFERENCES Student(StudentID)\n      )`
    },
    {
      name: 'Attendance',
      sql: `CREATE TABLE Attendance (\n        BookingID INT PRIMARY KEY,\n        Attended ENUM('Yes','No') NOT NULL DEFAULT 'No',\n        MarkedAt DATETIME,\n        FOREIGN KEY (BookingID) REFERENCES Booking(BookingID)\n      )`
    },
    {
      name: 'Review',
      sql: `CREATE TABLE Review (\n        BookingID INT PRIMARY KEY,\n        Rating TINYINT NOT NULL,\n        Comment TEXT,\n        ReviewDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,\n        CHECK (Rating BETWEEN 1 AND 5),\n        FOREIGN KEY (BookingID) REFERENCES Booking(BookingID)\n      )`
    }
  ];

  for (const t of tables) {
    if (!(await tableExists(t.name))) {
      await exec(`Create table ${t.name}`, t.sql);
    } else {
      console.log(`↺ Table ${t.name} exists`);
    }
  }

  // 2. Triggers
  if (!(await triggerExists('booking_only_if_open'))) {
    await exec('Trigger booking_only_if_open', `CREATE TRIGGER booking_only_if_open BEFORE INSERT ON Booking FOR EACH ROW BEGIN DECLARE v_status VARCHAR(20); SELECT Status INTO v_status FROM AvailabilitySlot WHERE SlotID = NEW.SlotID; IF v_status <> 'Open' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot book: slot is not Open'; END IF; END`);
  } else {
    console.log('↺ Trigger booking_only_if_open exists');
  }

  if (!(await triggerExists('trg_after_booking_insert'))) {
    await exec('Trigger trg_after_booking_insert', `CREATE TRIGGER trg_after_booking_insert AFTER INSERT ON Booking FOR EACH ROW BEGIN DECLARE current_bookings INT; DECLARE max_capacity INT; SELECT COUNT(*) INTO current_bookings FROM Booking WHERE SlotID = NEW.SlotID AND Status = 'Confirmed'; SELECT Capacity INTO max_capacity FROM AvailabilitySlot WHERE SlotID = NEW.SlotID; IF current_bookings >= max_capacity THEN UPDATE AvailabilitySlot SET Status = 'Closed' WHERE SlotID = NEW.SlotID; END IF; END`);
  } else {
    console.log('↺ Trigger trg_after_booking_insert exists');
  }

  // 3. Procedures
  if (!(await procedureExists('GetStudentSessions'))) {
    await exec('Procedure GetStudentSessions', `CREATE PROCEDURE GetStudentSessions (IN p_student_id INT, IN p_sort VARCHAR(20)) BEGIN IF p_sort = 'tutor' THEN SELECT b.BookingID,b.Status,s.Date,s.StartTime,c.CourseName,t.FullName AS TutorName FROM Booking b JOIN AvailabilitySlot s ON b.SlotID=s.SlotID JOIN Course c ON s.CourseID=c.CourseID JOIN Tutor t ON s.TutorID=t.TutorID WHERE b.StudentID=p_student_id AND s.Date >= CURDATE() AND b.Status <> 'Cancelled' ORDER BY t.FullName, s.Date, s.StartTime; ELSEIF p_sort = 'course' THEN SELECT b.BookingID,b.Status,s.Date,s.StartTime,c.CourseName,t.FullName AS TutorName FROM Booking b JOIN AvailabilitySlot s ON b.SlotID=s.SlotID JOIN Course c ON s.CourseID=c.CourseID JOIN Tutor t ON s.TutorID=t.TutorID WHERE b.StudentID=p_student_id AND s.Date >= CURDATE() AND b.Status <> 'Cancelled' ORDER BY c.CourseName, s.Date, s.StartTime; ELSE SELECT b.BookingID,b.Status,s.Date,s.StartTime,c.CourseName,t.FullName AS TutorName FROM Booking b JOIN AvailabilitySlot s ON b.SlotID=s.SlotID JOIN Course c ON s.CourseID=c.CourseID JOIN Tutor t ON s.TutorID=t.TutorID WHERE b.StudentID=p_student_id AND s.Date >= CURDATE() AND b.Status <> 'Cancelled' ORDER BY s.Date, s.StartTime; END IF; END`);
  } else {
    console.log('↺ Procedure GetStudentSessions exists');
  }

  if (!(await procedureExists('cancel_booking'))) {
    await exec('Procedure cancel_booking', `CREATE PROCEDURE cancel_booking(IN p_booking_id INT, IN p_student_id INT) BEGIN DECLARE v_slot_id INT; DECLARE v_capacity INT; DECLARE v_confirmed INT; SELECT b.SlotID INTO v_slot_id FROM Booking b WHERE b.BookingID=p_booking_id AND b.StudentID=p_student_id AND b.Status='Confirmed' FOR UPDATE; IF v_slot_id IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Booking not found or not Confirmed for this student'; END IF; UPDATE Booking SET Status='Cancelled' WHERE BookingID=p_booking_id; SELECT Capacity INTO v_capacity FROM AvailabilitySlot WHERE SlotID=v_slot_id FOR UPDATE; SELECT COUNT(*) INTO v_confirmed FROM Booking WHERE SlotID=v_slot_id AND Status='Confirmed'; IF v_confirmed < v_capacity THEN UPDATE AvailabilitySlot SET Status='Open' WHERE SlotID=v_slot_id; END IF; END`);
  } else {
    console.log('↺ Procedure cancel_booking exists');
  }

  if (!(await procedureExists('GetTutorUpcomingSessions'))) {
    await exec('Procedure GetTutorUpcomingSessions', `CREATE PROCEDURE GetTutorUpcomingSessions (IN p_tutor_id INT, IN p_sort_by VARCHAR(20)) BEGIN SELECT b.BookingID,s.Date,s.StartTime,s.Location,c.CourseName,st.FullName AS StudentName,b.Status FROM Booking b JOIN AvailabilitySlot s ON b.SlotID=s.SlotID JOIN Course c ON s.CourseID=c.CourseID JOIN Student st ON b.StudentID=st.StudentID WHERE s.TutorID=p_tutor_id AND s.Date >= CURDATE() AND b.Status='Confirmed' ORDER BY CASE WHEN p_sort_by='time' OR p_sort_by IS NULL OR p_sort_by='' THEN s.Date END ASC, CASE WHEN p_sort_by='time' OR p_sort_by IS NULL OR p_sort_by='' THEN s.StartTime END ASC, CASE WHEN p_sort_by='student' THEN st.FullName END ASC, CASE WHEN p_sort_by='student' THEN s.Date END ASC, CASE WHEN p_sort_by='student' THEN s.StartTime END ASC, CASE WHEN p_sort_by='course' THEN c.CourseName END ASC, CASE WHEN p_sort_by='course' THEN s.Date END ASC, CASE WHEN p_sort_by='course' THEN s.StartTime END ASC; END`);
  } else {
    console.log('↺ Procedure GetTutorUpcomingSessions exists');
  }

  console.log('\n=== Migration Complete ===');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration fatal error:', err);
  process.exit(1);
});
