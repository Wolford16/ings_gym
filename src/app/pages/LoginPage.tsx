import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { R, O, FD, FB, FM, tg, bg } from "../components/common/styleConstants";

/**
 * Página de inicio de sesión funcional.
 * Conecta con Firebase Auth a través del AuthContext.
 * Redirige según el rol del usuario y el flag de cambio de contraseña.
 */
export default function LoginPage() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // ── Mapeo de códigos de error de Firebase a español ───

  function traducirError(code: string): string {
    const errores: Record<string, string> = {
      "auth/invalid-email": "El correo electrónico no es válido.",
      "auth/user-disabled": "Esta cuenta ha sido desactivada.",
      "auth/user-not-found": "No existe una cuenta con este correo.",
      "auth/wrong-password": "La contraseña es incorrecta.",
      "auth/invalid-credential": "Credenciales inválidas. Verifica tu correo y contraseña.",
      "auth/too-many-requests":
        "Demasiados intentos fallidos. Espera un momento antes de reintentar.",
    };
    return errores[code] || "Error al iniciar sesión. Intenta de nuevo.";
  }

  // ── Submit ────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const datosUsuario = await iniciarSesion(email, password);

      // Si requiere cambio de contraseña → redirigir al formulario obligatorio
      if (datosUsuario.requiereCambioContrasena) {
        navigate("/cambio-contrasena", { replace: true });
        return;
      }

      // Redirigir al dashboard que corresponda según el rol
      const rutaPorRol: Record<string, string> = {
        usuario: "/dashboard/usuario",
        recepcionista: "/dashboard/recepcionista",
        entrenador: "/dashboard/entrenador",
        administrador: "/dashboard/administrador",
      };

      const destino = rutaPorRol[datosUsuario.rol] || "/dashboard";
      navigate(destino, { replace: true });
    } catch (err: any) {
      const codigo = err.code || "";
      setError(err.message || traducirError(codigo));
    } finally {
      setCargando(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative px-5 overflow-hidden"
      style={{
        background: "#060606",
      }}
    >
      {/* Elementos decorativos de fondo (luces de neón atenuadas) */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none opacity-20"
        style={{ background: R }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none opacity-20"
        style={{ background: O }}
      />

      {/* Tarjeta de Login (Glassmorphism) */}
      <div
        className="relative z-10 w-full max-w-md p-8 md:p-10 rounded-2xl border"
        style={{
          background: "rgba(18, 18, 18, 0.8)",
          backdropFilter: "blur(20px)",
          borderColor: `${R}30`,
          ...bg(R, 0.4),
        }}
      >
        {/* Cabecera del Formulario */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-4xl font-black tracking-widest block mb-2 transition-transform hover:scale-105"
            style={{ fontFamily: FD, ...tg(R) }}
          >
            <span style={{ color: R }}>INGS</span>
            <span className="text-white"> GYM</span>
          </Link>
          <p
            className="text-xs uppercase tracking-widest text-gray-500"
            style={{ fontFamily: FM }}
          >
            // Acceso de Usuarios y Personal
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div
            className="mb-6 px-4 py-3 rounded-lg border text-sm"
            style={{
              background: `${R}10`,
              borderColor: `${R}40`,
              color: R,
              fontFamily: FB,
            }}
          >
            {error}
          </div>
        )}

        {/* Formulario */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold"
              style={{ fontFamily: FB }}
            >
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ingsgym.com"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
              style={{
                background: "#121212",
                borderColor: "#333",
                color: "#fff",
                fontFamily: FB,
                fontSize: "1rem",
              }}
              required
              disabled={cargando}
            />
          </div>

          <div>
            <label
              className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold"
              style={{ fontFamily: FB }}
            >
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
              style={{
                background: "#121212",
                borderColor: "#333",
                color: "#fff",
                fontFamily: FB,
                fontSize: "1rem",
              }}
              required
              disabled={cargando}
            />
          </div>

          {/* Botón de Acceso */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3.5 text-base font-black uppercase tracking-widest text-center cursor-pointer transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: FD,
              background: R,
              color: "#fff",
              clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
              ...bg(R, 0.75),
            }}
          >
            {cargando ? "VERIFICANDO..." : "ENTRAR"}
          </button>
        </form>

        {/* Enlace para volver a la Landing */}
        <div className="mt-8 text-center border-t border-gray-800 pt-6">
          <Link
            to="/"
            className="text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
            style={{ fontFamily: FM }}
          >
            ← Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}
