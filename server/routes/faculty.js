import { Router } from 'express';
import Faculty from '../models/Faculty.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const faculty = await Faculty.find().lean();
    res.json({ success: true, data: faculty });
  } catch (error) {
    next(error);
  }
});

export default router;
