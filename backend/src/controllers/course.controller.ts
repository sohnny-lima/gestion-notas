// src/controllers/course.controller.ts
import { Response } from "express";
import { prisma } from "../prisma";
import { AuthRequest } from "../middleware/auth.middleware";

/**
 * Listar cursos (con filtros por rol, búsqueda y paginación)
 * - ADMIN: ve todos los cursos
 * - DOCENTE: solo cursos donde es teacher
 * - ALUMNO: solo cursos donde está matriculado
 */
export const getCourses = async (req: AuthRequest, res: Response) => {
  try {
    const { search, page = "1", limit = "10" } = req.query;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Filtro por rol
    if (userRole === "DOCENTE" && userId) {
      where.teacherId = userId;
    }

    if (userRole === "ALUMNO" && userId) {
      where.enrollments = {
        some: { studentId: userId },
      };
    }

    // Búsqueda por nombre o código
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { code: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: { select: { enrollments: true, grades: true } },
        },
        skip,
        take: limitNum,
        orderBy: { id: "desc" },
      }),
      prisma.course.count({ where }),
    ]);

    return res.json({
      courses,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get courses error:", error);
    return res.status(500).json({ error: "Error al obtener cursos" });
  }
};

/**
 * Crear curso (ADMIN)
 */
export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description, teacherId } = req.body;

    const existingCourse = await prisma.course.findUnique({ where: { code } });
    if (existingCourse) {
      return res.status(400).json({ error: "El código de curso ya existe" });
    }

    const course = await prisma.course.create({
      data: {
        name,
        code,
        description,
        teacherId: teacherId ? Number(teacherId) : null,
      },
    });

    return res.status(201).json(course);
  } catch (error) {
    console.error("Create course error:", error);
    return res.status(500).json({ error: "Error al crear curso" });
  }
};

/**
 * Actualizar curso (ADMIN)
 */
export const updateCourse = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, code, description, teacherId } = req.body;

    const course = await prisma.course.update({
      where: { id },
      data: {
        name,
        code,
        description,
        teacherId: teacherId ? Number(teacherId) : null,
      },
    });

    return res.json(course);
  } catch (error) {
    console.error("Update course error:", error);
    return res.status(500).json({ error: "Error al actualizar curso" });
  }
};

/**
 * Eliminar curso (ADMIN)
 */
export const deleteCourse = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.course.delete({ where: { id } });
    return res.json({ message: "Curso eliminado correctamente" });
  } catch (error) {
    console.error("Delete course error:", error);
    return res.status(500).json({ error: "Error al eliminar curso" });
  }
};

/**
 * Obtener detalles de un curso (ADMIN / DOCENTE / ALUMNO)
 * - DOCENTE: solo puede ver sus cursos
 * - ALUMNO: solo cursos donde está matriculado
 */
export const getCourseById = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        enrollments: {
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
        },
        grades: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    // DOCENTE: solo si es el responsable del curso
    if (userRole === "DOCENTE" && userId && course.teacherId !== userId) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para ver este curso" });
    }

    // ALUMNO: solo si está matriculado
    if (userRole === "ALUMNO" && userId) {
      const isEnrolled = course.enrollments.some((e) => e.studentId === userId);
      if (!isEnrolled) {
        return res
          .status(403)
          .json({ error: "No tienes permiso para ver este curso" });
      }
    }

    return res.json(course);
  } catch (error) {
    console.error("Get course by id error:", error);
    return res.status(500).json({ error: "Error al obtener curso" });
  }
};
