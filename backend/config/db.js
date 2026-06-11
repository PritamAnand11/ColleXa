import mongoose from "mongoose";

const connectDB = async () => {

  try {

    const uri = process.env.MONGO_URI;

    console.log("Connecting to:", uri);

    const conn = await mongoose.connect(uri, {
      dbName: "collexa"
    });

    console.log("MongoDB connected successfully");
    console.log("Host:", conn.connection.host);
    console.log("Database:", conn.connection.name);

  } catch (error) {

    console.error("MongoDB connection failed:", error);
    process.exit(1);

  }

};

export default connectDB;