// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
    } catch {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 p-6">
      {/* Card glass */}
      <div className="w-full max-w-md bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-10 animate-[fadeIn_0.6s_ease]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <GraduationCap size={40} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow">
            Portal Académico
          </h1>
          <p className="text-blue-50 mt-1">Inicia sesión para continuar</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/20 border border-red-400 text-white px-4 py-2 rounded-lg text-center text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-sm text-white/90 mb-1 block">Correo</label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-2.5 text-white/70"
              />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-white/70"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-white/90 mb-1 block">
              Contraseña
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-2.5 text-white/70"
              />
              <input
                type={showPass ? "text" : "password"}
                required
                className="w-full pl-10 pr-12 py-2.5 bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-white/70"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-white/80"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg
            hover:bg-blue-50 transition-all active:scale-[0.97]"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
