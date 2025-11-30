import { useEffect, useState } from "react";
import api from "../../utils/api";
import { Card } from "../../components/ui/Card";
import { CheckCircle, User, GraduationCap, BookOpen, Clock } from "lucide-react";

export default function DashboardAdmin() {
  const [stats, setStats] = useState({
    teacherCount: 0,
    studentCount: 0,
    courseCount: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get("/dashboard/summary");
        setStats(data);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const estadisticas = [
    {
      title: "DOCENTES",
      value: stats.teacherCount,
      icon: User,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "ALUMNOS",
      value: stats.studentCount,
      icon: GraduationCap,
      color: "text-green-600 bg-green-100",
    },
    {
      title: "CURSOS ACTIVOS",
      value: stats.courseCount,
      icon: BookOpen,
      color: "text-purple-600 bg-purple-100",
    },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getIconForType = (type) => {
    switch (type) {
      case "COURSE":
        return BookOpen;
      case "ENROLLMENT":
        return CheckCircle;
      case "GRADE":
        return GraduationCap;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Bienvenido, Director Principal
        </h1>
        <p className="text-slate-500">
          {new Date().toLocaleDateString("es-PE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {estadisticas.map((item, i) => (
          <Card key={i} className="p-6 flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center ${item.color}`}
            >
              <item.icon size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{item.title}</p>
              <p className="text-3xl font-bold text-slate-800">
                {loading ? "..." : item.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Actividad reciente */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Actividad Reciente
        </h2>

        {loading ? (
          <p className="text-slate-500">Cargando actividad...</p>
        ) : stats.recentActivity.length === 0 ? (
          <p className="text-slate-400 italic">No hay actividad reciente.</p>
        ) : (
          <div className="space-y-3">
            {stats.recentActivity.map((item) => {
              const Icon = getIconForType(item.type);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <Icon className="text-slate-600" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 font-medium">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
