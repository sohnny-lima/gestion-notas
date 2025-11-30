// frontend/src/utils/api.js
import axios from "axios";

// Asegúrate de que este puerto coincida con el backend:
// Backend: http://localhost:3000  (según tu consola)
const api = axios.create({
  baseURL: "http://localhost:3000/api",
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
