// tutorsController.js
// This controller manages tutor profile and account operations

const { pool } = require('../config/database');

const getTutorById = async (req, res) => {
  try {
    const { tutorId } = req.params;

    const [tutors] = await pool.query(
      `SELECT TutorID, FullName, Email, Bio, ExperienceYears, RatingAverage 
       FROM Tutor 
       WHERE TutorID = ?`,
      [tutorId]
    );

    if (tutors.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tutor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: tutors[0]
    });
  } catch (error) {
    console.error('Get tutor error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching tutor'
    });
  }
};

const getTutorProfile = async (req, res) => {
  try {
    const { tutorId } = req.params;

    const [tutors] = await pool.query(
      `SELECT t.FullName AS name,
              t.Email AS email,
              t.Bio AS bio,
              t.ExperienceYears AS experience_years,
              t.RatingAverage AS rating
       FROM Tutor t
       WHERE t.TutorID = ?`,
      [tutorId]
    );

    if (tutors.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tutor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: tutors[0]
    });
  } catch (error) {
    console.error('Get tutor profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching tutor profile'
    });
  }
};

const updateTutorProfile = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { bio, experienceYears } = req.body;

    const updates = [];
    const values = [];

    if (bio !== undefined) {
      updates.push('Bio = ?');
      values.push(bio);
    }

    if (experienceYears !== undefined) {
      updates.push('ExperienceYears = ?');
      values.push(experienceYears);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(tutorId);

    await pool.query(
      `UPDATE Tutor SET ${updates.join(', ')} WHERE TutorID = ?`,
      values
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update tutor profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating profile'
    });
  }
};

module.exports = {
  getTutorById,
  getTutorProfile,
  updateTutorProfile
};
