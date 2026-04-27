import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  credits: { type: Number, required: true },
  semester: { type: Number, required: true },
  lecturesPerWeek: { type: Number, required: true },
  type: { type: String, enum: ['lecture', 'lab', 'tutorial'], default: 'lecture' },
  facultyId: { type: String },
  studentsEnrolled: { type: Number, default: 30 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Course', courseSchema);
