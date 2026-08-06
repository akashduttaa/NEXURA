import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import blockchain from './services/blockchainSimulator.js';
import { studentData, facultyData, courseData, roomData } from './seed/seedData.js';

import authRoutes from './routes/auth.js';
import timetableRoutes from './routes/timetable.js';
import studentRoutes from './routes/students.js';
import facultyRoutes from './routes/faculty.js';
import transactionRoutes from './routes/transactions.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);

import Course from './models/Course.js';
import Room from './models/Room.js';

// Courses & Rooms endpoints
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find().lean();
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find().lean();
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), blockchain: blockchain.getStats() });
});

// Seed blockchain with sample transactions
async function seedBlockchain() {
  const stats = blockchain.getStats();
  if (stats.totalBlocks <= 1) {
    console.log('🌱 Seeding blockchain with sample records...');
    await blockchain.addAcademicRecord('Aarav Patel', 'CSE2024001', { course: 'CS301', grade: 'A', semester: 3, gpa: 9.0 });
    await blockchain.addAcademicRecord('Diya Sharma', 'CSE2024002', { course: 'CS302', grade: 'A+', semester: 3, gpa: 9.5 });
    await blockchain.addFeePayment('Aarav Patel', 'CSE2024001', 125000, 3);
    await blockchain.addFeePayment('Saanvi Mehta', 'ECE2024001', 115000, 3);
    await blockchain.addCertificate('Ishita Reddy', 'CSE2024006', 'Merit Certificate - Dean\'s List');
    await blockchain.addAcademicRecord('Vihaan Singh', 'CSE2024003', { course: 'CS305', grade: 'B+', semester: 5, gpa: 8.2 });
    await blockchain.addFeePayment('Vivaan Rao', 'ME2024001', 110000, 3);
  } else {
    console.log('⛓️  Blockchain already contains transactions. Skipping seed.');
  }
}

// Start server
const start = async () => {
  await connectDB();
  await blockchain.init();
  await seedBlockchain();
  
  app.listen(PORT, () => {
    console.log(`\n🚀 NEXURA Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints ready`);
    console.log(`⛓️  Blockchain initialized with ${blockchain.getChain().length} blocks\n`);
  });
};

start();
