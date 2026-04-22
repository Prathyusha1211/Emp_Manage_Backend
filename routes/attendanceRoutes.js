const express = require('express');
const { markAttendance } = require('../controllers/attendanceController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/mark', verifyToken, markAttendance);

module.exports = router;