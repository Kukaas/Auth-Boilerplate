import express from "express";
import { login, signUp } from "../controllers/auth.controller.js";

const router = express.Router();

// Sign up route
// POST /api/auth/signup
router.post("/signup", signUp);

// Login route
// POST /api/auth/login
router.post("/login", login);

export default router;
