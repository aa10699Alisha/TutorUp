import React, { useState, useEffect } from 'react';
import { getTutorProfile, updateTutorProfile } from '../../services/api';

function TutorProfile({ tutorId, onNavigate, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    bio: '',
    experienceYears: ''
  });

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorId]);

  const fetchProfile = async () => {
    try {
      const result = await getTutorProfile(tutorId);
      
      if (result.success) {
        setProfile(result.data);
        setEditData({
          bio: result.data.bio || '',
          experienceYears: result.data.experience_years || ''
        });
      } else {
        setError(result.error || 'Failed to load profile');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const result = await updateTutorProfile(tutorId, editData);

      if (result.success) {
        setSuccess('Profile updated successfully');
        setIsEditing(false);
        fetchProfile();
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="page-container">
      <h2>My Profile</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {profile && (
        <div>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0 }}>Profile Information</h3>
            <p style={{ fontSize: '1.1em' }}><strong>Name:</strong> {profile.name}</p>
            <p style={{ fontSize: '1.1em' }}><strong>Email:</strong> {profile.email}</p>
            <p style={{ fontSize: '1.1em' }}><strong>Experience:</strong> {profile.experience_years ? `${profile.experience_years} years` : 'Not specified'}</p>
            <p style={{ fontSize: '1.1em' }}><strong>Rating:</strong> {profile.rating ? `${profile.rating}/5.0` : 'No ratings yet'}</p>
            <p style={{ fontSize: '1.1em' }}><strong>Bio:</strong> {profile.bio || 'No bio provided'}</p>
            <p style={{ fontSize: '1.1em' }}><strong>Member Since:</strong> {profile.DateJoined ? new Date(profile.DateJoined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
          </div>

          <div style={{ marginTop: '30px' }}>
            <button 
              className="btn" 
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>

            {isEditing && (
              <div className="form-container" style={{ marginTop: '20px' }}>
                <form onSubmit={handleUpdateProfile}>
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea
                      name="bio"
                      value={editData.bio}
                      onChange={handleEditChange}
                      rows="4"
                    />
                  </div>
                  <div className="form-group">
                    <label>Years of Experience</label>
                    <input
                      type="number"
                      name="experienceYears"
                      value={editData.experienceYears}
                      onChange={handleEditChange}
                      min="0"
                    />
                  </div>
                  <button type="submit" className="btn">Save Changes</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TutorProfile;
