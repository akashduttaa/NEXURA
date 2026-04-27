import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true },
  email: { type: String, required: true },
  cgpa: { type: Number, default: 0 },
  feesPaid: { type: Boolean, default: false },
  feeAmount: { type: Number, default: 0 },
  courses: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Student', studentSchema);
