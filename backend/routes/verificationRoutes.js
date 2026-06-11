import express  from "express";
import multer   from "multer";
import path     from "path";
import {
  sendOTP, verifyOTP, uploadID, checkDomain,
  getPendingVerifications, approveVerification, rejectVerification,
} from "../controllers/verificationController.js";

const router = express.Router();

// ── Multer: store uploaded ID cards in uploads/proofs/ ───────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/proofs/"),
  filename:    (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext     = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime    = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Only JPG, PNG and PDF files are allowed."));
  },
});

// ── Student verification routes ───────────────────────────────
router.post("/send-otp",      sendOTP);
router.post("/verify-otp",    verifyOTP);
router.post("/upload-id",     upload.single("proofDocument"), uploadID);
router.get("/check-domain",   checkDomain);

// ── Admin routes ──────────────────────────────────────────────
router.get("/admin/pending",               getPendingVerifications);
router.post("/admin/:reviewId/approve",    approveVerification);
router.post("/admin/:reviewId/reject",     rejectVerification);

export default router;


// ============================================================
// backend/routes/reviewRoutes.js  — UPDATED
// (Replace your existing reviewRoutes.js with this)
// ============================================================
// import express from "express";
// import { addReview, getReviews, getUnfilteredReviews } from "../controllers/reviewController.js";
//
// const router = express.Router();
// router.post("/",                    addReview);
// router.get("/:collegeId",           getReviews);
// router.get("/:collegeId/unfiltered",getUnfilteredReviews);
// export default router;


// ============================================================
// backend/seedDomains.js  — Run ONCE to seed college domains
// Run: node backend/seedDomains.js
// ============================================================
// import mongoose from "mongoose";
// import dotenv   from "dotenv";
// import CollegeDomain from "./models/CollegeDomain.js";
//
// dotenv.config();
// await mongoose.connect(process.env.MONGO_URI);
//
// await CollegeDomain.deleteMany({});
// await CollegeDomain.insertMany([
//   { collegeName: "IIT Bombay",       domains: ["iitb.ac.in","iitbombay.ac.in"] },
//   { collegeName: "IIT Delhi",        domains: ["iitd.ac.in","iitdelhi.ac.in"] },
//   { collegeName: "IIM Ahmedabad",    domains: ["iima.ac.in","iimahmedabad.ac.in"] },
//   { collegeName: "BITS Pilani",      domains: ["bits-pilani.ac.in","pilani.bits-pilani.ac.in"] },
//   { collegeName: "NIT Trichy",       domains: ["nitt.edu"] },
//   { collegeName: "Amity University", domains: ["amity.edu","amityuniversity.in"] },
//   { collegeName: "VIT Vellore",      domains: ["vit.ac.in","vituniversity.ac.in"] },
//   { collegeName: "Delhi University", domains: ["du.ac.in"] },
//   { collegeName: "Jadavpur University", domains: ["jadavpur.edu","jusl.ac.in"] },
//   // Add your seeded colleges here matching collegeId if you want
// ]);
// console.log("College domains seeded!");
// await mongoose.disconnect();
