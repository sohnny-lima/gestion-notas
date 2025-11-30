// src/pages/admin/CoursesAdmin.jsx
import { useEffect, useState } from "react";
import api from "../../utils/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Search, Plus, Edit3, Trash2 } from "lucide-react";
import { Modal } from "../../components/ui/Modal";

export default function CoursesAdmin() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [newCourse, setNewCourse] = useState({
    name: "",
    code: "",
    description: "",
    teacherId: "",
  });
  const [creating, setCreating] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/courses", {
        params: {
          search: search || undefined,
          page: 1,
          limit: 100,
        },
      });
      // El backend responde { courses, pagination }
      setCourses(res.data.courses || []);
    } catch (error) {
      console.error("Error cargando cursos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar docentes para el select
  useEffect(() => {
    if (isModalOpen && teachers.length === 0) {
      api
        .get("/users/helpers/teachers")
        .then((res) => setTeachers(res.data))
        .catch((err) => console.error("Error cargando docentes", err));
    }
  }, [isModalOpen, teachers.length]);

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      if (editingId) {
        // Update
        await api.put(`/courses/${editingId}`, newCourse);
      } else {
        // Create
        await api.post("/courses", newCourse);
      }

      setIsModalOpen(false);
      setEditingId(null);
      setNewCourse({
        name: "",
        code: "",
        description: "",
        teacherId: "",
      });
      fetchCourses();
    } catch (error) {
      console.error("Error guardando curso", error);
      alert(error.response?.data?.error || "Error al guardar curso");
    } finally {
      setCreating(false);
    }
  };

  const handleEditCourse = (course) => {
    setEditingId(course.id);
    setNewCourse({
      name: course.name,
      code: course.code,
      description: course.description || "",
      teacherId: course.teacherId || "",
    });
    setIsModalOpen(true);
  };

  const handleDeleteCourse = async (course) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar el curso "${course.name}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/courses/${course.id}`);
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
    } catch (error) {
      console.error("Error eliminando curso", error);
      alert("Error al eliminar curso");
    }
  };

  const openNewCourseModal = () => {
    setEditingId(null);
    setNewCourse({
      name: "",
      code: "",
      description: "",
      teacherId: "",
    });
    setIsModalOpen(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gestión de Cursos
          </h1>
          <p className="text-sm text-slate-500">
            martes, 25 de noviembre de 2025
          </p>
        </div>

        <Button
          icon={Plus}
          className="shadow-md"
          onClick={openNewCourseModal}
        >
          Crear Curso
        </Button>
      </div>

      {/* Buscador */}
      <form onSubmit={handleSearchSubmit}>
        <div className="relative max-w-xl">
          <Search
            className="absolute left-3 top-2.5 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar curso..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </form>

      {/* Listado */}
      {loading ? (
        <Card className="p-8 text-center text-slate-500">
          Cargando cursos...
        </Card>
      ) : courses.length === 0 ? (
        <Card className="p-8 text-center text-slate-500">
          No hay cursos registrados.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="p-6 hover:shadow-lg transition-shadow duration-200 relative"
            >
              {/* Código curso + icono editar */}
              <div className="flex items-start justify-between mb-4">
                <Badge color="purple">{course.code}</Badge>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="text-slate-300 hover:text-blue-500 p-1"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course)}
                    className="text-slate-300 hover:text-red-500 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Nombre + descripción */}
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                {course.name}
              </h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                {course.description || "Sin descripción"}
              </p>

              {/* Docente */}
              <div className="flex items-center gap-3 mt-4">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  {/* icono usuario simple */}
                  <span className="text-sm font-semibold">
                    {course.teacher?.name?.[0] || "D"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">
                    Docente
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {course.teacher?.name || "Sin asignar"}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Editar Curso" : "Crear Nuevo Curso"}
      >
        <form onSubmit={handleSaveCourse} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre del Curso
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={newCourse.name}
              onChange={(e) =>
                setNewCourse({ ...newCourse, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Código
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={newCourse.code}
              onChange={(e) =>
                setNewCourse({ ...newCourse, code: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descripción
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              rows="3"
              value={newCourse.description}
              onChange={(e) =>
                setNewCourse({ ...newCourse, description: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Docente Asignado
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={newCourse.teacherId}
              onChange={(e) =>
                setNewCourse({ ...newCourse, teacherId: e.target.value })
              }
            >
              <option value="">Seleccionar Docente...</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <Button type="submit" disabled={creating}>
              {creating
                ? "Guardando..."
                : editingId
                  ? "Guardar Cambios"
                  : "Crear Curso"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
