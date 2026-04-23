const express = require('express');
const { markAttendance, getWorkersByDate } = require('../controllers/attendanceController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/mark', verifyToken, markAttendance);
router.get('/date', verifyToken, getWorkersByDate);

module.exports = router;