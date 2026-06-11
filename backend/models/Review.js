import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Ratings ──────────────────────────────────────────────
    overallRating:    { type: Number, min: 1, max: 5, required: true },
    facultyRating:    { type: Number, min: 1, max: 5, default: 0 },
    placementRating:  { type: Number, min: 1, max: 5, default: 0 },
    infraRating:      { type: Number, min: 1, max: 5, default: 0 },
    hostelRating:     { type: Number, min: 1, max: 5, default: 0 },

    // ── Content ──────────────────────────────────────────────
    review:  { type: String, required: true },
    pros:    { type: String, default: "" },
    cons:    { type: String, default: "" },

    // ── 🔥 UNFILTERED MODE FIELDS ────────────────────────────
    reviewType: {
      type:    String,
      enum:    ["public", "unfiltered"],
      default: "public",
    },
    isVerified: { type: Boolean, default: false },

    verificationMethod: {
      type:    String,
      enum:    ["college_email", "id_upload", "none"],
      default: "none",
    },
    studentType: {
      type:    String,
      enum:    ["student", "alumni", "none"],
      default: "none",
    },

    // Email verification
    collegeEmail:       { type: String,  default: "" },
    emailVerified:      { type: Boolean, default: false },

    // ID upload verification
    proofDocumentPath:  { type: String,  default: "" },
    proofDocumentName:  { type: String,  default: "" },
    verifiedByAdmin:    { type: Boolean, default: false },
    adminNote:          { type: String,  default: "" },

    // Student details
    department:         { type: String,  default: "" },
    graduationYear:     { type: String,  default: "" },
    isAnonymous:        { type: Boolean, default: false },

    // Verification status: pending | approved | rejected | none
    verificationStatus: {
      type:    String,
      enum:    ["pending", "approved", "rejected", "none"],
      default: "none",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Review", ReviewSchema);
