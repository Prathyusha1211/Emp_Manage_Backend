const mongoose = require("mongoose");
const Attendance = require('../models/Attendance');
const Worker = require('../models/Worker');


exports.markAttendance = async (req, res) => {
    try {
        const userId = req.userId;
        const { workerId, date, status } = req.body;

        // ✅ Step 1: Validate inputs
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized - user not authenticated"
            });
        }

        if (!workerId || !date || !status) {
            return res.status(400).json({
                message: "Missing required fields: workerId, date, status"
            });
        }

        // ✅ Step 2: Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({
                message: "Invalid workerId format"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                message: "Invalid userId format"
            });
        }

        // ✅ Step 3: Validate status
        if (!["present", "absent"].includes(status)) {
            return res.status(400).json({
                message: 'Invalid status - must be "present" or "absent"'
            });
        }

        // ✅ Step 4: Normalize date (VERY IMPORTANT)
        let attendanceDate = new Date(date);

        if (isNaN(attendanceDate.getTime())) {
            return res.status(400).json({
                message: "Invalid date format"
            });
        }

        // Convert to exact UTC midnight
        attendanceDate = new Date(Date.UTC(
            attendanceDate.getUTCFullYear(),
            attendanceDate.getUTCMonth(),
            attendanceDate.getUTCDate(),
            0, 0, 0, 0
        ));

        // ✅ Step 5: Convert IDs
        const workerObjectId = new mongoose.Types.ObjectId(workerId);
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // ✅ Step 6: Verify worker ownership
        const worker = await Worker.findById(workerObjectId);

        if (!worker) {
            return res.status(404).json({
                message: "Worker not found"
            });
        }

        if (worker.userId.toString() !== userObjectId.toString()) {
            return res.status(403).json({
                message: "Unauthorized - worker does not belong to this user"
            });
        }

        // ✅ Step 7: Atomic upsert (NO DUPLICATES EVER)
        const attendance = await Attendance.findOneAndUpdate(
            {
                workerId: workerObjectId,
                date: attendanceDate
            },
            {
                $set: {
                    status,
                    userId: userObjectId
                }
            },
            {
                new: true,      // return updated doc
                upsert: true,   // create if not exists
                setDefaultsOnInsert: true
            }
        );

        // ✅ Step 8: Response
        return res.status(200).json({
            message: "Attendance marked/updated successfully",
            attendance
        });

    } catch (error) {
        console.error("❌ Error in markAttendance:", error.message);

        // 🔥 Handle duplicate key (just in case)
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Duplicate attendance detected (should not happen after fix)",
                error: error.keyValue
            });
        }

        return res.status(500).json({
            message: "Server error",
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