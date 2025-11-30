// src/prisma.ts
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

// Cargamos variables de entorno manualmente porque este archivo se ejecuta
// antes que el resto de la app en el seed.
dotenv.config();

const connectionString = process.env.DATABASE_URL;

// 1. Configuramos el Pool de conexiones de PostgreSQL
const pool = new Pool({ connectionString });

// 2. Creamos el adaptador de Prisma
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
};

// 3. Pasamos el adaptador al cliente
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // 👈 ¡Esta es la clave para que Prisma 7 funcione feliz!
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
