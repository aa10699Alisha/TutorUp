import React, { useState, useEffect } from 'react';
import { getCoursesByMajor } from '../../services/api';

// Map course codes or names to image filenames
const courseImages = {
  'CS101': 'cs101.jpg',
  'MATH201': 'math201.jpg',
  'PHYS101': 'physics.jpg',
  'CHEM101': 'chemistry.jpg',
};

function CoursesList({ major, onNavigate, onSelectCourse }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (major) {
      fetchCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [major]);

  const fetchCourses = async () => {
    try {
      const result = await getCoursesByMajor(major.MajorID);
      
      if (result.success) {
        setCourses(result.data);
      } else {
        setError(result.error || 'Failed to load courses');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (course) => {
    onSelectCourse(course);
    onNavigate('course-detail');
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  // Filter courses based on search term
  const filteredCourses = courses.filter(course =>
    course.CourseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.CourseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.Description && course.Description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container">
      <h2>{major?.MajorName} Courses</h2>
      
      <button className="btn btn-secondary" onClick={() => onNavigate('majors')}>
        Back to Majors
      </button>

      {error && <div className="error-message">{error}</div>}

      <input
        type="text"
        placeholder="Search courses..."
        className="feed-main-search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginTop: '20px', marginBottom: '20px' }}
      />

      {filteredCourses.length === 0 ? (
        <div className="empty-state">{searchTerm ? 'No courses match your search' : 'No courses available for this major'}</div>
      ) : (
        <div className="card-grid">
          {filteredCourses.map((course) => (
            <div
              key={course.CourseID}
              className="card"
              onClick={() => handleCourseClick(course)}
            >
              {/* Hide image for Intro to Programming (CS101) and Calculus II (MATH201) */}
              {course.CourseCode !== 'CS101' && course.CourseCode !== 'MATH201' && (
                <img
                  src={
                    course.image
                      ? `/course-images/${course.image}`
                      : courseImages[course.CourseCode] 
                        ? `/course-images/${courseImages[course.CourseCode]}`
                        : undefined
                  }
                  alt={course.CourseName}
                  style={{
                    width: '100%',
                    maxHeight: '160px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    display: (course.image || courseImages[course.CourseCode]) ? 'block' : 'none'
                  }}
                />
              )}
              <h3>{course.CourseName}</h3>
              <p><strong>Course Code:</strong> {course.CourseCode}</p>
              {course.Description && <p>{course.Description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CoursesList;
