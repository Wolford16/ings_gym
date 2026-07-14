import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import {
  crearUsuario,
  listarUsuarios,
  actualizarUsuario,
} from "../../../services/usuariosService";
import type { DatosUsuario } from "../../../contexts/AuthContext";
import { R, O, G, Y, FD, FB, FM, bg, tg } from "../../components/common/styleConstants";

export default function ReceptionistDashboard() {
  const [clientes, setClientes] = useState<(DatosUsuario & { id: string })[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<(DatosUsuario & { id: string })[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [abrirModal, setAbrirModal] = useState(false);
  const [filtro, setFiltro] = useState("");

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("Gym2026!");
  const [membresia, setMembresia] = useState("Mensual");
  const [fechaVencimiento, setFechaVencimiento] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  const [exitoMsg, setExitoMsg] = useState("");

  // Cargar lista de clientes
  useEffect(() => {
    cargarClientes();
  }, []);

  // Filtrar clientes
  useEffect(() => {
    if (!filtro.trim()) {
      setClientesFiltrados(clientes);
    } else {
      const termino = filtro.toLowerCase();
      const filtrados = clientes.filter(
        (c) =>
          c.nombre.toLowerCase().includes(termino) ||
          c.email.toLowerCase().includes(termino) ||
          (c.telefono && c.telefono.includes(termino))
      );
      setClientesFiltrados(filtrados);
    }
  }, [filtro, clientes]);

  // Autocompletar la fecha de vencimiento según la membresía elegida
  useEffect(() => {
    if (abrirModal) {
      const hoy = new Date();
      let dias = 30;
      if (membresia === "Mensual") dias = 30;
      else if (membresia === "Trimestral") dias = 90;
      else if (membresia === "Semestral") dias = 180;
      else if (membresia === "Anual") dias = 365;

      const vencimiento = new Date(hoy.getTime() + dias * 24 * 60 * 60 * 1000);
      const yyyy = vencimiento.getFullYear();
      const mm = String(vencimiento.getMonth() + 1).padStart(2, "0");
      const dd = String(vencimiento.getDate()).padStart(2, "0");
      setFechaVencimiento(`${yyyy}-${mm}-${dd}`);
    }
  }, [membresia, abrirModal]);

  async function cargarClientes() {
    setCargandoLista(true);
    try {
      const todos = await listarUsuarios();
      // Filtrar solo clientes (rol === 'usuario')
      const soloClientes = todos.filter((u) => u.rol === "usuario");
      setClientes(soloClientes);
      setClientesFiltrados(soloClientes);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    } finally {
      setCargandoLista(false);
    }
  }

  // Activar o desactivar cuenta del cliente
  async function toggleEstado(uid: string, estadoActual: string) {
    const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";
    try {
      await actualizarUsuario(uid, { estado: nuevoEstado });
      setClientes((prev) =>
        prev.map((c) => (c.id === uid ? { ...c, estado: nuevoEstado as any } : c))
      );
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("No se pudo actualizar el estado del cliente.");
    }
  }

  // Guardar nuevo cliente
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorForm("");
    setExitoMsg("");
    setGuardando(true);

    if (!fechaVencimiento) {
      setErrorForm("Por favor, selecciona una fecha de vencimiento para la membresía.");
      setGuardando(false);
      return;
    }

    // Configuración para la creación de cuenta en Auth sin desloguear
    const env = (import.meta as any).env;
    const config = {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
      measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
    };

    let secondaryApp;
    try {
      // 1. Inicializar app secundaria temporal
      secondaryApp = initializeApp(config, "temp-reception-auth");
      const secondaryAuth = getAuth(secondaryApp);

      // 2. Registrar usuario en Firebase Auth
      const credenciales = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );
      const newUid = credenciales.user.uid;

      // 3. Cerrar sesión de la app temporal
      await signOut(secondaryAuth);

      // 4. Preparar datos adicionales de membresía
      const dateObj = new Date(fechaVencimiento + "T23:59:59");
      const timestampVencimiento = Timestamp.fromDate(dateObj);

      const detallesPerfil = {
        membresiaTipo: membresia,
        fechaVencimiento: timestampVencimiento,
      };

      // 5. Crear el documento en Firestore (rol es 'usuario')
      await crearUsuario(newUid, {
        nombre,
        email,
        telefono,
        rol: "usuario",
        detallesPerfil,
      });

      // 6. Éxito
      setExitoMsg(`¡Cliente registrado con éxito! Contraseña: ${password}`);
      setNombre("");
      setEmail("");
      setTelefono("");
      setFechaVencimiento("");
      setMembresia("Mensual");
      setPassword("Gym2026!");
      
      // Recargar lista
      cargarClientes();
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setErrorForm("Este correo ya está registrado.");
      } else {
        setErrorForm(err.message || "Error al registrar al cliente.");
      }
    } finally {
      if (secondaryApp) {
        await secondaryApp.delete().catch(console.error);
      }
      setGuardando(false);
    }
  }

  // Dar formato legible a la fecha
  function formatearFecha(timestamp: any): string {
    if (!timestamp) return "Sin definir";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // Verificar si la membresía está vencida
  function estaVencido(timestamp: any): boolean {
    if (!timestamp) return true;
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date < new Date();
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-white" style={{ fontFamily: FD }}>
            Administración de Clientes & Pagos
          </h1>
          <p className="text-zinc-500 text-sm uppercase tracking-widest" style={{ fontFamily: FM }}>
            // Panel de Gestión de Recepción
          </p>
        </div>
        <button
          onClick={() => {
            setErrorForm("");
            setExitoMsg("");
            setAbrirModal(true);
          }}
          className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white cursor-pointer hover:brightness-110 active:scale-95 transition-all self-start md:self-auto"
          style={{
            background: O,
            color: "#fff",
            clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
            ...bg(O, 0.4),
            fontFamily: FD,
          }}
        >
          + Registrar Cliente
        </button>
      </div>

      {/* Buscador y Tabla de Clientes */}
      <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: FB }}>
            Clientes y Socios Activos
          </h2>
          {/* Campo de búsqueda */}
          <div className="relative max-w-sm w-full">
            <input
              type="text"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar por nombre, correo o tel..."
              className="w-full pl-3 pr-8 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs focus:outline-none text-white focus:border-orange-500/50"
              style={{ fontFamily: FB }}
            />
            <span className="absolute right-3 top-2.5 text-zinc-500 font-mono text-[10px]">// FILTRO</span>
          </div>
        </div>

        {cargandoLista ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${O}40`, borderTopColor: O }} />
            <span className="text-xs uppercase text-zinc-500 font-bold" style={{ fontFamily: FM }}>Cargando clientes...</span>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <p className="text-center text-zinc-600 uppercase text-xs tracking-wider py-8" style={{ fontFamily: FM }}>
            {filtro ? "// Ningún cliente coincide con la búsqueda." : "// No hay clientes registrados en el sistema."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-widest text-[10px]" style={{ fontFamily: FM }}>
                  <th className="py-3 px-4">Cliente / Correo</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4">Membresía</th>
                  <th className="py-3 px-4">Fecha Vence</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60">
                {clientesFiltrados.map((cliente) => {
                  const vencido = estaVencido(cliente.detallesPerfil?.fechaVencimiento);
                  const inactivo = cliente.estado === "inactivo";

                  return (
                    <tr
                      key={cliente.id}
                      className="hover:bg-zinc-900/20 transition-colors"
                      style={{ fontFamily: FB }}
                    >
                      <td className="py-4 px-4">
                        <div className="font-bold text-white uppercase">{cliente.nombre}</div>
                        <div className="text-xs text-zinc-500 font-mono" style={{ fontFamily: FM }}>{cliente.email}</div>
                      </td>
                      <td className="py-4 px-4 text-zinc-300 font-mono text-xs">
                        {cliente.telefono || "-"}
                      </td>
                      <td className="py-4 px-4 text-zinc-300">
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono">
                          {cliente.detallesPerfil?.membresiaTipo || "Ninguno"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`font-semibold ${
                            vencido ? "text-red-500 animate-pulse" : "text-emerald-400"
                          }`}
                        >
                          {formatearFecha(cliente.detallesPerfil?.fechaVencimiento)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-widest"
                          style={{
                            backgroundColor: inactivo ? `${R}15` : `${G}15`,
                            color: inactivo ? R : G,
                            fontFamily: FM,
                          }}
                        >
                          {inactivo ? "Inactivo" : "Activo"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => toggleEstado(cliente.id, cliente.estado)}
                          className="px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded cursor-pointer hover:bg-zinc-800/80 transition-colors border text-zinc-400 border-zinc-800 hover:text-white"
                          style={{ fontFamily: FM }}
                        >
                          {inactivo ? "Activar" : "Desactivar"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para Crear Cliente */}
      {abrirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="w-full max-w-lg p-6 rounded-2xl border bg-zinc-950 relative"
            style={{ borderColor: `${O}30`, ...bg(O, 0.4) }}
          >
            {/* Botón cerrar modal */}
            <button
              onClick={() => setAbrirModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-xl font-black uppercase tracking-wider text-white mb-2" style={{ fontFamily: FD }}>
              Registrar Nuevo Cliente
            </h3>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-6" style={{ fontFamily: FM }}>
              // Generar ficha de membresía y clave
            </p>

            {errorForm && (
              <div className="mb-4 px-4 py-2 bg-red-950/20 border border-red-900/50 text-red-500 rounded text-xs" style={{ fontFamily: FB }}>
                {errorForm}
              </div>
            )}

            {exitoMsg && (
              <div className="mb-4 px-4 py-3 bg-green-950/20 border border-green-900/50 text-green-400 rounded text-xs space-y-1" style={{ fontFamily: FB }}>
                <p className="font-bold">{exitoMsg}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">// Comparte estos accesos con el nuevo cliente.</p>
              </div>
            )}

            {!exitoMsg ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Sofía López"
                      className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white focus:border-orange-500/50"
                      style={{ fontFamily: FB }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ej: +502 87654321"
                      className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white focus:border-orange-500/50"
                      style={{ fontFamily: FB }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sofia@email.com"
                      className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white focus:border-orange-500/50"
                      style={{ fontFamily: FB }}
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                      Contraseña Temporal
                    </label>
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white focus:border-orange-500/50 font-mono"
                      style={{ fontFamily: FM }}
                    />
                  </div>
                </div>

                <div className="p-3 border border-zinc-800 bg-zinc-900/40 rounded-lg space-y-3">
                  <p className="text-[10px] uppercase text-zinc-500 tracking-wider font-mono">// Configuración de Membresía</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                        Tipo de Plan
                      </label>
                      <select
                        value={membresia}
                        onChange={(e) => setMembresia(e.target.value)}
                        className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white focus:border-orange-500/50"
                        style={{ fontFamily: FB }}
                      >
                        <option value="Mensual">Mensual</option>
                        <option value="Trimestral">Trimestral</option>
                        <option value="Semestral">Semestral</option>
                        <option value="Anual">Anual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                        Fecha de Vencimiento
                      </label>
                      <input
                        type="date"
                        required
                        value={fechaVencimiento}
                        onChange={(e) => setFechaVencimiento(e.target.value)}
                        className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white focus:border-orange-500/50"
                        style={{ fontFamily: FB }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setAbrirModal(false)}
                    className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded text-xs font-bold uppercase transition-colors cursor-pointer"
                    style={{ fontFamily: FB }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando}
                    className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white cursor-pointer hover:brightness-110 transition-all disabled:opacity-50"
                    style={{
                      background: O,
                      clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                      ...bg(O, 0.4),
                      fontFamily: FD,
                    }}
                  >
                    {guardando ? "Registrando..." : "Registrar Cliente"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setAbrirModal(false);
                    setExitoMsg("");
                  }}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white cursor-pointer hover:brightness-110 transition-all"
                  style={{
                    background: O,
                    clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                    ...bg(O, 0.4),
                    fontFamily: FD,
                  }}
                >
                  Entendido / Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
