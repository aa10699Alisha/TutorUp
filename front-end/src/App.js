import React, { useState } from 'react';
import './App.css';

// Auth Components
import Welcome from './components/Auth/Welcome';
import StudentSignup from './components/Auth/StudentSignup';
import TutorSignup from './components/Auth/TutorSignup';
import StudentSignin from './components/Auth/StudentSignin';
import TutorSignin from './components/Auth/TutorSignin';

// Student Components
import MajorsList from './components/Student/MajorsList';
import CoursesList from './components/Student/CoursesList';
import CourseDetail from './components/Student/CourseDetail';
import StudentSessions from './components/Student/StudentSessions';
import StudentProfile from './components/Student/StudentProfile';

// Tutor Components
import TutorSessions from './components/Tutor/TutorSessions';
import TutorProfile from './components/Tutor/TutorProfile';

// Settings Component
import Settings from './components/settings/Settings';

function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleLogin = (userData, type) => {
    setUser(userData);
    setUserType(type);
    setCurrentPage(type === 'student' ? 'majors' : 'tutor-sessions');
  };

  const handleLogout = () => {
    setUser(null);
    setUserType(null);
    setCurrentPage('welcome');
    setSelectedMajor(null);
    setSelectedCourse(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return <Welcome onNavigate={setCurrentPage} />;
      case 'student-signup':
        return <StudentSignup onNavigate={setCurrentPage} onLogin={handleLogin} />;
      case 'tutor-signup':
        return <TutorSignup onNavigate={setCurrentPage} onLogin={handleLogin} />;
      case 'student-signin':
        return <StudentSignin onNavigate={setCurrentPage} onLogin={handleLogin} />;
      case 'tutor-signin':
        return <TutorSignin onNavigate={setCurrentPage} onLogin={handleLogin} />;
      case 'majors':
        return <MajorsList onNavigate={setCurrentPage} onSelectMajor={setSelectedMajor} />;
      case 'courses':
        return <CoursesList 
          major={selectedMajor} 
          onNavigate={setCurrentPage} 
          onSelectCourse={setSelectedCourse} 
        />;
      case 'course-detail':
        return <CourseDetail 
          course={selectedCourse} 
          studentId={user?.StudentID}
          onNavigate={setCurrentPage} 
        />;
      case 'student-sessions':
        return <StudentSessions studentId={user?.StudentID} onNavigate={setCurrentPage} />;
      case 'student-profile':
        return <StudentProfile studentId={user?.StudentID} onNavigate={setCurrentPage} onLogout={handleLogout} />;
      case 'tutor-sessions':
        return <TutorSessions tutorId={user?.TutorID} onNavigate={setCurrentPage} />;
      case 'tutor-profile':
        return <TutorProfile tutorId={user?.TutorID} onNavigate={setCurrentPage} onLogout={handleLogout} />;
      case 'settings':
        return <Settings user={user} userType={userType} onNavigate={setCurrentPage} onLogout={handleLogout} />;
      default:
        return <Welcome onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>TutorUp</h1>
        {user && (
          <nav className="main-nav">
            {userType === 'student' && (
              <>
                <button onClick={() => setCurrentPage('majors')}>Browse Courses</button>
                <button onClick={() => setCurrentPage('student-sessions')}>My Sessions</button>
                <button onClick={() => setCurrentPage('settings')}>Settings</button>
                <button onClick={() => setCurrentPage('student-profile')}>Profile</button>
              </>
            )}
            {userType === 'tutor' && (
              <>
                <button onClick={() => setCurrentPage('tutor-sessions')}>My Sessions</button>
                <button onClick={() => setCurrentPage('settings')}>Settings</button>
                <button onClick={() => setCurrentPage('tutor-profile')}>Profile</button>
              </>
            )}
            <button onClick={handleLogout}>Logout</button>
          </nav>
        )}
      </header>
      <main className="App-main">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
