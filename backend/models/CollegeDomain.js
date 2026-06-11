import mongoose from "mongoose";
import CollegeDomain from "./CollegeDomain.js";


const CollegeDomainSchema = new mongoose.Schema({
  collegeId:   { type: mongoose.Schema.Types.ObjectId, ref: "College" },
  collegeName: { type: String, required: true },
  domains:     [String], // e.g. ["iitb.ac.in", "iitbombay.ac.in"]
});

export default mongoose.model("CollegeDomain", CollegeDomainSchema);
