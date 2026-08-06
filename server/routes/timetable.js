import { Router } from 'express';
import { generateTimetable, simulateChange } from '../services/geneticAlgorithm.js';
import { auth, authorize } from '../middleware/auth.js';
import Course from '../models/Course.js';
import Faculty from '../models/Faculty.js';
import Room from '../models/Room.js';
// Import our global response utility format handler
import ApiResponse from '../utils/ApiResponse.js';

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
    
    // Standardized Response
    return res.status(200).json(
      new ApiResponse(200, result, 'Timetable generated successfully')
    );
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
    
    const responseData = {
      ...result,
      simulatedChange: { unavailableFaculty }
    };
    
    // Standardized Response
    return res.status(200).json(
      new ApiResponse(200, responseData, 'Timetable changes simulated successfully')
    );
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get the current cached timetable
router.get('/current', (req, res) => {
  if (cachedTimetable) {
    // Standardized Response for existing timetable
    return res.status(200).json(
      new ApiResponse(200, cachedTimetable, 'Current timetable retrieved successfully')
    );
  } else {
    // Standardized Response for empty state
    return res.status(200).json(
      new ApiResponse(200, null, 'No timetable generated yet')
    );
  }
});

export default router;