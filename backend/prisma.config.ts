// backend/prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

type Env = {
  DATABASE_URL: string;
};

export default defineConfig({
  schema: "prisma/schema.prisma",

  // 👇 AQUÍ va la URL de la BD
  datasource: {
    url: env<Env>("DATABASE_URL"),
  },

  // 👇 Y AQUÍ se configuran migraciones + seed
  migrations: {
    path: "prisma/migrations",
    seed: "tsx src/seed.ts",  // <- este es tu seed
  },
});
