import { Router } from 'express';
import { generateTimetable, simulateChange } from '../services/geneticAlgorithm.js';
import { auth, authorize } from '../middleware/auth.js';
import Course from '../models/Course.js';
import Faculty from '../models/Faculty.js';
import Room from '../models/Room.js';

const router = Router();

let cachedTimetable = null;

// Only admin can generate
router.post('/generate', auth, authorize('admin'), async (req, res) => {
  try {
    const { department, semester } = req.body;
    
    const courses = await Course.find().lean();
    const faculty = await Faculty.find().lean();
    const rooms = await Room.find().lean();

    const result = generateTimetable(courses, faculty, rooms, { department, semester });
    cachedTimetable = result;
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Only admin can simulate changes
router.post('/simulate-change', auth, authorize('admin'), async (req, res) => {
  try {
    const { unavailableFaculty = [] } = req.body;
    
    const courses = await Course.find().lean();
    const faculty = await Faculty.find().lean();
    const rooms = await Room.find().lean();

    const result = simulateChange(courses, faculty, rooms, unavailableFaculty);
    cachedTimetable = result;
    
    res.json({ success: true, data: result, simulatedChange: { unavailableFaculty } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/current', (req, res) => {
  if (cachedTimetable) {
    res.json({ success: true, data: cachedTimetable });
  } else {
    res.json({ success: false, message: 'No timetable generated yet' });
  }
});

export default router;
