// src/controllers/grade.controller.ts
import { Request, Response } from "express";
import { prisma } from "../prisma";

export const upsertGrade = async (req: Request, res: Response) => {
  try {
    const { studentId, courseId, value } = req.body;

    // Validar matricula
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: Number(studentId),
          courseId: Number(courseId),
        },
      },
    });

    if (!enrollment) {
      return res
        .status(400)
        .json({ error: "El alumno no está matriculado en el curso" });
    }

    // Buscar si ya tiene nota previa
    const existingGrade = await prisma.grade.findFirst({
      where: {
        studentId: Number(studentId),
        courseId: Number(courseId),
      },
    });

    let grade;

    if (existingGrade) {
      grade = await prisma.grade.update({
        where: { id: existingGrade.id },
        data: { value: Number(value) },
      });
    } else {
      grade = await prisma.grade.create({
        data: {
          studentId: Number(studentId),
          courseId: Number(courseId),
          value: Number(value),
        },
      });
    }

    return res.json(grade);
  } catch (error) {
    console.error("Upsert grade error:", error);
    return res.status(500).json({ error: "Error al guardar nota" });
  }
};

export const deleteGrade = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.grade.delete({ where: { id } });
    return res.json({ message: "Nota eliminada correctamente" });
  } catch (error) {
    console.error("Delete grade error:", error);
    return res.status(500).json({ error: "Error al eliminar nota" });
  }
};

export const getCourseGrades = async (req: Request, res: Response) => {
  try {
    const courseId = Number(req.params.courseId);

    const grades = await prisma.grade.findMany({
      where: { courseId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        student: { name: "asc" },
      },
    });

    return res.json(grades);
  } catch (error) {
    console.error("Get course grades error:", error);
    return res.status(500).json({ error: "Error al obtener notas" });
  }
};
