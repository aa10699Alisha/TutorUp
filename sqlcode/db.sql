-- 1. Major
CREATE TABLE Major (
    MajorID INT AUTO_INCREMENT PRIMARY KEY,
    MajorName VARCHAR(100) NOT NULL
);

-- 2. Student
CREATE TABLE Student (
    StudentID INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(150) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    DateJoined DATE NOT NULL
);

-- 3. Tutor
CREATE TABLE Tutor (
    TutorID INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(150) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    Bio TEXT,
    ExperienceYears INT DEFAULT 0,
    RatingAverage DECIMAL(3,2) DEFAULT 0.00
);

-- 4. Course (belongs to Major)
CREATE TABLE Course (
    CourseID INT AUTO_INCREMENT PRIMARY KEY,
    CourseCode VARCHAR(50) NOT NULL UNIQUE,
    CourseName VARCHAR(150) NOT NULL,
    Description TEXT,
    Level VARCHAR(50),
    MajorID INT,
    FOREIGN KEY (MajorID) REFERENCES Major(MajorID)
);

-- 5. TutorCourse (Tutor ↔ Course many-to-many)
CREATE TABLE TutorCourse (
    TutorID INT NOT NULL,
    CourseID INT NOT NULL,
    PRIMARY KEY (TutorID, CourseID),
    FOREIGN KEY (TutorID) REFERENCES Tutor(TutorID),
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID)
);

-- 6. StudentCourse (Student ↔ Course many-to-many)
CREATE TABLE StudentCourse (
    StudentID INT NOT NULL,
    CourseID INT NOT NULL,
    PRIMARY KEY (StudentID, CourseID),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID),
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID)
);

-- 7. AvailabilitySlot
CREATE TABLE AvailabilitySlot (
    SlotID INT AUTO_INCREMENT PRIMARY KEY,
    Date DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    Capacity INT NOT NULL DEFAULT 1,
    Location VARCHAR(150),
    Status ENUM('Open', 'Closed', 'Cancelled') NOT NULL DEFAULT 'Open',
    TutorID INT NOT NULL,
    CourseID INT NOT NULL,
    FOREIGN KEY (TutorID) REFERENCES Tutor(TutorID),
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID)
);

-- 8. Booking
CREATE TABLE Booking (
    BookingID INT AUTO_INCREMENT PRIMARY KEY,
    Status ENUM('Requested','Confirmed','Canceled','Completed','No Show')
        NOT NULL DEFAULT 'Requested',
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    SlotID INT NOT NULL,
    StudentID INT NOT NULL,
    FOREIGN KEY (SlotID) REFERENCES AvailabilitySlot(SlotID),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID)
);

-- 9. Attendance (1-to-1 with Booking)
CREATE TABLE Attendance (
    BookingID INT PRIMARY KEY,
    Attended ENUM('Yes','No') NOT NULL DEFAULT 'No',
    MarkedAt DATETIME,
    FOREIGN KEY (BookingID) REFERENCES Booking(BookingID)
);

-- 10. Review (1-to-1 with Booking)
CREATE TABLE Review (
    BookingID INT PRIMARY KEY,
    Rating TINYINT NOT NULL,
    Comment TEXT,
    ReviewDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (Rating BETWEEN 1 AND 5),
    FOREIGN KEY (BookingID) REFERENCES Booking(BookingID)
);


/* 1. MAJOR (10 rows, English-y names) */
INSERT INTO Major (MajorID, MajorName) VALUES
(1, 'Computer Science'),
(2, 'Mathematics'),
(3, 'Physics'),
(4, 'Business Management'),
(5, 'English Literature'),
(6, 'Psychology'),
(7, 'Economics'),
(8, 'History'),
(9, 'Art and Design'),
(10, 'Engineering');

/* 2. STUDENT (20 rows, English names) */
INSERT INTO Student (StudentID, FullName, Email, DateJoined) VALUES
(1, 'Olivia Johnson', 'olivia.johnson@example.com', '2025-01-10'),
(2, 'Liam Smith', 'liam.smith@example.com', '2025-01-11'),
(3, 'Emma Davis', 'emma.davis@example.com', '2025-01-12'),
(4, 'Noah Brown', 'noah.brown@example.com', '2025-01-13'),
(5, 'Ava Wilson', 'ava.wilson@example.com', '2025-01-14'),
(6, 'Mason Taylor', 'mason.taylor@example.com', '2025-01-15'),
(7, 'Sophia Anderson', 'sophia.anderson@example.com', '2025-01-16'),
(8, 'Logan Thomas', 'logan.thomas@example.com', '2025-01-17'),
(9, 'Mia Martin', 'mia.martin@example.com', '2025-01-18'),
(10, 'Lucas Jackson', 'lucas.jackson@example.com', '2025-01-19'),
(11, 'Harper White', 'harper.white@example.com', '2025-01-20'),
(12, 'Ethan Harris', 'ethan.harris@example.com', '2025-01-21'),
(13, 'Amelia Clark', 'amelia.clark@example.com', '2025-01-22'),
(14, 'James Lewis', 'james.lewis@example.com', '2025-01-23'),
(15, 'Charlotte Walker', 'charlotte.walker@example.com', '2025-01-24'),
(16, 'Benjamin Young', 'benjamin.young@example.com', '2025-01-25'),
(17, 'Evelyn King', 'evelyn.king@example.com', '2025-01-26'),
(18, 'Henry Wright', 'henry.wright@example.com', '2025-01-27'),
(19, 'Abigail Scott', 'abigail.scott@example.com', '2025-01-28'),
(20, 'Daniel Green', 'daniel.green@example.com', '2025-01-29');

/* 3. TUTOR (10 rows) */
INSERT INTO Tutor (TutorID, FullName, Email, Bio, ExperienceYears, RatingAverage) VALUES
(1, 'Dr. William Carter', 'william.carter@example.com', 'Teaches intro CS and basic programming.', 6, 4.8),
(2, 'Sarah Bennett', 'sarah.bennett@example.com', 'Math tutor for calculus and linear algebra.', 5, 4.7),
(3, 'Michael Turner', 'michael.turner@example.com', 'Physics concepts and exam prep.', 4, 4.5),
(4, 'Laura Collins', 'laura.collins@example.com', 'Business and accounting sessions.', 7, 4.6),
(5, 'David Mitchell', 'david.mitchell@example.com', 'Academic writing and literature.', 3, 4.4),
(6, 'Emily Rogers', 'emily.rogers@example.com', 'Data structures and problem solving.', 2, 4.3),
(7, 'Robert Hughes', 'robert.hughes@example.com', 'Intro to psychology and study skills.', 5, 4.9),
(8, 'Jessica Parker', 'jessica.parker@example.com', 'Economics principles.', 4, 4.2),
(9, 'Brian Adams', 'brian.adams@example.com', 'Physics labs and extra help.', 3, 4.1),
(10, 'Natalie Brooks', 'natalie.brooks@example.com', 'Web dev + writing help.', 2, 4.0);

/* 4. COURSE (10 rows, tied to majors) */
INSERT INTO Course (CourseID, CourseCode, CourseName, Description, Level, MajorID) VALUES
(1, 'CS101', 'Intro to Programming', 'Basics of programming in Python.', 'Undergraduate', 1),
(2, 'CS201', 'Data Structures', 'Arrays, lists, trees, graphs.', 'Undergraduate', 1),
(3, 'MATH101', 'Calculus I', 'Limits, derivatives, integrals.', 'Undergraduate', 2),
(4, 'MATH210', 'Linear Algebra', 'Matrices, vectors, eigenvalues.', 'Undergraduate', 2),
(5, 'PHYS101', 'General Physics', 'Motion, forces, energy.', 'Undergraduate', 3),
(6, 'BUS101', 'Intro to Business', 'Principles of business and management.', 'Undergraduate', 4),
(7, 'ENG101', 'Academic Writing', 'Essay structure and argument.', 'Undergraduate', 5),
(8, 'PSY101', 'Intro to Psychology', 'Core concepts in psychology.', 'Undergraduate', 6),
(9, 'ECON101', 'Principles of Economics', 'Micro and macro basics.', 'Undergraduate', 7),
(10, 'HIST101', 'World History', 'Key events in world history.', 'Undergraduate', 8);

/* 5. TUTORCOURSE
   make it logical:
   - Tutor 1 + Tutor 6 + Tutor 10 handle CS courses (1,2)
   - Tutor 2 handles math (3,4)
   - Tutor 3 + Tutor 9 handle physics (5)
   - Tutor 4 handles business (6)
   - Tutor 5 + Tutor 10 handle writing (7)
   - Tutor 7 handles psychology (8)
   - Tutor 8 handles economics (9)
   - Tutor 9 also handles history (10)
*/
INSERT INTO TutorCourse (TutorID, CourseID) VALUES
(1, 1),
(1, 2),
(6, 1),
(6, 2),
(10, 1),
(2, 3),
(2, 4),
(3, 5),
(9, 5),
(4, 6),
(5, 7),
(10, 7),
(7, 8),
(8, 9),
(9, 10);

/* 6. STUDENTCOURSE
   - each student is in 1–2 courses that match the above courses
   - keeps it realistic for joins later
*/
INSERT INTO StudentCourse (StudentID, CourseID) VALUES
(1, 1), (1, 3),
(2, 1), (2, 2),
(3, 3),
(4, 1), (4, 5),
(5, 7),
(6, 6),
(7, 3), (7, 4),
(8, 1),
(9, 5),
(10, 6),
(11, 7),
(12, 1), (12, 2),
(13, 9),
(14, 3),
(15, 4),
(16, 5),
(17, 8),
(18, 9),
(19, 1),
(20, 10);

/* 7. AVAILABILITYSLOT (20 rows)
   spread across 2025-11-10 .. 2025-11-16
   each tied to an existing TutorID and CourseID above
*/
INSERT INTO AvailabilitySlot (SlotID, Date, StartTime, EndTime, Capacity, Location, Status, TutorID, CourseID) VALUES
(1, '2025-11-10', '10:00:00', '11:00:00', 3, 'Room A1', 'Open', 1, 1),
(2, '2025-11-10', '11:00:00', '12:00:00', 3, 'Room A1', 'Open', 1, 2),
(3, '2025-11-10', '14:00:00', '15:00:00', 2, 'Online', 'Open', 2, 3),
(4, '2025-11-11', '09:00:00', '10:00:00', 2, 'Room B2', 'Open', 2, 4),
(5, '2025-11-11', '10:30:00', '11:30:00', 4, 'Online', 'Open', 3, 5),
(6, '2025-11-11', '15:00:00', '16:00:00', 3, 'Room C1', 'Open', 4, 6),
(7, '2025-11-12', '09:00:00', '10:00:00', 3, 'Room D1', 'Open', 5, 7),
(8, '2025-11-12', '11:00:00', '12:00:00', 2, 'Online', 'Open', 6, 1),
(9, '2025-11-12', '13:00:00', '14:00:00', 2, 'Online', 'Open', 6, 2),
(10, '2025-11-13', '10:00:00', '11:00:00', 3, 'Room E3', 'Open', 7, 8),
(11, '2025-11-13', '11:00:00', '12:00:00', 3, 'Online', 'Open', 8, 9),
(12, '2025-11-13', '14:00:00', '15:00:00', 3, 'Room F2', 'Open', 9, 5),
(13, '2025-11-14', '09:00:00', '10:00:00', 2, 'Online', 'Open', 10, 1),
(14, '2025-11-14', '10:00:00', '11:00:00', 2, 'Room G1', 'Open', 10, 7),
(15, '2025-11-14', '11:00:00', '12:00:00', 3, 'Room G1', 'Open', 4, 6),
(16, '2025-11-15', '09:00:00', '10:00:00', 3, 'Online', 'Open', 3, 5),
(17, '2025-11-15', '11:00:00', '12:00:00', 2, 'Online', 'Open', 2, 3),
(18, '2025-11-15', '13:00:00', '14:00:00', 2, 'Room H4', 'Open', 1, 2),
(19, '2025-11-16', '10:00:00', '11:00:00', 3, 'Online', 'Open', 8, 9),
(20, '2025-11-16', '14:00:00', '15:00:00', 3, 'Room I2', 'Open', 7, 8);

/* 8. BOOKING (20 rows)
   all SlotID 1..20 exist
   all StudentID 1..20 exist
*/
INSERT INTO Booking (BookingID, Status, SlotID, StudentID) VALUES
(1, 'Confirmed', 1, 1),
(2, 'Confirmed', 1, 2),
(3, 'Requested', 2, 3),
(4, 'Completed', 3, 4),
(5, 'Completed', 4, 5),
(6, 'Confirmed', 5, 6),
(7, 'Confirmed', 6, 7),
(8, 'Completed', 7, 8),
(9, 'Requested', 8, 9),
(10, 'No Show', 9, 10),
(11, 'Completed', 10, 11),
(12, 'Completed', 11, 12),
(13, 'Confirmed', 12, 13),
(14, 'Confirmed', 13, 14),
(15, 'Completed', 14, 15),
(16, 'Requested', 15, 16),
(17, 'Confirmed', 16, 17),
(18, 'Completed', 17, 18),
(19, 'Requested', 18, 19),
(20, 'Confirmed', 19, 20);

/* 9. ATTENDANCE
   only for bookings that make sense to mark
*/
INSERT INTO Attendance (BookingID, Attended, MarkedAt) VALUES
(1,  'Yes', '2025-11-10 11:05:00'),
(2,  'Yes', '2025-11-10 11:06:00'),
(3,  'No',  '2025-11-10 12:05:00'),
(4,  'Yes', '2025-11-11 09:15:00'),
(5,  'Yes', '2025-11-11 10:15:00'),
(6,  'Yes', '2025-11-11 11:45:00'),
(7,  'Yes', '2025-11-11 16:05:00'),
(8,  'Yes', '2025-11-12 09:05:00'),
(9,  'No',  '2025-11-12 12:05:00'),
(10, 'No',  '2025-11-12 14:05:00'),
(11, 'Yes', '2025-11-13 11:05:00'),
(12, 'Yes', '2025-11-13 12:05:00'),
(13, 'Yes', '2025-11-13 15:05:00'),
(14, 'Yes', '2025-11-14 10:05:00'),
(15, 'Yes', '2025-11-14 11:05:00');


/* 10. REVIEW  */
INSERT INTO Review (BookingID, Rating, Comment, ReviewDate) VALUES
(4, 5, 'Great math session.', '2025-11-11 11:30:00'),
(5, 4, 'Helpful, went through examples.', '2025-11-11 10:30:00'),
(8, 5, 'Very clear writing tips.', '2025-11-12 10:30:00'),
(11, 5, 'Psych session was engaging.', '2025-11-13 11:30:00'),
(12, 4, 'Econ recap was useful.', '2025-11-13 12:30:00');
