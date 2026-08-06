import { Router } from 'express';
import Student from '../models/Student.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const students = await Student.find().lean();
    res.json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
});

router.get('/:rollNo', auth, async (req, res, next) => {
  try {
    const student = await Student.findOne({ rollNo: req.params.rollNo }).lean();
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
});

export default router;
