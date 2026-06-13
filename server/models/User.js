import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "faculty", "student"],
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    referenceId: {
      type: String, // employeeId for faculty, rollNo for students
    },
    // ── Profile fields ──────────────────────────────────────────────────────────
    avatar: {
      type: String, // base64 data URL or external URL
      default: null,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", userSchema);
