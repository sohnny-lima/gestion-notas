// src/routes/enrollments.routes.ts
import { Router } from "express";
import {
  enrollStudent,
  unenrollStudent,
  getCourseStudents,
} from "../controllers/enrollment.controller";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";

const router = Router();

// Todas requieren estar autenticado
router.use(authMiddleware);

// ADMIN matricula / desmatricula
router.post("/", requireRole(["ADMIN"]), enrollStudent);
router.delete("/:id", requireRole(["ADMIN"]), unenrollStudent);

// DOCENTE o ADMIN pueden ver alumnos de un curso
router.get("/course/:courseId/students", getCourseStudents);

export default router;
