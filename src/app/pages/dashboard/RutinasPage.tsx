import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { bancoEjercicios, type Ejercicio } from "../../data/bancoEjercicios";
import {
  guardarRutina,
  obtenerRutinasPorUsuario,
  eliminarRutina,
  type RutinaGuardada,
} from "../../../services/rutinasService";
import { FD, FB, FM, G, R, Y, O, bg, tg } from "../../components/common/styleConstants";

export default function RutinasPage() {
  const { usuario } = useAuth();

  // Estados generales
  const [seccion, setSeccion] = useState<"presets" | "generador" | "guardadas">("presets");
  const [musculoFiltro, setMusculoFiltro] = useState<"pecho" | "espalda" | "piernas" | "hombros" | "brazos">("pecho");

  // Estados del generador
  const [grupoObjetivo, setGrupoObjetivo] = useState<"Empuje" | "Tracción" | "Piernas" | "Full Body">("Empuje");
  const [enfoque, setEnfoque] = useState<"Hipertrofia" | "Fuerza" | "Resistencia">("Hipertrofia");
  const [duracion, setDuracion] = useState<"30 min" | "45 min" | "60 min">("45 min");

  const [rutinaGenerada, setRutinaGenerada] = useState<Ejercicio[]>([]);
  const [nombreRutinaPersonalizada, setNombreRutinaPersonalizada] = useState("");
  const [guardandoRutina, setGuardandoRutina] = useState(false);
  const [exitoGuardar, setExitoGuardar] = useState("");

  // Estados de biblioteca
  const [rutinasGuardadas, setRutinasGuardadas] = useState<RutinaGuardada[]>([]);
  const [cargandoGuardadas, setCargandoGuardadas] = useState(false);
  const [rutinaExpandidaId, setRutinaExpandidaId] = useState<string | null>(null);

  // Cargar biblioteca personal
  useEffect(() => {
    if (usuario && seccion === "guardadas") {
      cargarRutinasPersonales();
    }
  }, [usuario, seccion]);

  async function cargarRutinasPersonales() {
    setCargandoGuardadas(true);
    try {
      const data = await obtenerRutinasPorUsuario(usuario!.uid);
      setRutinasGuardadas(data);
    } catch (error) {
      console.error("Error al cargar biblioteca de rutinas:", error);
    } finally {
      setCargandoGuardadas(false);
    }
  }

  // Generar rutina dinámicamente según filtros
  function handleGenerarRutina() {
    setExitoGuardar("");
    let ejerciciosCandidatos: Ejercicio[] = [];

    if (grupoObjetivo === "Empuje") {
      // Pecho, hombros, y ejercicios de tríceps (brazos_2 es tríceps)
      ejerciciosCandidatos = bancoEjercicios.filter(
        (e) => e.musculo === "pecho" || e.musculo === "hombros" || e.id === "brazos_2"
      );
    } else if (grupoObjetivo === "Tracción") {
      // Espalda y bíceps (brazos_1 es bíceps)
      ejerciciosCandidatos = bancoEjercicios.filter(
        (e) => e.musculo === "espalda" || e.id === "brazos_1"
      );
    } else if (grupoObjetivo === "Piernas") {
      ejerciciosCandidatos = bancoEjercicios.filter((e) => e.musculo === "piernas");
    } else if (grupoObjetivo === "Full Body") {
      // Tomamos de todos lados
      ejerciciosCandidatos = [...bancoEjercicios];
    }

    // Número de ejercicios según duración
    let cantidad = 4;
    if (duracion === "30 min") cantidad = 3;
    else if (duracion === "45 min") cantidad = 4;
    else if (duracion === "60 min") cantidad = 6;

    // Desordenar candidatos y tomar la cantidad necesaria
    const barajados = [...ejerciciosCandidatos].sort(() => 0.5 - Math.random());
    const seleccionados = barajados.slice(0, cantidad);

    // Ajustar series/repeticiones recomendadas según el enfoque
    const rutinaAjustada = seleccionados.map((ej) => {
      let reps = "3-4 series de 8-12 reps";
      if (enfoque === "Fuerza") {
        reps = "5 series de 5 reps (peso elevado). Descanso 3 min.";
      } else if (enfoque === "Resistencia") {
        reps = "3 series de 15-20 reps (ritmo rápido). Descanso 45s.";
      }
      return {
        ...ej,
        recomendaciones: reps,
      };
    });

    setRutinaGenerada(rutinaAjustada);
    setNombreRutinaPersonalizada(`Rutina ${grupoObjetivo} - ${enfoque}`);
  }

  // Guardar rutina generada en Firebase
  async function handleGuardarRutina() {
    if (!usuario) return;
    if (!nombreRutinaPersonalizada.trim()) {
      alert("Por favor introduce un nombre para tu rutina.");
      return;
    }
    setGuardandoRutina(true);
    try {
      await guardarRutina({
        usuarioId: usuario.uid,
        nombre: nombreRutinaPersonalizada,
        enfoque,
        duracion,
        ejerciciosIds: rutinaGenerada.map((e) => e.id),
      });
      setExitoGuardar("¡Rutina guardada con éxito en tu biblioteca!");
      setRutinaGenerada([]);
      setNombreRutinaPersonalizada("");
    } catch (error) {
      console.error("Error al guardar rutina:", error);
      alert("No se pudo guardar la rutina.");
    } finally {
      setGuardandoRutina(false);
    }
  }

  // Eliminar rutina guardada
  async function handleEliminarRutina(id: string) {
    if (!confirm("¿Deseas eliminar esta rutina de tu biblioteca?")) return;
    try {
      await eliminarRutina(id);
      setRutinasGuardadas((prev) => prev.filter((r) => r.id !== id));
      if (rutinaExpandidaId === id) setRutinaExpandidaId(null);
    } catch (error) {
      console.error("Error al eliminar rutina:", error);
    }
  }

  // Obtener los datos completos de los ejercicios de una rutina guardada
  function resolverEjerciciosDeRutina(ids: string[]): Ejercicio[] {
    return ids
      .map((id) => bancoEjercicios.find((e) => e.id === id))
      .filter((e): e is Ejercicio => e !== undefined);
  }

  // Filtrar ejercicios presets por el músculo seleccionado
  const ejerciciosPresets = bancoEjercicios.filter((e) => e.musculo === musculoFiltro);

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black uppercase tracking-wider text-white" style={{ fontFamily: FD }}>
          Zona de Entrenamiento
        </h1>
        <p className="text-zinc-500 text-sm uppercase tracking-widest" style={{ fontFamily: FM }}>
          // Biblioteca de ejercicios y creador de rutinas
        </p>
      </div>

      {/* Menú de pestañas */}
      <div className="flex border-b border-zinc-800 gap-1" style={{ fontFamily: FB }}>
        <button
          onClick={() => setSeccion("presets")}
          className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
            seccion === "presets"
              ? "border-b-2 text-red-500 bg-zinc-900/20"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          style={{ borderColor: seccion === "presets" ? R : "transparent" }}
        >
          Ejercicios por Músculo
        </button>
        <button
          onClick={() => setSeccion("generador")}
          className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
            seccion === "generador"
              ? "border-b-2 text-green-400 bg-zinc-900/20"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          style={{ borderColor: seccion === "generador" ? G : "transparent" }}
        >
          Generador de Rutinas
        </button>
        <button
          onClick={() => setSeccion("guardadas")}
          className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
            seccion === "guardadas"
              ? "border-b-2 text-orange-500 bg-zinc-900/20"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          style={{ borderColor: seccion === "guardadas" ? O : "transparent" }}
        >
          Mis Rutinas Guardadas
        </button>
      </div>

      {/* SECCIÓN 1: Ejercicios Presets */}
      {seccion === "presets" && (
        <div className="space-y-6">
          {/* Selector de músculo */}
          <div className="flex flex-wrap gap-2" style={{ fontFamily: FM }}>
            {(["pecho", "espalda", "piernas", "hombros", "brazos"] as const).map((musc) => (
              <button
                key={musc}
                onClick={() => setMusculoFiltro(musc)}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                  musculoFiltro === musc
                    ? "bg-zinc-800 text-white border border-red-500/50"
                    : "bg-zinc-950 text-zinc-500 border border-zinc-900 hover:text-zinc-300"
                }`}
              >
                {musc}
              </button>
            ))}
          </div>

          {/* Listado de Ejercicios */}
          <div className="grid gap-6 md:grid-cols-2">
            {ejerciciosPresets.map((ej) => (
              <div
                key={ej.id}
                className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/60 flex flex-col md:flex-row gap-5"
              >
                {/* Imagen del ejercicio */}
                <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden shrink-0 border border-zinc-800 bg-zinc-900 relative">
                  <img
                    src={ej.gifUrl}
                    alt={ej.nombre}
                    className="w-full h-full object-cover grayscale opacity-85 hover:grayscale-0 transition-all duration-300"
                  />
                  <span
                    className="absolute bottom-2 left-2 text-[8px] font-mono tracking-wider bg-black/80 px-1.5 py-0.5 rounded text-zinc-400"
                    style={{ fontFamily: FM }}
                  >
                    DEMO VISUAL
                  </span>
                </div>

                {/* Detalles técnicos */}
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider" style={{ fontFamily: FB }}>
                    {ej.nombre}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed" style={{ fontFamily: FB }}>
                    {ej.descripcion}
                  </p>
                  <div className="pt-2 border-t border-zinc-900 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-mono text-red-400 block" style={{ fontFamily: FM }}>
                      // Instrucción Recomendada:
                    </span>
                    <p className="text-xs text-white font-semibold" style={{ fontFamily: FB }}>
                      {ej.recomendaciones}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECCIÓN 2: Generador Inteligente */}
      {seccion === "generador" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950 grid md:grid-cols-3 gap-6">
            {/* Split */}
            <div>
              <label className="block text-xs uppercase text-zinc-400 font-bold mb-2" style={{ fontFamily: FB }}>
                División de Entrenamiento
              </label>
              <select
                value={grupoObjetivo}
                onChange={(e) => setGrupoObjetivo(e.target.value as any)}
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-green-500/50"
                style={{ fontFamily: FB }}
              >
                <option value="Empuje">Empuje (Pecho, Hombro, Tríceps)</option>
                <option value="Tracción">Tracción (Espalda, Bíceps)</option>
                <option value="Piernas">Piernas Completo</option>
                <option value="Full Body">Full Body (Cuerpo Completo)</option>
              </select>
            </div>

            {/* Enfoque */}
            <div>
              <label className="block text-xs uppercase text-zinc-400 font-bold mb-2" style={{ fontFamily: FB }}>
                Objetivo / Enfoque
              </label>
              <select
                value={enfoque}
                onChange={(e) => setEnfoque(e.target.value as any)}
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-green-500/50"
                style={{ fontFamily: FB }}
              >
                <option value="Hipertrofia">Hipertrofia (Ganancia Muscular)</option>
                <option value="Fuerza">Fuerza Máxima (Bajas Reps)</option>
                <option value="Resistencia">Resistencia & Cardio (Altas Reps)</option>
              </select>
            </div>

            {/* Duración */}
            <div>
              <label className="block text-xs uppercase text-zinc-400 font-bold mb-2" style={{ fontFamily: FB }}>
                Tiempo Disponible
              </label>
              <select
                value={duracion}
                onChange={(e) => setDuracion(e.target.value as any)}
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-green-500/50"
                style={{ fontFamily: FB }}
              >
                <option value="30 min">30 minutos (Express)</option>
                <option value="45 min">45 minutos (Estándar)</option>
                <option value="60 min">60 minutos (Completo)</option>
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                onClick={handleGenerarRutina}
                className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-black cursor-pointer hover:brightness-110 active:scale-95 transition-all"
                style={{
                  background: G,
                  clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                  ...bg(G, 0.4),
                  fontFamily: FD,
                }}
              >
                Generar Rutina Personalizada
              </button>
            </div>
          </div>

          {exitoGuardar && (
            <div className="px-4 py-3 bg-emerald-950/20 border border-emerald-900/50 text-emerald-400 rounded-lg text-sm" style={{ fontFamily: FB }}>
              {exitoGuardar}
            </div>
          )}

          {/* Rutina Generada */}
          {rutinaGenerada.length > 0 && (
            <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: FB }}>
                    Tu Rutina Generada
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5" style={{ fontFamily: FM }}>
                    // Listo para iniciar sesión de entreno
                  </p>
                </div>

                <div className="flex gap-2 items-center w-full md:w-auto">
                  <input
                    type="text"
                    value={nombreRutinaPersonalizada}
                    onChange={(e) => setNombreRutinaPersonalizada(e.target.value)}
                    placeholder="Nombre de la rutina..."
                    className="px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-green-500/50 flex-1 md:flex-none"
                    style={{ fontFamily: FB }}
                  />
                  <button
                    onClick={handleGuardarRutina}
                    disabled={guardandoRutina}
                    className="px-4 py-2 text-xs font-black uppercase text-white tracking-wider rounded border border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer"
                    style={{ fontFamily: FB }}
                  >
                    {guardandoRutina ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>

              {/* Lista de Ejercicios Generados */}
              <div className="grid gap-4">
                {rutinaGenerada.map((ej, index) => (
                  <div
                    key={ej.id}
                    className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-900 flex items-center justify-between gap-4 flex-col md:flex-row"
                  >
                    <div className="flex items-center gap-4 flex-col md:flex-row w-full">
                      <span
                        className="text-lg font-black text-green-400 font-mono w-6 text-center"
                        style={{ fontFamily: FM }}
                      >
                        0{index + 1}
                      </span>
                      <div className="w-12 h-12 rounded overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800">
                        <img src={ej.gifUrl} alt={ej.nombre} className="w-full h-full object-cover grayscale" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white uppercase text-sm tracking-wider" style={{ fontFamily: FB }}>
                          {ej.nombre}
                        </h4>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase" style={{ fontFamily: FM }}>
                          Músculo: {ej.musculo}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 w-full md:w-auto">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block" style={{ fontFamily: FM }}>
                        Configuración:
                      </span>
                      <span className="text-xs font-bold text-white uppercase" style={{ fontFamily: FB }}>
                        {ej.recomendaciones}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN 3: Biblioteca Personal */}
      {seccion === "guardadas" && (
        <div className="space-y-6">
          <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-6">
            <h2 className="text-xl font-bold uppercase tracking-wider mb-6 text-white" style={{ fontFamily: FB }}>
              Mi Biblioteca de Rutinas
            </h2>

            {cargandoGuardadas ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${O}40`, borderTopColor: O }} />
                <span className="text-xs uppercase text-zinc-500 font-bold" style={{ fontFamily: FM }}>Cargando biblioteca...</span>
              </div>
            ) : rutinasGuardadas.length === 0 ? (
              <p className="text-center text-zinc-600 uppercase text-xs tracking-wider py-8" style={{ fontFamily: FM }}>
                // No tienes rutinas personalizadas guardadas.
              </p>
            ) : (
              <div className="space-y-4">
                {rutinasGuardadas.map((rutina) => {
                  const expandida = rutinaExpandidaId === rutina.id;
                  const ejercicios = resolverEjerciciosDeRutina(rutina.ejerciciosIds);

                  return (
                    <div
                      key={rutina.id}
                      className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-900/20"
                    >
                      {/* Cabecera Rutina */}
                      <div
                        onClick={() => setRutinaExpandidaId(expandida ? null : (rutina.id || null))}
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-900/40 transition-all flex-col md:flex-row gap-3"
                      >
                        <div>
                          <h3 className="text-base font-bold text-white uppercase tracking-wider" style={{ fontFamily: FB }}>
                            {rutina.nombre}
                          </h3>
                          <div className="flex gap-3 text-[10px] text-zinc-500 font-mono uppercase mt-0.5" style={{ fontFamily: FM }}>
                            <span>Enfoque: {rutina.enfoque}</span>
                            <span>•</span>
                            <span>Duración: {rutina.duracion}</span>
                            <span>•</span>
                            <span>Ejercicios: {rutina.ejerciciosIds?.length}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEliminarRutina(rutina.id!);
                            }}
                            className="px-2 py-1 text-[10px] uppercase font-bold text-red-500 border border-red-900/30 hover:border-red-900 bg-red-950/10 hover:bg-red-950/30 rounded transition-all cursor-pointer"
                            style={{ fontFamily: FM }}
                          >
                            Eliminar
                          </button>
                          <span className="text-zinc-500 text-xs font-mono">{expandida ? "▲ Ocultar" : "▼ Desplegar"}</span>
                        </div>
                      </div>

                      {/* Detalles Ejercicios (Expandible) */}
                      {expandida && (
                        <div className="border-t border-zinc-900 p-4 bg-zinc-950/60 divide-y divide-zinc-900">
                          {ejercicios.map((ej, index) => (
                            <div key={ej.id} className="py-3 flex items-center gap-4 flex-col md:flex-row justify-between">
                              <div className="flex items-center gap-3 flex-col md:flex-row w-full">
                                <span className="text-zinc-500 font-mono text-xs">0{index + 1}</span>
                                <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded overflow-hidden shrink-0">
                                  <img src={ej.gifUrl} alt={ej.nombre} className="w-full h-full object-cover grayscale" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-white uppercase text-xs tracking-wider" style={{ fontFamily: FB }}>
                                    {ej.nombre}
                                  </h4>
                                  <p className="text-[10px] text-zinc-500" style={{ fontFamily: FB }}>{ej.descripcion.substring(0, 100)}...</p>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-green-400 uppercase shrink-0 w-full md:w-auto text-right mt-2 md:mt-0" style={{ fontFamily: FB }}>
                                {ej.recomendaciones}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
