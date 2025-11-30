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

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ ok: true, message: "API Sistema de notas" });
});

// Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/enrollments", enrollmentsRoutes);
app.use("/api/grades", gradesRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 👇 DOCENTE
app.use("/api/teacher", teacherRoutes);

// 👇 ALUMNO (OJO: plural "students" para que coincida con el frontend)
app.use("/api/students", studentRoutes);

app.listen(PORT, () => {
  console.log(`🚀 API escuchando en http://localhost:${PORT}`);
});
