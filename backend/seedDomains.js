import mongoose from "mongoose";
import dotenv   from "dotenv";
import CollegeDomain from "./models/CollegeDomain.js";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);
await CollegeDomain.deleteMany({});

await CollegeDomain.insertMany([
  { collegeName: "IIT Bombay",          domains: ["iitb.ac.in", "iitbombay.ac.in"] },
  { collegeName: "IIT Delhi",           domains: ["iitd.ac.in"] },
  { collegeName: "IIT Madras",          domains: ["iitm.ac.in"] },
  { collegeName: "IIT Kanpur",          domains: ["iitk.ac.in"] },
  { collegeName: "IIT Kharagpur",       domains: ["iitkgp.ac.in"] },
  { collegeName: "IIM Ahmedabad",       domains: ["iima.ac.in"] },
  { collegeName: "IIM Bangalore",       domains: ["iimb.ac.in"] },
  { collegeName: "IIM Calcutta",        domains: ["iimcal.ac.in"] },
  { collegeName: "BITS Pilani",         domains: ["bits-pilani.ac.in", "pilani.bits-pilani.ac.in", "hyderabad.bits-pilani.ac.in", "goa.bits-pilani.ac.in"] },
  { collegeName: "NIT Trichy",          domains: ["nitt.edu"] },
  { collegeName: "NIT Warangal",        domains: ["nitw.ac.in"] },
  { collegeName: "NIT Surathkal",       domains: ["nitk.ac.in"] },
  { collegeName: "Delhi University",    domains: ["du.ac.in"] },
  { collegeName: "Jadavpur University", domains: ["jadavpur.edu"] },
  { collegeName: "VIT Vellore",         domains: ["vit.ac.in", "vituniversity.ac.in"] },
  { collegeName: "Amity University",    domains: ["amity.edu", "amityuniversity.in"] },
  { collegeName: "AIIMS Delhi",         domains: ["aiims.edu", "aiimsdelhi.ac.in"] },
  { collegeName: "SRM University",      domains: ["srmist.edu.in", "srm.edu.in"] },
  { collegeName: "Manipal University",  domains: ["manipal.edu", "manipaluniversity.edu.in"] },
  { collegeName: "Anna University",     domains: ["annauniv.edu"] },
  { collegeName: "Pune University",     domains: ["unipune.ac.in"] },
  { collegeName: "Jadavpur University", domains: ["jadavpuruniversity.in"] },
  { collegeName: "Osmania University",  domains: ["osmania.ac.in"] },
  { collegeName: "BHU Varanasi",        domains: ["bhu.ac.in"] },
  { collegeName: "Hyderabad University",domains: ["uohyd.ac.in", "uoh.ac.in"] },
  {
  collegeName: "Lloyd Institute of Engineering & Technology",
  domains: ["liet.in"]
}
  // Add your own colleges with their domains below:
  // { collegeName: "Your College", domains: ["yourcollege.ac.in"] },
]);

console.log("✅ College domains seeded successfully!");
await mongoose.disconnect();
