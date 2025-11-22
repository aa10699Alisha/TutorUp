import React, { useState, useEffect } from 'react';
import { updateStudentPassword, deleteStudentAccount } from '../../services/api';

function Settings({ user, userType, onNavigate, onLogout }) {
  const [theme, setTheme] = useState('light');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme) => {
    document.body.className = newTheme === 'dark' ? 'dark-theme' : '';
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
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

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      const userId = userType === 'student' ? user?.StudentID : user?.TutorID;
      const result = await updateStudentPassword(userId, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (result.success) {
        setSuccess('Password updated successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
      const userId = userType === 'student' ? user?.StudentID : user?.TutorID;
      const result = await deleteStudentAccount(userId, deletePassword);

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

  return (
    <div className="page-container">
      <h2>Settings</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Theme Toggle */}
      <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Appearance</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <label style={{ fontSize: '1.1em' }}>Theme:</label>
          <button 
            className="btn" 
            onClick={toggleTheme}
            style={{ minWidth: '120px' }}
          >
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
        <p style={{ marginTop: '10px', color: '#666', fontSize: '0.9em' }}>
          Current theme: <strong>{theme === 'light' ? 'Light' : 'Dark'}</strong>
        </p>
      </div>

      {/* Password Change */}
      <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Security</h3>
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
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                />
              </div>
              <button type="submit" className="btn">Update Password</button>
            </form>
          </div>
        )}
      </div>

      {/* Privacy Policy */}
      <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Privacy & Terms</h3>
        <button className="btn btn-secondary" onClick={() => window.alert('Privacy Policy\n\nYour data is secure and used only for tutoring session management.')}>
          View Privacy Policy
        </button>
      </div>

      {/* Danger Zone */}
      <div style={{ marginTop: '30px', borderTop: '2px solid #ccc', paddingTop: '20px' }}>
        <h3 style={{ color: '#e74c3c' }}>Danger Zone</h3>
        <button 
          className="btn btn-danger" 
          onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
        >
          {showDeleteConfirm ? 'Cancel' : 'Deactivate Account'}
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
                placeholder="Password"
              />
            </div>
            <button 
              className="btn btn-danger" 
              onClick={handleDeleteAccount}
              disabled={!deletePassword}
            >
              Confirm Deactivate Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
