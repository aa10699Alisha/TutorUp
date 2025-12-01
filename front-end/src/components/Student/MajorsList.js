
import React, { useState, useEffect } from 'react';
import { getAllMajors, getAllCoursesWithMajors } from '../../services/api';
// Map major names or IDs to image filenames
const majorImages = {
  'Biology': 'Biology.jpg',
  'Business': 'Business.jpg',
  'business': 'Business.jpg',
  'Business Administration': 'Business.jpg',
  'Mathematics': 'Mathematics.jpg',
  'mathematics': 'Mathematics.jpg',
  'Mathematics.jpeg': 'Mathematics.jpeg',
  'Chemistry': 'Chemistry.jpeg',
  'Computer Science': 'ComputerScience.jpg',
  'Economics': 'Economics.jpg',
  'English Literature': 'EnglishLiterature.jpg',
  'History': 'History.jpg',
  'Physics': 'Physics.jpg',
  'Psychology': 'Psychology.png',
  'psychology': 'Psychology.png',
  'Psychology.jpeg': 'Psychology.png',
};
const fallbackImage = '/course-images/default.jpg'; 

function MajorsList({ onNavigate, onSelectMajor }) {
  const [majors, setMajors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [majorsResult, coursesResult] = await Promise.all([
        getAllMajors(),
        getAllCoursesWithMajors()
      ]);
      
      if (majorsResult.success) {
        setMajors(majorsResult.data);
      } else {
        setError(majorsResult.error || 'Failed to load majors');
      }

      if (coursesResult.success) {
        setCourses(coursesResult.data);
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMajorClick = (major) => {
    onSelectMajor(major);
    onNavigate('courses');
  };

  if (loading) {
    return <div className="loading">Loading majors...</div>;
  }

  // Filter majors based on search term - match major name OR course names
  const filteredMajors = majors.filter(major => {
    // Check if major name matches
    if (major.MajorName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return true;
    }
    // Check if any course in this major matches
    const majorCourses = courses.filter(course => course.MajorID === major.MajorID);
    return majorCourses.some(course => 
      course.CourseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.CourseCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="page-container">
      <h2>Browse by Major</h2>
      
      {error && <div className="error-message">{error}</div>}

      <input
        type="text"
        placeholder="Search majors or courses..."
        className="feed-main-search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '20px' }}
      />

      {filteredMajors.length === 0 ? (
        <div className="empty-state">{searchTerm ? 'No majors match your search' : 'No majors available'}</div>
      ) : (
        <div className="card-grid">
          {filteredMajors.map((major) => {
            console.log('MajorName:', major.MajorName);
            let imgFile = majorImages[major.MajorName]
              || majorImages[major.MajorName?.toLowerCase()]
              || majorImages[major.MajorName?.replace(/\s/g, '')]
              || fallbackImage;
            return (
              <div
                key={major.MajorID}
                className="card"
                onClick={() => handleMajorClick(major)}
              >
                <img
                  src={imgFile.startsWith('/') ? imgFile : `/course-images/${imgFile}`}
                  alt={major.MajorName}
                  style={{
                    width: '100%',
                    maxHeight: '160px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    marginBottom: '12px',
                  }}
                />
                <h3>{major.MajorName}</h3>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MajorsList;
