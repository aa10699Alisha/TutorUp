require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

async function count(table) {
  const [rows] = await pool.query(`SELECT COUNT(*) AS c FROM ${table}`);
  return rows[0].c;
}

async function seed() {
  console.log('\n=== TutorUp Seed Start ===');

  // 1. Majors
  if (await count('Major') === 0) {
    await pool.query(`INSERT INTO Major (MajorName) VALUES ('Computer Science'), ('Mathematics')`);
    console.log('✔ Seed Majors');
  } else {
    console.log('↺ Majors already seeded');
  }

  // 2. Courses
  if (await count('Course') === 0) {
    await pool.query(`INSERT INTO Course (CourseCode, CourseName, Description, Level, MajorID) VALUES
      ('CS101','Intro to Programming','Basics with Python','Undergraduate',1),
      ('MATH201','Calculus II','Integration & Series','Undergraduate',2)`);
    console.log('✔ Seed Courses');
  } else {
    console.log('↺ Courses already seeded');
  }

  // 3. Tutor
  if (await count('Tutor') === 0) {
    const tutorHash = await bcrypt.hash('tutor123', 10);
    await pool.query(`INSERT INTO Tutor (FullName, Email, HashedPassword, Bio, ExperienceYears, RatingAverage) VALUES
      ('Test Tutor','tutor@test.com','${tutorHash}','Demo tutor',1,0.00)`);
    console.log('✔ Seed Tutor');
  } else {
    console.log('↺ Tutor already seeded');
  }

  // 4. Student
  if (await count('Student') === 0) {
    const studentHash = await bcrypt.hash('student123', 10);
    await pool.query(`INSERT INTO Student (FullName, Email, HashedPassword, DateJoined) VALUES
      ('Test Student','student@test.com','${studentHash}',CURDATE())`);
    console.log('✔ Seed Student');
  } else {
    console.log('↺ Student already seeded');
  }

  // 5. AvailabilitySlot
  if (await count('AvailabilitySlot') === 0) {
    await pool.query(`INSERT INTO AvailabilitySlot (Date, StartTime, EndTime, Capacity, Location, Status, TutorID, CourseID) VALUES
      (CURDATE() + INTERVAL 1 DAY,'10:00:00','11:00:00',2,'Room A101','Open',1,1)`);
    console.log('✔ Seed AvailabilitySlot');
  } else {
    console.log('↺ AvailabilitySlot already seeded');
  }

  console.log('\n=== Seed Complete ===');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed fatal error:', err);
  process.exit(1);
});
