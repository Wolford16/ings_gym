import { Link, Outlet } from "react-router";
import { R, FD, FB, FM, tg } from "../../components/common/styleConstants";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex text-white" style={{ background: "#060606" }}>
      {/* Sidebar Lateral */}
      <aside
        className="w-64 border-r flex flex-col justify-between p-6"
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
            <span className="text-[10px] text-gray-500 uppercase tracking-widest block" style={{ fontFamily: FM }}>
              // PANEL DE CONTROL
            </span>
          </div>

          {/* Menú de Navegación de Prueba para la Fase 1 */}
          <nav className="space-y-2">
            <Link
              to="/dashboard"
              className="block px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-900 transition-colors uppercase tracking-wider"
              style={{ fontFamily: FB }}
            >
              Panel General
            </Link>
            <Link
              to="/dashboard/usuario"
              className="block px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-900 transition-colors uppercase tracking-wider text-gray-400 hover:text-white"
              style={{ fontFamily: FB }}
            >
              Módulo Usuario
            </Link>
            <Link
              to="/dashboard/recepcionista"
              className="block px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-900 transition-colors uppercase tracking-wider text-gray-400 hover:text-white"
              style={{ fontFamily: FB }}
            >
              Módulo Recepcionista
            </Link>
            <Link
              to="/dashboard/entrenador"
              className="block px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-900 transition-colors uppercase tracking-wider text-gray-400 hover:text-white"
              style={{ fontFamily: FB }}
            >
              Módulo Entrenador
            </Link>
            <Link
              to="/dashboard/administrador"
              className="block px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-900 transition-colors uppercase tracking-wider text-gray-400 hover:text-white"
              style={{ fontFamily: FB }}
            >
              Módulo Administrador
            </Link>
          </nav>
        </div>

        {/* Footer del Sidebar con botón de salir */}
        <div>
          <Link
            to="/"
            className="block text-center text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors py-2 border-t border-zinc-800"
            style={{ fontFamily: FM }}
          >
            ← Salir a Landing
          </Link>
        </div>
      </aside>

      {/* Contenedor del Contenido Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
