import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  obtenerClases,
  inscribirAlumno,
  desinscribirAlumno,
  type Clase,
} from "../../../services/clasesService";
import { FD, FB, FM, R, G, Y, O, bg, tg } from "../../components/common/styleConstants";

export default function UserDashboard() {
  const { usuario, datosUsuario } = useAuth();
  const [clases, setClases] = useState<(Clase & { id: string })[]>([]);
  const [cargandoClases, setCargandoClases] = useState(true);
  const [errorAccion, setErrorAccion] = useState("");
  const [exitoAccion, setExitoAccion] = useState("");
  const [filtroClase, setFiltroClase] = useState<"todas" | "mis">("todas");

  useEffect(() => {
    if (usuario) {
      cargarClases();
    }
  }, [usuario]);

  async function cargarClases() {
    setCargandoClases(true);
    try {
      const data = await obtenerClases();
      // Ordenar por horario
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

  // Cálculos de membresía
  const vencimiento = datosUsuario?.detallesPerfil?.fechaVencimiento;
  let diasRestantes = 0;
  let estaActivo = false;
  
  if (vencimiento) {
    const vencimientoDate = vencimiento.toDate ? vencimiento.toDate() : new Date(vencimiento);
    const hoy = new Date();
    // Poner horas a 0 en hoy para cálculo exacto
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

  // Clases que el usuario está inscrito
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
          {/* Luces neón fondo */}
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

      {/* Sección de Clases */}
      <div className="border border-zinc-800 rounded-2xl bg-zinc-950 p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: FB }}>
              Clases Colectivas
            </h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mt-0.5" style={{ fontFamily: FM }}>
              // Reserva tu cupo para las sesiones diarias
            </p>
          </div>

          {/* Toggle Filtro Clases */}
          <div className="flex border border-zinc-800 rounded p-1 bg-zinc-900 gap-1" style={{ fontFamily: FM }}>
            <button
              onClick={() => setFiltroClase("todas")}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                filtroClase === "todas" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Todas las Clases
            </button>
            <button
              onClick={() => setFiltroClase("mis")}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                filtroClase === "mis" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Mis Inscripciones ({misClases.length})
            </button>
          </div>
        </div>

        {cargandoClases ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${R}40`, borderTopColor: R }} />
            <span className="text-xs uppercase text-zinc-500 font-bold" style={{ fontFamily: FM }}>Cargando agenda de clases...</span>
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
    </div>
  );
}
