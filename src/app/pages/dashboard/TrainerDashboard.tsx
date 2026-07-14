import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Timestamp } from "firebase/firestore";
import {
  crearClase,
  obtenerClasesPorEntrenador,
  eliminarClase,
  type Clase,
} from "../../../services/clasesService";
import { FD, FB, FM, G, R, bg } from "../../components/common/styleConstants";

export default function TrainerDashboard() {
  const { usuario, datosUsuario } = useAuth();
  const [clases, setClases] = useState<(Clase & { id: string })[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [abrirModal, setAbrirModal] = useState(false);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [horario, setHorario] = useState("");
  const [cupoMaximo, setCupoMaximo] = useState(15);

  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");

  useEffect(() => {
    if (usuario) {
      cargarClases();
    }
  }, [usuario]);

  async function cargarClases() {
    if (!usuario) return;
    setCargandoLista(true);
    try {
      const data = await obtenerClasesPorEntrenador(usuario.uid);
      // Ordenar por horario ascendente
      const ordenado = data.sort((a, b) => {
        const tA = a.horario.toDate ? a.horario.toDate().getTime() : new Date(a.horario).getTime();
        const tB = b.horario.toDate ? b.horario.toDate().getTime() : new Date(b.horario).getTime();
        return tA - tB;
      });
      setClases(ordenado);
    } catch (error) {
      console.error("Error al cargar clases del entrenador:", error);
    } finally {
      setCargandoLista(false);
    }
  }

  async function handleEliminar(id: string) {
    if (!confirm("¿Estás seguro de que deseas cancelar/eliminar esta clase?")) return;
    try {
      await eliminarClase(id);
      setClases((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error al eliminar clase:", error);
      alert("No se pudo eliminar la clase.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorForm("");
    setGuardando(true);

    if (!usuario) {
      setErrorForm("No hay sesión de usuario activa.");
      setGuardando(false);
      return;
    }

    if (!horario) {
      setErrorForm("Por favor, introduce una fecha y hora para la clase.");
      setGuardando(false);
      return;
    }

    try {
      const dateObj = new Date(horario);
      await crearClase({
        nombre,
        descripcion,
        entrenadorId: usuario.uid,
        horario: dateObj,
        cupoMaximo: Number(cupoMaximo),
      });

      // Limpiar y recargar
      setNombre("");
      setDescripcion("");
      setHorario("");
      setCupoMaximo(15);
      setAbrirModal(false);
      cargarClases();
    } catch (error: any) {
      console.error(error);
      setErrorForm(error.message || "Error al crear la clase.");
    } finally {
      setGuardando(false);
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
            Mis Alumnos & Clases
          </h1>
          <p className="text-zinc-500 text-sm uppercase tracking-widest" style={{ fontFamily: FM }}>
            // Panel de Control del Entrenador
          </p>
        </div>
        <button
          onClick={() => {
            setErrorForm("");
            setAbrirModal(true);
          }}
          className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black cursor-pointer hover:brightness-110 active:scale-95 transition-all self-start md:self-auto"
          style={{
            background: G,
            color: "#000",
            clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
            ...bg(G, 0.4),
            fontFamily: FD,
          }}
        >
          + Programar Clase
        </button>
      </div>

      {/* Tarjeta Informativa Resumen del Entrenador */}
      {datosUsuario && (
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold uppercase tracking-wider text-white" style={{ fontFamily: FB }}>
              Planificación Semanal
            </h2>
            <p className="text-zinc-400 text-sm mt-1" style={{ fontFamily: FB }}>
              Aquí puedes programar clases de tu especialidad, revisar la asistencia y cupo de alumnos, y gestionar tu agenda diaria de entrenamiento.
            </p>
          </div>
          <div className="shrink-0 flex gap-2">
            <span
              className="inline-block text-xs uppercase tracking-widest px-3 py-1 font-bold rounded"
              style={{ backgroundColor: `${G}15`, color: G, fontFamily: FM }}
            >
              Turno: {datosUsuario.detallesPerfil?.horarioTurno || "Sin definir"}
            </span>
          </div>
        </div>
      )}

      {/* Lista de clases programadas */}
      <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-6 space-y-6">
        <h2 className="text-xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: FB }}>
          Mis Clases Programadas
        </h2>

        {cargandoLista ? (
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
                      onClick={() => handleEliminar(clase.id)}
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

      {/* Modal para Crear Clase */}
      {abrirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="w-full max-w-md p-6 rounded-2xl border bg-zinc-950 relative"
            style={{ borderColor: `${G}30`, ...bg(G, 0.4) }}
          >
            {/* Cerrar modal */}
            <button
              onClick={() => setAbrirModal(false)}
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

            {errorForm && (
              <div className="mb-4 px-4 py-2 bg-red-950/20 border border-red-900/50 text-red-500 rounded text-xs" style={{ fontFamily: FB }}>
                {errorForm}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                  Nombre de la Clase
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
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
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
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
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
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
                    value={cupoMaximo}
                    onChange={(e) => setCupoMaximo(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white focus:border-green-500/50"
                    style={{ fontFamily: FB }}
                  />
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
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black cursor-pointer hover:brightness-110 transition-all disabled:opacity-50"
                  style={{
                    background: G,
                    clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                    ...bg(G, 0.4),
                    fontFamily: FD,
                  }}
                >
                  {guardando ? "Programando..." : "Programar Clase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
