import express from "express";

import {
  getColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege
} from "../controllers/collegeController.js";

import {
  protect,
  adminOnly
} from "../middleware/authMiddleware.js";


/* ✅ FIRST create router */
const router = express.Router();


/* ✅ Public routes */
router.get("/", getColleges);

router.get("/:id", getCollegeById);


/* ✅ Admin protected routes */
router.post("/", protect, adminOnly, createCollege);

router.put("/:id", protect, adminOnly, updateCollege);

router.delete("/:id", protect, adminOnly, deleteCollege);


/* ✅ Export router */
export default router;