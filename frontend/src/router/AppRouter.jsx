// src/router/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Layout from "../components/Layout";

import UsersAdmin from "../pages/admin/UsersAdmin";
import CoursesAdmin from "../pages/admin/CoursesAdmin";
import DashboardAdmin from "../pages/admin/DashboardAdmin";

import DashboardTeacher from "../pages/docente/DashboardTeacher";
import DashboardStudent from "../pages/alumno/DashboardStudent";

import { useAuth } from "../context/AuthContext";

// --- RUTA PROTEGIDA ---
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/" replace />;

  // Si se especifican roles, validar permisos
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// --- DASHBOARD SEGÚN ROL (para /dashboard) ---
const DashboardSwitcher = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  if (user.role === "ADMIN") return <DashboardAdmin />;
  if (user.role === "DOCENTE") return <DashboardTeacher mode="courses" />;
  if (user.role === "ALUMNO") return <DashboardStudent mode="dashboard" />;

  // Fallback
  return (
    <div className="text-2xl font-bold text-slate-800">
      Bienvenido al sistema de gestión de notas
    </div>
  );
};

export default function AppRouter() {
  return (
    <Routes>
      {/* Login público */}
      <Route path="/" element={<Login />} />

      {/* Rutas privadas con Layout */}
      <Route element={<Layout />}>
        {/* DASHBOARD (Inicio) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardSwitcher />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <UsersAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <CoursesAdmin />
            </ProtectedRoute>
          }
        />

        {/* ================= DOCENTE ================= */}
        {/* Mis Cursos → tarjetas de cursos */}
        <Route
          path="/docente/courses"
          element={
            <ProtectedRoute roles={["DOCENTE"]}>
              <DashboardTeacher mode="courses" />
            </ProtectedRoute>
          }
        />
        {/* Gestión Notas → tabla con alumnos y notas */}
        <Route
          path="/docente/grades"
          element={
            <ProtectedRoute roles={["DOCENTE"]}>
              <DashboardTeacher mode="grades" />
            </ProtectedRoute>
          }
        />

        {/* ================= ALUMNO ================= */}
        {/* Mis notas (tabla) */}
        <Route
          path="/alumno/grades"
          element={
            <ProtectedRoute roles={["ALUMNO"]}>
              <DashboardStudent mode="grades" />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
