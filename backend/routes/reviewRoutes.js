import express from "express";
import {
  addReview,
  getReviews,
  getUnfilteredReviews,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/",                       addReview);            // POST   /api/reviews
router.get("/:collegeId",              getReviews);           // GET    /api/reviews/:collegeId
router.get("/:collegeId/unfiltered",   getUnfilteredReviews); // GET    /api/reviews/:collegeId/unfiltered

export default router;

