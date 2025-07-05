import express from "express";
import dotenv from "dotenv";

import authRouter from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";

dotenv.config();
const PORT = process.env.PORT;
const app = express();

app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
