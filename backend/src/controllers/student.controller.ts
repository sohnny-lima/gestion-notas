// src/controllers/student.controller.ts
import { Request, Response } from "express";
import { prisma } from "../prisma";
import { AuthRequest } from "../middleware/auth.middleware";

/**
 * Perfil del alumno autenticado
 */
export const getStudentProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const studentId = req.user.id;

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
        code: true,
        createdAt: true,
      },
    });

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return res.json({ student, enrollments });
  } catch (error) {
    console.error("Get student profile error:", error);
    return res.status(500).json({ error: "Error al obtener perfil" });
  }
};

/**
 * Notas del alumno autenticado
 */
export const getStudentGrades = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const studentId = req.user.id;

    const grades = await prisma.grade.findMany({
      where: { studentId },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const promedio =
      grades.length > 0
        ? grades.reduce((acc, g) => acc + g.value, 0) / grades.length
        : null;

    return res.json({ grades, promedio });
  } catch (error) {
    console.error("Get student grades error:", error);
    return res.status(500).json({ error: "Error al obtener notas" });
  }
};

/**
 * ADMIN: Obtener cursos de un alumno específico (para el modal de asignación)
 */
export const getStudentCoursesAdmin = async (req: Request, res: Response) => {
  try {
    const studentId = Number(req.params.id);

    // Obtener todos los cursos disponibles
    const allCourses = await prisma.course.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    });

    // Obtener cursos donde el alumno está matriculado
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      select: { courseId: true },
    });

    const enrolledCourseIds = enrollments.map((e) => e.courseId);

    return res.json({
      allCourses,
      enrolledCourseIds,
    });
  } catch (error) {
    console.error("Get student courses admin error:", error);
    return res.status(500).json({ error: "Error al obtener cursos del alumno" });
  }
};

/**
 * ADMIN: Actualizar cursos de un alumno (bulk update)
 */
export const updateStudentCourses = async (req: Request, res: Response) => {
  try {
    const studentId = Number(req.params.id);
    const { courseIds } = req.body; // Array de IDs [1, 2, 5]

    if (!Array.isArray(courseIds)) {
      return res.status(400).json({ error: "Formato de cursos inválido" });
    }

    // Usar transacción para reemplazar matrículas
    await prisma.$transaction(async (tx) => {
      // 1. Eliminar todas las matrículas actuales
      await tx.enrollment.deleteMany({
        where: { studentId },
      });

      // 2. Crear las nuevas matrículas
      if (courseIds.length > 0) {
        await tx.enrollment.createMany({
          data: courseIds.map((courseId: number) => ({
            studentId,
            courseId: Number(courseId),
          })),
        });
      }
    });

    return res.json({ message: "Cursos actualizados correctamente" });
  } catch (error) {
    console.error("Update student courses error:", error);
    return res.status(500).json({ error: "Error al actualizar cursos" });
  }
};
