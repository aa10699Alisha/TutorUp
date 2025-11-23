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
  const [sortOption, setSortOption] = useState('date'); // 'date' (time), 'tutor', 'course'

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, sortOption]);

  const fetchSessions = async () => {
    try {
      const [upcomingResult, pastResult] = await Promise.all([
        getStudentUpcomingSessions(studentId, sortOption),
        getStudentPastSessions(studentId)
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

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

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

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>Upcoming Sessions</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: 'bold' }}>Sort by:</label>
          <select value={sortOption} onChange={handleSortChange} style={{ padding: '8px', borderRadius: '5px', border: '2px solid #ddd' }}>
            <option value="date">Time</option>
            <option value="tutor">Tutor</option>
            <option value="course">Course</option>
          </select>
        </div>
      </div>
      {upcomingSessions.length === 0 ? (
        <div className="empty-state">No upcoming sessions</div>
      ) : (
        <div className="list-container">
          {upcomingSessions.map((session) => (
            <div key={session.BookingID} className="list-item">
              <h4>{session.CourseName}</h4>
              <p><strong>Date:</strong> {new Date(session.Date).toLocaleDateString()}</p>
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

      <h3 style={{ marginTop: '40px' }}>Past Sessions</h3>
      {pastSessions.length === 0 ? (
        <div className="empty-state">No past sessions</div>
      ) : (
        <div className="list-container">
          {pastSessions.map((session) => (
            <div key={session.BookingID} className="list-item">
              <h4>{session.CourseName}</h4>
              <p><strong>Date:</strong> {new Date(session.Date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {session.StartTime} - {session.EndTime}</p>
              <p><strong>Tutor:</strong> {session.TutorName}</p>
              <p><strong>Location:</strong> {session.Location}</p>
              <p><strong>Attended:</strong> {session.Attended || 'Not marked'}</p>
              
              {session.Attended === null && (
                <div className="session-actions">
                  <button 
                    className="btn" 
                    onClick={() => handleMarkAttendance(session.BookingID, 'Yes')}
                  >
                    Mark as Attended
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleMarkAttendance(session.BookingID, 'No')}
                  >
                    Mark as Not Attended
                  </button>
                </div>
              )}

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
