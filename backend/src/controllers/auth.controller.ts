// src/controllers/auth.controller.ts
import { Response } from "express";
import { prisma } from "../prisma";
import { comparePassword, generateToken } from "../utils/auth";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth.middleware";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// LOGIN
export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = generateToken(user.id, user.role, user.email || undefined);

    return res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        code: user.code,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // ✅ En Zod v4 la propiedad correcta es "issues", NO "errors"
      return res.status(400).json({ error: error.issues });
    }

    console.error("Login error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ME / PERFIL AUTENTICADO
export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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
    console.error("Me error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
