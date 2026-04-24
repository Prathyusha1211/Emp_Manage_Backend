const express = require('express');
const { addWorkers, editWorker } = require('../controllers/workerController');
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

/**
 * @swagger
 * /worker/edit/{workerId}:
 *   put:
 *     summary: Edit a specific worker
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Worker ID to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               wage:
 *                 type: number
 *                 example: 6000
 *             description: At least one field (name or wage) is required
 *     responses:
 *       200:
 *         description: Worker updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Worker updated successfully"
 *                 updatedWorker:
 *                   $ref: '#/components/schemas/Worker'
 *       400:
 *         description: Validation failed or duplicate name
 *       403:
 *         description: Unauthorized to edit this worker
 *       404:
 *         description: Worker not found
 *       500:
 *         description: Server error
 */
router.put('/edit/:workerId', verifyToken, editWorker);

module.exports = router;