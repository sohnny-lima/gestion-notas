// backend/src/index.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";
import coursesRoutes from "./routes/courses.routes";
import enrollmentsRoutes from "./routes/enrollments.routes";
import gradesRoutes from "./routes/grades.routes";
import studentRoutes from "./routes/student.routes";
import teacherRoutes from "./routes/teacher.routes";
import dashboardRoutes from "./routes/dashboard.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const isProd = process.env.NODE_ENV === "production";

/* ============================
   🚀 C O R S   C O N F I G
============================ */

const allowedOrigins = isProd
  ? ["http://72.60.50.177", "http://72.60.50.177:80"]
  : [
      "http://localhost:5173", // Vite dev
    ];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ ok: true, message: "API Sistema de Notas (Docker PROD + DEV)" });
});

// Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/enrollments", enrollmentsRoutes);
app.use("/api/grades", gradesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/students", studentRoutes);

app.listen(PORT, () => {
  console.log(`🚀 API escuchando en http://0.0.0.0:${PORT}`);
  console.log(`🌐 CORS activo para: ${allowedOrigins.join(", ")}`);
});
