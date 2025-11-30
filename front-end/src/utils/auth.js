// Authentication utility functions for TutorUp

/**
 * Save user session to localStorage
 */
export const saveUserSession = (user, userType, currentPage = null) => {
  const sessionData = {
    user,
    userType,
    currentPage: currentPage || (userType === 'student' ? 'majors' : 'tutor-sessions'),
    timestamp: new Date().getTime()
  };
  
  localStorage.setItem('tutorup_session', JSON.stringify(sessionData));
};

/**
 * Get user session from localStorage
 * Returns null if session is expired (> 24 hours)
 */
export const getUserSession = () => {
  const sessionStr = localStorage.getItem('tutorup_session');
  
  if (!sessionStr) {
    return null;
  }
  
  try {
    const session = JSON.parse(sessionStr);
    const now = new Date().getTime();
    const sessionAge = now - session.timestamp;
    
    // Session expires after 24 hours (86400000 ms)
    const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;
    
    if (sessionAge > SESSION_TIMEOUT) {
      clearUserSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error parsing session:', error);
    clearUserSession();
    return null;
  }
};

/**
 * Clear user session from localStorage
 */
export const clearUserSession = () => {
  localStorage.removeItem('tutorup_session');
  // Also clear old format if it exists
  localStorage.removeItem('user');
  localStorage.removeItem('userType');
  localStorage.removeItem('currentPage');
};

/**
 * Update session activity timestamp
 */
export const updateSessionActivity = () => {
  const session = getUserSession();
  
  if (session) {
    session.timestamp = new Date().getTime();
    localStorage.setItem('tutorup_session', JSON.stringify(session));
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return getUserSession() !== null;
};
