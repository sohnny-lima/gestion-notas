// src/routes/teacher.routes.ts
import { Router } from "express";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";
import {
  getTeacherCourses,
  getTeacherCourseStudents,
  updateStudentGrade,
} from "../controllers/teacher.controller";

const router = Router();

// Todas requieren token y rol DOCENTE
router.use(authMiddleware);
router.use(requireRole(["DOCENTE"]));

/**
 * GET /api/teacher/courses
 * Cursos asignados al docente logueado
 */
router.get("/courses", getTeacherCourses);

/**
 * GET /api/teacher/courses/:courseId/students
 * Alumnos matriculados en ese curso
 */
router.get("/courses/:courseId/students", getTeacherCourseStudents);

/**
 * POST /api/teacher/courses/:courseId/grades
 * Registrar/Actualizar nota
 */
router.post("/courses/:courseId/grades", updateStudentGrade);

export default router;
