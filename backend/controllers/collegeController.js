import mongoose from "mongoose";
import { analyzeReviewsWithGemini } from "../services/geminiService.js";

const idFilter = (id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  const objectId = isValid ? new mongoose.Types.ObjectId(id) : null;

  return objectId
    ? { $or: [{ _id: objectId }, { _id: id }] }
    : { _id: id };
};

const collegeIdFilter = (id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  const objectId = isValid ? new mongoose.Types.ObjectId(id) : null;

  return objectId
    ? { $or: [{ collegeId: objectId }, { collegeId: id }] }
    : { collegeId: id };
};

export const getColleges = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const search = req.query.search || "";

    console.log("Search query:", search);

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const colleges = await db
      .collection("colleges")
      .find(query)
      .sort({ overallRating: -1, createdAt: -1 })
      .toArray();

    res.status(200).json(colleges);
  } catch (error) {
    console.error("Get colleges error:", error);
    res.status(500).json({ message: "Failed to fetch colleges" });
  }
};

export const getCollegeById = async (req, res) => {
  try {
    const collegeId = req.params.id;
    const forceRefresh = req.query.refresh === "true";

    console.log("Searching college ID:", collegeId);
    console.log("Force refresh:", forceRefresh);

    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return res.status(400).json({ message: "Invalid college ID" });
    }

    const db = mongoose.connection.db;

    const college = await db
      .collection("colleges")
      .findOne(idFilter(collegeId));

    if (!college) {
      console.log("College NOT FOUND");
      return res.status(404).json({ message: "College not found" });
    }

    const reviews = await db
      .collection("reviews")
      .find(collegeIdFilter(collegeId))
      .sort({ createdAt: -1 })
      .toArray();

    console.log("Reviews found:", reviews.length);

    const reviewTexts = reviews.map(
      (r) => `
College: ${r.collegeName || ""}
Review: ${r.review || ""}
Pros: ${r.pros || ""}
Cons: ${r.cons || ""}
Faculty Rating: ${r.facultyRating || ""}
Placement Rating: ${r.placementRating || ""}
Infrastructure Rating: ${r.infraRating || ""}
Hostel Rating: ${r.hostelRating || ""}
Overall Rating: ${r.overallRating || ""}
`.trim()
    );

    console.log("Review texts prepared:", reviewTexts.length);

    const existing = !forceRefresh ? college.aiAnalysis : null;

    const isStaleOrEmpty =
      !existing ||
      !existing.summary ||
      existing.summary === "No reviews available" ||
      existing.summary === "AI analysis unavailable" ||
      !existing.pros ||
      existing.pros.length === 0;

    let aiAnalysis = existing || null;

    if (isStaleOrEmpty && reviewTexts.length > 0) {
      console.log("Generating AI analysis using Gemini...");

      const generated = await analyzeReviewsWithGemini(reviewTexts);

      if (generated && generated.pros && generated.pros.length > 0) {
        aiAnalysis = { ...generated, lastUpdated: new Date() };

        await db
          .collection("colleges")
          .updateOne(idFilter(collegeId), {
            $set: { aiAnalysis, updatedAt: new Date() },
          });

        console.log("AI analysis saved to database");
      } else {
        console.warn(
          "Gemini returned empty result — not caching, will retry next request"
        );
        aiAnalysis = generated;
      }
    } else if (isStaleOrEmpty && reviewTexts.length === 0) {
      console.log("No reviews to analyze yet");
    } else {
      console.log("Using cached AI analysis from database");
    }

    if (!aiAnalysis) {
      aiAnalysis = {
        pros: [],
        cons: [],
        summary: "No reviews available yet. Be the first to review!",
        sentiment: "Neutral",
        lastUpdated: new Date(),
      };
    }

    res.status(200).json({ college, reviews, aiAnalysis });
  } catch (error) {
    console.error("Get college error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createCollege = async (req, res) => {
  try {
    const db = mongoose.connection.db;

    const newCollege = {
      name: req.body.name,
      location: req.body.location || "",
      image: req.body.image || "",
      courses: [],
      avgFacultyRating: 0,
      avgPlacementRating: 0,
      avgInfraRating: 0,
      avgHostelRating: 0,
      overallRating: 0,
      aiAnalysis: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("colleges").insertOne(newCollege);

    const college = await db
      .collection("colleges")
      .findOne({ _id: result.insertedId });

    res.status(201).json(college);
  } catch (error) {
    console.error("Create college error:", error);
    res.status(500).json({ message: "Failed to create college" });
  }
};

export const updateCollege = async (req, res) => {
  try {
    const collegeId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return res.status(400).json({ message: "Invalid college ID" });
    }

    const db = mongoose.connection.db;

    await db
      .collection("colleges")
      .updateOne(idFilter(collegeId), {
        $set: { ...req.body, updatedAt: new Date() },
      });

    const updatedCollege = await db
      .collection("colleges")
      .findOne(idFilter(collegeId));

    res.status(200).json(updatedCollege);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Update failed" });
  }
};

export const deleteCollege = async (req, res) => {
  try {
    const collegeId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return res.status(400).json({ message: "Invalid college ID" });
    }

    const db = mongoose.connection.db;

    await db.collection("colleges").deleteOne(idFilter(collegeId));

    await db.collection("reviews").deleteMany(collegeIdFilter(collegeId));

    res.status(200).json({ message: "College deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Delete failed" });
  }
};
