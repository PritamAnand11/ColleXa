import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true
  },

  location: String,

  image: String,

  courses: [String],

  avgFacultyRating: {
    type: Number,
    default: 0
  },

  avgPlacementRating: {
    type: Number,
    default: 0
  },

  truthLayer: {
  verdict: String,
  verdictReason: String,
  strengths: [String],
  concerns: [String],
  biggestGap: String,
  trustScore: Number,
  studentQuote: String,
  recommendation: String,
  cachedAt: Date,
},

  avgInfraRating: {
    type: Number,
    default: 0
  },

  avgHostelRating: {
    type: Number,
    default: 0
  },

  overallRating: {
    type: Number,
    default: 0
  },

  aiAnalysis: {
    summary: {
      type: String,
      default: ""
    },

    pros: [String],

    cons: [String],

    sentiment: {
      type: String,
      default: ""
    },

    lastUpdated: Date
  }

},
{
  timestamps: true,

  // THIS IS THE MOST IMPORTANT FIX
  collection: "colleges"
}
);

const College = mongoose.model("College", collegeSchema);

export default College;