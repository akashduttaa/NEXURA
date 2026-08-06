import { Router } from 'express';
import Faculty from '../models/Faculty.js';
import { auth } from '../middleware/auth.js';
// Import our global response utility format handler
import ApiResponse from '../utils/ApiResponse.js';

const router = Router();

router.get('/', auth, async (req, res) => {
  try {
    const faculty = await Faculty.find().lean();
    
    // Standardized Response using our ApiResponse class utility
    return res.status(200).json(
      new ApiResponse(200, faculty, 'Faculty list fetched successfully')
    );
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;