import { Link, Outlet, useNavigate } from "react-router";
import { useAuth } from "../../../contexts/AuthContext";
import { R, O, G, Y, FD, FB, FM, tg } from "../../components/common/styleConstants";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";
import {
  marcarNotificacionLeida,
  marcarTodasLeidas,
  type Notificacion,
} from "../../../services/notificacionesService";

export default function DashboardLayout() {
  const { usuario, datosUsuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [abrirModalNotif, setAbrirModalNotif] = useState(false);

  // Escuchar notificaciones en tiempo real
  useEffect(() => {
    if (!usuario || !datosUsuario) return;

    const q = query(collection(db, "notificaciones"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Notificacion[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Notificacion);
      });

      // Filtrar por destinatario: UID específico, "todos" o el rol del usuario
      const filtradas = list.filter(
        (n) =>
          n.usuarioId === usuario.uid ||
          n.usuarioId === "todos" ||
          n.usuarioId === datosUsuario.rol
      );

      // Ordenar por fecha de creación desc
      filtradas.sort((a, b) => {
        const tA = a.fechaCreacion?.toDate ? a.fechaCreacion.toDate().getTime() : new Date(a.fechaCreacion || 0).getTime();
        const tB = b.fechaCreacion?.toDate ? b.fechaCreacion.toDate().getTime() : new Date(b.fechaCreacion || 0).getTime();
        return tB - tA;
      });

      setNotificaciones(filtradas);
    });

    return () => unsubscribe();
  }, [usuario, datosUsuario]);

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
  const noLeidas = notificaciones.filter((n) => !n.leido);

  async function handleMarcarLeidas() {
    try {
      await marcarTodasLeidas(notificaciones);
    } catch (error) {
      console.error("Error al marcar como leídas:", error);
    }
  }

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
          </div>

          {/* Información del Usuario Conectado */}
          {datosUsuario && (
            <div className="mb-6 p-3 rounded-lg border border-zinc-800 bg-zinc-950 flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5 truncate">
                <div className="text-[10px] uppercase text-zinc-500 font-bold" style={{ fontFamily: FM }}>
                  Conectado como:
                </div>
                <div className="text-xs font-black text-white truncate max-w-[120px]" style={{ fontFamily: FB }}>
                  {datosUsuario.nombre}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: colorActivo }} />
                  <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: colorActivo, fontFamily: FM }}>
                    {rol}
                  </span>
                </div>
              </div>

              {/* Botón de Campana de Notificaciones */}
              <button
                onClick={() => setAbrirModalNotif(true)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer relative shrink-0 p-1.5 hover:bg-zinc-900 rounded"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {noLeidas.length > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold rounded-full bg-red-600 text-white flex items-center justify-center animate-pulse"
                    style={{ fontFamily: FM }}
                  >
                    {noLeidas.length}
                  </span>
                )}
              </button>
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

      {/* Modal/Drawer de Notificaciones */}
      {abrirModalNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-md h-full p-6 border-l flex flex-col justify-between bg-zinc-950/95"
            style={{ borderColor: "#181818" }}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider text-white" style={{ fontFamily: FD }}>
                    Centro de Alertas
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest" style={{ fontFamily: FM }}>
                    // Notificaciones internas
                  </span>
                </div>
                <button
                  onClick={() => setAbrirModalNotif(false)}
                  className="text-zinc-400 hover:text-white font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Acciones */}
              {notificaciones.length > 0 && noLeidas.length > 0 && (
                <div className="flex justify-end mb-4">
                  <button
                    onClick={handleMarcarLeidas}
                    className="text-[10px] uppercase font-black tracking-wider text-green-400 hover:text-green-300 cursor-pointer"
                    style={{ fontFamily: FM }}
                  >
                    Marcar todo como leído
                  </button>
                </div>
              )}

              {/* Lista */}
              <div className="space-y-3 overflow-y-auto max-h-[70vh]">
                {notificaciones.length === 0 ? (
                  <p
                    className="text-center text-zinc-600 uppercase text-xs tracking-wider py-12"
                    style={{ fontFamily: FM }}
                  >
                    // No tienes notificaciones en este momento.
                  </p>
                ) : (
                  notificaciones.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={async () => {
                        if (!notif.leido && notif.id) {
                          await marcarNotificacionLeida(notif.id);
                        }
                      }}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                        notif.leido
                          ? "bg-zinc-900/10 border-zinc-900 text-zinc-400 hover:bg-zinc-900/25"
                          : "bg-zinc-900/40 border-zinc-800 text-white hover:bg-zinc-900/60"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className="font-bold text-xs uppercase tracking-wider"
                          style={{ fontFamily: FB }}
                        >
                          {notif.titulo}
                        </span>
                        {!notif.leido && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs leading-relaxed" style={{ fontFamily: FB }}>
                        {notif.mensaje}
                      </p>
                      <span
                        className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block mt-2 text-right"
                        style={{ fontFamily: FM }}
                      >
                        {notif.fechaCreacion?.toDate
                          ? notif.fechaCreacion.toDate().toLocaleDateString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4 text-center">
              <button
                onClick={() => setAbrirModalNotif(false)}
                className="text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                style={{ fontFamily: FM }}
              >
                Cerrar Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
