const express = require('express');
const { markAttendance, getWorkersByDate } = require('../controllers/attendanceController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /attendance/mark:
 *   post:
 *     summary: Mark attendance for a worker
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workerId
 *               - date
 *               - status
 *             properties:
 *               workerId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-23"
 *               status:
 *                 type: string
 *                 enum: [present, absent]
 *                 example: "present"
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *       200:
 *         description: Attendance updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Worker not found
 *       500:
 *         description: Server error
 */
router.post('/mark', verifyToken, markAttendance);

/**
 * @swagger
 * /attendance/date:
 *   get:
 *     summary: Get workers by date with attendance status
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format
 *         example: "2026-04-23"
 *     responses:
 *       200:
 *         description: Workers fetched successfully with attendance status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 date:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       wage:
 *                         type: number
 *                       attendanceStatus:
 *                         type: string
 *                         enum: [present, absent, null]
 *                       attendance:
 *                         type: object
 *       400:
 *         description: Date is required
 *       500:
 *         description: Server error
 */
router.get('/date', verifyToken, getWorkersByDate);

module.exports = router;