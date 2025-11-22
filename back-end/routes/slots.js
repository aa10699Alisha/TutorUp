const express = require('express');
const router = express.Router();
const {
  getTodaySlots,
  getTomorrowSlots,
  getSlotsByDate
} = require('../controllers/slotsController');

// Slot routes
router.get('/today', getTodaySlots);
router.get('/tomorrow', getTomorrowSlots);
router.get('/date/:date', getSlotsByDate);

module.exports = router;
