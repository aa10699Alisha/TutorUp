import React, { useState, useRef, useEffect } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const drawerRef = useRef(null);
  const hamburgerRef = useRef(null);

  // Close mobile drawer when clicking outside (in addition to overlay)
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleOutside = (e) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(e.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [isMobileMenuOpen]);

  const handleLogin = (userData, type) => {
    setUser(userData);
    setUserType(type);
    setCurrentPage(type === 'student' ? 'majors' : 'tutor-sessions');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      setUser(null);
      setUserType(null);
      setCurrentPage('welcome');
      setSelectedMajor(null);
      setSelectedCourse(null);
    }
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
        <h1 className="desktop-title">TutorUp</h1>
        {user && (
          <>
            {/* Desktop Navigation */}
            <nav className="main-nav desktop-only">
              {userType === 'student' && (
                <>
                  <button 
                    onClick={() => setCurrentPage('majors')}
                    className={['majors', 'courses', 'course-detail'].includes(currentPage) ? 'active' : ''}
                  >
                    Browse Courses
                  </button>
                  <button 
                    onClick={() => setCurrentPage('student-sessions')}
                    className={currentPage === 'student-sessions' ? 'active' : ''}
                  >
                    My Sessions
                  </button>
                  <button 
                    onClick={() => setCurrentPage('settings')}
                    className={currentPage === 'settings' ? 'active' : ''}
                  >
                    Settings
                  </button>
                  <button 
                    onClick={() => setCurrentPage('student-profile')}
                    className={currentPage === 'student-profile' ? 'active' : ''}
                  >
                    Profile
                  </button>
                </>
              )}
              {userType === 'tutor' && (
                <>
                  <button 
                    onClick={() => setCurrentPage('tutor-sessions')}
                    className={currentPage === 'tutor-sessions' ? 'active' : ''}
                  >
                    My Sessions
                  </button>
                  <button 
                    onClick={() => setCurrentPage('settings')}
                    className={currentPage === 'settings' ? 'active' : ''}
                  >
                    Settings
                  </button>
                  <button 
                    onClick={() => setCurrentPage('tutor-profile')}
                    className={currentPage === 'tutor-profile' ? 'active' : ''}
                  >
                    Profile
                  </button>
                </>
              )}
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </nav>

            {/* Mobile Topbar */}
            <div className="mobile-topbar mobile-only">
              <button
                type="button"
                className="hamburger-button"
                aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                ref={hamburgerRef}
              >
                <svg className="hamburger-icon" viewBox="0 0 24 18" aria-hidden="true" focusable="false">
                  <line x1="2" y1="3" x2="22" y2="3" />
                  <line x1="2" y1="9" x2="22" y2="9" />
                  <line x1="2" y1="15" x2="22" y2="15" />
                </svg>
              </button>
              <span className="mobile-topbar-title">TutorUp</span>
            </div>

            {/* Mobile Drawer */}
            <div ref={drawerRef} className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
              {userType === 'student' && (
                <>
                  <button
                    className={`mobile-drawer-item ${['majors', 'courses', 'course-detail'].includes(currentPage) ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentPage('majors');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Browse Courses
                  </button>
                  <button
                    className={`mobile-drawer-item ${currentPage === 'student-sessions' ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentPage('student-sessions');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    My Sessions
                  </button>
                  <button
                    className={`mobile-drawer-item ${currentPage === 'settings' ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentPage('settings');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Settings
                  </button>
                  <button
                    className={`mobile-drawer-item ${currentPage === 'student-profile' ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentPage('student-profile');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Profile
                  </button>
                </>
              )}
              {userType === 'tutor' && (
                <>
                  <button
                    className={`mobile-drawer-item ${currentPage === 'tutor-sessions' ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentPage('tutor-sessions');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    My Sessions
                  </button>
                  <button
                    className={`mobile-drawer-item ${currentPage === 'settings' ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentPage('settings');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Settings
                  </button>
                  <button
                    className={`mobile-drawer-item ${currentPage === 'tutor-profile' ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentPage('tutor-profile');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Profile
                  </button>
                </>
              )}
              <button
                className="mobile-drawer-item"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                Logout
              </button>
            </div>
            {isMobileMenuOpen && (
              <div
                className="mobile-drawer-overlay mobile-only"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden
              />
            )}
          </>
        )}
      </header>
      <main className="App-main">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
