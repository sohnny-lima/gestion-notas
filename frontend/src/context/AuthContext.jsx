/* eslint-disable react-refresh/only-export-components */
// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // Cargar usuario desde localStorage si existe
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(false);
  const [error, setError] = useState(null);

  // Comprobar sesión con /auth/me al iniciar la app
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        setCheckingSession(true);
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch (err) {
        console.error("Error validando sesión:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // POST al backend -> {API_BASE}/api/auth/login
      const { data } = await api.post(
        "/auth/login",
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          // Solo necesitas withCredentials si usas cookies httpOnly
          withCredentials: false,
        }
      );

      const { token, user: loggedUser } = data;

      // Guardar en localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(loggedUser));

      // Guardar en estado
      setUser(loggedUser);

      // Redirigir al dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Error en login:", err);
      setError("Credenciales incorrectas");
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const value = {
    user,
    loading,
    checkingSession,
    error,
    login,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
