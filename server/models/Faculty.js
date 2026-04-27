import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  email: { type: String, required: true },
  courses: [{ type: String }],
  availability: {
    type: Map,
    of: [Number],
    default: () => ({
      Monday: [1,2,3,4,5,6,7,8],
      Tuesday: [1,2,3,4,5,6,7,8],
      Wednesday: [1,2,3,4,5,6,7,8],
      Thursday: [1,2,3,4,5,6,7,8],
      Friday: [1,2,3,4,5,6,7,8],
      Saturday: [1,2,3,4,5,6]
    })
  },
  maxHoursPerWeek: { type: Number, default: 20 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Faculty', facultySchema);
