import { Router } from 'express';
import Course from '../models/Course.js';
import Faculty from '../models/Faculty.js';
import Room from '../models/Room.js';
import Student from '../models/Student.js';
import { auth, authorize } from '../middleware/auth.js';
// Import our global response utility format handler
import ApiResponse from '../utils/ApiResponse.js';

const router = Router();

// Only admin can view analytics
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const courses = await Course.find().lean();
    const faculty = await Faculty.find().lean();
    const rooms = await Room.find().lean();
    const students = await Student.find().lean();

    // Faculty workload
    const workload = faculty.map(f => {
      const assigned = courses.filter(c => c.facultyId === f.employeeId);
      const totalHours = assigned.reduce((sum, c) => sum + (c.lecturesPerWeek || 3), 0);
      return { name: f.name, department: f.department, hoursPerWeek: totalHours, maxHours: f.maxHoursPerWeek || 20, utilization: Math.round((totalHours / (f.maxHoursPerWeek || 20)) * 100) };
    });

    // Room utilization (based on total available slots)
    const totalSlotsPerRoom = 6 * 8; // 6 days * 8 slots
    const roomUtil = rooms.map(r => {
      const assignedCourses = courses.filter(c => c.type === r.type);
      const usedSlots = assignedCourses.reduce((s, c) => s + (c.lecturesPerWeek || 3), 0) / rooms.filter(rm => rm.type === r.type).length;
      return { room: r.number, building: r.building, capacity: r.capacity, type: r.type, usedSlots: Math.round(usedSlots), totalSlots: totalSlotsPerRoom, utilization: Math.round((usedSlots / totalSlotsPerRoom) * 100) };
    });

    // Department stats
    const deptStats = {};
    for (const d of ['CSE', 'ECE', 'ME']) {
      deptStats[d] = {
        students: students.filter(s => s.department === d).length,
        faculty: faculty.filter(f => f.department === d).length,
        courses: courses.filter(c => c.department === d).length,
        avgCGPA: +(students.filter(s => s.department === d).reduce((s, st) => s + st.cgpa, 0) / Math.max(students.filter(s => s.department === d).length, 1)).toFixed(2)
      };
    }

    // Fee collection
    const feeStats = {
      totalStudents: students.length,
      paid: students.filter(s => s.feesPaid).length,
      unpaid: students.filter(s => !s.feesPaid).length,
      totalCollected: students.filter(s => s.feesPaid).reduce((s, st) => s + (st.feeAmount || 0), 0),
      collectionRate: Math.round((students.filter(s => s.feesPaid).length / students.length) * 100)
    };

    // Pack data together for formatting wrapper
    const analyticsData = {
      overview: { totalStudents: students.length, totalFaculty: faculty.length, totalCourses: courses.length, totalRooms: rooms.length },
      facultyWorkload: workload,
      roomUtilization: roomUtil,
      departmentStats: deptStats,
      feeStats
    };

    // Standardized Response using our new ApiResponse utility class
    return res.status(200).json(
      new ApiResponse(200, analyticsData, 'Analytics fetched successfully')
    );
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;