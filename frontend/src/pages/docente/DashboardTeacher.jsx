// frontend/src/pages/docente/DashboardTeacher.jsx

import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function DashboardTeacher({ mode = "courses" }) {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [pendingGrades, setPendingGrades] = useState({});
  const [savingId, setSavingId] = useState(null);

  // Fecha formateada
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

  /* ============================================================
      1) CARGAR CURSOS DEL DOCENTE
     ============================================================ */
  useEffect(() => {
    if (!user) return;

    const fetchCourses = async () => {
      try {
        const { data } = await api.get("/teacher/courses");

        // garantizar array
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.courses)
            ? data.courses
            : [];

        setCourses(list);

        if (list.length > 0) {
          setSelectedCourseId(list[0].id);
        }
      } catch (err) {
        console.error("Error cargando cursos del docente:", err);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [user]);

  /* ============================================================
      2) CARGAR ALUMNOS + NOTAS DEL CURSO SELECCIONADO
     ============================================================ */
  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        // A: obtener alumnos/matrículas
        const res = await api.get(
          `/teacher/courses/${selectedCourseId}/students`
        );
        const enrollments = Array.isArray(res.data) ? res.data : [];

        // B: obtener notas
        let grades = [];
        try {
          const resGrades = await api.get(`/grades/course/${selectedCourseId}`);
          grades = Array.isArray(resGrades.data) ? resGrades.data : [];
        } catch (e) {
          console.warn("Sin notas previas:", e);
        }

        // C: combinar alumnos + notas
        const mapped = enrollments.map((enroll) => {
          const st = enroll.student;
          const gradeRecord = grades.find((g) => g.studentId === st.id);

          return {
            id: st.id,
            name: st.name,
            code: st.code,
            grade: gradeRecord ? gradeRecord.value : null,
          };
        });

        setStudents(mapped);
      } catch (err) {
        console.error("Error cargando alumnos:", err);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedCourseId]);

  /* ============================================================
      3) GUARDAR NOTA
     ============================================================ */
  const handleGradeChange = (studentId, value) => {
    setPendingGrades((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleSaveGrade = async (studentId) => {
    const raw = pendingGrades[studentId];
    if (raw === undefined || raw === "") return;

    const value = Number(raw);
    if (isNaN(value) || value < 0 || value > 20) {
      alert("La nota debe estar entre 0 y 20");
      return;
    }

    setSavingId(studentId);

    try {
      await api.post(`/teacher/courses/${selectedCourseId}/grades`, {
        studentId,
        value,
      });

      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, grade: value } : s))
      );

      setPendingGrades((prev) => {
        const c = { ...prev };
        delete c[studentId];
        return c;
      });
    } catch (err) {
      console.error("Error guardando nota:", err);
      alert("Error al guardar la nota.");
    } finally {
      setSavingId(null);
    }
  };

  /* ============================================================
      UI: MIS CURSOS
     ============================================================ */
  const renderCoursesView = () => {
    if (loadingCourses)
      return (
        <div className="p-8 text-center text-slate-500">Cargando cursos...</div>
      );

    return (
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-1">
          Mis Cursos Asignados
        </h1>
        <p className="text-slate-500 mb-8">{formattedDate}</p>

        {courses.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-300 rounded-xl text-slate-400">
            No tienes cursos asignados todavía.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold text-slate-800">
                    {course.name}
                  </h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase">
                    {course.code}
                  </span>
                </div>

                <p className="text-slate-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
                  {course.description || "Sin descripción disponible."}
                </p>

                <div className="text-xs text-slate-400 pt-4 border-t border-slate-100">
                  Docente: Tú
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ============================================================
      UI: GESTIÓN DE NOTAS
     ============================================================ */
  const renderGradesView = () => {
    const currentCourse = courses.find((c) => c.id === selectedCourseId);

    return (
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-1">
          Registro de Notas
        </h1>

        <p className="text-slate-500 mb-6">
          {formattedDate}{" "}
          {currentCourse && (
            <span className="font-medium text-blue-600">
              • {currentCourse.name}
            </span>
          )}
        </p>

        {courses.length > 0 ? (
          <>
            {/* Tabs de cursos */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {courses.map((c) => {
                const active = c.id === selectedCourseId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCourseId(c.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${active
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                      }`}
                  >
                    {c.code}
                  </button>
                );
              })}
            </div>

            {/* Tabla alumnos */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-slate-50/50 flex justify-between">
                <h3 className="font-semibold text-slate-700">
                  Lista de Alumnos
                </h3>
                <span className="text-xs font-medium text-slate-500 bg-slate-200 px-3 py-1 rounded-full">
                  {students.length} Estudiantes
                </span>
              </div>

              {loadingStudents ? (
                <div className="p-12 text-center text-slate-500">
                  Cargando alumnos...
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-6 py-3">Nombre</th>
                      <th className="px-6 py-3">Código</th>
                      <th className="px-6 py-3 text-center">Nota</th>
                      <th className="px-6 py-3 text-right">Acción</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {students.map((st) => (
                      <tr key={st.id}>
                        <td className="px-6 py-4 font-medium">{st.name}</td>
                        <td className="px-6 py-4">{st.code ?? "S/C"}</td>

                        <td className="px-6 py-4 text-center">
                          {st.grade !== null ? (
                            <span
                              className={`font-bold ${st.grade < 11
                                  ? "text-red-500"
                                  : "text-green-600"
                                }`}
                            >
                              {st.grade}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">--</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={pendingGrades[st.id] ?? ""}
                              placeholder={st.grade ?? "--"}
                              className="w-16 px-2 py-1 text-center border rounded-lg"
                              onChange={(e) =>
                                handleGradeChange(st.id, e.target.value)
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleSaveGrade(st.id)
                              }
                            />

                            <button
                              onClick={() => handleSaveGrade(st.id)}
                              disabled={savingId === st.id}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                            >
                              {savingId === st.id ? (
                                <span className="animate-spin block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></span>
                              ) : (
                                <Save size={18} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {students.length === 0 && (
                      <tr>
                        <td
                          colSpan="4"
                          className="p-12 text-center text-slate-400"
                        >
                          No hay alumnos matriculados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <div className="p-12 border-2 border-dashed rounded-xl text-slate-400 bg-slate-50">
            No tienes cursos asignados para gestionar notas.
          </div>
        )}
      </div>
    );
  };

  if (mode === "grades") return renderGradesView();
  return renderCoursesView();
}
