import express from "express";
import { getTruthLayer, refreshTruthLayer } from "../controllers/truthLayerController.js";

const router = express.Router();

// GET  /api/truth-layer/:collegeId         → Get (or generate) truth layer
// POST /api/truth-layer/:collegeId/refresh → Force re-analyse (bypass cache)

router.get("/:collegeId",          getTruthLayer);
router.post("/:collegeId/refresh", refreshTruthLayer);

export default router;
