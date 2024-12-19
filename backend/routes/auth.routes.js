import express from "express";
import { signUp } from "../controllers/auth.controller.js";

const router = express.Router();

// Sign up route
// POST /api/auth/signup
router.post("/signup", signUp);

export default router;
