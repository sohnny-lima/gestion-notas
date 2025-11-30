// src/routes/users.routes.ts
import { Router } from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getTeachers,
  getStudents,
} from "../controllers/user.controller";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";

const router = Router();

// Todas estas rutas solo las puede usar el ADMIN
router.use(authMiddleware, requireRole(["ADMIN"] as const));

// GET /api/users
router.get("/", getUsers);

// POST /api/users
router.post("/", createUser);

// PUT /api/users/:id
router.put("/:id", updateUser);

// DELETE /api/users/:id
router.delete("/:id", deleteUser);

// GET /api/users/helpers/teachers
router.get("/helpers/teachers", getTeachers);

// GET /api/users/helpers/students
router.get("/helpers/students", getStudents);

export default router;
