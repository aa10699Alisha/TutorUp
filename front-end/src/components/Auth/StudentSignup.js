import React, { useState } from 'react';
import { studentSignup } from '../../services/api';

function StudentSignup({ onNavigate, onLogin }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
              required
            />
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
