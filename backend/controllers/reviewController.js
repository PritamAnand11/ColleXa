import Review  from "../models/Review.js";
import College from "../models/College.js";

const recalcAverages = async (collegeId) => {
  const reviews = await Review.find({ collegeId });
  if (!reviews.length) return;
  const avg = (key) => {
    const vals = reviews.map(r => r[key]).filter(v => v > 0);
    return vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : 0;
  };
  await College.findByIdAndUpdate(collegeId, {
    overallRating: avg("overallRating"), avgFacultyRating: avg("facultyRating"),
    avgPlacementRating: avg("placementRating"), avgInfraRating: avg("infraRating"),
    avgHostelRating: avg("hostelRating"), reviewCount: reviews.length,
  });
};

// POST /api/reviews
export const addReview = async (req, res) => {
  try {
    const {
      collegeId, userId, overallRating, facultyRating, placementRating,
      infraRating, hostelRating, review, pros, cons,
      reviewType, verificationMethod, studentType, collegeEmail, emailVerified,
      proofDocumentPath, proofDocumentName, department, graduationYear, isAnonymous,
    } = req.body;

    let verificationStatus = "none";
    let isVerified = false;
    if (reviewType === "unfiltered") {
      if (verificationMethod === "college_email" && emailVerified === true) {
        verificationStatus = "approved"; isVerified = true;
      } else if (verificationMethod === "id_upload" && proofDocumentPath) {
        verificationStatus = "pending"; isVerified = false;
      }
    }

    const newReview = await Review.create({
      collegeId, userId, overallRating, facultyRating, placementRating,
      infraRating, hostelRating, review, pros, cons,
      reviewType: reviewType || "public", isVerified,
      verificationMethod: verificationMethod || "none",
      studentType: studentType || "none",
      collegeEmail: collegeEmail || "", emailVerified: emailVerified || false,
      proofDocumentPath: proofDocumentPath || "", proofDocumentName: proofDocumentName || "",
      department: department || "", graduationYear: graduationYear || "",
      isAnonymous: isAnonymous || false, verificationStatus,
    });

    await recalcAverages(collegeId);

    return res.status(201).json({
      success: true, review: newReview,
      message: reviewType === "unfiltered" && verificationMethod === "id_upload"
        ? "Review submitted! It will appear after admin verification."
        : "Review submitted successfully!",
    });
  } catch (err) {
    console.error("addReview error:", err.message);
    return res.status(500).json({ error: "Failed to submit review." });
  }
};

// GET /api/reviews/:collegeId — All reviews
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ collegeId: req.params.collegeId })
      .populate("userId", "name email").sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (err) { return res.status(500).json({ error: "Failed to fetch reviews." }); }
};

// GET /api/reviews/:collegeId/unfiltered — Verified only
export const getUnfilteredReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      collegeId: req.params.collegeId,
      reviewType: "unfiltered", isVerified: true, verificationStatus: "approved",
    }).populate("userId", "name email").sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (err) { return res.status(500).json({ error: "Failed to fetch unfiltered reviews." }); }
};
