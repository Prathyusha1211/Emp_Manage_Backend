const Worker = require('../models/Worker');

exports.addWorkers = async (req, res) => {
    try {
        const userId = req.userId;
        let { workersData } = req.body;

        if (!Array.isArray(workersData)) {
            workersData = [workersData];
        }

        const errors = [];

        // 🔍 Step 1: Validate input fields
        for (const workerData of workersData) {
            const { name, wage } = workerData;

            if (!name || !wage) {
                errors.push({
                    name: name || null,
                    error: 'Name and wage are required'
                });
            }
        }

        // 🔍 Step 2: Check duplicates in DB
        const names = workersData.map(w => w.name);

        const existingWorkers = await Worker.find({
            name: { $in: names },
            userId
        });

        const existingNames = new Set(existingWorkers.map(w => w.name));

        for (const name of existingNames) {
            errors.push({
                name,
                error: 'Already exists'
            });
        }

        // ❌ If ANY errors → return
        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors
            });
        }

        // ✅ Step 3: Insert all workers
        const newWorkers = workersData.map(w => ({
            ...w,
            userId
        }));

        const addedWorkers = await Worker.insertMany(newWorkers);

        return res.status(201).json({
            message: 'Workers added successfully',
            addedWorkers
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

exports.editWorker = async (req, res) => {
    try {
        const userId = req.userId;
        const { workerId } = req.params;
        const { name, wage } = req.body;

        // 🔍 Step 1: Validate input
        if (!name && !wage) {
            return res.status(400).json({
                message: 'At least one field (name or wage) is required'
            });
        }

        // 🔍 Step 2: Check if worker exists and belongs to the user
        const worker = await Worker.findById(workerId);

        if (!worker) {
            return res.status(404).json({
                message: 'Worker not found'
            });
        }

        if (worker.userId.toString() !== userId) {
            return res.status(403).json({
                message: 'Unauthorized to edit this worker'
            });
        }

        // 🔍 Step 3: Check for duplicate name (if name is being updated)
        if (name && name !== worker.name) {
            const existingWorker = await Worker.findOne({
                name,
                userId,
                _id: { $ne: workerId }
            });

            if (existingWorker) {
                return res.status(400).json({
                    message: 'Worker with this name already exists'
                });
            }
        }

        // ✅ Step 4: Update the worker
        const updateData = {};
        if (name) updateData.name = name;
        if (wage) updateData.wage = wage;

        const updatedWorker = await Worker.findByIdAndUpdate(
            workerId,
            updateData,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            message: 'Worker updated successfully',
            updatedWorker
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};