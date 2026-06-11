import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import chatRoutes from "./routes/chatRoutes.js";

import connectDB from "./config/db.js";


import collegeRoutes from "./routes/collegeRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import collegeForMeRoutes from "./routes/collegeForMeRoutes.js";

import truthLayerRoutes from "./routes/truthLayerRoutes.js";

import verificationRoutes from "./routes/verificationRoutes.js";

import path from "path";


dotenv.config();

// ✅ FIRST connect database
connectDB();

// ✅ THEN create app
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/verify", verificationRoutes);



app.use("/api/reviews", reviewRoutes);

app.use("/api/truth-layer", truthLayerRoutes);

app.use("/api/chat", chatRoutes);


app.use("/api/college-for-me", collegeForMeRoutes);


// ✅ Debug route (PUT HERE, after app is created)
app.get("/debug-db", async (req, res) => {

  try {

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    res.json({
      database: mongoose.connection.name,
      collections: collections.map(c => c.name)
    });
    

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});


// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/reviews", reviewRoutes);


// ✅ Test route
app.get("/", (req, res) => {
  res.send("API running...");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});