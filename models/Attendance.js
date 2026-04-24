const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent'], required: true },
  createdAt: { type: Date, default: Date.now }
});

// 🔑 Compound index (already exists in database as worker_1_date_1)
attendanceSchema.index({ worker: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);