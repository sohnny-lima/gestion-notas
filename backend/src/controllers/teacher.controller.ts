// src/controllers/teacher.controller.ts
import { Response } from "express";
import { prisma } from "../prisma";
import { AuthRequest } from "../middleware/auth.middleware";

/**
 * GET /api/teacher/courses
 * Devuelve los cursos asignados al docente logueado
 */
export const getTeacherCourses = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user!.id;

    const courses = await prisma.course.findMany({
      where: { teacherId },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
      },
      orderBy: { name: "asc" },
    });

    return res.json(courses);
  } catch (error) {
    console.error("Get teacher courses error:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener cursos del docente" });
  }
};

/**
 * GET /api/teacher/courses/:courseId/students
 * Devuelve los alumnos matriculados en ese curso (solo si el curso es del docente)
 */
export const getTeacherCourseStudents = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const teacherId = req.user!.id;
    const courseId = Number(req.params.courseId);

    // Verificar que el curso pertenezca a este docente
    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId },
    });

    if (!course) {
      return res.status(404).json({
        message: "Curso no encontrado o no asignado a este docente",
      });
    }

    // Matrículas con info del alumno
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            code: true,
          },
        },
      },
      orderBy: {
        student: { name: "asc" },
      },
    });

    return res.json(enrollments);
  } catch (error) {
    console.error("Get teacher course students error:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener alumnos del curso" });
  }
};

/**
 * POST /api/teacher/courses/:courseId/grades
 * Registra o actualiza la nota de un alumno en un curso
 */
export const updateStudentGrade = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user!.id;
    const courseId = Number(req.params.courseId);
    const { studentId, value } = req.body;

    if (!studentId || value === undefined) {
      return res.status(400).json({ error: "Faltan datos (studentId, value)" });
    }

    // Verificar que el curso sea del docente
    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId },
    });

    if (!course) {
      return res.status(403).json({ error: "No tienes permiso para este curso" });
    }

    // Verificar matrícula (opcional, pero recomendado)
    const enrollment = await prisma.enrollment.findFirst({
      where: { courseId, studentId },
    });

    if (!enrollment) {
      return res
        .status(400)
        .json({ error: "El alumno no está matriculado en este curso" });
    }

    // Upsert nota
    const grade = await prisma.grade.upsert({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
      update: {
        value: Number(value),
      },
      create: {
        studentId,
        courseId,
        value: Number(value),
      },
    });

    return res.json(grade);
  } catch (error) {
    console.error("Update grade error:", error);
    return res.status(500).json({ error: "Error al guardar la nota" });
  }
};
