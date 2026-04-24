const mongoose = require("mongoose");
const Attendance = require('../models/Attendance');
const Worker = require('../models/Worker');

exports.markAttendance = async (req, res) => {
    try {
        const userId = req.userId;
        const { workerId, date, status } = req.body;

        // ✅ Step 1: Validate all inputs exist
        if (!userId) {
            return res.status(401).json({
                message: 'Unauthorized - user not authenticated'
            });
        }

        if (!workerId || !date || !status) {
            return res.status(400).json({
                message: 'Missing required fields: workerId, date, status'
            });
        }

        // ✅ Step 2: Validate formats
        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({
                message: 'Invalid workerId format'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                message: 'Invalid userId format'
            });
        }

        if (!['present', 'absent'].includes(status)) {
            return res.status(400).json({
                message: 'Invalid status - must be "present" or "absent"'
            });
        }

        // ✅ Step 3: Parse and validate date
        let attendanceDate = new Date(date);
        if (isNaN(attendanceDate.getTime())) {
            return res.status(400).json({
                message: 'Invalid date format'
            });
        }

        // Convert to midnight UTC
        attendanceDate = new Date(Date.UTC(
            attendanceDate.getUTCFullYear(),
            attendanceDate.getUTCMonth(),
            attendanceDate.getUTCDate(),
            0, 0, 0, 0
        ));

        // ✅ Step 4: Convert IDs to ObjectId ONCE and reuse
        const workerObjectId = new mongoose.Types.ObjectId(workerId);
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // ✅ Step 5: Verify worker exists and belongs to user
        const worker = await Worker.findById(workerObjectId);
        if (!worker) {
            return res.status(404).json({
                message: 'Worker not found'
            });
        }

        if (worker.userId.toString() !== userObjectId.toString()) {
            return res.status(403).json({
                message: 'Unauthorized - worker does not belong to this user'
            });
        }

        // ✅ Step 6: Check if attendance exists for this worker on this date
        const nextDay = new Date(attendanceDate);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);


        const existingAttendance = await Attendance.findOne({
            workerId: workerObjectId,
            date: { $gte: attendanceDate, $lt: nextDay }
        });

        if (existingAttendance) {

            if (existingAttendance.status === status) {
                return res.status(200).json({
                    message: 'Attendance already marked with same status',
                    attendance: existingAttendance
                });
            }

            existingAttendance.status = status;
            await existingAttendance.save();

            return res.status(200).json({
                message: 'Attendance updated successfully',
                attendance: existingAttendance
            });
        }


        // ✅ Step 7: Create new attendance record
        const newAttendance = new Attendance({
            workerId: workerObjectId,
            userId: userObjectId,
            date: attendanceDate,
            status: status
        });

        await newAttendance.save();


        return res.status(201).json({
            message: 'Attendance marked successfully',
            attendance: newAttendance
        });

    } catch (error) {
        console.error('❌ Error in markAttendance:', error.message);
        console.error('Stack:', error.stack);

        // Handle E11000 duplicate key error
        if (error.code === 11000) {
            console.error('🚨 E11000 Error - Duplicate key detected');
            console.error('Key pattern:', error.keyPattern);
            console.error('Key value:', error.keyValue);
            
            return res.status(409).json({
                message: 'E11000 Duplicate Key Error - This indicates corrupted data in database',
                error: 'Please contact administrator to clean database',
                details: {
                    keyPattern: error.keyPattern,
                    keyValue: error.keyValue
                }
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            console.error('❌ Validation errors:', errors);
            return res.status(400).json({
                message: 'Validation failed',
                errors
            });
        }

        // Generic server error
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

exports.getWorkersByDate = async (req, res) => {
    try {
        const userId = req.userId;
        const { date } = req.query || req.body;

        if (!date) {
            return res.status(400).json({
                message: 'Date is required'
            });
        }

        // 🕒 Convert IST date → UTC range
        const inputDate = new Date(date);

        // Start of IST day
        inputDate.setHours(0, 0, 0, 0);

        // Convert IST → UTC
        const start = new Date(inputDate.getTime() - (5.5 * 60 * 60 * 1000));
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const result = await Worker.aggregate([
            {
                // 🔥 Fix: convert userId to ObjectId
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: 'attendances',
                    let: { workerId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$workerId', '$$workerId'] },
                                        { $gte: ['$date', start] },
                                        { $lt: ['$date', end] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'attendance'
                }
            },
            {
                $addFields: {
                    // attendance: { $arrayElemAt: ['$attendance', 0] },
                    attendanceStatus: {
                        $ifNull: [
                            { $arrayElemAt: ['$attendance.status', 0] },
                            null
                        ]
                    }
                }
            },
            {
                $project: {
                    name: 1,
                    wage: 1,
                    attendanceStatus: 1,
                    // attendance: 1
                }
            }
        ]);

        return res.status(200).json({
            message: 'Workers fetched successfully',
            date,
            data: result
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};