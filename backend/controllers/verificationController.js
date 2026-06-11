import nodemailer      from "nodemailer";
import crypto          from "crypto";
import OTP             from "../models/OTP.js";
import Review          from "../models/Review.js";
import CollegeDomain   from "../models/CollegeDomain.js";

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/verify/send-otp
export const sendOTP = async (req, res) => {
  try {
    const { collegeId, collegeEmail, userId } = req.body;
    if (!collegeEmail || !collegeEmail.includes("@"))
      return res.status(400).json({ error: "Invalid email address." });

    const domain = collegeEmail.split("@")[1].toLowerCase();
    const domainRecord = await CollegeDomain.findOne({ collegeId, domains: domain });

    if (!domainRecord)
      return res.status(400).json({
        error: `"@${domain}" is not registered for this college. Use ID upload instead.`,
      });

    await OTP.deleteMany({ userId, collegeId });
    const otpCode  = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OTP.create({ userId, collegeId, email: collegeEmail, otp: otpCode, expiresAt });

    const transporter = createTransporter();
    await transporter.sendMail({
      from:    `"ColleXa Verification" <${process.env.EMAIL_USER}>`,
      to:      collegeEmail,
      subject: "ColleXa — Unfiltered Mode Verification Code",
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#F8F6FF;padding:32px;border-radius:16px;">
        <h1 style="color:#4F46E5;text-align:center;">ColleXa 🎓</h1>
        <div style="background:#fff;border-radius:12px;padding:28px;border:1.5px solid #EDE9FE;text-align:center;">
          <p style="color:#374151;">Your Unfiltered Mode verification code:</p>
          <div style="background:#4F46E5;color:#fff;font-size:36px;font-weight:900;letter-spacing:10px;border-radius:12px;padding:18px 24px;margin:16px 0;">${otpCode}</div>
          <p style="color:#9CA3AF;font-size:12px;">Expires in <strong>10 minutes</strong>.</p>
        </div>
      </div>`,
    });

    return res.json({ success: true, message: `OTP sent to ${collegeEmail}` });
  } catch (err) {
    console.error("sendOTP error:", err.message);
    return res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
};

// POST /api/verify/verify-otp
export const verifyOTP = async (req, res) => {
  try {
    const { userId, collegeId, collegeEmail, otp, studentType, department, graduationYear } = req.body;
    const record = await OTP.findOne({ userId, collegeId, email: collegeEmail, used: false });

    if (!record)                return res.status(400).json({ error: "OTP not found. Request a new one." });
    if (record.expiresAt < new Date()) return res.status(400).json({ error: "OTP expired. Request a new one." });
    if (record.otp !== otp)     return res.status(400).json({ error: "Incorrect OTP." });

    record.used = true;
    await record.save();

    const verificationToken = crypto.randomBytes(32).toString("hex");
    return res.json({
      success: true, verificationToken, collegeEmail,
      studentType: studentType || "student",
      department:  department  || "",
      graduationYear: graduationYear || "",
      message: "Email verified! You can now submit your Unfiltered review.",
    });
  } catch (err) {
    console.error("verifyOTP error:", err.message);
    return res.status(500).json({ error: "Verification failed." });
  }
};

// POST /api/verify/upload-id  (multipart, file field = "proofDocument")
export const uploadID = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });
    const { studentType, department, graduationYear } = req.body;
    return res.json({
      success: true,
      proofDocumentPath: req.file.path,
      proofDocumentName: req.file.originalname,
      studentType: studentType   || "student",
      department:  department    || "",
      graduationYear: graduationYear || "",
      message: "Document uploaded! Your review will be reviewed by admin.",
    });
  } catch (err) {
    console.error("uploadID error:", err.message);
    return res.status(500).json({ error: "Upload failed." });
  }
};

// GET /api/verify/check-domain?domain=iitb.ac.in&collegeId=xxx
export const checkDomain = async (req, res) => {
  try {
    const { domain, collegeId } = req.query;
    if (!domain || !collegeId) return res.status(400).json({ error: "domain and collegeId required." });
    const record = await CollegeDomain.findOne({ collegeId, domains: domain.toLowerCase() });
    return res.json({ valid: !!record, collegeName: record?.collegeName || null });
  } catch (err) {
    return res.status(500).json({ error: "Domain check failed." });
  }
};

// GET /api/admin/pending-verifications
export const getPendingVerifications = async (req, res) => {
  try {
    const pending = await Review.find({ verificationMethod: "id_upload", verificationStatus: "pending" })
      .populate("userId", "name email")
      .populate("collegeId", "name location")
      .sort({ createdAt: -1 });
    return res.json(pending);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch pending verifications." });
  }
};

// POST /api/admin/verify/:reviewId/approve
export const approveVerification = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { adminNote } = req.body;
    const review = await Review.findByIdAndUpdate(reviewId,
      { isVerified: true, verifiedByAdmin: true, verificationStatus: "approved", adminNote: adminNote || "Approved" },
      { new: true }
    );
    if (!review) return res.status(404).json({ error: "Review not found." });
    return res.json({ success: true, review });
  } catch (err) {
    return res.status(500).json({ error: "Approval failed." });
  }
};

// POST /api/admin/verify/:reviewId/reject
export const rejectVerification = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { adminNote } = req.body;
    const review = await Review.findByIdAndUpdate(reviewId,
      { isVerified: false, verificationStatus: "rejected", reviewType: "public", adminNote: adminNote || "Rejected" },
      { new: true }
    );
    if (!review) return res.status(404).json({ error: "Review not found." });
    return res.json({ success: true, review });
  } catch (err) {
    return res.status(500).json({ error: "Rejection failed." });
  }
};
