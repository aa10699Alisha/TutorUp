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
    HashedPassword VARCHAR(255) NOT NULL,
    DateJoined DATE NOT NULL
);


-- 3. Tutor
CREATE TABLE Tutor (
    TutorID INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(150) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    HashedPassword VARCHAR(255) NOT NULL,
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
    Status ENUM('Open', 'Closed') NOT NULL DEFAULT 'Open',
    TutorID INT NOT NULL,
    CourseID INT NOT NULL,
    FOREIGN KEY (TutorID) REFERENCES Tutor(TutorID),
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID)
);

-- 8. Booking
CREATE TABLE Booking (
    BookingID INT AUTO_INCREMENT PRIMARY KEY,
    Status ENUM('Confirmed','Completed', 'Cancelled') NOT NULL DEFAULT 'Confirmed',
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

-- 1. MAJOR (10 rows)
INSERT INTO Major (MajorID, MajorName) VALUES
(1, 'Computer Science'),
(2, 'Mathematics'),
(3, 'Physics'),
(4, 'Biology'),
(5, 'Chemistry'),
(6, 'Economics'),
(7, 'Psychology'),
(8, 'English Literature'),
(9, 'History'),
(10, 'Business Administration');

-- 2. STUDENT (20 rows)
INSERT INTO Student (StudentID, FullName, Email, HashedPassword, DateJoined) VALUES
(1, 'Alice Johnson', 'alice.johnson@example.com', 'hashed_pw_1', '2025-10-01'),
(2, 'Brian Smith', 'brian.smith@example.com', 'hashed_pw_2', '2025-10-02'),
(3, 'Catherine Lee', 'catherine.lee@example.com', 'hashed_pw_3', '2025-10-03'),
(4, 'Daniel Green', 'daniel.green@example.com', 'hashed_pw_4', '2025-10-04'),
(5, 'Emma Davis', 'emma.davis@example.com', 'hashed_pw_5', '2025-10-05'),
(6, 'Frank Miller', 'frank.miller@example.com', 'hashed_pw_6', '2025-10-06'),
(7, 'Grace Wilson', 'grace.wilson@example.com', 'hashed_pw_7', '2025-10-07'),
(8, 'Henry Clark', 'henry.clark@example.com', 'hashed_pw_8', '2025-10-08'),
(9, 'Isabella King', 'isabella.king@example.com', 'hashed_pw_9', '2025-10-09'),
(10, 'Jack Turner', 'jack.turner@example.com', 'hashed_pw_10', '2025-10-10'),
(11, 'Karen Walker', 'karen.walker@example.com', 'hashed_pw_11', '2025-10-11'),
(12, 'Liam Scott', 'liam.scott@example.com', 'hashed_pw_12', '2025-10-12'),
(13, 'Mia Adams', 'mia.adams@example.com', 'hashed_pw_13', '2025-10-13'),
(14, 'Noah Baker', 'noah.baker@example.com', 'hashed_pw_14', '2025-10-14'),
(15, 'Olivia Perez', 'olivia.perez@example.com', 'hashed_pw_15', '2025-10-15'),
(16, 'Peter Young', 'peter.young@example.com', 'hashed_pw_16', '2025-10-16'),
(17, 'Quinn Harris', 'quinn.harris@example.com', 'hashed_pw_17', '2025-10-17'),
(18, 'Ryan Mitchell', 'ryan.mitchell@example.com', 'hashed_pw_18', '2025-10-18'),
(19, 'Sophia Rogers', 'sophia.rogers@example.com', 'hashed_pw_19', '2025-10-19'),
(20, 'Thomas Evans', 'thomas.evans@example.com', 'hashed_pw_20', '2025-10-20');

-- 3. TUTOR (10 rows)
INSERT INTO Tutor (TutorID, FullName, Email, HashedPassword, Bio, ExperienceYears, RatingAverage) VALUES
(1, 'Dr. James Carter', 'james.carter@tutors.com', 'hashed_tutor_1', 'CS tutor specializing in algorithms.', 5, 4.70),
(2, 'Sarah Thompson', 'sarah.thompson@tutors.com', 'hashed_tutor_2', 'Math and statistics tutor.', 4, 4.50),
(3, 'Michael Brown', 'michael.brown@tutors.com', 'hashed_tutor_3', 'Physics tutor, loves mechanics.', 6, 4.80),
(4, 'Emily Wilson', 'emily.wilson@tutors.com', 'hashed_tutor_4', 'Biology tutor with lab experience.', 3, 4.40),
(5, 'David Johnson', 'david.johnson@tutors.com', 'hashed_tutor_5', 'Chemistry and organic specialist.', 7, 4.90),
(6, 'Olivia Taylor', 'olivia.taylor@tutors.com', 'hashed_tutor_6', 'Economics tutor, micro/macro.', 2, 4.30),
(7, 'Christopher Moore', 'chris.moore@tutors.com', 'hashed_tutor_7', 'Psychology tutor, research methods.', 4, 4.60),
(8, 'Ashley Martinez', 'ashley.martinez@tutors.com', 'hashed_tutor_8', 'English literature tutor.', 5, 4.75),
(9, 'Robert Anderson', 'robert.anderson@tutors.com', 'hashed_tutor_9', 'History and IR tutor.', 3, 4.35),
(10, 'Jessica Lewis', 'jessica.lewis@tutors.com', 'hashed_tutor_10', 'Business and management tutor.', 6, 4.85);

-- 4. COURSE (10 rows) – tied to different majors
INSERT INTO Course (CourseID, CourseCode, CourseName, Description, Level, MajorID) VALUES
(1, 'CS101', 'Intro to Programming', 'Basics of programming with Python.', 'Undergraduate', 1),
(2, 'MATH201', 'Calculus II', 'Integration techniques and series.', 'Undergraduate', 2),
(3, 'PHYS150', 'Classical Mechanics', 'Newtonian mechanics and energy.', 'Undergraduate', 3),
(4, 'BIO110', 'General Biology', 'Cell structure, genetics, evolution.', 'Undergraduate', 4),
(5, 'CHEM120', 'Organic Chemistry I', 'Intro to organic chemistry.', 'Undergraduate', 5),
(6, 'ECON101', 'Microeconomics', 'Consumer and firm behavior.', 'Undergraduate', 6),
(7, 'PSY101', 'Intro to Psychology', 'Foundations of psychology.', 'Undergraduate', 7),
(8, 'ENG210', 'Modern Literature', 'Study of 20th century literature.', 'Undergraduate', 8),
(9, 'HIST200', 'World History', 'Global historical developments.', 'Undergraduate', 9),
(10, 'BUS105', 'Principles of Management', 'Intro to management and org behavior.', 'Undergraduate', 10);

-- 5. TUTORCOURSE (10 rows)
INSERT INTO TutorCourse (TutorID, CourseID) VALUES
(1, 1),   -- James teaches CS101
(2, 2),   -- Sarah teaches Calculus II
(3, 3),   -- Michael teaches Mechanics
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10);

-- 6. STUDENTCOURSE (10 rows) – just sample enrollments
INSERT INTO StudentCourse (StudentID, CourseID) VALUES
(1, 1),
(2, 2),
(3, 1),
(4, 3),
(5, 4),
(6, 5),
(7, 6),
(8, 7),
(9, 8),
(10, 9);

-- 7. AVAILABILITYSLOT (20 rows)
-- dates spread, tutors + courses reused
INSERT INTO AvailabilitySlot (SlotID, Date, StartTime, EndTime, Capacity, Location, Status, TutorID, CourseID) VALUES
(1, '2025-11-10', '10:00:00', '11:00:00', 2, 'Room A101', 'Open', 1, 1),
(2, '2025-11-10', '11:00:00', '12:00:00', 1, 'Room A101', 'Open', 1, 1),
(3, '2025-11-11', '09:00:00', '10:00:00', 3, 'Room B202', 'Open', 2, 2),
(4, '2025-11-11', '14:00:00', '15:00:00', 1, 'Room B202', 'Closed', 2, 2),
(5, '2025-11-12', '13:00:00', '14:00:00', 2, 'Room C303', 'Open', 3, 3),
(6, '2025-11-12', '15:00:00', '16:00:00', 1, 'Room C303', 'Open', 3, 3),
(7, '2025-11-13', '10:00:00', '11:00:00', 2, 'Room D404', 'Open', 4, 4),
(8, '2025-11-13', '11:00:00', '12:00:00', 2, 'Room D404', 'Open', 4, 4),
(9, '2025-11-14', '09:30:00', '10:30:00', 1, 'Room E505', 'Open', 5, 5),
(10, '2025-11-14', '10:30:00', '11:30:00', 1, 'Room E505', 'Open', 5, 5),
(11, '2025-11-15', '12:00:00', '13:00:00', 2, 'Room F606', 'Open', 6, 6),
(12, '2025-11-15', '13:00:00', '14:00:00', 1, 'Room F606', 'Closed', 6, 6),
(13, '2025-11-16', '14:00:00', '15:00:00', 2, 'Room G707', 'Open', 7, 7),
(14, '2025-11-16', '15:00:00', '16:00:00', 2, 'Room G707', 'Open', 7, 7),
(15, '2025-11-17', '09:00:00', '10:00:00', 3, 'Room H808', 'Open', 8, 8),
(16, '2025-11-17', '10:00:00', '11:00:00', 1, 'Room H808', 'Open', 8, 8),
(17, '2025-11-18', '11:00:00', '12:00:00', 2, 'Room I909', 'Open', 9, 9),
(18, '2025-11-18', '12:00:00', '13:00:00', 1, 'Room I909', 'Open', 9, 9),
(19, '2025-11-19', '13:00:00', '14:00:00', 2, 'Room J010', 'Open', 10, 10),
(20, '2025-11-19', '14:00:00', '15:00:00', 2, 'Room J010', 'Open', 10, 10);

-- 8. BOOKING (10 rows) – only Confirmed/Completed
INSERT INTO Booking (BookingID, Status, CreatedAt, SlotID, StudentID) VALUES
(1, 'Completed', '2025-11-01 09:15:00', 1, 1),
(2, 'Completed', '2025-11-01 10:00:00', 2, 2),
(3, 'Confirmed', '2025-11-02 11:30:00', 3, 3),
(4, 'Completed', '2025-11-02 12:10:00', 4, 4),
(5, 'Completed', '2025-11-03 13:45:00', 5, 5),
(6, 'Confirmed', '2025-11-03 14:20:00', 6, 6),
(7, 'Completed', '2025-11-04 09:50:00', 7, 7),
(8, 'Completed', '2025-11-04 10:30:00', 8, 8),
(9, 'Confirmed', '2025-11-05 11:05:00', 9, 9),
(10, 'Completed', '2025-11-05 11:40:00', 10, 10);

-- 9. ATTENDANCE (10 rows) – 1-to-1 with Booking
INSERT INTO Attendance (BookingID, Attended, MarkedAt) VALUES
(1, 'Yes', '2025-11-01 11:00:00'),
(2, 'Yes', '2025-11-01 12:00:00'),
(3, 'No',  NULL),
(4, 'Yes', '2025-11-02 15:00:00'),
(5, 'Yes', '2025-11-03 15:00:00'),
(6, 'No',  NULL),
(7, 'Yes', '2025-11-04 11:30:00'),
(8, 'Yes', '2025-11-04 12:30:00'),
(9, 'No',  NULL),
(10, 'Yes', '2025-11-05 13:00:00');

-- 10. REVIEW (10 rows) – sample ratings
INSERT INTO Review (BookingID, Rating, Comment, ReviewDate) VALUES
(1, 5, 'Very helpful session.', '2025-11-01 12:05:00'),
(2, 4, 'Good explanation of calculus.', '2025-11-01 12:30:00'),
(3, 3, 'Could not attend fully.', '2025-11-02 12:30:00'),
(4, 5, 'Great tutor, clear and patient.', '2025-11-02 16:00:00'),
(5, 4, 'Organic chem examples were useful.', '2025-11-03 16:00:00'),
(6, 4, 'Economics intro was solid.', '2025-11-03 16:30:00'),
(7, 5, 'Loved the psychology overview.', '2025-11-04 13:00:00'),
(8, 5, 'Literature discussion was engaging.', '2025-11-04 13:30:00'),
(9, 3, 'History was okay, need more sources.', '2025-11-05 12:30:00'),
(10, 5, 'Business concepts were very clear.', '2025-11-05 13:30:00');