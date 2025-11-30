// src/types/express.d.ts

export {}; // convierte este archivo en un módulo

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
