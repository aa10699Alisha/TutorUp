import React from 'react';

function Welcome({ onNavigate }) {
  return (
    <div className="page-container" style={{ textAlign: 'center' }}>
      <h2>Welcome to TutorUp</h2>
      <p style={{ fontSize: '1.2em', marginBottom: '30px' }}>
        Your peer tutoring session management platform
      </p>
      
      <div style={{ marginBottom: '40px' }}>
        <h3>Students</h3>
        <button className="btn" onClick={() => onNavigate('student-signup')}>
          Sign Up as Student
        </button>
        <button className="btn btn-secondary" onClick={() => onNavigate('student-signin')}>
          Student Sign In
        </button>
      </div>

      <div>
        <h3>Tutors</h3>
        <button className="btn btn-secondary" onClick={() => onNavigate('tutor-signin')}>
          Tutor Sign In
        </button>
      </div>
    </div>
  );
}

export default Welcome;
