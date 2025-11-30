// frontend/src/pages/alumno/DashboardStudent.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import { GraduationCap } from "lucide-react";
import { Badge } from "../../components/ui/Badge";

export default function DashboardStudent({ mode = "dashboard" }) {
  const [profile, setProfile] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const [profileRes, gradesRes] = await Promise.all([
        api.get("/students/profile"), // GET /api/students/profile
        api.get("/students/grades"), // GET /api/students/grades
      ]);

      setProfile(profileRes.data.student);
      setGrades(gradesRes.data.grades || []);
    } catch (error) {
      console.error("Error cargando datos del alumno", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  // Fecha bonita tipo “martes, 25 de noviembre de 2025”
  const formattedDate = useMemo(() => {
    const today = new Date();
    const text = today.toLocaleDateString("es-PE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return text.charAt(0).toUpperCase() + text.slice(1);
  }, []);

  // Promedio general de notas
  const promedioGeneral = useMemo(() => {
    if (!grades || grades.length === 0) return null;
    const sum = grades.reduce((acc, g) => acc + g.value, 0);
    return (sum / grades.length).toFixed(2);
  }, [grades]);

  if (loading) {
    return <div className="text-sm text-slate-500">Cargando datos...</div>;
  }

  // Cabecera reutilizable (nombre, correo, código, fecha registro)
  const renderHeader = () => (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
          <GraduationCap className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{profile?.name}</h2>
          <p className="text-sm text-slate-500">{profile?.email}</p>
          <p className="text-xs text-slate-400 mt-1">
            Código: {profile?.code || "—"}
          </p>
        </div>
      </div>
      <div className="text-right space-y-1">
        <p className="text-xs text-slate-400">
          Registrado el{" "}
          {profile?.createdAt
            ? new Date(profile.createdAt).toLocaleDateString()
            : "—"}
        </p>
      </div>
    </div>
  );

  /* ===================== VISTA DASHBOARD ===================== */
  const renderDashboardView = () => (
    <div className="space-y-8">
      {renderHeader()}

      {/* Promedio general */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-8 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold">Promedio General</h3>
        <p className="text-5xl font-bold mt-2">{promedioGeneral ?? "--"}</p>
        <p className="text-sm mt-2 opacity-80">{formattedDate}</p>
      </div>

      {/* Tarjetas por curso (similar a tu captura de “Mis Cursos”) */}
      <div className="space-y-4">
        {grades.length === 0 ? (
          <div className="p-6 bg-white border border-slate-200 rounded-xl text-slate-500">
            Aún no tienes notas registradas.
          </div>
        ) : (
          grades.map((g) => (
            <div
              key={g.id}
              className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex items-center justify-between"
            >
              {/* Info del curso */}
              <div className="p-6 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="px-3 py-1 font-bold bg-blue-100 text-blue-700 rounded-full">
                    {g.course.code}
                  </span>

                  {g.course.teacher?.name && (
                    <span className="text-slate-500">
                      Prof. {g.course.teacher.name}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-semibold text-slate-800">
                  {g.course.name}
                </h2>

                {/* Descripción opcional si la traes en el backend en el futuro */}
                {/* <p className="text-slate-500 text-sm">
                  {g.course.description || ""}
                </p> */}
              </div>

              {/* Nota final a la derecha */}
              <div className="bg-slate-50 px-10 py-6 text-center border-l border-slate-200 min-w-[120px]">
                <p className="text-xs text-slate-500 font-semibold mb-1">
                  NOTA FINAL
                </p>
                <p
                  className={`text-3xl font-bold ${
                    g.value >= 14
                      ? "text-green-600"
                      : g.value >= 10
                      ? "text-blue-600"
                      : "text-red-500"
                  }`}
                >
                  {g.value.toFixed(1)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  /* ===================== VISTA MIS NOTAS (TABLA) ===================== */
  const renderGradesView = () => (
    <div className="space-y-6">
      {renderHeader()}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-800">
            Mis notas por curso
          </h3>
        </div>

        {grades.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            Aún no tienes notas registradas.
          </div>
        ) : (
          <table className="w-full text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Curso
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Código
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Nota
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {grades.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3">{g.course.name}</td>
                  <td className="px-6 py-3 text-xs font-mono text-slate-500">
                    {g.course.code}
                  </td>
                  <td className="px-6 py-3">
                    <Badge
                      color={
                        g.value >= 14
                          ? "green"
                          : g.value >= 10
                          ? "blue"
                          : "gray"
                      }
                    >
                      {g.value.toFixed(1)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  // Selector de vista
  if (mode === "grades") {
    // Página /alumno/grades
    return renderGradesView();
  }

  // Página /dashboard
  return renderDashboardView();
}
