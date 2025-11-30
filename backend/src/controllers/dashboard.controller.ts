import { Response } from "express";
import { prisma } from "../prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
    try {
        // 1. Contadores
        const [teacherCount, studentCount, courseCount] = await Promise.all([
            prisma.user.count({ where: { role: "DOCENTE" } }),
            prisma.user.count({ where: { role: "ALUMNO" } }),
            prisma.course.count(),
        ]);

        // 2. Actividad Reciente (Enrollments + Grades + Courses)
        // Como Course no tiene createdAt, usaremos ID desc y fecha actual simulada o null

        const recentEnrollments = await prisma.enrollment.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                student: { select: { name: true } },
                course: { select: { name: true } },
            },
        });

        const recentGrades = await prisma.grade.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                student: { select: { name: true } },
                course: { select: { name: true } },
            },
        });

        const recentCourses = await prisma.course.findMany({
            take: 5,
            orderBy: { id: "desc" },
        });

        // Normalizar para el frontend
        const activity = [
            ...recentEnrollments.map((e) => ({
                id: `enroll-${e.id}`,
                type: "ENROLLMENT",
                title: `Alumno ${e.student.name} matriculado en ${e.course.name}`,
                createdAt: e.createdAt,
            })),
            ...recentGrades.map((g) => ({
                id: `grade-${g.id}`,
                type: "GRADE",
                title: `Nota registrada para ${g.student.name} en ${g.course.name}`,
                createdAt: g.createdAt,
            })),
            ...recentCourses.map((c) => ({
                id: `course-${c.id}`,
                type: "COURSE",
                title: `Nuevo curso creado: ${c.name}`,
                createdAt: new Date(), // Fallback ya que no tiene createdAt
            })),
        ];

        // Ordenar por fecha desc (las que tienen fecha real) y tomar 5-10
        activity.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });

        return res.json({
            teacherCount,
            studentCount,
            courseCount,
            recentActivity: activity.slice(0, 10),
        });
    } catch (error) {
        console.error("Dashboard summary error:", error);
        return res.status(500).json({ error: "Error al obtener resumen" });
    }
};
