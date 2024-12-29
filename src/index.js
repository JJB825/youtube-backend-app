// write connection code in separate files

// import dotenv to configure environment variables
// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
dotenv.config({ path: "./env" });

import connectDB from "./db/index.js";
connectDB();

// write all connection code in index.js file itself
/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants";

import express from "express";
const app = express();

const port = process.env.PORT || 3000;

// IIFE (Immediately Invoked Function Expression)
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    // error listeners for express app
    app.on("App listening error", (error) => {
      console.error(error);
      throw err;
    });

    // listening express app
    app.listen(port, () => {
      console.log(`Server connected on port ${port}`);
      console.log(`Server connected to database`);
    });
  } catch (error) {
    console.error("Database connection ERROR:", error);
    throw error;
  }
})();
*/
