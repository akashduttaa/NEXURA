import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'nexura_super_secret_key_2026';

// Nodemailer transporter configuration
const getTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_USER.includes('@gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  // Fallback for testing
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.EMAIL_USER || 'ethereal_user',
      pass: process.env.EMAIL_PASS || 'ethereal_pass'
    }
  });
};

const transporter = getTransporter();

// Verify connection configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ SMTP Transporter Error:", error.message);
    if (error.message.includes('535')) {
      console.error("💡 TIP: If using Gmail, you MUST use a 16-character 'App Password', not your regular login password.");
    }
  } else {
    console.log("✅ SMTP Server is ready to take our messages");
  }
});

// Helper to send OTP
const sendOTP = async (email, otp) => {
  console.log(`\n========================================`);
  console.log(`🔐 OTP for ${email}: ${otp}`);
  console.log(`========================================\n`);
  
  if (!process.env.EMAIL_USER) {
    return { success: false, error: 'No email service configured' };
  }

  // Gmail App Password validation warning
  if (process.env.EMAIL_USER.includes('@gmail.com')) {
    const pass = process.env.EMAIL_PASS || '';
    const isAppPassword = /^[a-z]{16}$/.test(pass.replace(/\s/g, '').toLowerCase());
    if (!isAppPassword) {
      console.warn("⚠️  WARNING: Your EMAIL_PASS doesn't look like a Google App Password (16 lowercase letters).");
      console.warn("   Emails will likely fail with '535 Authentication failed'.");
    }
  }

  try {
    await transporter.sendMail({
      from: `"NEXURA Auth" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'NEXURA Account Verification OTP',
      text: `Your OTP for account verification is: ${otp}. It expires in 10 minutes.`,
      html: `<h3>Welcome to NEXURA</h3><p>Your OTP is: <strong>${otp}</strong></p><p>It expires in 10 minutes.</p>`
    });
    return { success: true };
  } catch (err) {
    console.error('❌ Email sending failed:', err.message);
    return { success: false, error: err.message };
  }
};

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, referenceId } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ success: false, message: 'User already exists and is verified' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (user && !user.isVerified) {
      user.name = name;
      user.password = hashedPassword;
      user.role = role;
      user.referenceId = referenceId;
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
    } else {
      user = new User({
        name, email, password: hashedPassword, role, referenceId, otp, otpExpiry
      });
      await user.save();
    }

    const emailResult = await sendOTP(email, otp);
    
    if (emailResult.success) {
      res.json({ success: true, message: 'OTP sent successfully. Please verify your email.' });
    } else {
      res.json({ 
        success: true, 
        message: `Account created, but email delivery failed (${emailResult.error}). For testing, find your OTP in the server console: ${otp}`,
        debugOtp: otp // Only for dev testing
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role, referenceId: user.referenceId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      success: true, 
      message: 'Account verified successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, referenceId: user.referenceId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'Please verify your email first', requiresVerification: true });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, referenceId: user.referenceId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, referenceId: user.referenceId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

import Course from '../models/Course.js';
import Room from '../models/Room.js';
import { studentData, facultyData, courseData, roomData } from '../seed/seedData.js';

// Quick Demo Mode Setup
router.post('/demo-setup', async (req, res) => {
  try {
    // Clear all DB
    await User.deleteMany({});
    await Student.deleteMany({});
    await Faculty.deleteMany({});
    await Course.deleteMany({});
    await Room.deleteMany({});
    
    // Insert base data
    await Course.insertMany(courseData);
    await Room.insertMany(roomData);
    await Faculty.insertMany(facultyData);
    await Student.insertMany(studentData);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('demo123', salt);

    const users = [
      { name: 'Admin Demo', email: 'admin@nexura.edu', password: hashedPassword, role: 'admin', isVerified: true },
      { name: 'Dr. Arjun Mehta', email: 'faculty@nexura.edu', password: hashedPassword, role: 'faculty', referenceId: 'FAC001', isVerified: true },
      { name: 'Aarav Patel', email: 'student@nexura.edu', password: hashedPassword, role: 'student', referenceId: 'CSE2024001', isVerified: true },
    ];

    await User.insertMany(users);

    res.json({ success: true, message: 'Database seeded and Demo users created: admin@, faculty@, student@ (password: demo123)' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
