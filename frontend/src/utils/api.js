// frontend/src/utils/api.js
import axios from "axios";

// 1️⃣ Primero intenta usar la variable de entorno (dev/prod)
// 2️⃣ Si no existe, usa el host actual del navegador con puerto 3000 (útil en prod)
// 3️⃣ Último fallback: localhost:3000
const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : "http://localhost:3000");

console.log("[API_BASE]", API_BASE);

const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

// Interceptor: agrega el token a cada petición automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
