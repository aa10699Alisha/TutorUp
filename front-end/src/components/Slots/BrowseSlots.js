import React, { useState, useEffect } from 'react';
import { getSlotsByDate } from '../../services/api';

function BrowseSlots({ onNavigate }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const result = await getSlotsByDate(dateStr);
      
      if (result.success) {
        setSlots(result.data);
      } else {
        setError(result.error || 'Failed to load slots');
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

  if (loading) {
    return <div className="loading">Loading slots...</div>;
  }

  return (
    <div className="page-container">
      <h2>Browse Tutoring Slots</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <button className="btn btn-secondary" onClick={goToPreviousDay}>← Previous Day</button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h3 style={{ margin: 0 }}>{formatDate(currentDate)}</h3>
        </div>
        <button className="btn btn-secondary" onClick={goToNextDay}>Next Day →</button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button className="btn" onClick={goToToday}>Go to Today</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {slots.length === 0 ? (
        <div className="empty-state">No available slots for this date</div>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BrowseSlots;
