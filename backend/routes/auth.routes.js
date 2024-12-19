import express from "express";
import {
  login,
  resetPassword,
  sendOTP,
  signUp,
  verifiedEmail,
  verifyEmail,
  verifyOTP,
} from "../controllers/auth.controller.js";

const router = express.Router();

// Sign up route
// POST /api/auth/signup
router.post("/signup", signUp);

// Login route
// POST /api/auth/login
router.post("/login", login);

// Verify route
// GET /api/auth/verify/:uniqueString/:userId
router.get("/verify/:uniqueString/:userId", verifyEmail);

// Verified email route
// GET /api/auth/verifiedEmail
router.get("/verifiedEmail", verifiedEmail);

// Forgot password route
// POST /api/auth/forgot-password
router.post("/forgot-password", sendOTP);

// Verify OTP route
// POST /api/auth/verify-otp
router.post("/verify-otp", verifyOTP);

// Reset password route
// POST /api/auth/reset-password
router.post("/reset-password", resetPassword);

export default router;
