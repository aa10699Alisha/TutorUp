import React, { useState, useEffect } from 'react';
import { getTutorUpcomingSessions, getTutorPastSessions } from '../../services/api';

function TutorSessions({ tutorId, onNavigate }) {
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('Time');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [pastSortBy, setPastSortBy] = useState('Recent');
  const [showPastSortMenu, setShowPastSortMenu] = useState(false);

  const sortParamMap = {
    'Time': 'time',
    'Course': 'course'
  };

  const pastSortOptions = ['Recent', 'Oldest', 'Course'];

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorId, sortBy]);

  const fetchSessions = async () => {
    try {
      const [upcomingResult, pastResult] = await Promise.all([
        getTutorUpcomingSessions(tutorId, sortParamMap[sortBy]),
        getTutorPastSessions(tutorId)
      ]);

      if (upcomingResult.success) {
        setUpcomingSessions(upcomingResult.data);
      }
      if (pastResult.success) {
        setPastSessions(pastResult.data);
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSort = (label) => {
    setSortBy(label);
    setShowSortMenu(false);
  };

  const handleSelectPastSort = (label) => {
    setPastSortBy(label);
    setShowPastSortMenu(false);
  };

  // Client-side sort for past sessions
  const sortedPastSessions = [...pastSessions].sort((a, b) => {
    if (pastSortBy === 'Recent') {
      // Parse MySQL datetime format properly
      const dateStrA = a.Date.split('T')[0];
      const dateStrB = b.Date.split('T')[0];
      const dateA = new Date(`${dateStrA} ${a.StartTime}`);
      const dateB = new Date(`${dateStrB} ${b.StartTime}`);
      return dateB - dateA;
    } else if (pastSortBy === 'Oldest') {
      const dateStrA = a.Date.split('T')[0];
      const dateStrB = b.Date.split('T')[0];
      const dateA = new Date(`${dateStrA} ${a.StartTime}`);
      const dateB = new Date(`${dateStrB} ${b.StartTime}`);
      return dateA - dateB;
    } else if (pastSortBy === 'Course') {
      return a.CourseName.localeCompare(b.CourseName);
    }
    return 0;
  });

  if (loading) {
    return <div className="loading">Loading sessions...</div>;
  }

  return (
    <div className="page-container">
      <h2>My Tutoring Sessions</h2>

      {error && <div className="error-message">{error}</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>Upcoming Sessions</h3>
        <div className="feed-main-sort-container" style={{ maxWidth: '220px' }}>
          <button
            className="feed-main-sort-button"
            onClick={(e) => {
              e.stopPropagation();
              setShowSortMenu(!showSortMenu);
            }}
          >
            Sort: {sortBy} ▼
          </button>
          {showSortMenu && (
            <div className="feed-main-sort-menu">
              {['Time','Course'].map(opt => (
                <div
                  key={opt}
                  className="feed-main-sort-option"
                  onClick={() => handleSelectSort(opt)}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {upcomingSessions.length === 0 ? (
        <div className="empty-state">No upcoming sessions</div>
      ) : (
        <div className="list-container">
          {upcomingSessions.map((session) => (
            <div key={`${session.SlotID}-${session.BookingID || 'open'}`} className="list-item">
              <h4>{session.CourseName}</h4>
              <p><strong>Date:</strong> {new Date(session.Date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {session.StartTime} - {session.EndTime}</p>
              <p><strong>Location:</strong> {session.Location}</p>
              <p><strong>Status:</strong> {session.Status}</p>
              {session.StudentName && (
                <p><strong>Student:</strong> {session.StudentName}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: '40px', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>Past Sessions</h3>
        <div className="feed-main-sort-container" style={{ maxWidth: '220px' }}>
          <button
            className="feed-main-sort-button"
            onClick={(e) => {
              e.stopPropagation();
              setShowPastSortMenu(!showPastSortMenu);
            }}
          >
            Sort: {pastSortBy} ▼
          </button>
          {showPastSortMenu && (
            <div className="feed-main-sort-menu">
              {pastSortOptions.map(opt => (
                <div
                  key={opt}
                  className="feed-main-sort-option"
                  onClick={() => handleSelectPastSort(opt)}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {pastSessions.length === 0 ? (
        <div className="empty-state">No past sessions</div>
      ) : (
        <div className="list-container">
          {sortedPastSessions.map((session, index) => (
            <div key={`${session.BookingID || index}`} className="list-item">
              <h4>{session.CourseName}</h4>
              <p><strong>Date:</strong> {new Date(session.Date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {session.StartTime} - {session.EndTime}</p>
              <p><strong>Location:</strong> {session.Location}</p>
              {session.StudentName && (
                <>
                  <p><strong>Student:</strong> {session.StudentName}</p>
                  <p><strong>Attended:</strong> {session.Attended || 'Not marked'}</p>
                </>
              )}
              {session.Rating && (
                <div style={{ marginTop: '10px', background: '#e8f5e9', padding: '10px', borderRadius: '5px' }}>
                  <p><strong>Student Review:</strong> {session.Rating}/5</p>
                  {session.Comment && <p>{session.Comment}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TutorSessions;
