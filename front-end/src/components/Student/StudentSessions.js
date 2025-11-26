import React, { useState, useEffect } from 'react';
import { 
  getStudentUpcomingSessions, 
  getStudentPastSessions, 
  cancelBooking,
  markAttendance,
  submitReview 
} from '../../services/api';

function StudentSessions({ studentId, onNavigate }) {
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reviewData, setReviewData] = useState({});
  const [sortBy, setSortBy] = useState('Time'); // UI label
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [pastSortBy, setPastSortBy] = useState('Recent'); // Past sessions sort
  const [showPastSortMenu, setShowPastSortMenu] = useState(false);

  const sortParamMap = {
    'Time': 'date',
    'Tutor': 'tutor',
    'Course': 'course'
  };

  const pastSortOptions = ['Recent', 'Oldest', 'Tutor', 'Course'];

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, sortBy]);

  const fetchSessions = async () => {
    try {
      // Get local datetime in 'YYYY-MM-DD HH:MM:SS' format
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const localDateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      console.log('[StudentSessions] Fetching upcoming and past sessions', { studentId, sort: sortParamMap[sortBy], localDateTime });
      const [upcomingResult, pastResult] = await Promise.all([
        getStudentUpcomingSessions(studentId, sortParamMap[sortBy], localDateTime),
        getStudentPastSessions(studentId)
      ]);

      console.log('[StudentSessions] Upcoming result:', upcomingResult);
      console.log('[StudentSessions] Past result:', pastResult);

      if (upcomingResult.success) {
        setUpcomingSessions(upcomingResult.data);
      } else {
        console.error('[StudentSessions] Upcoming error:', upcomingResult.error);
      }
      if (pastResult.success) {
        setPastSessions(pastResult.data);
      } else {
        console.error('[StudentSessions] Past error:', pastResult.error);
      }
    } catch (err) {
      setError('Server error. Please try again.');
      console.error('[StudentSessions] Fetch error:', err);
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
      const dateStrA = a.Date.split('T')[0]; // Handle ISO string or date-only
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
    } else if (pastSortBy === 'Tutor') {
      return a.TutorName.localeCompare(b.TutorName);
    } else if (pastSortBy === 'Course') {
      return a.CourseName.localeCompare(b.CourseName);
    }
    return 0;
  });

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const result = await cancelBooking(bookingId, studentId);

      if (result.success) {
        setSuccess('Booking cancelled successfully');
        fetchSessions();
      } else {
        setError(result.error || 'Cancellation failed');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  const handleMarkAttendance = async (bookingId, attended) => {
    setError('');
    setSuccess('');

    try {
      const result = await markAttendance(bookingId, attended);

      if (result.success) {
        setSuccess('Attendance marked successfully');
        fetchSessions();
      } else {
        setError(result.error || 'Failed to mark attendance');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  const handleReviewChange = (bookingId, field, value) => {
    setReviewData({
      ...reviewData,
      [bookingId]: {
        ...reviewData[bookingId],
        [field]: value
      }
    });
  };

  const handleSubmitReview = async (bookingId) => {
    const review = reviewData[bookingId];
    if (!review || !review.rating) {
      setError('Please provide a rating');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const result = await submitReview(bookingId, review);

      if (result.success) {
        setSuccess('Review submitted successfully');
        setReviewData({ ...reviewData, [bookingId]: {} });
        fetchSessions();
      } else {
        setError(result.error || 'Failed to submit review');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading sessions...</div>;
  }

  return (
    <div className="page-container">
      <h2>My Tutoring Sessions</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

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
              {['Time','Tutor','Course'].map(opt => (
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
            <div key={session.BookingID} className="list-item">
              <h4>{session.CourseName}</h4>
              {/* Display date as YYYY-MM-DD to avoid timezone shift */}
              <p><strong>Date:</strong> {session.Date}</p>
              <p><strong>Time:</strong> {session.StartTime} - {session.EndTime}</p>
              <p><strong>Tutor:</strong> {session.TutorName}</p>
              <p><strong>Location:</strong> {session.Location}</p>
              <p><strong>Status:</strong> {session.Status}</p>
              <div className="session-actions">
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleCancelBooking(session.BookingID)}
                >
                  Cancel Booking
                </button>
              </div>
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
          {sortedPastSessions.map((session) => (
            <div key={session.BookingID} className="list-item">
              <h4>{session.CourseName}</h4>
              {/* Display date as YYYY-MM-DD to avoid timezone shift */}
              <p><strong>Date:</strong> {session.Date}</p>
              <p><strong>Time:</strong> {session.StartTime} - {session.EndTime}</p>
              <p><strong>Tutor:</strong> {session.TutorName}</p>
              <p><strong>Location:</strong> {session.Location}</p>
              <p><strong>Attended:</strong> {session.Attended || 'Not marked'}</p>
              
              {/* Attendance marking is tutor-only. Students only see status. */}

              {session.Attended === 'Yes' && !session.Rating && (
                <div style={{ marginTop: '15px' }}>
                  <h4>Leave a Review</h4>
                  <div className="form-group">
                    <label>Rating (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={reviewData[session.BookingID]?.rating || ''}
                      onChange={(e) => handleReviewChange(session.BookingID, 'rating', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Comment (Optional)</label>
                    <textarea
                      rows="2"
                      value={reviewData[session.BookingID]?.comment || ''}
                      onChange={(e) => handleReviewChange(session.BookingID, 'comment', e.target.value)}
                    />
                  </div>
                  <button 
                    className="btn" 
                    onClick={() => handleSubmitReview(session.BookingID)}
                  >
                    Submit Review
                  </button>
                </div>
              )}

              {session.Rating && (
                <div style={{ marginTop: '10px', background: '#e8f5e9', padding: '10px', borderRadius: '5px' }}>
                  <p><strong>Your Review:</strong> {session.Rating}/5</p>
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

export default StudentSessions;
