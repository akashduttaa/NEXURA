import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";
import Course from "../models/Course.js";
import Room from "../models/Room.js";
import { auth } from "../middleware/auth.js";
import {
  studentData,
  facultyData,
  courseData,
  roomData,
} from "../seed/seedData.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "nexura_super_secret_key_2026";

// ── Nodemailer ───────────────────────────────────────────────────────────────
const getTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_USER.includes("@gmail.com")) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: process.env.EMAIL_USER || "ethereal_user",
      pass: process.env.EMAIL_PASS || "ethereal_pass",
    },
  });
};

const transporter = getTransporter();

transporter.verify(function (error) {
  if (error) {
    console.error("❌ SMTP Transporter Error:", error.message);
    if (error.message.includes("535")) {
      console.error(
        "💡 TIP: If using Gmail, use a 16-character 'App Password'.",
      );
    }
  } else {
    console.log("✅ SMTP Server is ready");
  }
});

const sendOTP = async (email, otp) => {
  console.log(`\n========================================`);
  console.log(`🔐 OTP for ${email}: ${otp}`);
  console.log(`========================================\n`);

  if (!process.env.EMAIL_USER)
    return { success: false, error: "No email service configured" };

  try {
    await transporter.sendMail({
      from: `"NEXURA Auth" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "NEXURA Account Verification OTP",
      text: `Your OTP for account verification is: ${otp}. It expires in 10 minutes.`,
      html: `<h3>Welcome to NEXURA</h3><p>Your OTP is: <strong>${otp}</strong></p><p>It expires in 10 minutes.</p>`,
    });
    return { success: true };
  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
    return { success: false, error: err.message };
  }
};

// ── POST /api/auth/signup ────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, referenceId } = req.body;

    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User already exists and is verified",
        });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

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
        name,
        email,
        password: hashedPassword,
        role,
        referenceId,
        otp,
        otpExpiry,
      });
      await user.save();
    }

    const emailResult = await sendOTP(email, otp);

    if (emailResult.success) {
      res.json({
        success: true,
        message: "OTP sent successfully. Please verify your email.",
      });
    } else {
      res.json({
        success: true,
        message: `Account created, but email delivery failed (${emailResult.error}). OTP in server console: ${otp}`,
        debugOtp: otp,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── POST /api/auth/verify-otp ────────────────────────────────────────────────
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, referenceId: user.referenceId },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      success: true,
      message: "Account verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        referenceId: user.referenceId,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    if (!user.isVerified) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Please verify your email first",
          requiresVerification: true,
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, referenceId: user.referenceId },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        referenceId: user.referenceId,
        avatar: user.avatar || null, // ← included on login
        bio: user.bio || "",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
// Returns the current authenticated user's full profile (including avatar + bio)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -otp -otpExpiry",
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        referenceId: user.referenceId,
        avatar: user.avatar || null,
        bio: user.bio || "",
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── PATCH /api/auth/profile ───────────────────────────────────────────────────
// Updates name, bio, and/or avatar for the authenticated user
router.patch("/profile", auth, async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;

    // Validate avatar size (base64 of 5 MB ≈ ~6.8 MB string — reject above that)
    if (avatar && avatar.length > 7 * 1024 * 1024) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Avatar image is too large. Max 5 MB.",
        });
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio.trim().slice(0, 500);
    if (avatar !== undefined) updates.avatar = avatar; // null clears it

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password -otp -otpExpiry");

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        referenceId: user.referenceId,
        avatar: user.avatar || null,
        bio: user.bio || "",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── POST /api/auth/demo-setup ────────────────────────────────────────────────
router.post("/demo-setup", async (req, res) => {
  try {
    await User.deleteMany({});
    await Student.deleteMany({});
    await Faculty.deleteMany({});
    await Course.deleteMany({});
    await Room.deleteMany({});

    await Course.insertMany(courseData);
    await Room.insertMany(roomData);
    await Faculty.insertMany(facultyData);
    await Student.insertMany(studentData);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("demo123", salt);

    const users = [
      {
        name: "Admin Demo",
        email: "admin@nexura.edu",
        password: hashedPassword,
        role: "admin",
        isVerified: true,
      },
      {
        name: "Dr. Arjun Mehta",
        email: "faculty@nexura.edu",
        password: hashedPassword,
        role: "faculty",
        referenceId: "FAC001",
        isVerified: true,
      },
      {
        name: "Aarav Patel",
        email: "student@nexura.edu",
        password: hashedPassword,
        role: "student",
        referenceId: "CSE2024001",
        isVerified: true,
      },
    ];

    await User.insertMany(users);

    res.json({
      success: true,
      message:
        "Database seeded. Demo users: admin@, faculty@, student@ (password: demo123)",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
