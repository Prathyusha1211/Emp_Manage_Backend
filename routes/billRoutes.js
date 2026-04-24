const express = require('express');
const billController = require('../controllers/billController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /bill/store:
 *   post:
 *     summary: Store a new bill
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - generatedBillData
 *               - name
 *               - date
 *             properties:
 *               generatedBillData:
 *                 type: object
 *                 description: Bill data object
 *                 example: { items: [], total: 0 }
 *               name:
 *                 type: string
 *                 description: Bill name
 *                 example: "March Bill"
 *               date:
 *                 type: string
 *                 description: Date in DD/MM/YYYY format or ISO format
 *                 example: "2026-04-24"
 *     responses:
 *       201:
 *         description: Bill stored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bill stored successfully"
 *                 bill:
 *                   $ref: '#/components/schemas/Bill'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.post('/store', verifyToken, billController.storeBill);

/**
 * @swagger
 * /bill/get-bills:
 *   get:
 *     summary: Get all bills for authenticated user
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bills retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bills retrieved successfully"
 *                 bills:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bill'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/get-bills', verifyToken, billController.getBills);

/**
 * @swagger
 * /bill/{billId}:
 *   get:
 *     summary: Get a specific bill by ID
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: billId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bill ID
 *     responses:
 *       200:
 *         description: Bill retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bill retrieved successfully"
 *                 bill:
 *                   $ref: '#/components/schemas/Bill'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Bill not found
 *       500:
 *         description: Server error
 */
router.get('/:billId', verifyToken, billController.getBillById);

module.exports = router;
