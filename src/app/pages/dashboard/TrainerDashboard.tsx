import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { collection, query, where, getDocs, addDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import {
  crearClase,
  obtenerClasesPorEntrenador,
  eliminarClase,
  type Clase,
} from "../../../services/clasesService";
import {
  crearTicket,
  type Ticket,
} from "../../../services/ticketsService";
import {
  listarUsuariosPorRol,
} from "../../../services/usuariosService";
import {
  guardarRutina,
  obtenerRutinasPorUsuario,
} from "../../../services/rutinasService";
import { bancoEjercicios, type Ejercicio } from "../../data/bancoEjercicios";
import { FD, FB, FM, G, R, bg, tg } from "../../components/common/styleConstants";

export default function TrainerDashboard() {
  const { usuario, datosUsuario } = useAuth();
  
  // Pestañas del Entrenador
  const [pestana, setPestana] = useState<"clases" | "clientes" | "tickets">("clases");

  // Estados de Clases
  const [clases, setClases] = useState<(Clase & { id: string })[]>([]);
  const [cargandoClases, setCargandoClases] = useState(true);
  const [abrirModalClase, setAbrirModalClase] = useState(false);
  const [nombreClase, setNombreClase] = useState("");
  const [descClase, setDescClase] = useState("");
  const [horarioClase, setHorarioClase] = useState("");
  const [cupoClase, setCupoClase] = useState(15);
  const [guardandoClase, setGuardandoClase] = useState(false);

  // Estados de Clientes y Rutinas
  const [clientes, setClientes] = useState<any[]>([]);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  
  // Modal de Asignación de Rutina
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any | null>(null);
  const [abrirModalRutina, setAbrirModalRutina] = useState(false);
  const [ejerciciosSeleccionados, setEjerciciosSeleccionados] = useState<string[]>([]);
  const [nombreRutina, setNombreRutina] = useState("Mi Rutina Personalizada");
  const [enfoqueRutina, setEnfoqueRutina] = useState("Hipertrofia");
  const [duracionRutina, setDuracionRutina] = useState("45 min");
  const [guardandoRutina, setGuardandoRutina] = useState(false);

  // Estados de Tickets (Reportar fallas)
  const [ticketTitulo, setTicketTitulo] = useState("");
  const [ticketDescripcion, setTicketDescripcion] = useState("");
  const [ticketTipo, setTicketTipo] = useState<"Limpieza" | "Máquina" | "Otros">("Máquina");
  const [guardandoTicket, setGuardandoTicket] = useState(false);
  const [errorTicket, setErrorTicket] = useState("");
  const [exitoTicket, setExitoTicket] = useState("");

  useEffect(() => {
    if (usuario) {
      cargarClases();
    }
  }, [usuario]);

  useEffect(() => {
    if (pestana === "clientes") {
      cargarClientes();
    }
  }, [pestana]);

  async function cargarClases() {
    if (!usuario) return;
    setCargandoClases(true);
    try {
      const data = await obtenerClasesPorEntrenador(usuario.uid);
      data.sort((a, b) => {
        const tA = a.horario.toDate ? a.horario.toDate().getTime() : new Date(a.horario).getTime();
        const tB = b.horario.toDate ? b.horario.toDate().getTime() : new Date(b.horario).getTime();
        return tA - tB;
      });
      setClases(data);
    } catch (error) {
      console.error("Error al cargar clases:", error);
    } finally {
      setCargandoClases(false);
    }
  }

  async function cargarClientes() {
    setCargandoClientes(true);
    try {
      // Cargar todos los usuarios con rol 'usuario'
      const data = await listarUsuariosPorRol("usuario");
      setClientes(data);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    } finally {
      setCargandoClientes(false);
    }
  }

  async function handleEliminarClase(id: string) {
    if (!confirm("¿Deseas eliminar esta clase?")) return;
    try {
      await eliminarClase(id);
      setClases((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error al cancelar clase:", error);
    }
  }

  async function handleCrearClase(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario) return;
    setGuardandoClase(true);
    try {
      const dateObj = new Date(horarioClase);
      await crearClase({
        nombre: nombreClase,
        descripcion: descClase,
        entrenadorId: usuario.uid,
        horario: dateObj,
        cupoMaximo: Number(cupoClase),
      });
      setNombreClase("");
      setDescClase("");
      setHorarioClase("");
      setCupoClase(15);
      setAbrirModalClase(false);
      cargarClases();
    } catch (error) {
      console.error(error);
    } finally {
      setGuardandoClase(false);
    }
  }

  // Abrir modal de asignación de rutinas
  async function handleAbrirModalRutina(cliente: any) {
    setClienteSeleccionado(cliente);
    setEjerciciosSeleccionados([]);
    setNombreRutina("Rutina Personalizada");
    setAbrirModalRutina(true);

    // Cargar rutina actual de este cliente si existe para editarla
    try {
      const rutinasExistentes = await obtenerRutinasPorUsuario(cliente.id);
      if (rutinasExistentes.length > 0) {
        const ultima = rutinasExistentes[rutinasExistentes.length - 1];
        setNombreRutina(ultima.nombre);
        setEnfoqueRutina(ultima.enfoque);
        setDuracionRutina(ultima.duracion);
        setEjerciciosSeleccionados(ultima.ejerciciosIds || []);
      }
    } catch (error) {
      console.error("Error al buscar rutinas anteriores del cliente:", error);
    }
  }

  // Guardar rutina asignada al cliente
  async function handleGuardarRutinaAsignada(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteSeleccionado) return;
    if (ejerciciosSeleccionados.length === 0) {
      alert("Debes seleccionar al menos un ejercicio.");
      return;
    }
    setGuardandoRutina(true);
    try {
      await guardarRutina({
        usuarioId: clienteSeleccionado.id,
        nombre: nombreRutina,
        enfoque: enfoqueRutina,
        duracion: duracionRutina,
        ejerciciosIds: ejerciciosSeleccionados,
      });

      // Crear una notificación para el cliente informándole
      const notifRef = collection(db, "notificaciones");
      await addDoc(notifRef, {
        usuarioId: clienteSeleccionado.id,
        titulo: "Rutina Actualizada",
        mensaje: `El coach ${datosUsuario?.nombre} ha actualizado tu rutina personalizada: "${nombreRutina}".`,
        leido: false,
        fechaCreacion: new Date(),
        tipo: "sistema",
      });

      setAbrirModalRutina(false);
      alert("¡Rutina asignada y guardada con éxito!");
    } catch (error: any) {
      console.error("Error al guardar rutina:", error);
      alert("No se pudo asignar la rutina: " + (error.message || String(error)));
    } finally {
      setGuardandoRutina(false);
    }
  }

  const handleToggleEjercicio = (id: string) => {
    setEjerciciosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  async function handleCrearTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario || !datosUsuario) return;
    setGuardandoTicket(true);
    setErrorTicket("");
    setExitoTicket("");
    try {
      await crearTicket({
        usuarioId: usuario.uid,
        creadorNombre: datosUsuario.nombre,
        creadorRol: "entrenador",
        titulo: ticketTitulo,
        descripcion: ticketDescripcion,
        tipo: ticketTipo as any,
      });
      setTicketTitulo("");
      setTicketDescripcion("");
      setExitoTicket("¡Falla reportada con éxito!");
    } catch (error) {
      console.error(error);
      setErrorTicket("No se pudo registrar el reporte.");
    } finally {
      setGuardandoTicket(false);
    }
  }

  function formatearHorario(timestamp: any): string {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-white" style={{ fontFamily: FD }}>
            Módulo Entrenador / Coach
          </h1>
        </div>

        {pestana === "clases" && (
          <button
            onClick={() => setAbrirModalClase(true)}
            className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black cursor-pointer hover:brightness-110 active:scale-95 transition-all self-start md:self-auto"
            style={{
              background: G,
              clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
              ...bg(G, 0.4),
              fontFamily: FD,
            }}
          >
            + Programar Clase
          </button>
        )}
      </div>

      {/* Selector de Pestañas */}
      <div className="flex border-b border-zinc-800 gap-1" style={{ fontFamily: FB }}>
        <button
          onClick={() => setPestana("clases")}
          className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
            pestana === "clases"
              ? "border-b-2 text-green-400 bg-zinc-900/20"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          style={{ borderColor: pestana === "clases" ? G : "transparent" }}
        >
          Mis Clases
        </button>
        <button
          onClick={() => setPestana("clientes")}
          className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
            pestana === "clientes"
              ? "border-b-2 text-green-400 bg-zinc-900/20"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          style={{ borderColor: pestana === "clientes" ? G : "transparent" }}
        >
          Clientes & Rutinas
        </button>
        <button
          onClick={() => setPestana("tickets")}
          className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
            pestana === "tickets"
              ? "border-b-2 text-green-400 bg-zinc-900/20"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          style={{ borderColor: pestana === "tickets" ? G : "transparent" }}
        >
          Reportar Falla
        </button>
      </div>

      {/* PESTAÑA: Clases */}
      {pestana === "clases" && (
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-6 space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: FB }}>
            Mis Clases Programadas
          </h2>

          {cargandoClases ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${G}40`, borderTopColor: G }} />
              <span className="text-xs uppercase text-zinc-500 font-bold" style={{ fontFamily: FM }}>Cargando agenda...</span>
            </div>
          ) : clases.length === 0 ? (
            <p className="text-center text-zinc-600 uppercase text-xs tracking-wider py-8" style={{ fontFamily: FM }}>
              // No tienes clases programadas para esta semana.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clases.map((clase) => {
                const inscritosCount = clase.alumnosInscritos?.length || 0;
                const cupoLleno = inscritosCount >= clase.cupoMaximo;

                return (
                  <div
                    key={clase.id}
                    className="p-5 rounded-lg border bg-zinc-900/30 flex flex-col justify-between gap-4 transition-all hover:bg-zinc-900/50 border-zinc-800"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="text-base font-bold text-white uppercase tracking-wider line-clamp-1" style={{ fontFamily: FB }}>
                          {clase.nombre}
                        </h3>
                        <span className="text-[10px] text-zinc-500 font-mono" style={{ fontFamily: FM }}>
                          ID: {clase.id.substring(0, 5)}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 font-semibold line-clamp-2" style={{ fontFamily: FB }}>
                        {clase.descripcion || "Sin descripción."}
                      </p>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <span className="text-[10px] text-zinc-500 font-mono uppercase" style={{ fontFamily: FM }}>Horario:</span>
                          <span className="font-bold text-white uppercase">{formatearHorario(clase.horario)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500 font-mono uppercase" style={{ fontFamily: FM }}>Inscritos:</span>
                          <span className={`font-bold ${cupoLleno ? "text-red-500" : "text-emerald-400"}`}>
                            {inscritosCount} / {clase.cupoMaximo} alumnos
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end border-t border-zinc-800/50 pt-3">
                      <button
                        onClick={() => handleEliminarClase(clase.id)}
                        className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-black rounded cursor-pointer border border-zinc-800 text-zinc-500 hover:text-white hover:border-red-900 hover:bg-red-950/20 transition-all"
                        style={{ fontFamily: FM }}
                      >
                        Cancelar Clase
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA: Clientes y Rutinas */}
      {pestana === "clientes" && (
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-6 space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: FB }}>
            Clientes Activos de INGS GYM
          </h2>

          {cargandoClientes ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-zinc-700 border-t-white" />
            </div>
          ) : clientes.length === 0 ? (
            <p className="text-center text-zinc-600 uppercase text-xs tracking-wider py-8" style={{ fontFamily: FM }}>
              // No hay clientes registrados en la base de datos.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {clientes.map((c) => (
                <div key={c.id} className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/10 flex flex-col justify-between md:flex-row items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wider" style={{ fontFamily: FB }}>
                      {c.nombre}
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono" style={{ fontFamily: FM }}>{c.email}</p>
                    <p className="text-xs text-zinc-400 font-mono">Plan: {c.detallesPerfil?.membresiaTipo || "Ninguno"}</p>
                  </div>
                  <button
                    onClick={() => handleAbrirModalRutina(c)}
                    className="px-4 py-2 text-xs font-black uppercase text-black bg-green-400 cursor-pointer rounded hover:brightness-110 active:scale-95 transition-all"
                    style={{ fontFamily: FD }}
                  >
                    Asignar Rutina
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA: Reportar Falla */}
      {pestana === "tickets" && (
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-6 max-w-xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: FB }}>
              Reportar Falla en Equipamientos o Instalaciones
            </h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mt-0.5" style={{ fontFamily: FM }}>
              // Tickets de Soporte Interno
            </p>
          </div>

          {exitoTicket && (
            <div className="px-4 py-3 bg-green-950/20 border border-green-900/50 text-green-400 rounded-lg text-sm" style={{ fontFamily: FB }}>
              {exitoTicket}
            </div>
          )}
          {errorTicket && (
            <div className="px-4 py-3 bg-red-950/20 border border-red-900/50 text-red-500 rounded-lg text-sm" style={{ fontFamily: FB }}>
              {errorTicket}
            </div>
          )}

          <form onSubmit={handleCrearTicket} className="space-y-4">
            <div>
              <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                Asunto / Título
              </label>
              <input
                type="text"
                required
                value={ticketTitulo}
                onChange={(e) => setTicketTitulo(e.target.value)}
                placeholder="Ej: Caminadora #4 dañada"
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-green-500/50"
                style={{ fontFamily: FB }}
              />
            </div>

            <div>
              <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                Categoría de Falla
              </label>
              <select
                value={ticketTipo}
                onChange={(e) => setTicketTipo(e.target.value as any)}
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-green-500/50"
                style={{ fontFamily: FB }}
              >
                <option value="Máquina">Máquina Averiada</option>
                <option value="Limpieza">Falta de Limpieza</option>
                <option value="Otros">Otros Inconvenientes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                Detalles del problema
              </label>
              <textarea
                required
                value={ticketDescripcion}
                onChange={(e) => setTicketDescripcion(e.target.value)}
                placeholder="Escribe aquí las observaciones técnicas..."
                rows={4}
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-green-500/50 resize-none"
                style={{ fontFamily: FB }}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-800">
              <button
                type="submit"
                disabled={guardandoTicket}
                className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black cursor-pointer bg-green-400 hover:brightness-110 transition-all disabled:opacity-50"
                style={{
                  clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                  ...bg(G, 0.4),
                  fontFamily: FD,
                }}
              >
                {guardandoTicket ? "Registrando..." : "Enviar Reporte de Falla"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Asignar Rutina */}
      {abrirModalRutina && clienteSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-6 rounded-2xl border bg-zinc-950 border-zinc-800 flex flex-col justify-between max-h-[90vh]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black uppercase text-white" style={{ fontFamily: FD }}>
                  Asignar Rutina a {clienteSeleccionado.nombre}
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block" style={{ fontFamily: FM }}>
                  // Diseña el plan de entreno
                </span>
              </div>
              <button onClick={() => setAbrirModalRutina(false)} className="text-zinc-400 hover:text-white font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarRutinaAsignada} className="flex flex-col flex-1 overflow-hidden">
              <div className="space-y-4 overflow-y-auto flex-1 pr-2 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                      Nombre de la Rutina
                    </label>
                    <input
                      type="text"
                      required
                      value={nombreRutina}
                      onChange={(e) => setNombreRutina(e.target.value)}
                      placeholder="Ej: Rutina de Fuerza"
                      className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none"
                      style={{ fontFamily: FB }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                      Objetivo / Enfoque
                    </label>
                    <select
                      value={enfoqueRutina}
                      onChange={(e) => setEnfoqueRutina(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none"
                      style={{ fontFamily: FB }}
                    >
                      <option value="Hipertrofia">Hipertrofia</option>
                      <option value="Fuerza">Fuerza</option>
                      <option value="Resistencia">Resistencia</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                    Duración Sesión
                  </label>
                  <select
                    value={duracionRutina}
                    onChange={(e) => setDuracionRutina(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none"
                    style={{ fontFamily: FB }}
                  >
                    <option value="30 min">30 min (Express)</option>
                    <option value="45 min">45 min (Estándar)</option>
                    <option value="60 min">60 min (Completo)</option>
                  </select>
                </div>

                {/* Selector de Ejercicios del Banco */}
                <div className="space-y-2">
                  <span className="block text-xs uppercase text-zinc-400 font-bold" style={{ fontFamily: FB }}>
                    Seleccionar Ejercicios del Banco
                  </span>
                  <div className="grid gap-2 grid-cols-2 max-h-[30vh] overflow-y-auto p-2 border border-zinc-900 rounded bg-zinc-950">
                    {bancoEjercicios.map((ej) => {
                      const seleccionado = ejerciciosSeleccionados.includes(ej.id);
                      return (
                        <div
                          key={ej.id}
                          onClick={() => handleToggleEjercicio(ej.id)}
                          className={`p-2.5 rounded border text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-between ${
                            seleccionado
                              ? "bg-green-950/20 border-green-500 text-green-400"
                              : "bg-zinc-900/30 border-zinc-900 text-zinc-500 hover:text-zinc-300"
                          }`}
                          style={{ fontFamily: FB }}
                        >
                          <span>{ej.nombre}</span>
                          <span className="text-[9px] font-mono uppercase" style={{ fontFamily: FM }}>
                            {ej.musculo}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAbrirModalRutina(false)}
                  className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded text-xs font-bold uppercase transition-colors cursor-pointer"
                  style={{ fontFamily: FB }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoRutina}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black bg-green-400 cursor-pointer hover:brightness-110 transition-all disabled:opacity-50"
                  style={{
                    clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                    ...bg(G, 0.4),
                    fontFamily: FD,
                  }}
                >
                  {guardandoRutina ? "Guardando..." : "Asignar a Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Crear Clase */}
      {abrirModalClase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="w-full max-w-md p-6 rounded-2xl border bg-zinc-950 relative"
            style={{ borderColor: `${G}30`, ...bg(G, 0.4) }}
          >
            <button
              onClick={() => setAbrirModalClase(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-xl font-black uppercase tracking-wider text-white mb-2" style={{ fontFamily: FD }}>
              Programar Nueva Clase
            </h3>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-6" style={{ fontFamily: FM }}>
              // Registrar horario e itinerario
            </p>

            <form onSubmit={handleCrearClase} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                  Nombre de la Clase
                </label>
                <input
                  type="text"
                  required
                  value={nombreClase}
                  onChange={(e) => setNombreClase(e.target.value)}
                  placeholder="Ej: Crossfit Funcional, Spinning Pro"
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white focus:border-green-500/50"
                  style={{ fontFamily: FB }}
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                  Descripción
                </label>
                <textarea
                  value={descClase}
                  onChange={(e) => setDescClase(e.target.value)}
                  placeholder="Describe el enfoque y requisitos de la clase..."
                  rows={3}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white focus:border-green-500/50 resize-none"
                  style={{ fontFamily: FB }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                    Fecha y Hora
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={horarioClase}
                    onChange={(e) => setHorarioClase(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white focus:border-green-500/50"
                    style={{ fontFamily: FB }}
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                    Cupo Máximo (Alumnos)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={cupoClase}
                    onChange={(e) => setCupoClase(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white focus:border-green-500/50"
                    style={{ fontFamily: FB }}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAbrirModalClase(false)}
                  className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded text-xs font-bold uppercase transition-colors cursor-pointer"
                  style={{ fontFamily: FB }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoClase}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black cursor-pointer hover:brightness-110 transition-all disabled:opacity-50"
                  style={{
                    background: G,
                    clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                    ...bg(G, 0.4),
                    fontFamily: FD,
                  }}
                >
                  {guardandoClase ? "Programando..." : "Programar Clase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
