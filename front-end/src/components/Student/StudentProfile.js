import React, { useState, useEffect } from 'react';
import { getStudentProfile, updateStudentPassword, deleteStudentAccount } from '../../services/api';

function StudentProfile({ studentId, onNavigate, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile for studentId:', studentId);
      const result = await getStudentProfile(studentId);
      console.log('Profile result:', result);
      
      if (result.success) {
        setProfile(result.data);
      } else {
        setError(result.error || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const result = await updateStudentPassword(studentId, passwordData);

      if (result.success) {
        setSuccess('Password updated successfully');
        setPasswordData({ currentPassword: '', newPassword: '' });
        setShowPasswordForm(false);
      } else {
        setError(result.error || 'Failed to update password');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    setError('');
    setSuccess('');

    try {
      const result = await deleteStudentAccount(studentId, deletePassword);

      if (result.success) {
        alert('Account deleted successfully');
        onLogout();
      } else {
        setError(result.error || 'Failed to delete account');
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
            <p style={{ fontSize: '1.1em' }}><strong>Member Since:</strong> {profile.DateJoined ? new Date(profile.DateJoined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
            {profile.joined_year && <p style={{ fontSize: '1.1em' }}><strong>Joined Year:</strong> {profile.joined_year}</p>}
          </div>

          <div style={{ marginTop: '30px' }}>
            <button 
              className="btn" 
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              {showPasswordForm ? 'Cancel' : 'Change Password'}
            </button>

            {showPasswordForm && (
              <div className="form-container" style={{ marginTop: '20px' }}>
                <form onSubmit={handleUpdatePassword}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <button type="submit" className="btn">Update Password</button>
                </form>
              </div>
            )}
          </div>

          <div style={{ marginTop: '30px', borderTop: '2px solid #ccc', paddingTop: '20px' }}>
            <h3>Danger Zone</h3>
            <button 
              className="btn btn-danger" 
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            >
              {showDeleteConfirm ? 'Cancel' : 'Delete Account'}
            </button>

            {showDeleteConfirm && (
              <div style={{ marginTop: '20px', background: '#ffebee', padding: '15px', borderRadius: '5px' }}>
                <p><strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.</p>
                <div className="form-group">
                  <label>Enter your password to confirm</label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />
                </div>
                <button 
                  className="btn btn-danger" 
                  onClick={handleDeleteAccount}
                  disabled={!deletePassword}
                >
                  Confirm Delete Account
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentProfile;
