// src/routes/student.routes.ts
import { Router } from "express";
import {
  getStudentProfile,
  getStudentGrades,
} from "../controllers/student.controller";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";

const router = Router();

// Todas las rutas requieren autenticación (token válido)
router.use(authMiddleware);

// Rutas propias del ALUMNO
router.get("/profile", requireRole(["ALUMNO"]), getStudentProfile);
router.get("/grades", requireRole(["ALUMNO"]), getStudentGrades);

// Rutas para ADMIN (gestión de cursos del alumno)
import {
  getStudentCoursesAdmin,
  updateStudentCourses,
} from "../controllers/student.controller";

router.get("/:id/courses", requireRole(["ADMIN"]), getStudentCoursesAdmin);
router.put("/:id/courses", requireRole(["ADMIN"]), updateStudentCourses);

export default router;
