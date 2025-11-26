import React, { useState, useEffect } from 'react';
import { getSlotsByDate, createBooking } from '../../services/api';

// Map course codes or names to image filenames
const courseImages = {
  'CS101': 'cs101.jpg',
  'MATH201': 'math201.jpg',
  'PHYS101': 'physics.jpg',
  'CHEM101': 'chemistry.jpg',
};

function CourseDetail({ course, studentId, onNavigate }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (course) {
      fetchSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course, currentDate]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      // Build date string in local time (YYYY-MM-DD) to avoid UTC shift from toISOString()
      const dateStr = [
        currentDate.getFullYear(),
        String(currentDate.getMonth() + 1).padStart(2, '0'),
        String(currentDate.getDate()).padStart(2, '0')
      ].join('-');

      // If user requested today's date, ask backend for future-only slots and pass local time
      const todayLocal = new Date();
      const todayStr = [
        todayLocal.getFullYear(),
        String(todayLocal.getMonth() + 1).padStart(2, '0'),
        String(todayLocal.getDate()).padStart(2, '0')
      ].join('-');

      const futureOnly = dateStr === todayStr;
      let options = { futureOnly };
      if (futureOnly) {
        // Format local time as HH:MM:SS
        const pad = n => String(n).padStart(2, '0');
        const localTime = `${pad(todayLocal.getHours())}:${pad(todayLocal.getMinutes())}:${pad(todayLocal.getSeconds())}`;
        options.localTime = localTime;
      }
      const result = await getSlotsByDate(dateStr, options);

      if (result.success) {
        // Filter slots for this specific course
        const courseSlots = result.data.filter(slot => slot.CourseName === course.CourseName);
        setSlots(courseSlots);
      } else {
        setError(result.error || 'Failed to load available slots');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
  };

  const goToPreviousDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setCurrentDate(prevDay);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleBookSlot = async (slotId) => {
    setError('');
    setSuccess('');

    console.log('Booking data:', { studentId, slotId });

    if (!studentId) {
      setError('Student ID is missing. Please log in again.');
      return;
    }

    try {
      const result = await createBooking({
        studentId,
        slotId
      });

      if (result.success) {
        setSuccess('Booking created successfully!');
        fetchSlots();
        setTimeout(() => {
          onNavigate('student-sessions');
        }, 2000);
      } else if (result.error && result.error.toLowerCase().includes('overlap')) {
        setError('You already have a confirmed booking that overlaps this time.');
      } else if (result.error && result.error.toLowerCase().includes('same course more than once')) {
        setError('You cannot book the same course more than once on one day.');
      } else if (result.error && result.error.toLowerCase().includes('same tutor') && result.error.toLowerCase().includes('same course')) {
        setError('You cannot book a session with the same tutor for the same course again on the same day.');
      } else if (result.error && (result.error.toLowerCase().includes('already') || result.error?.toLowerCase().includes('twice'))) {
        setError('You have already booked this session.');
      } else {
        setError(result.error || 'Booking failed');
      }
    } catch (err) {
      // If backend returns 409, show user-friendly message
      if (err && err.status === 409) {
        setError('You have already booked this session.');
      } else {
        setError('Server error. Please try again.');
      }
      console.error('Booking error:', err);
    }
  };

  return (
    <div className="page-container">
      <h2>{course?.CourseName}</h2>
      <p><strong>Course Code:</strong> {course?.CourseCode}</p>
      {course?.Description && <p>{course.Description}</p>}

      <button className="btn btn-secondary" onClick={() => onNavigate('courses')}>
        Back to Courses
      </button>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <h3 style={{ marginTop: '30px' }}>Available Tutoring Slots</h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <button className="btn btn-secondary date-nav-button" onClick={goToPreviousDay}>
          <span className="desktop-only">← Previous Day</span>
          <span className="mobile-only">←</span>
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h4 style={{ margin: 0 }}>{formatDate(currentDate)}</h4>
        </div>
        <button className="btn btn-secondary date-nav-button" onClick={goToNextDay}>
          <span className="desktop-only">Next Day →</span>
          <span className="mobile-only">→</span>
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button className="btn" onClick={goToToday}>Go to Today</button>
      </div>

      {loading ? (
        <div className="loading">Loading slots...</div>
      ) : slots.length === 0 ? (
        <div className="empty-state">No available slots for this course on this date</div>
      ) : (
        <div className="list-container">
          {slots.map((slot) => (
            <div key={slot.SlotID} className="list-item">
              <h4>{slot.CourseName}</h4>
              <p><strong>Time:</strong> {slot.StartTime} - {slot.EndTime}</p>
              <p><strong>Tutor:</strong> {slot.TutorName}</p>
              <p><strong>Location:</strong> {slot.Location}</p>
              <p><strong>Capacity:</strong> {slot.Capacity} students</p>
              <p><strong>Available:</strong> {slot.Capacity - (slot.BookedCount || 0)} spots remaining</p>
              <button 
                className="btn" 
                onClick={() => handleBookSlot(slot.SlotID)}
              >
                Book This Slot
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseDetail;
