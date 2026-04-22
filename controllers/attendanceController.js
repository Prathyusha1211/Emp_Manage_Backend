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

        // Validate status
        if (!['present', 'absent'].includes(status)) {
            return res.status(400).json({
                message: 'Status must be either "present" or "absent"'
            });
        }

        // Check if worker exists and belongs to the user
        const worker = await Worker.findById(workerId);
        if (!worker) {
            return res.status(404).json({
                message: 'Worker not found'
            });
        }

        if (worker.userId.toString() !== userId) {
            return res.status(403).json({
                message: 'Unauthorized: Worker does not belong to this user'
            });
        }

        // Check if attendance already marked for this date
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(attendanceDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const existingAttendance = await Attendance.findOne({
            workerId,
            date: { $gte: attendanceDate, $lt: nextDay }
        });

        if (existingAttendance) {
            // 🔍 If same status → no change
            if (existingAttendance.status === status) {
                return res.status(400).json({
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

        // Create attendance record
        const attendance = new Attendance({
            workerId,
            userId,
            date: attendanceDate,
            status
        });

        await attendance.save();

        res.status(201).json({
            message: 'Attendance marked successfully',
            attendance
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};