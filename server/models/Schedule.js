import mongoose from 'mongoose';

const scheduleEntrySchema = new mongoose.Schema({
  courseCode: String,
  courseName: String,
  facultyName: String,
  facultyId: String,
  roomNumber: String,
  day: String,
  timeSlot: Number,
  department: String,
  type: { type: String, default: 'lecture' }
}, { _id: false });

const scheduleSchema = new mongoose.Schema({
  semester: { type: Number, required: true },
  department: { type: String, required: true },
  entries: [scheduleEntrySchema],
  conflicts: { type: Number, default: 0 },
  conflictDetails: [{ type: String }],
  fitness: { type: Number, default: 0 },
  isActive: { type: Boolean, default: false },
  generatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Schedule', scheduleSchema);
