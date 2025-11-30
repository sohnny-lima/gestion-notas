// src/pages/admin/UsersAdmin.jsx
import { useEffect, useState } from "react";
import api from "../../utils/api";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Search, Plus, Edit, Trash2, BookOpen } from "lucide-react";
import { Modal } from "../../components/ui/Modal";

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // --- Estado Modal Usuario (Crear/Editar) ---
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "ALUMNO",
    code: "",
  });
  const [creating, setCreating] = useState(false);

  // --- Estado Modal Asignación Cursos ---
  const [isAssignCoursesModalOpen, setIsAssignCoursesModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // --- Carga de Usuarios ---
  const fetchUsers = async (term = "") => {
    setLoading(true);
    try {
      const res = await api.get("/users", {
        params: {
          search: term || undefined,
          limit: 100,
        },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.users;
      setUsers(data || []);
    } catch (error) {
      console.error("Error cargando usuarios", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(search.trim());
  };

  // --- Handlers Usuario ---

  const openNewUserModal = () => {
    setEditingId(null);
    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "ALUMNO",
      code: "",
    });
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingId(user.id);
    setNewUser({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      code: user.code || "",
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, newUser);
      } else {
        await api.post("/users", newUser);
      }
      setIsUserModalOpen(false);
      setEditingId(null);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "ALUMNO",
        code: "",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error guardando usuario", error);
      alert(error.response?.data?.error || "Error al guardar usuario");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar al usuario "${user.name}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    try {
      await api.delete(`/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (error) {
      console.error("Error eliminando usuario", error);
      alert("Error al eliminar usuario");
    }
  };

  // --- Handlers Asignación Cursos ---

  const openAssignCoursesModal = async (student) => {
    setSelectedStudent(student);
    setIsAssignCoursesModalOpen(true);
    setLoadingCourses(true);
    try {
      const res = await api.get(`/students/${student.id}/courses`);
      setAvailableCourses(res.data.allCourses);
      setSelectedCourses(res.data.enrolledCourseIds);
    } catch (error) {
      console.error("Error cargando cursos del alumno", error);
      alert("Error al cargar cursos");
      setIsAssignCoursesModalOpen(false);
    } finally {
      setLoadingCourses(false);
    }
  };

  const closeAssignCoursesModal = () => {
    setIsAssignCoursesModalOpen(false);
    setSelectedStudent(null);
    setAvailableCourses([]);
    setSelectedCourses([]);
  };

  const toggleCourseSelection = (courseId) => {
    setSelectedCourses((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleSaveAssignment = async () => {
    setCreating(true);
    try {
      await api.put(`/students/${selectedStudent.id}/courses`, {
        courseIds: selectedCourses,
      });
      alert("Cursos asignados correctamente");
      closeAssignCoursesModal();
    } catch (error) {
      console.error("Error asignando cursos", error);
      alert("Error al asignar cursos");
    } finally {
      setCreating(false);
    }
  };

  // --- Helpers ---

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const badgeColorForRole = (role) => {
    if (role === "ADMIN") return "purple";
    if (role === "DOCENTE") return "blue";
    if (role === "ALUMNO") return "green";
    return "gray";
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-slate-500">
            {new Date().toLocaleDateString("es-PE", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <Button
          icon={Plus}
          className="px-5"
          onClick={openNewUserModal}
        >
          Nuevo Usuario
        </Button>
      </div>

      {/* Buscador */}
      <form onSubmit={handleSearchSubmit} className="max-w-md">
        <div className="relative">
          <Search
            className="absolute left-3 top-2.5 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar usuario..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </form>

      {/* Tabla */}
      <Card className="mt-2 overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Cargando usuarios...</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            No se encontraron usuarios.
          </div>
        ) : (
          <table className="w-full text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Email
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Rol
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">
                  Fecha Alta
                </th>
                <th className="px-6 py-3 text-center font-semibold text-slate-600">
                  Cursos
                </th>
                <th className="px-6 py-3 text-right font-semibold text-slate-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-900 font-medium">
                    {user.name}
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <Badge color={badgeColorForRole(user.role)}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4 text-center">
                    {user.role === "ALUMNO" && (
                      <button
                        onClick={() => openAssignCoursesModal(user)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                      >
                        <BookOpen size={14} />
                        Asignar
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Modal Usuario */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={editingId ? "Editar Usuario" : "Crear Nuevo Usuario"}
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={newUser.name}
              onChange={(e) =>
                setNewUser({ ...newUser, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              {...(!editingId && { required: true })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={newUser.password}
              placeholder={
                editingId ? "Dejar en blanco para mantener actual" : ""
              }
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Rol
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
              >
                <option value="ALUMNO">Alumno</option>
                <option value="DOCENTE">Docente</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            {newUser.role === "ALUMNO" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Código de Alumno
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={newUser.code}
                  onChange={(e) =>
                    setNewUser({ ...newUser, code: e.target.value })
                  }
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-2">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <Button type="submit" disabled={creating}>
              {creating
                ? "Guardando..."
                : editingId
                  ? "Guardar Cambios"
                  : "Crear Usuario"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Asignación Cursos */}
      {isAssignCoursesModalOpen && (
        <Modal
          isOpen={isAssignCoursesModalOpen}
          onClose={closeAssignCoursesModal}
          title={`Asignar Cursos - ${selectedStudent?.name}`}
        >
          {loadingCourses ? (
            <div className="p-8 text-center text-slate-500">
              Cargando cursos disponibles...
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                Selecciona los cursos en los que deseas matricular al alumno.
              </p>

              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                {availableCourses.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-400">
                    No hay cursos disponibles.
                  </div>
                ) : (
                  availableCourses.map((course) => {
                    const isSelected = selectedCourses.includes(course.id);
                    return (
                      <div
                        key={course.id}
                        className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                          }`}
                        onClick={() => toggleCourseSelection(course.id)}
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {course.name}
                          </p>
                          <span className="text-xs text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                            {course.code}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-2">
                <button
                  type="button"
                  onClick={closeAssignCoursesModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <Button onClick={handleSaveAssignment} disabled={creating}>
                  {creating ? "Guardando..." : "Guardar Asignación"}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
