import { Router } from 'express';
import Student from '../models/Student.js';
import { auth } from '../middleware/auth.js';
// Import our global response utility format handler
import ApiResponse from '../utils/ApiResponse.js';

const router = Router();

// Get all students
router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.find().lean();
    
    // Standardized Response
    return res.status(200).json(
      new ApiResponse(200, students, 'Students list fetched successfully')
    );
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a single student by roll number
router.get('/:rollNo', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ rollNo: req.params.rollNo }).lean();
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
    
    // Standardized Response
    return res.status(200).json(
      new ApiResponse(200, student, `Student details for roll number ${req.params.rollNo} fetched successfully`)
    );
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;