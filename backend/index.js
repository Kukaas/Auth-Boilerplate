import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// Import routes
import authRoutes from "./routes/auth.routes.js";

const app = express();
dotenv.config();
app.use(express.json());

app.use(cookieParser());
app.use(cors());

// Run server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log(error);
  });

// Create error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error!";
  res.status(
    statusCode.json({
      success: false,
      message,
      statusCode,
    })
  );
});

// Routes
app.use("/api/auth", authRoutes);

export default app;
