import fs from "fs";
import csv from "csv-parser";
import College from "../models/College.js";

export const importCollegesFromCSV = (filePath) => {
  const colleges = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => colleges.push(data))
    .on("end", async () => {
      await College.insertMany(colleges);
      console.log("CSV Import Complete");
    });
};
