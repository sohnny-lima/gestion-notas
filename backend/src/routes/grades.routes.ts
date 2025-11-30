// src/routes/grades.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { prisma } from "../prisma";

const router = Router();

router.use(authMiddleware);

// GET /api/grades/course/:courseId
router.get("/course/:courseId", async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);

    const grades = await prisma.grade.findMany({
      where: { courseId },
      select: {
        id: true,
        studentId: true,
        courseId: true,
        value: true,
      },
    });

    res.json(grades);
  } catch (error) {
    console.error("Error al obtener notas:", error);
    res.status(500).json({ message: "Error al obtener notas" });
  }
});

// POST /api/grades
// Upsert: crea o actualiza la nota de un alumno en un curso
router.post("/", async (req, res) => {
  try {
    const { studentId, courseId, value } = req.body;

    const grade = await prisma.grade.upsert({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
      update: { value },
      create: { studentId, courseId, value },
    });

    res.json(grade);
  } catch (error) {
    console.error("Error al guardar nota:", error);
    res.status(500).json({ message: "Error al guardar nota" });
  }
});

export default router;
