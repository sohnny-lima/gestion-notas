// src/routes/courses.routes.ts
import { Router } from "express";
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseById,
} from "../controllers/course.controller";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";

const router = Router();

// Todas requieren token
router.use(authMiddleware);

// Listar cursos (ADMIN / DOCENTE / ALUMNO)
// La lógica de filtrado por rol debe estar en getCourses.
router.get("/", getCourses);

// Crear curso (solo ADMIN)
router.post("/", requireRole(["ADMIN"]), createCourse);

// Actualizar curso (solo ADMIN)
router.put("/:id", requireRole(["ADMIN"]), updateCourse);

// Eliminar curso (solo ADMIN)
router.delete("/:id", requireRole(["ADMIN"]), deleteCourse);

// Detalle de un curso
router.get("/:id", getCourseById);

export default router;
