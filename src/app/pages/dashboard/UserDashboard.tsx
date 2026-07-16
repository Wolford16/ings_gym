import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  obtenerClases,
  inscribirAlumno,
  desinscribirAlumno,
  type Clase,
} from "../../../services/clasesService";
import {
  obtenerPagosPorUsuario,
  type Pago,
} from "../../../services/pagosService";
import {
  crearTicket,
  obtenerTicketsPorUsuario,
  type Ticket,
} from "../../../services/ticketsService";
import {
  verificarEncuestaRespondida,
  registrarEncuesta,
} from "../../../services/encuestasService";
import { FD, FB, FM, R, G, Y, O, bg, tg } from "../../components/common/styleConstants";

export default function UserDashboard() {
  const { usuario, datosUsuario } = useAuth();

  // Navegación interna del dashboard de usuario
  const [seccionInterna, setSeccionInterna] = useState<"clases" | "pagos" | "tickets">("clases");

  // Estados de Clases
  const [clases, setClases] = useState<(Clase & { id: string })[]>([]);
  const [cargandoClases, setCargandoClases] = useState(true);
  const [filtroClase, setFiltroClase] = useState<"todas" | "mis">("todas");

  // Estados de Pagos
  const [pagos, setPagos] = useState<(Pago & { id: string })[]>([]);
  const [cargandoPagos, setCargandoPagos] = useState(false);

  // Estados de Tickets
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cargandoTickets, setCargandoTickets] = useState(false);
  const [abrirModalTicket, setAbrirModalTicket] = useState(false);
  const [ticketTitulo, setTicketTitulo] = useState("");
  const [ticketDescripcion, setTicketDescripcion] = useState("");
  const [ticketTipo, setTicketTipo] = useState<"Limpieza" | "Máquina" | "Sugerencia" | "Otros">("Máquina");
  const [guardandoTicket, setGuardandoTicket] = useState(false);

  // Estados de Encuesta
  const [mostrarEncuesta, setMostrarEncuesta] = useState(false);
  const [estrellas, setEstrellas] = useState(5);
  const [sugerenciaEncuesta, setSugerenciaEncuesta] = useState("");
  const [mesEncuestaActual, setMesEncuestaActual] = useState("");

  const [errorAccion, setErrorAccion] = useState("");
  const [exitoAccion, setExitoAccion] = useState("");

  // Cargar Clases y verificar Encuesta
  useEffect(() => {
    if (usuario) {
      cargarClases();
      comprobarEncuesta();
    }
  }, [usuario]);

  // Cargar datos según pestaña
  useEffect(() => {
    if (usuario) {
      if (seccionInterna === "pagos") {
        cargarPagos();
      } else if (seccionInterna === "tickets") {
        cargarTickets();
      }
    }
  }, [usuario, seccionInterna]);

  // Comprobar si ya respondió la encuesta de este mes
  async function comprobarEncuesta() {
    if (!usuario) return;
    const hoy = new Date();
    const mesStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
    setMesEncuestaActual(mesStr);
    try {
      const yaRespondida = await verificarEncuestaRespondida(usuario.uid, mesStr);
      if (!yaRespondida) {
        setMostrarEncuesta(true);
      }
    } catch (error) {
      console.error("Error al comprobar encuesta:", error);
    }
  }

  // Guardar encuesta
  async function handleEnviarEncuesta() {
    if (!usuario) return;
    try {
      await registrarEncuesta({
        usuarioId: usuario.uid,
        mes: mesEncuestaActual,
        calificacion: estrellas,
      });
      setMostrarEncuesta(false);
      alert("¡Gracias por tu calificación! Nos ayuda a mejorar.");
    } catch (error) {
      console.error("Error al registrar encuesta:", error);
    }
  }

  async function cargarClases() {
    setCargandoClases(true);
    try {
      const data = await obtenerClases();
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

  async function cargarPagos() {
    if (!usuario) return;
    setCargandoPagos(true);
    try {
      const data = await obtenerPagosPorUsuario(usuario.uid);
      setPagos(data);
    } catch (error) {
      console.error("Error al cargar pagos:", error);
    } finally {
      setCargandoPagos(false);
    }
  }

  async function cargarTickets() {
    if (!usuario) return;
    setCargandoTickets(true);
    try {
      const data = await obtenerTicketsPorUsuario(usuario.uid);
      setTickets(data);
    } catch (error) {
      console.error("Error al cargar tickets:", error);
    } finally {
      setCargandoTickets(false);
    }
  }

  async function handleInscripcion(claseId: string) {
    if (!usuario) return;
    setErrorAccion("");
    setExitoAccion("");
    try {
      await inscribirAlumno(claseId, usuario.uid);
      setExitoAccion("¡Inscripción exitosa! Te hemos reservado un cupo.");
      cargarClases();
    } catch (error: any) {
      setErrorAccion(error.message || "No se pudo realizar la inscripción.");
    }
  }

  async function handleCancelacion(claseId: string) {
    if (!usuario) return;
    setErrorAccion("");
    setExitoAccion("");
    try {
      await desinscribirAlumno(claseId, usuario.uid);
      setExitoAccion("Inscripción cancelada. Cupo liberado.");
      cargarClases();
    } catch (error: any) {
      setErrorAccion(error.message || "No se pudo cancelar la inscripción.");
    }
  }

  async function handleCrearTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario || !datosUsuario) return;
    setGuardandoTicket(true);
    try {
      await crearTicket({
        usuarioId: usuario.uid,
        creadorNombre: datosUsuario.nombre,
        creadorRol: "usuario",
        titulo: ticketTitulo,
        descripcion: ticketDescripcion,
        tipo: ticketTipo,
      });
      setTicketTitulo("");
      setTicketDescripcion("");
      setAbrirModalTicket(false);
      setExitoAccion("¡Ticket reportado con éxito! El administrador lo revisará.");
      cargarTickets();
    } catch (error: any) {
      console.error(error);
      setErrorAccion("No se pudo enviar el reporte.");
    } finally {
      setGuardandoTicket(false);
    }
  }

  // Cálculos de membresía
  const vencimiento = datosUsuario?.detallesPerfil?.fechaVencimiento;
  let diasRestantes = 0;
  let estaActivo = false;

  if (vencimiento) {
    const vencimientoDate = vencimiento.toDate ? vencimiento.toDate() : new Date(vencimiento);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const difMs = vencimientoDate.getTime() - hoy.getTime();
    diasRestantes = Math.ceil(difMs / (1000 * 60 * 60 * 24));
    estaActivo = diasRestantes > 0 && datosUsuario.estado === "activo";
  }

  function formatearFecha(timestamp: any): string {
    if (!timestamp) return "No disponible";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
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

  const misClases = clases.filter(
    (c) => usuario && c.alumnosInscritos?.includes(usuario.uid)
  );

  const clasesAMostrar = filtroClase === "todas" ? clases : misClases;

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black uppercase tracking-wider text-white" style={{ fontFamily: FD }}>
          Mi Panel de Cliente
        </h1>
        <p className="text-zinc-500 text-sm uppercase tracking-widest" style={{ fontFamily: FM }}>
          // Acceso rápido y clases del socio
        </p>
      </div>

      {/* Grid Superior: Carnet y Estado */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Carnet Digital Premium */}
        <div
          className="relative overflow-hidden p-6 rounded-2xl border col-span-2 flex flex-col justify-between min-h-[220px]"
          style={{
            background: "linear-gradient(135deg, #121212 0%, #0d0d0d 100%)",
            borderColor: estaActivo ? `${G}30` : `${R}30`,
            ...bg(estaActivo ? G : R, 0.4),
          }}
        >
          <div
            className="absolute top-0 right-0 w-[120px] h-[120px] rounded-full blur-[80px] pointer-events-none opacity-20"
            style={{ background: estaActivo ? G : R }}
          />

          <div className="flex justify-between items-start z-10">
            <div>
              <span
                className="text-[10px] tracking-widest uppercase font-mono text-zinc-500 block mb-1"
                style={{ fontFamily: FM }}
              >
                // SOCIO ACTIVO INGS GYM
              </span>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider" style={{ fontFamily: FD }}>
                {datosUsuario?.nombre}
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-1" style={{ fontFamily: FM }}>
                ID: {usuario?.uid.substring(0, 10)}... | {datosUsuario?.email}
              </p>
            </div>
            <div className="text-right">
              <span
                className="text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-widest"
                style={{
                  backgroundColor: estaActivo ? `${G}20` : `${R}20`,
                  color: estaActivo ? G : R,
                  fontFamily: FM,
                }}
              >
                {estaActivo ? "MEMBRESÍA ACTIVA" : "MEMBRESÍA VENCIDA"}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-6 z-10">
            <div>
              <p className="text-zinc-500 text-[10px] uppercase tracking-wider" style={{ fontFamily: FM }}>
                Plan Contratado
              </p>
              <p className="text-lg font-bold text-white uppercase" style={{ fontFamily: FB }}>
                {datosUsuario?.detallesPerfil?.membresiaTipo || "Sin membresía"}
              </p>
              <p className="text-zinc-500 text-xs mt-0.5" style={{ fontFamily: FB }}>
                Vence el {formatearFecha(vencimiento)}
              </p>
            </div>

            {/* Código de Barras Cyberpunk Estético */}
            <div className="flex flex-col items-center gap-1.5 self-start md:self-auto">
              <div className="flex items-center gap-0.5 h-8 bg-white/5 p-1 rounded">
                {[2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 1, 2, 3].map((w, idx) => (
                  <div
                    key={idx}
                    className="bg-white h-full"
                    style={{ width: `${w}px`, opacity: idx % 3 === 0 ? 0.3 : 0.8 }}
                  />
                ))}
              </div>
              <span className="text-[8px] font-mono text-zinc-500 tracking-[3px] uppercase" style={{ fontFamily: FM }}>
                *INGS-{usuario?.uid.substring(0, 5)}*
              </span>
            </div>
          </div>
        </div>

        {/* Tarjeta de días restantes */}
        <div
          className="p-6 rounded-2xl border flex flex-col justify-between"
          style={{
            background: "#0c0c0c",
            borderColor: "#181818",
          }}
        >
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400" style={{ fontFamily: FB }}>
              Tiempo Restante
            </h3>
            <p className="text-zinc-500 text-[10px] uppercase font-mono mt-1" style={{ fontFamily: FM }}>
              // Acceso al Centro deportivo
            </p>
          </div>

          <div className="my-4">
            <span
              className="text-6xl font-black block tracking-tighter"
              style={{
                fontFamily: FD,
                color: estaActivo ? G : R,
                ...tg(estaActivo ? G : R, 0.4),
              }}
            >
              {estaActivo ? diasRestantes : 0}
            </span>
            <span className="text-xs uppercase text-zinc-500 font-bold block mt-1" style={{ fontFamily: FB }}>
              Días de Entrenamiento
            </span>
          </div>

          <div className="text-xs text-zinc-400 font-semibold" style={{ fontFamily: FB }}>
            {estaActivo
              ? "¡Sigue entrenando duro para alcanzar tus objetivos!"
              : "Tu membresía ha expirado. Por favor, renuévala en la recepción."}
          </div>
        </div>
      </div>

      {/* Alertas */}
      {errorAccion && (
        <div className="px-4 py-3 bg-red-950/20 border border-red-900/50 text-red-500 rounded-lg text-sm" style={{ fontFamily: FB }}>
          {errorAccion}
        </div>
      )}
      {exitoAccion && (
        <div className="px-4 py-3 bg-emerald-950/20 border border-emerald-900/50 text-emerald-400 rounded-lg text-sm" style={{ fontFamily: FB }}>
          {exitoAccion}
        </div>
      )}

      {/* Selector de Navegación Interna */}
      <div className="flex border-b border-zinc-800 gap-1" style={{ fontFamily: FB }}>
        <button
          onClick={() => setSeccionInterna("clases")}
          className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${seccionInterna === "clases" ? "border-b-2 text-white bg-zinc-900/20 border-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
        >
          Clases Colectivas
        </button>
        <button
          onClick={() => setSeccionInterna("pagos")}
          className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${seccionInterna === "pagos" ? "border-b-2 text-white bg-zinc-900/20 border-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
        >
          Historial de Pagos
        </button>
        <button
          onClick={() => setSeccionInterna("tickets")}
          className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${seccionInterna === "tickets" ? "border-b-2 text-white bg-zinc-900/20 border-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
        >
          Soporte / Tickets
        </button>
      </div>

      {/* SECCIÓN INTERNA: Clases */}
      {seccionInterna === "clases" && (
        <div className="border border-zinc-800 rounded-2xl bg-zinc-950 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: FB }}>
                Listado de Clases
              </h2>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mt-0.5" style={{ fontFamily: FM }}>
                // Reserva tu cupo para las sesiones diarias
              </p>
            </div>

            <div className="flex border border-zinc-800 rounded p-1 bg-zinc-900 gap-1" style={{ fontFamily: FM }}>
              <button
                onClick={() => setFiltroClase("todas")}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${filtroClase === "todas" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
              >
                Todas las Clases
              </button>
              <button
                onClick={() => setFiltroClase("mis")}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${filtroClase === "mis" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
              >
                Mis Inscripciones ({misClases.length})
              </button>
            </div>
          </div>

          {cargandoClases ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${R}40`, borderTopColor: R }} />
              <span className="text-xs uppercase text-zinc-500 font-bold" style={{ fontFamily: FM }}>Cargando agenda...</span>
            </div>
          ) : clasesAMostrar.length === 0 ? (
            <p className="text-center text-zinc-600 uppercase text-xs tracking-wider py-12" style={{ fontFamily: FM }}>
              {filtroClase === "mis"
                ? "// No estás inscrito en ninguna clase todavía."
                : "// No hay clases programadas disponibles."}
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clasesAMostrar.map((clase) => {
                const inscritosCount = clase.alumnosInscritos?.length || 0;
                const cupoLleno = inscritosCount >= clase.cupoMaximo;
                const yaInscrito = usuario && clase.alumnosInscritos?.includes(usuario.uid);

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
                        {yaInscrito && (
                          <span
                            className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded tracking-widest bg-emerald-950 text-emerald-400 border border-emerald-900"
                            style={{ fontFamily: FM }}
                          >
                            INSCRITO
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 font-semibold line-clamp-2" style={{ fontFamily: FB }}>
                        {clase.descripcion || "Sin descripción."}
                      </p>

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500 font-mono uppercase" style={{ fontFamily: FM }}>Horario:</span>
                          <span className="font-bold text-white uppercase">{formatearHorario(clase.horario)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500 font-mono uppercase" style={{ fontFamily: FM }}>Cupo:</span>
                          <span className={`font-bold ${cupoLleno ? "text-red-500" : "text-emerald-400"}`}>
                            {inscritosCount} / {clase.cupoMaximo} alumnos
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end border-t border-zinc-800/50 pt-3">
                      {yaInscrito ? (
                        <button
                          onClick={() => handleCancelacion(clase.id)}
                          className="w-full py-2 text-[10px] uppercase tracking-widest font-black rounded cursor-pointer border border-zinc-800 hover:border-red-900/50 hover:bg-red-950/20 text-red-500 hover:text-red-400 transition-all text-center"
                          style={{ fontFamily: FM }}
                        >
                          Cancelar Inscripción
                        </button>
                      ) : (
                        <button
                          onClick={() => handleInscripcion(clase.id)}
                          disabled={cupoLleno || !estaActivo}
                          className="w-full py-2 text-[10px] uppercase tracking-widest font-black rounded cursor-pointer text-center bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ fontFamily: FM }}
                        >
                          {cupoLleno
                            ? "Clase Llena"
                            : !estaActivo
                              ? "Membresía Vencida"
                              : "Inscribirme"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN INTERNA: Pagos */}
      {seccionInterna === "pagos" && (
        <div className="border border-zinc-800 rounded-2xl bg-zinc-950 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: FB }}>
              Historial de Transacciones
            </h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mt-0.5" style={{ fontFamily: FM }}>
              // Registro de tus mensualidades
            </p>
          </div>

          {cargandoPagos ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-zinc-700 border-t-white" />
            </div>
          ) : pagos.length === 0 ? (
            <p className="text-center text-zinc-600 uppercase text-xs tracking-wider py-12" style={{ fontFamily: FM }}>
              // No tienes transacciones registradas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-widest text-[10px]" style={{ fontFamily: FM }}>
                    <th className="py-3 px-4">Concepto</th>
                    <th className="py-3 px-4">Método de Pago</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 font-mono text-xs">
                  {pagos.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-900/10">
                      <td className="py-4 px-4 text-white uppercase font-bold">{p.concepto}</td>
                      <td className="py-4 px-4 text-zinc-400 uppercase">{p.metodoPago}</td>
                      <td className="py-4 px-4 text-zinc-400">
                        {p.fechaPago?.toDate ? p.fechaPago.toDate().toLocaleDateString("es-ES") : ""}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-green-400">${p.monto}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN INTERNA: Tickets */}
      {seccionInterna === "tickets" && (
        <div className="border border-zinc-800 rounded-2xl bg-zinc-950 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: FB }}>
                Reportes de Soporte / Tickets
              </h2>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mt-0.5" style={{ fontFamily: FM }}>
                // Informa de fallos en el gimnasio
              </p>
            </div>
            <button
              onClick={() => setAbrirModalTicket(true)}
              className="px-4 py-2 text-xs font-black uppercase text-white tracking-wider border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
              style={{ fontFamily: FB }}
            >
              Reportar Inconveniente
            </button>
          </div>

          {cargandoTickets ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-zinc-700 border-t-white" />
            </div>
          ) : tickets.length === 0 ? (
            <p className="text-center text-zinc-600 uppercase text-xs tracking-wider py-12" style={{ fontFamily: FM }}>
              // No has creado ningún reporte de ticket.
            </p>
          ) : (
            <div className="space-y-4">
              {tickets.map((t) => (
                <div key={t.id} className="p-4 rounded-lg bg-zinc-900/20 border border-zinc-900 flex flex-col justify-between md:flex-row gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white uppercase text-sm">{t.titulo}</span>
                      <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-zinc-900 text-zinc-400 rounded">
                        {t.tipo}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{t.descripcion}</p>
                    {t.asignadoNombre && (
                      <p className="text-[10px] text-zinc-500 font-mono">
                        Asignado a: <span className="text-zinc-300">{t.asignadoNombre}</span>
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0 flex flex-col justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-mono block uppercase">Estado:</span>
                      <span
                        className={`text-xs font-black uppercase tracking-wider ${t.estado === "pendiente"
                          ? "text-yellow-500"
                          : t.estado === "proceso"
                            ? "text-orange-500"
                            : "text-green-400"
                          }`}
                      >
                        {t.estado}
                      </span>
                    </div>
                    <span className="text-[9px] text-zinc-600 font-mono block">
                      {t.fechaCreacion?.toDate ? t.fechaCreacion.toDate().toLocaleDateString("es-ES") : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Crear Ticket */}
      {abrirModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl border bg-zinc-950 border-zinc-800">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-black uppercase text-white" style={{ fontFamily: FD }}>
                  Reportar Inconveniente
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block" style={{ fontFamily: FM }}>
                  // Tickets de Soporte
                </span>
              </div>
              <button onClick={() => setAbrirModalTicket(false)} className="text-zinc-400 hover:text-white font-bold cursor-pointer">
                ✕
              </button>
            </div>

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
                  placeholder="Ej: Máquina de poleas rota"
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-red-500/50"
                  style={{ fontFamily: FB }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                    Categoría
                  </label>
                  <select
                    value={ticketTipo}
                    onChange={(e) => setTicketTipo(e.target.value as any)}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-red-500/50"
                    style={{ fontFamily: FB }}
                  >
                    <option value="Máquina">Máquina averiada</option>
                    <option value="Limpieza">Limpieza</option>
                    <option value="Sugerencia">Sugerencia</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                  Detalle del problema
                </label>
                <textarea
                  required
                  value={ticketDescripcion}
                  onChange={(e) => setTicketDescripcion(e.target.value)}
                  placeholder="Por favor describe lo que ocurre..."
                  rows={4}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-red-500/50 resize-none"
                  style={{ fontFamily: FB }}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAbrirModalTicket(false)}
                  className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded text-xs font-bold uppercase transition-colors cursor-pointer"
                  style={{ fontFamily: FB }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoTicket}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white cursor-pointer bg-red-600 hover:brightness-110 transition-all disabled:opacity-50"
                  style={{
                    clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                    ...bg(R, 0.4),
                    fontFamily: FD,
                  }}
                >
                  {guardandoTicket ? "Enviando..." : "Enviar Reporte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Encuesta mensual de Satisfacción */}
      {mostrarEncuesta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div
            className="w-full max-w-md p-6 rounded-2xl border bg-zinc-950 text-center space-y-6 relative"
            style={{ borderColor: `${Y}30`, ...bg(Y, 0.4) }}
          >
            <div>
              <h3 className="text-xl font-black uppercase text-white" style={{ fontFamily: FD }}>
                Encuesta de Satisfacción
              </h3>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mt-1" style={{ fontFamily: FM }}>
                // Queremos conocer tu opinión mensual
              </p>
            </div>

            <p className="text-sm text-zinc-300" style={{ fontFamily: FB }}>
              ¿Cómo calificarías tu experiencia en INGS GYM este mes?
            </p>

            {/* Estrellas interactiva */}
            <div className="flex justify-center gap-2 text-3xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setEstrellas(star)}
                  className="transition-transform hover:scale-125 cursor-pointer text-yellow-500"
                >
                  {star <= estrellas ? "★" : "☆"}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setMostrarEncuesta(false)}
                className="px-4 py-2 border border-zinc-800 text-zinc-500 hover:text-zinc-300 rounded text-xs font-bold uppercase transition-colors cursor-pointer"
                style={{ fontFamily: FB }}
              >
                Omitir
              </button>
              <button
                onClick={handleEnviarEncuesta}
                className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black cursor-pointer"
                style={{
                  background: Y,
                  clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                  ...bg(Y, 0.4),
                  fontFamily: FD,
                }}
              >
                Enviar Calificación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
