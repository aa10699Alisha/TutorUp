const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Auth API calls
export const studentSignup = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/student/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};

export const tutorSignup = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/tutor/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};

export const studentSignin = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/student/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return response.json();
};

export const tutorSignin = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/tutor/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return response.json();
};

// Courses API calls
export const getAllMajors = async () => {
  const response = await fetch(`${API_BASE_URL}/courses/majors`);
  return response.json();
};

export const getCoursesByMajor = async (majorId) => {
  const response = await fetch(`${API_BASE_URL}/courses/by-major/${majorId}`);
  return response.json();
};

export const getCourseById = async (courseId) => {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
  return response.json();
};

export const getAvailableSlotsByCourse = async (courseId) => {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/slots`);
  return response.json();
};

// Tutors API calls
export const getTutorProfile = async (tutorId) => {
  const response = await fetch(`${API_BASE_URL}/tutors/${tutorId}/profile`);
  return response.json();
};

export const updateTutorProfile = async (tutorId, profileData) => {
  const response = await fetch(`${API_BASE_URL}/tutors/${tutorId}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  });
  return response.json();
};

// Bookings API calls
export const createBooking = async (bookingData) => {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData)
  });
  return response.json();
};

export const cancelBooking = async (bookingId, studentId) => {
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId })
  });
  return response.json();
};

export const getStudentUpcomingSessions = async (studentId) => {
  const response = await fetch(`${API_BASE_URL}/bookings/student/${studentId}/upcoming`);
  return response.json();
};

export const getStudentPastSessions = async (studentId) => {
  const response = await fetch(`${API_BASE_URL}/bookings/student/${studentId}/past`);
  return response.json();
};

export const getTutorUpcomingSessions = async (tutorId) => {
  const response = await fetch(`${API_BASE_URL}/bookings/tutor/${tutorId}/upcoming`);
  return response.json();
};

export const getTutorPastSessions = async (tutorId) => {
  const response = await fetch(`${API_BASE_URL}/bookings/tutor/${tutorId}/past`);
  return response.json();
};

// Slots API calls
export const getTodaySlots = async () => {
  const response = await fetch(`${API_BASE_URL}/slots/today`);
  return response.json();
};

export const getTomorrowSlots = async () => {
  const response = await fetch(`${API_BASE_URL}/slots/tomorrow`);
  return response.json();
};

export const getSlotsByDate = async (date) => {
  const response = await fetch(`${API_BASE_URL}/slots/date/${date}`);
  return response.json();
};

// Students API calls
export const getStudentProfile = async (studentId) => {
  const response = await fetch(`${API_BASE_URL}/students/${studentId}/profile`);
  return response.json();
};

export const updateStudentPassword = async (studentId, passwordData) => {
  const response = await fetch(`${API_BASE_URL}/students/${studentId}/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(passwordData)
  });
  return response.json();
};

export const markAttendance = async (bookingId, attended) => {
  const response = await fetch(`${API_BASE_URL}/students/attendance/${bookingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attended })
  });
  return response.json();
};

export const submitReview = async (bookingId, reviewData) => {
  const response = await fetch(`${API_BASE_URL}/students/review/${bookingId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData)
  });
  return response.json();
};

export const deleteStudentAccount = async (studentId, password) => {
  const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  return response.json();
};
