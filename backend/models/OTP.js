import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  collegeId:   { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true },
  email:       { type: String, required: true },
  otp:         { type: String, required: true },
  expiresAt:   { type: Date,   required: true },
  used:        { type: Boolean, default: false },
});

// Auto-delete expired OTPs after 10 minutes
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("OTP", OTPSchema);
