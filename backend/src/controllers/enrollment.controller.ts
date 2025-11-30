// src/controllers/enrollment.controller.ts
import { Request, Response } from "express";
import { prisma } from "../prisma";

export const enrollStudent = async (req: Request, res: Response) => {
  try {
    const { studentId, courseId } = req.body;

    const student = await prisma.user.findUnique({
      where: { id: Number(studentId) },
    });
    if (!student || student.role !== "ALUMNO") {
      return res.status(400).json({ error: "Alumno inválido" });
    }

    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
    });
    if (!course) {
      return res.status(400).json({ error: "Curso no encontrado" });
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: Number(studentId),
          courseId: Number(courseId),
        },
      },
    });
    if (existingEnrollment) {
      return res.status(400).json({ error: "Alumno ya está matriculado" });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: Number(studentId),
        courseId: Number(courseId),
      },
    });

    return res.status(201).json(enrollment);
  } catch (error) {
    console.error("Enroll student error:", error);
    return res.status(500).json({ error: "Error al matricular alumno" });
  }
};

export const unenrollStudent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.enrollment.delete({ where: { id } });
    return res.json({ message: "Matrícula eliminada correctamente" });
  } catch (error) {
    console.error("Unenroll student error:", error);
    return res.status(500).json({ error: "Error al eliminar matrícula" });
  }
};

export const getCourseStudents = async (req: Request, res: Response) => {
  try {
    const courseId = Number(req.params.courseId);

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
    console.error("Get course students error:", error);
    return res.status(500).json({ error: "Error al obtener estudiantes" });
  }
};
