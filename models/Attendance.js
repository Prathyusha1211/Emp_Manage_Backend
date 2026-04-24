const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent'], required: true },
  createdAt: { type: Date, default: Date.now }
});

// 🔑 Unique compound index: one attendance record per worker per day
attendanceSchema.index({ workerId: 1, date: 1 }, { unique: true });

// 🛡️ Pre-save validation
attendanceSchema.pre('save', function(next) {
  if (!this.workerId) {
    return next(new Error('workerId is required'));
  }
  if (!this.userId) {
    return next(new Error('userId is required'));
  }
  if (!this.date) {
    return next(new Error('date is required'));
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);

module.exports = mongoose.model('Attendance', attendanceSchema);