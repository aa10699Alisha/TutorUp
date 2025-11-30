# TutorUp - Peer Tutoring Sessions Database

A full-stack web application for managing peer tutoring sessions at universities. Students can search for tutors by subject or course, view tutor profiles, and book available time slots. Tutors can manage their teaching subjects, set up availability slots, and track their bookings.

## Project Structure

```
TutorUp/
├── back-end/              # Express.js backend API
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── routes/           # API routes
│   ├── .env              # Environment variables
│   ├── app.js            # Express app setup
│   ├── server.js         # Server entry point
│   └── package.json      # Backend dependencies
│
├── front-end/            # React frontend
│   ├── public/          # Static files
│   ├── src/             
│   │   ├── components/  # React components
│   │   │   ├── Auth/   # Authentication components
│   │   │   ├── Student/ # Student-facing components
│   │   │   ├── Tutor/   # Tutor-facing components
│   │   │   └── Slots/   # Slot viewing components
│   │   ├── services/    # API service layer
│   │   ├── App.js       # Main app component
│   │   └── index.js     # React entry point
│   └── package.json     # Frontend dependencies
│
└── Milestones-1-3-diagrams-wireframes-and-sql-code/
    ├── sqlcode/         # SQL scripts
    │   └── COMMANDS.sql # Database schema, data, queries, procedures
    ├── Wireframes/      # UI/UX designs
    └── ERD Diagram Milestone 3/ # Entity Relationship Diagram
```

## Tech Stack

### Backend
- **Node.js** with **Express.js** - REST API server
- **MySQL** (Aiven hosted) - Relational database
- **mysql2** - MySQL client with promise support
- **bcrypt** - Password hashing
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing
- **morgan** - HTTP request logger

### Frontend
- **React** - UI library
- **React Router DOM** - Client-side routing (ready for implementation)
- **Fetch API** - HTTP requests to backend

## Database

The application uses a **MySQL database hosted on Aiven**. The database includes:

### Tables
- `Major` - Academic majors
- `Student` - Student accounts
- `Tutor` - Tutor accounts
- `Course` - Courses linked to majors
- `TutorCourse` - Tutors teaching specific courses
- `StudentCourse` - Students enrolled in courses
- `AvailabilitySlot` - Tutor availability slots with capacity management
- `Booking` - Student bookings for slots
- `Attendance` - Attendance records for bookings
- `Review` - Student reviews for completed sessions

### Key Features
- **Triggers** to prevent booking on closed slots and auto-close slots when capacity is reached
- **Stored Procedures** for complex operations:
  - `GetStudentSessions` - Get student sessions with sorting
  - `GetTutorUpcomingSessions` - Get tutor sessions with sorting
  - `cancel_booking` - Cancel booking and reopen slot if capacity allows
- **Business Rules**:
  - Bookings only allowed on 'Open' slots
  - Slots auto-close when capacity is reached
  - Reviews only allowed for attended sessions
  - One review per booking maximum

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Access to the Aiven MySQL database (credentials in `.env`)

### Backend Setup

1. **Navigate to the backend directory:**
   ```powershell
   cd TutorUp\back-end
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Configure environment variables:**
   
   The `.env` file is already configured with Aiven credentials:
   ```
   ```

4. **Start the backend server:**
   
   **For Development (with auto-restart on file changes):**
   ```powershell
   npm run dev
   ```
   
   **For Production:**
   ```powershell
   npm start
   ```

   The backend will run on `http://localhost:3001`
   
   **Note:** Always use `npm run dev` during development - the server will automatically restart when you save changes to any file!

### Frontend Setup

1. **Open a new terminal and navigate to the frontend directory:**
   ```powershell
   cd TutorUp\front-end
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Configure environment variables:**
   
   The `.env` file points to the backend API:
   ```
   REACT_APP_API_URL=http://localhost:3001/api
   ```

4. **Start the frontend development server:**
   ```powershell
   npm start
   ```

   The frontend will run on `http://localhost:3000` and automatically open in your browser.

## Database Setup

The database schema, sample data, triggers, and stored procedures are already loaded into the Aiven MySQL database. The SQL code is available in:

```
TutorUp/Milestones-1-3-diagrams-wireframes-and-sql-code/sqlcode/COMMANDS.sql
```

### If you need to update the database:

1. Connect to the Aiven MySQL database using a MySQL client (e.g., MySQL Workbench, DBeaver, or command line):
   ```
   
   ```

2. Run the SQL scripts from `COMMANDS.sql` as needed.

### Database Schema Highlights

**Tables created:**
- Major, Student, Tutor, Course
- TutorCourse, StudentCourse (many-to-many relationships)
- AvailabilitySlot, Booking, Attendance, Review

**Sample data inserted:**
- 10 Majors
- 20 Students
- 10 Tutors
- 10 Courses
- 25 Availability Slots
- 15 Bookings
- Attendance and Review records

**Triggers:**
- `booking_only_if_open` - Prevents booking on non-open slots
- `trg_after_booking_insert` - Auto-closes slots when capacity reached

**Stored Procedures:**
- `GetStudentSessions(studentId, sortBy)` - Student's upcoming sessions
- `GetTutorUpcomingSessions(tutorId, sortBy)` - Tutor's upcoming sessions
- `cancel_booking(bookingId, studentId)` - Cancel booking with slot reopening logic

## API Endpoints

### Authentication
- `POST /api/auth/student/signup` - Student registration
- `POST /api/auth/student/signin` - Student login
- `POST /api/auth/tutor/signup` - Tutor registration
- `POST /api/auth/tutor/signin` - Tutor login

### Courses & Majors
- `GET /api/courses/majors` - Get all majors
- `GET /api/courses/by-major/:majorId` - Get courses by major
- `GET /api/courses/:courseId` - Get course details
- `GET /api/courses/:courseId/slots` - Get available slots for a course

### Tutors
- `GET /api/tutors/:tutorId` - Get tutor information
- `GET /api/tutors/:tutorId/profile` - Get tutor profile
- `PUT /api/tutors/:tutorId/profile` - Update tutor profile

### Bookings
- `POST /api/bookings` - Create a booking
- `DELETE /api/bookings/:bookingId` - Cancel a booking
- `GET /api/bookings/student/:studentId/upcoming` - Student's upcoming sessions
- `GET /api/bookings/student/:studentId/past` - Student's past sessions
- `GET /api/bookings/tutor/:tutorId/upcoming` - Tutor's upcoming sessions
- `GET /api/bookings/tutor/:tutorId/past` - Tutor's past sessions

### Slots
- `GET /api/slots/today` - Today's scheduled slots
- `GET /api/slots/tomorrow` - Tomorrow's scheduled slots

### Students
- `GET /api/students/:studentId/profile` - Get student profile
- `PUT /api/students/:studentId/password` - Update student password
- `PUT /api/students/attendance/:bookingId` - Mark attendance
- `POST /api/students/review/:bookingId` - Submit a review
- `DELETE /api/students/:studentId` - Delete student account

## Features

### For Students
1. **Browse & Search**
   - Browse courses by major
   - View course details and available tutoring slots
   - See tutor information and ratings

2. **Booking Management**
   - Book available tutoring sessions
   - View upcoming sessions (sortable by date, tutor, or course)
   - Cancel bookings
   - View past sessions

3. **Reviews**
   - Leave reviews for completed sessions (one per booking)
   - Rate tutors on a 5-star scale
   - Add written comments

4. **Profile**
   - View profile information
   - Change password

### For Tutors
1. **Session Management**
   - View upcoming sessions (sortable by time, student, or course)
   - View past sessions
   - See student information for each session

2. **Attendance Tracking**
   - Mark student attendance (Yes/No) for past sessions

3. **Reviews**
   - View student reviews and ratings

4. **Profile**
   - View and edit bio
   - Update years of experience
   - See average rating

### General Features
- **Today's & Tomorrow's Slots**: Both students and tutors can view upcoming daily schedules
- **Capacity Management**: Slots automatically close when booking capacity is reached
- **Authentication**: Separate login/signup flows for students and tutors

## Application Flow

### Student Journey
1. Sign up or sign in as a student
2. Browse majors → Select a major → View courses
3. Select a course → View available tutoring slots
4. Book a session with a tutor
5. View upcoming sessions (My Sessions → Upcoming)
6. After session completion, leave a review
7. View past sessions and reviews (My Sessions → Past)

### Tutor Journey
1. Sign up or sign in as a tutor
2. View upcoming sessions with student details
3. After sessions, mark attendance for students
4. View past sessions with reviews
5. Update profile (bio, experience)

## Architecture Notes

This project follows the same architectural patterns as the NextQuad project (Project A):

### Backend Patterns
- **MVC Structure**: Routes → Controllers → Database
- **Connection Pooling**: MySQL connection pool for efficient database access
- **Error Handling**: Consistent error responses with `success` boolean
- **Response Format**: 
  ```javascript
  {
    success: true/false,
    data: {...},
    count: number,  // for list endpoints
    error: "message" // for errors
  }
  ```

### Frontend Patterns
- **Component-Based**: Reusable React components
- **Service Layer**: Centralized API calls in `services/api.js`
- **State Management**: Local component state with useState/useEffect
- **Navigation**: Page-based navigation through App.js state (can be upgraded to React Router)
- **Styling**: Component-specific CSS files

## Testing the Application

### Quick Test Flow

1. **Start both servers** (backend on port 3001, frontend on port 3000)

2. **Create a Student Account:**
   - Click "Students" → "Sign Up"
   - Fill in details and register

3. **Browse and Book:**
   - After login, browse majors
   - Select a course
   - Book an available slot

4. **Create a Tutor Account:**
   - Logout and create a tutor account
   - View upcoming sessions to see the booking

5. **Complete Session Flow:**
   - Mark attendance for the session
   - Switch to student account
   - Leave a review for the completed session

## Troubleshooting

### Backend won't start
- Check that port 3001 is available
- Verify database credentials in `.env`
- Run `npm install` to ensure all dependencies are installed
- Check database connection logs in terminal

### Frontend won't connect to backend
- Verify backend is running on port 3001
- Check `.env` file has correct `REACT_APP_API_URL`
- Restart frontend after changing `.env` file

### Database connection errors
- Verify Aiven database is accessible
- Check firewall/network settings
- Confirm credentials are correct
- Ensure IP is whitelisted in Aiven console (if applicable)

### CORS errors
- Backend includes CORS middleware - should work by default
- Ensure frontend is calling `http://localhost:3001/api` not production URLs

## Development Notes

### Adding New Features

**Backend:**
1. Add route in `routes/` folder
2. Create controller in `controllers/` folder
3. Import and use route in `app.js`

**Frontend:**
1. Create component in appropriate folder under `components/`
2. Add page case in `App.js` renderContent()
3. Create API service function in `services/api.js`

### Code Style
- Follow existing patterns from Project A
- Use async/await for asynchronous operations
- Include error handling in all API calls
- Maintain consistent response formats

## Future Enhancements

- Implement React Router for better navigation
- Add JWT authentication with protected routes
- Real-time notifications for bookings
- Tutor availability calendar interface
- Advanced search and filtering
- Email notifications for bookings
- Admin panel for managing users and sessions
- Analytics dashboard for tutors
- Messaging system between students and tutors

## Credits

Developed following the architecture patterns of the NextQuad project.

Database schema, wireframes, and SQL code located in:
`Milestones-1-3-diagrams-wireframes-and-sql-code/`

## License

This is an educational project.