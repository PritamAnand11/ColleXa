import express from "express";
import { getCollegeRecommendations } from "../controllers/collegeForMeController.js";

const router = express.Router();

// POST /api/college-for-me
router.post("/", getCollegeRecommendations);

export default router;
