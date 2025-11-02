import { useState } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";
import "../styles.css";

export default function Login() {
  const loginStore = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegister, setIsRegister] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        await api.post("/auth/register", { email, name, password });
      }
      const { data } = await api.post("/auth/login", { email, password });
      loginStore(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Error en la autenticación");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="card">
        <h2 className="card-title">
          {isRegister ? "Crea tu cuenta en EduPlan IA" : "Bienvenido a EduPlan IA"}
        </h2>
        <p className="card-subtitle">
          {isRegister ? "Completa los datos para registrarte" : "Ingresa con tu cuenta para continuar"}
        </p>

        <form className="form" onSubmit={onSubmit}>
          {isRegister && (
            <input
              className="input"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          )}
          <input
            className="input"
            type="email"
            autoComplete="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="error" role="alert" aria-live="assertive">{error}</p>}

          <button className="btn" disabled={loading}>
            {loading ? (isRegister ? "Registrando..." : "Ingresando...") : (isRegister ? "Registrarse" : "Ingresar")}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
          </button>

          <p className="status">Tu información es procesada de forma segura.</p>
        </form>
      </div>
    </div>
  );
}
 