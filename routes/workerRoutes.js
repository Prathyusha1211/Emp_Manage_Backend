const express = require('express');
const { addWorkers } = require('../controllers/workerController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /worker/add:
 *   post:
 *     summary: Add new workers
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workersData
 *             properties:
 *               workersData:
 *                 oneOf:
 *                   - type: array
 *                     items:
 *                       type: object
 *                       required:
 *                         - name
 *                         - wage
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         wage:
 *                           type: number
 *                           example: 5000
 *                   - type: object
 *                     required:
 *                       - name
 *                       - wage
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       wage:
 *                         type: number
 *                         example: 5000
 *     responses:
 *       201:
 *         description: Workers added successfully
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Server error
 */
router.post('/add', verifyToken, addWorkers);

module.exports = router;