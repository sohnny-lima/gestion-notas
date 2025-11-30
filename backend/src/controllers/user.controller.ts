// src/controllers/user.controller.ts
import { Response } from "express";
import { prisma } from "../prisma";
import { Request } from "express";
import { hashPassword } from "../utils/auth";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, search, page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
        { code: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          code: true,
          createdAt: true,
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, code } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya existe" });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role,
        code: role === "ALUMNO" ? code : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        code: true,
        createdAt: true,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ error: "Error al crear usuario" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, email, password, role, code } = req.body;

    const data: any = { name, email, role };

    if (password) {
      data.password = await hashPassword(password);
    }

    if (role === "ALUMNO") {
      data.code = code;
    } else {
      data.code = null;
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        code: true,
        createdAt: true,
      },
    });

    return res.json(user);
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.user.delete({ where: { id } });
    return res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

export const getTeachers = async (_req: Request, res: Response) => {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: "DOCENTE" },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });
    return res.json(teachers);
  } catch (error) {
    console.error("Get teachers error:", error);
    return res.status(500).json({ error: "Error al obtener docentes" });
  }
};

export const getStudents = async (_req: Request, res: Response) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: "ALUMNO" },
      select: {
        id: true,
        name: true,
        email: true,
        code: true,
      },
      orderBy: { name: "asc" },
    });
    return res.json(students);
  } catch (error) {
    console.error("Get students error:", error);
    return res.status(500).json({ error: "Error al obtener alumnos" });
  }
};
