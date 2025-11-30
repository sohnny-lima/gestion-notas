// src/pages/docente/TeacherGradesPage.jsx

import DashboardTeacher from "./DashboardTeacher";

/**
 * Página de "Gestión Notas" para el docente.
 * Reutiliza el mismo DashboardTeacher pero en modo "grades".
 * La ruta está mapeada en AppRouter a: /docente/grades
 */
export default function TeacherGradesPage() {
  return <DashboardTeacher mode="grades" />;
}
