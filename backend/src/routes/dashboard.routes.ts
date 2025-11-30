import { Router } from "express";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";
import { getDashboardSummary } from "../controllers/dashboard.controller";

const router = Router();

router.use(authMiddleware);
router.use(requireRole(["ADMIN"]));

router.get("/summary", getDashboardSummary);

export default router;
