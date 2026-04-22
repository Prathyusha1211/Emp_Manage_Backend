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