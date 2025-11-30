// backend/src/routes/auth.routes.ts
import { Router } from "express";
import { login, me } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me
router.get("/me", authMiddleware, me);

export default router;
