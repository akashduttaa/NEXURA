import { Router } from 'express';
import { generateTimetable, simulateChange } from '../services/geneticAlgorithm.js';
import { auth, authorize } from '../middleware/auth.js';
import Course from '../models/Course.js';
import Faculty from '../models/Faculty.js';
import Room from '../models/Room.js';
import Schedule from '../models/Schedule.js';

const router = Router();

// Only admin can generate
router.post('/generate', auth, authorize('admin'), async (req, res) => {
  try {
    const { department, semester } = req.body;
    
    const courses = await Course.find().lean();
    const faculty = await Faculty.find().lean();
    const rooms = await Room.find().lean();

    const result = generateTimetable(courses, faculty, rooms, { department, semester });
    
    // Mark all existing schedules as inactive
    await Schedule.updateMany({}, { isActive: false });
    
    const schedule = new Schedule({
      semester: typeof semester === 'number' ? semester : 3,
      department: department || 'All',
      entries: result.entries,
      conflicts: result.conflictCount,
      conflictDetails: result.conflicts,
      fitness: result.fitness,
      isActive: true
    });
    await schedule.save();

    const responseData = {
      _id: schedule._id,
      entries: schedule.entries,
      fitness: schedule.fitness,
      conflicts: schedule.conflictDetails,
      conflictCount: schedule.conflicts,
      conflictPercentage: schedule.entries.length ? Math.round((schedule.conflicts / schedule.entries.length) * 100) : 0,
      totalSlots: schedule.entries.length,
      generatedAt: schedule.generatedAt,
      semester: schedule.semester,
      department: schedule.department,
      isActive: schedule.isActive
    };
    
    res.json({ success: true, data: responseData });
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
    
    // Mark all existing schedules as inactive
    await Schedule.updateMany({}, { isActive: false });
    
    const schedule = new Schedule({
      semester: 3,
      department: 'All',
      entries: result.entries,
      conflicts: result.conflictCount,
      conflictDetails: result.conflicts,
      fitness: result.fitness,
      isActive: true
    });
    await schedule.save();

    const responseData = {
      _id: schedule._id,
      entries: schedule.entries,
      fitness: schedule.fitness,
      conflicts: schedule.conflictDetails,
      conflictCount: schedule.conflicts,
      conflictPercentage: schedule.entries.length ? Math.round((schedule.conflicts / schedule.entries.length) * 100) : 0,
      totalSlots: schedule.entries.length,
      generatedAt: schedule.generatedAt,
      semester: schedule.semester,
      department: schedule.department,
      isActive: schedule.isActive
    };
    
    res.json({ success: true, data: responseData, simulatedChange: { unavailableFaculty } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Retrieve active or latest schedule
router.get('/current', async (req, res) => {
  try {
    let current = await Schedule.findOne({ isActive: true }).lean();
    if (!current) {
      current = await Schedule.findOne().sort({ generatedAt: -1 }).lean();
    }

    if (current) {
      const responseData = {
        _id: current._id,
        entries: current.entries,
        fitness: current.fitness,
        conflicts: current.conflictDetails,
        conflictCount: current.conflicts,
        conflictPercentage: current.entries.length ? Math.round((current.conflicts / current.entries.length) * 100) : 0,
        totalSlots: current.entries.length,
        generatedAt: current.generatedAt,
        semester: current.semester,
        department: current.department,
        isActive: current.isActive
      };
      res.json({ success: true, data: responseData });
    } else {
      res.json({ success: false, message: 'No timetable generated yet' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get generation history (without heavy entries list)
router.get('/history', auth, async (req, res) => {
  try {
    const history = await Schedule.find({}, '-entries').sort({ generatedAt: -1 }).lean();
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Activate specific schedule config
router.post('/:id/active', auth, authorize('admin'), async (req, res) => {
  try {
    await Schedule.updateMany({}, { isActive: false });
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    res.json({ success: true, message: 'Schedule activated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete specific schedule config
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const deleted = await Schedule.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    
    // If the active schedule was deleted, fall back to making the latest remaining one active
    if (deleted.isActive) {
      const latest = await Schedule.findOne().sort({ generatedAt: -1 });
      if (latest) {
        latest.isActive = true;
        await latest.save();
      }
    }
    
    res.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
