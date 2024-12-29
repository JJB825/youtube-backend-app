import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// purely database connection
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    // to know which host is being connected in case of multiple database connections
    console.log(
      `MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("Database connection FAILED:", error);
    // inbuilt nodejs function to exit a process
    process.exit(1);
  }
};

export default connectDB;
