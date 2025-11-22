import React, { useState, useEffect } from 'react';
import { getTomorrowSlots } from '../../services/api';

function TomorrowSlots({ onNavigate }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const result = await getTomorrowSlots();
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

  if (loading) {
    return <div className="loading">Loading tomorrow's slots...</div>;
  }

  return (
    <div className="page-container">
      <h2>Tomorrow's Tutoring Slots</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {slots.length === 0 ? (
        <div className="empty-state">No slots available for tomorrow</div>
      ) : (
        <div className="list-container">
          {slots.map((slot) => (
            <div key={slot.SlotID} className="list-item">
              <h4>{slot.CourseName}</h4>
              <p><strong>Time:</strong> {slot.StartTime} - {slot.EndTime}</p>
              <p><strong>Tutor:</strong> {slot.TutorName}</p>
              <p><strong>Location:</strong> {slot.Location}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TomorrowSlots;
