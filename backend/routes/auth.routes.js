import express from "express";
import {
  login,
  signUp,
  verifiedEmail,
  verifyEmail,
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

export default router;
