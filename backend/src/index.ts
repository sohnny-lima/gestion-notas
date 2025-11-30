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

/* ============================
   🚀 C O R S   C O N F I G
============================ */

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["http://localhost"] // 🔥 Frontend en modo producción por NGINX
    : ["http://localhost:5173", "http://localhost:5174"]; // 🔥 Vite en modo dev

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/* ============================
   📌 R U T A   D E   P R U E B A
============================ */
app.get("/", (_req, res) => {
  res.json({ ok: true, message: "API Sistema de Notas (Docker PROD + DEV)" });
});

/* ============================
   📌 R U T A S   P R I N C I P A L E S
============================ */
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/enrollments", enrollmentsRoutes);
app.use("/api/grades", gradesRoutes);
app.use("/api/dashboard", dashboardRoutes);

// DOCENTE
app.use("/api/teacher", teacherRoutes);

// ALUMNO (plural: students)
app.use("/api/students", studentRoutes);

/* ============================
   🚀 I N I C I O   D E   A P I
============================ */
app.listen(PORT, () => {
  console.log(`🚀 API escuchando en http://localhost:${PORT}`);
  console.log(`🌐 CORS activo para: ${allowedOrigins.join(", ")}`);
});
