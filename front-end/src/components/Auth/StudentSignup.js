import React, { useState } from 'react';
import { studentSignup } from '../../services/api';

function StudentSignup({ onNavigate, onLogin }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  
  // Password validation states
  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Real-time password validation
    if (name === 'password') {
      setPasswordChecks({
        minLength: value.length >= 6,
        hasLowercase: /[a-z]/.test(value),
        hasUppercase: /[A-Z]/.test(value),
        hasNumber: /[0-9]/.test(value)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const result = await studentSignup(formData);
      
      if (result.success) {
        setSuccess('Account created successfully! Logging you in...');
        // Auto-login after signup
        if (onLogin) {
          setTimeout(() => {
            onLogin(result.data, 'student');
          }, 1000);
        } else {
          setTimeout(() => {
            onNavigate('student-signin');
          }, 2000);
        }
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  return (
    <div className="page-container">
      <h2>Student Sign Up</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setShowPasswordRequirements(true)}
              required
            />
            
            {showPasswordRequirements && (
              <div style={{ 
                marginTop: '10px', 
                padding: '12px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '6px',
                fontSize: '13px'
              }}>
                <div style={{ marginBottom: '6px', fontWeight: '600', color: '#333' }}>
                  Password Requirements:
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ 
                    color: passwordChecks.minLength ? '#28a745' : '#6c757d',
                    marginRight: '8px',
                    fontWeight: 'bold'
                  }}>
                    {passwordChecks.minLength ? '✓' : '○'}
                  </span>
                  <span style={{ color: passwordChecks.minLength ? '#28a745' : '#6c757d' }}>
                    At least 6 characters
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ 
                    color: passwordChecks.hasLowercase ? '#28a745' : '#6c757d',
                    marginRight: '8px',
                    fontWeight: 'bold'
                  }}>
                    {passwordChecks.hasLowercase ? '✓' : '○'}
                  </span>
                  <span style={{ color: passwordChecks.hasLowercase ? '#28a745' : '#6c757d' }}>
                    One lowercase letter (a-z)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ 
                    color: passwordChecks.hasUppercase ? '#28a745' : '#6c757d',
                    marginRight: '8px',
                    fontWeight: 'bold'
                  }}>
                    {passwordChecks.hasUppercase ? '✓' : '○'}
                  </span>
                  <span style={{ color: passwordChecks.hasUppercase ? '#28a745' : '#6c757d' }}>
                    One uppercase letter (A-Z)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    color: passwordChecks.hasNumber ? '#28a745' : '#6c757d',
                    marginRight: '8px',
                    fontWeight: 'bold'
                  }}>
                    {passwordChecks.hasNumber ? '✓' : '○'}
                  </span>
                  <span style={{ color: passwordChecks.hasNumber ? '#28a745' : '#6c757d' }}>
                    One number (0-9)
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <small style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Passwords do not match
              </small>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <small style={{ color: '#28a745', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                ✓ Passwords match
              </small>
            )}
          </div>

          <button type="submit" className="btn">Sign Up</button>
          <button type="button" className="btn btn-secondary" onClick={() => onNavigate('welcome')}>
            Back
          </button>
        </form>
      </div>
    </div>
  );
}

export default StudentSignup;
