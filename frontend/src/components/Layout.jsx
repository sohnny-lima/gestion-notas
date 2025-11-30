// src/components/Layout.jsx
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  LogOut,
  GraduationCap,
  FileText,
} from "lucide-react";

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // --- MENÚ SEGÚN ROL ---
  let menuItems = [];

  if (user?.role === "ADMIN") {
    menuItems = [
      {
        path: "/dashboard",
        label: "Inicio",
        icon: LayoutDashboard,
      },
      {
        path: "/admin/users",
        label: "Usuarios",
        icon: Users,
      },
      {
        path: "/admin/courses",
        label: "Cursos",
        icon: BookOpen,
      },
    ];
  } else if (user?.role === "DOCENTE") {
    menuItems = [
      {
        path: "/dashboard",
        label: "Inicio",
        icon: LayoutDashboard,
      },
      {
        path: "/docente/courses",
        label: "Mis Cursos",
        icon: BookOpen,
      },
      {
        path: "/docente/grades",
        label: "Gestión Notas",
        icon: FileText,
      },
    ];
  } else if (user?.role === "ALUMNO") {
    menuItems = [
      {
        path: "/dashboard",
        label: "Inicio",
        icon: LayoutDashboard,
      },
      {
        path: "/alumno/grades",
        label: "Mis Notas",
        icon: BookOpen,
      },
    ];
  }

  const prettyRole =
    user?.role === "ADMIN"
      ? "Admin"
      : user?.role === "DOCENTE"
      ? "Docente"
      : user?.role === "ALUMNO"
      ? "Alumno"
      : "";

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-950 text-slate-200 flex flex-col">
        {/* Logo / título */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white text-lg">EduManager</span>
          </div>
        </div>

        {/* Menú */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const active =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Usuario + logout (parte inferior) */}
        <div className="border-t border-slate-800 px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-blue-900 flex items-center justify-center text-blue-200 font-semibold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-white truncate">
                {user?.name || "Usuario"}
              </span>
              <span className="text-xs text-slate-400 truncate">
                {prettyRole}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-900/60 px-3 py-2 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 px-10 py-8">
        <Outlet />
      </main>
    </div>
  );
}
