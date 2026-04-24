const mongoose = require("mongoose");
const Attendance = require('../models/Attendance');
const Worker = require('../models/Worker');

exports.markAttendance = async (req, res) => {
    try {
        const userId = req.userId;
        const { workerId, date, status } = req.body;

        // Validate required fields
        if (!workerId || !date || !status) {
            return res.status(400).json({
                message: 'workerId, date, and status are required'
            });
        }

        // 🔍 Validate workerId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({
                message: 'Invalid workerId format'
            });
        }

        // 🔍 Validate date is a valid date
        const attendanceDate = new Date(date);
        if (isNaN(attendanceDate.getTime())) {
            return res.status(400).json({
                message: 'Invalid date format. Use YYYY-MM-DD or ISO format'
            });
        }

        // Validate status
        if (!['present', 'absent'].includes(status)) {
            return res.status(400).json({
                message: 'Status must be either "present" or "absent"'
            });
        }

        console.log("✓ Validation passed");

        // Check if worker exists and belongs to the user
        const worker = await Worker.findById(workerId);
        if (!worker) {
            return res.status(404).json({
                message: 'Worker not found'
            });
        }

        console.log("✓ Worker found");

        if (worker.userId.toString() !== userId) {
            return res.status(403).json({
                message: 'Unauthorized: Worker does not belong to this user'
            });
        }

        console.log("✓ User authorization passed");

        // Check if attendance already marked for this date
        attendanceDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(attendanceDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const existingAttendance = await Attendance.findOne({
            worker: new mongoose.Types.ObjectId(workerId),
            date: { $gte: attendanceDate, $lt: nextDay }
        });

        if (existingAttendance) {
            // 🔍 If same status → no change
            if (existingAttendance.status === status) {
                return res.status(200).json({
                    message: 'Attendance already marked with same status'
                });
            }

            // 🔄 If status changed → update
            existingAttendance.status = status;
            await existingAttendance.save();

            return res.status(200).json({
                message: 'Attendance updated successfully',
                attendance: existingAttendance
            });
        }

        console.log("✓ Creating new attendance record");

        // Create attendance record
        const attendance = new Attendance({
            worker: new mongoose.Types.ObjectId(workerId),
            userId: new mongoose.Types.ObjectId(userId),
            date: attendanceDate,
            status
        });

        await attendance.save();

        console.log("✓ Attendance record created successfully");

        res.status(201).json({
            message: 'Attendance marked successfully',
            attendance
        });
    } catch (error) {
        console.error('❌ Error in markAttendance:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
                                        { $eq: ['$worker', '$$workerId'] },
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