import { Link, Outlet, useNavigate } from "react-router";
import { useAuth } from "../../../contexts/AuthContext";
import { R, O, G, Y, FD, FB, FM, tg } from "../../components/common/styleConstants";

export default function DashboardLayout() {
  const { datosUsuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await cerrarSesion();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  // Si no se han cargado los datos del usuario, mostramos un estado básico
  const rol = datosUsuario?.rol || "usuario";

  // Mapear colores de rol para indicadores
  const colorRol: Record<string, string> = {
    usuario: R,
    recepcionista: O,
    entrenador: G,
    administrador: Y,
  };

  const colorActivo = colorRol[rol] || R;

  return (
    <div className="min-h-screen flex text-white" style={{ background: "#060606" }}>
      {/* Sidebar Lateral */}
      <aside
        className="w-64 border-r flex flex-col justify-between p-6 shrink-0"
        style={{
          background: "#0c0c0c",
          borderColor: "#181818",
        }}
      >
        <div>
          {/* Logo */}
          <div className="mb-8">
            <Link
              to="/"
              className="text-2xl font-black tracking-widest block"
              style={{ fontFamily: FD, ...tg(R, 0.8) }}
            >
              <span style={{ color: R }}>INGS</span>
              <span className="text-white"> GYM</span>
            </Link>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest block mt-1" style={{ fontFamily: FM }}>
              // PANEL DE CONTROL
            </span>
          </div>

          {/* Información del Usuario Conectado */}
          {datosUsuario && (
            <div className="mb-6 p-3 rounded-lg border border-zinc-800 bg-zinc-950 flex flex-col gap-1">
              <div className="text-xs uppercase text-zinc-500 font-bold" style={{ fontFamily: FM }}>
                Conectado como:
              </div>
              <div className="text-sm font-black text-white truncate" style={{ fontFamily: FB }}>
                {datosUsuario.nombre}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colorActivo }} />
                <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: colorActivo, fontFamily: FM }}>
                  {rol}
                </span>
              </div>
            </div>
          )}

          {/* Menú de Navegación Dinámico según el Rol */}
          <nav className="space-y-2">
            {/* Panel General es accesible para staff, no para clientes */}
            {rol !== "usuario" && (
              <Link
                to="/dashboard"
                className="block px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-900 transition-colors uppercase tracking-wider text-gray-300 hover:text-white"
                style={{ fontFamily: FB }}
              >
                Panel General
              </Link>
            )}

            {/* Módulo de Clientes (Solo Usuario) */}
            {rol === "usuario" && (
              <Link
                to="/dashboard/usuario"
                className="block px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-900 transition-colors uppercase tracking-wider text-gray-400 hover:text-white border-l-2"
                style={{ borderColor: R, fontFamily: FB }}
              >
                Mi Panel de Cliente
              </Link>
            )}

            {/* Zona de Rutinas (Accesible para todos) */}
            <Link
              to="/dashboard/rutinas"
              className="block px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-900 transition-colors uppercase tracking-wider text-gray-400 hover:text-white border-l-2"
              style={{ borderColor: G, fontFamily: FB }}
            >
              Zona de Rutinas
            </Link>

            {/* Módulo de Recepción (Recepcionista y Administrador) */}
            {(rol === "recepcionista" || rol === "administrador") && (
              <Link
                to="/dashboard/recepcionista"
                className="block px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-900 transition-colors uppercase tracking-wider text-gray-400 hover:text-white border-l-2"
                style={{ borderColor: O, fontFamily: FB }}
              >
                Módulo Recepcionista
              </Link>
            )}

            {/* Módulo de Entrenamiento (Entrenador y Administrador) */}
            {(rol === "entrenador" || rol === "administrador") && (
              <Link
                to="/dashboard/entrenador"
                className="block px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-900 transition-colors uppercase tracking-wider text-gray-400 hover:text-white border-l-2"
                style={{ borderColor: G, fontFamily: FB }}
              >
                Módulo Entrenador
              </Link>
            )}

            {/* Módulo Administrador (Solo Administrador) */}
            {rol === "administrador" && (
              <Link
                to="/dashboard/administrador"
                className="block px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-900 transition-colors uppercase tracking-wider text-gray-400 hover:text-white border-l-2"
                style={{ borderColor: Y, fontFamily: FB }}
              >
                Módulo Administrador
              </Link>
            )}
          </nav>
        </div>

        {/* Botón de Cerrar Sesión Real */}
        <div>
          <button
            onClick={handleLogout}
            className="w-full text-center text-xs uppercase tracking-widest text-zinc-500 hover:text-white hover:border-white/20 transition-all py-3 border-t border-zinc-800 cursor-pointer font-bold"
            style={{ fontFamily: FM }}
          >
            ← Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenedor del Contenido Principal */}
      <main className="flex-1 p-8 overflow-y-auto bg-zinc-950/20">
        <Outlet />
      </main>
    </div>
  );
}
