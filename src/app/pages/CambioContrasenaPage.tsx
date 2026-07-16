import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { R, O, FD, FB, FM, tg, bg } from "../components/common/styleConstants";

/**
 * Pantalla de cambio de contraseña obligatorio.
 * Se muestra cuando el usuario tiene el flag `requiereCambioContrasena: true`
 * tras iniciar sesión con la contraseña temporal asignada por la recepcionista.
 */
export default function CambioContrasenaPage() {
  const { cambiarContrasena, datosUsuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // ── Validaciones ──────────────────────────────────────

  function validarPassword(): string | null {
    if (nuevaPassword.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }
    if (!/[A-Z]/.test(nuevaPassword)) {
      return "La contraseña debe contener al menos una letra mayúscula.";
    }
    if (!/[0-9]/.test(nuevaPassword)) {
      return "La contraseña debe contener al menos un número.";
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(nuevaPassword)) {
      return "La contraseña debe contener al menos un carácter especial.";
    }
    if (nuevaPassword !== confirmarPassword) {
      return "Las contraseñas no coinciden.";
    }
    return null;
  }

  // ── Indicador visual de fortaleza ─────────────────────

  function getFortaleza(): { nivel: number; texto: string; color: string } {
    let nivel = 0;
    if (nuevaPassword.length >= 8) nivel++;
    if (/[A-Z]/.test(nuevaPassword)) nivel++;
    if (/[0-9]/.test(nuevaPassword)) nivel++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(nuevaPassword)) nivel++;

    const configs = [
      { texto: "", color: "#333" },
      { texto: "Débil", color: "#ff1500" },
      { texto: "Regular", color: "#ff6600" },
      { texto: "Buena", color: "#ffd700" },
      { texto: "Fuerte", color: "#39ff14" },
    ];

    return { nivel, ...configs[nivel] };
  }

  // ── Submit ────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const errorValidacion = validarPassword();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setCargando(true);

    try {
      await cambiarContrasena(nuevaPassword);

      // Redirigir al dashboard correspondiente según su rol
      const rutaPorRol: Record<string, string> = {
        usuario: "/dashboard/usuario",
        recepcionista: "/dashboard/recepcionista",
        entrenador: "/dashboard/entrenador",
        administrador: "/dashboard/administrador",
      };

      const destino = rutaPorRol[datosUsuario?.rol || ""] || "/dashboard";
      navigate(destino, { replace: true });
    } catch (err: any) {
      // Firebase puede requerir re-autenticación si la sesión es antigua
      if (err.code === "auth/requires-recent-login") {
        setError(
          "Tu sesión ha expirado. Cierra sesión, vuelve a iniciar y repite el proceso."
        );
      } else {
        setError(err.message || "Error al cambiar la contraseña.");
      }
    } finally {
      setCargando(false);
    }
  }

  const fortaleza = getFortaleza();

  return (
    <div
      className="min-h-screen flex items-center justify-center relative px-5 overflow-hidden"
      style={{ background: "#060606" }}
    >
      {/* Luces de fondo decorativas */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none opacity-20"
        style={{ background: O }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none opacity-20"
        style={{ background: R }}
      />

      {/* Tarjeta principal */}
      <div
        className="relative z-10 w-full max-w-md p-8 md:p-10 rounded-2xl border"
        style={{
          background: "rgba(18, 18, 18, 0.8)",
          backdropFilter: "blur(20px)",
          borderColor: `${O}30`,
          ...bg(O, 0.4),
        }}
      >
        {/* Cabecera */}
        <div className="text-center mb-8">
          <div
            className="text-4xl font-black tracking-widest mb-2"
            style={{ fontFamily: FD }}
          >
            <span style={{ color: R }}>INGS</span>
            <span className="text-white"> GYM</span>
          </div>

          {/* Icono de candado */}
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center border-2"
              style={{ borderColor: `${O}60`, background: `${O}10` }}
            >
              <svg
                className="w-8 h-8"
                style={{ color: O }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          <h1
            className="text-lg font-bold uppercase tracking-wider text-white mb-1"
            style={{ fontFamily: FB }}
          >
            Cambio de Contraseña Obligatorio
          </h1>
          <p
            className="text-xs uppercase tracking-widest text-gray-500"
            style={{ fontFamily: FM }}
          >
            // Define tu clave personal y secreta
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
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Nueva contraseña */}
          <div>
            <label
              className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold"
              style={{ fontFamily: FB }}
            >
              Nueva Contraseña
            </label>
            <input
              type="password"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
              style={{
                background: "#121212",
                borderColor: nuevaPassword
                  ? `${fortaleza.color}60`
                  : "#333",
                color: "#fff",
                fontFamily: FB,
                fontSize: "1rem",
              }}
              required
              disabled={cargando}
            />

            {/* Barra de fortaleza */}
            {nuevaPassword && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        background:
                          i <= fortaleza.nivel ? fortaleza.color : "#333",
                      }}
                    />
                  ))}
                </div>
                <span
                  className="text-xs"
                  style={{ color: fortaleza.color, fontFamily: FM }}
                >
                  {fortaleza.texto}
                </span>
              </div>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label
              className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold"
              style={{ fontFamily: FB }}
            >
              Confirmar Contraseña
            </label>
            <input
              type="password"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              placeholder="Repite tu nueva contraseña"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
              style={{
                background: "#121212",
                borderColor:
                  confirmarPassword && confirmarPassword === nuevaPassword
                    ? "#39ff1460"
                    : confirmarPassword
                    ? `${R}60`
                    : "#333",
                color: "#fff",
                fontFamily: FB,
                fontSize: "1rem",
              }}
              required
              disabled={cargando}
            />
            {confirmarPassword && confirmarPassword !== nuevaPassword && (
              <span
                className="text-xs mt-1 block"
                style={{ color: R, fontFamily: FM }}
              >
                Las contraseñas no coinciden
              </span>
            )}
          </div>

          {/* Requisitos */}
          <div
            className="p-3 rounded-lg"
            style={{ background: "#ffffff08", fontFamily: FM }}
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              // Requisitos:
            </p>
            <ul className="space-y-1 text-xs">
              {[
                {
                  ok: nuevaPassword.length >= 8,
                  texto: "Mínimo 8 caracteres",
                },
                {
                  ok: /[A-Z]/.test(nuevaPassword),
                  texto: "Una letra mayúscula",
                },
                { ok: /[0-9]/.test(nuevaPassword), texto: "Un número" },
                {
                  ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                    nuevaPassword
                  ),
                  texto: "Un carácter especial",
                },
              ].map(({ ok, texto }) => (
                <li
                  key={texto}
                  className="flex items-center gap-2 transition-colors"
                  style={{ color: ok ? "#39ff14" : "#666" }}
                >
                  <span>{ok ? "✓" : "○"}</span>
                  <span>{texto}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Botón de enviar */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3.5 text-base font-black uppercase tracking-widest text-center cursor-pointer transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: FD,
              background: O,
              color: "#fff",
              clipPath:
                "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
              ...bg(O, 0.75),
            }}
          >
            {cargando ? "ACTUALIZANDO..." : "ESTABLECER NUEVA CLAVE"}
          </button>
        </form>

        {/* Enlace para cerrar sesión */}
        <div className="mt-8 text-center border-t border-gray-800 pt-6">
          <button
            onClick={cerrarSesion}
            className="text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors cursor-pointer"
            style={{ fontFamily: FM }}
          >
            ← Cerrar sesión y volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
