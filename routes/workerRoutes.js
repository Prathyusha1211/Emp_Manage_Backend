const express = require('express');
const { addWorkers } = require('../controllers/workerController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add', verifyToken, addWorkers);

module.exports = router;