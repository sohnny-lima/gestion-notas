// src/types/express.d.ts
import type { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: "ADMIN" | "DOCENTE" | "ALUMNO";
        email?: string;
      };
    }
  }
}

// Tipo explícito que usan tus controladores/middlewares
export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: "ADMIN" | "DOCENTE" | "ALUMNO";
    email?: string;
  };
}

// Necesario para que el archivo sea tratado como módulo
export {};
