// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * INTERFAZ EXTENDIDA: Esto permite usar req.user en controladores
 */
export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: "ADMIN" | "DOCENTE" | "ALUMNO";
    email?: string;
  };
}

/**
 * MIDDLEWARE PARA VERIFICAR TOKEN
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AuthRequest["user"];

    // Guardamos el usuario en req.user
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

/**
 * MIDDLEWARE PARA VERIFICAR ROLES
 */
export const requireRole = (roles: Array<"ADMIN" | "DOCENTE" | "ALUMNO">) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "No autorizado" });
    }

    next();
  };
};
