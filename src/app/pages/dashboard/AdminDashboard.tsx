import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import {
  crearUsuario,
  listarUsuarios,
  actualizarUsuario,
} from "../../../services/usuariosService";
import {
  crearClase,
  obtenerClases,
  eliminarClase,
  type Clase,
} from "../../../services/clasesService";
import type { DatosUsuario } from "../../../contexts/AuthContext";
import { R, O, G, Y, FD, FB, FM, bg, tg } from "../../components/common/styleConstants";

export default function AdminDashboard() {
  const [pestana, setPestana] = useState<"personal" | "clases">("personal");
  const [usuarios, setUsuarios] = useState<(DatosUsuario & { id: string })[]>([]);
  const [clases, setClases] = useState<(Clase & { id: string })[]>([]);
  const [entrenadoresActivos, setEntrenadoresActivos] = useState<(DatosUsuario & { id: string })[]>([]);
  
  const [cargandoLista, setCargandoLista] = useState(true);
  const [abrirModalStaff, setAbrirModalStaff] = useState(false);
  const [abrirModalClase, setAbrirModalClase] = useState(false);

  // Estados del formulario de Staff
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState<"recepcionista" | "entrenador" | "administrador">("recepcionista");
  const [password, setPassword] = useState("Gym2026!");
  const [turno, setTurno] = useState("Mañana");
  const [especialidades, setEspecialidades] = useState("");

  const [guardandoStaff, setGuardandoStaff] = useState(false);
  const [errorStaff, setErrorStaff] = useState("");
  const [exitoStaff, setExitoStaff] = useState("");

  // Estados del formulario de Clases
  const [claseNombre, setClaseNombre] = useState("");
  const [claseDescripcion, setClaseDescripcion] = useState("");
  const [claseHorario, setClaseHorario] = useState("");
  const [claseCupo, setClaseCupo] = useState(15);
  const [claseEntrenadorId, setClaseEntrenadorId] = useState("");

  const [guardandoClase, setGuardandoClase] = useState(false);
  const [errorClase, setErrorClase] = useState("");

  // Cargar datos
  useEffect(() => {
    cargarDatos();
  }, [pestana]);

  async function cargarDatos() {
    setCargandoLista(true);
    try {
      const todosUsuarios = await listarUsuarios();
      
      // Filtrar entrenadores activos para el selector de clases
      const coaches = todosUsuarios.filter((u) => u.rol === "entrenador" && u.estado === "activo");
      setEntrenadoresActivos(coaches);

      if (pestana === "personal") {
        // Filtrar solo personal (no clientes/'usuario')
        const personal = todosUsuarios.filter((u) => u.rol !== "usuario");
        setUsuarios(personal);
      } else {
        // Cargar clases
        const todasClases = await obtenerClases();
        // Ordenar por fecha ascendente
        todasClases.sort((a, b) => {
          const tA = a.horario.toDate ? a.horario.toDate().getTime() : new Date(a.horario).getTime();
          const tB = b.horario.toDate ? b.horario.toDate().getTime() : new Date(b.horario).getTime();
          return tA - tB;
        });
        setClases(todasClases);
      }
    } catch (error) {
      console.error("Error al cargar datos del administrador:", error);
    } finally {
      setCargandoLista(false);
    }
  }

  // Activar o desactivar cuenta de staff
  async function toggleEstado(uid: string, estadoActual: string) {
    const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";
    try {
      await actualizarUsuario(uid, { estado: nuevoEstado });
      setUsuarios((prev) =>
        prev.map((u) => (u.id === uid ? { ...u, estado: nuevoEstado as any } : u))
      );
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("No se pudo actualizar el estado del usuario.");
    }
  }

  // Cancelar/Eliminar clase
  async function handleCancelarClase(id: string) {
    if (!confirm("¿Estás seguro de que deseas cancelar esta clase?")) return;
    try {
      await eliminarClase(id);
      setClases((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error al cancelar clase:", error);
      alert("No se pudo cancelar la clase.");
    }
  }

  // Guardar nuevo miembro del staff
  async function handleSubmitStaff(e: React.FormEvent) {
    e.preventDefault();
    setErrorStaff("");
    setExitoStaff("");
    setGuardandoStaff(true);

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
      secondaryApp = initializeApp(config, "temp-admin-auth");
      const secondaryAuth = getAuth(secondaryApp);

      const credenciales = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );
      const newUid = credenciales.user.uid;
      await signOut(secondaryAuth);

      const detallesPerfil: Record<string, any> = {};
      if (rol === "entrenador") {
        detallesPerfil.horarioTurno = turno;
        detallesPerfil.especialidades = especialidades
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== "");
      }

      await crearUsuario(newUid, {
        nombre,
        email,
        telefono,
        rol,
        detallesPerfil,
      });

      setExitoStaff(`¡Cuenta de ${rol} creada con éxito! Contraseña: ${password}`);
      setNombre("");
      setEmail("");
      setTelefono("");
      setEspecialidades("");
      setPassword("Gym2026!");
      
      cargarDatos();
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setErrorStaff("Este correo ya está registrado.");
      } else {
        setErrorStaff(err.message || "Error al registrar la cuenta.");
      }
    } finally {
      if (secondaryApp) {
        await secondaryApp.delete().catch(console.error);
      }
      setGuardandoStaff(false);
    }
  }

  // Guardar nueva clase
  async function handleSubmitClase(e: React.FormEvent) {
    e.preventDefault();
    setErrorClase("");
    setGuardandoClase(true);

    if (!claseEntrenadorId) {
      setErrorClase("Debes asignar un entrenador activo a la clase.");
      setGuardandoClase(false);
      return;
    }

    if (!claseHorario) {
      setErrorClase("Por favor, introduce una fecha y hora.");
      setGuardandoClase(false);
      return;
    }

    try {
      const dateObj = new Date(claseHorario);
      await crearClase({
        nombre: claseNombre,
        descripcion: claseDescripcion,
        entrenadorId: claseEntrenadorId,
        horario: dateObj,
        cupoMaximo: Number(claseCupo),
      });

      setClaseNombre("");
      setClaseDescripcion("");
      setClaseHorario("");
      setClaseCupo(15);
      setClaseEntrenadorId("");
      setAbrirModalClase(false);
      cargarDatos();
    } catch (error: any) {
      console.error(error);
      setErrorClase(error.message || "Error al crear la clase.");
    } finally {
      setGuardandoClase(false);
    }
  }

  // Buscar nombre del entrenador asignado
  function obtenerNombreEntrenador(entrenadorId: string): string {
    const coach = entrenadoresActivos.find((e) => e.id === entrenadorId);
    return coach ? coach.nombre : "Entrenador no disponible/inactivo";
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

  const badgeColores: Record<string, string> = {
    recepcionista: O,
    entrenador: G,
    administrador: Y,
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-white" style={{ fontFamily: FD }}>
            Administración Global
          </h1>
          <p className="text-zinc-500 text-sm uppercase tracking-widest" style={{ fontFamily: FM }}>
            // Control Maestro del Gimnasio
          </p>
        </div>

        {/* Botones de Acción según pestaña */}
        <div className="self-start md:self-auto">
          {pestana === "personal" ? (
            <button
              onClick={() => {
                setErrorStaff("");
                setExitoStaff("");
                setAbrirModalStaff(true);
              }}
              className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black cursor-pointer hover:brightness-110 active:scale-95 transition-all"
              style={{
                background: Y,
                clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                ...bg(Y, 0.4),
                fontFamily: FD,
              }}
            >
              + Agregar Personal
            </button>
          ) : (
            <button
              onClick={() => {
                setErrorClase("");
                setAbrirModalClase(true);
              }}
              className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black cursor-pointer hover:brightness-110 active:scale-95 transition-all"
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
      </div>

      {/* Selector de Pestañas */}
      <div className="flex border-b border-zinc-800 gap-1" style={{ fontFamily: FB }}>
        <button
          onClick={() => setPestana("personal")}
          className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
            pestana === "personal"
              ? "border-b-2 text-yellow-500 bg-zinc-900/20"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          style={{ borderColor: pestana === "personal" ? Y : "transparent" }}
        >
          Gestión de Personal
        </button>
        <button
          onClick={() => setPestana("clases")}
          className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
            pestana === "clases"
              ? "border-b-2 text-green-400 bg-zinc-900/20"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          style={{ borderColor: pestana === "clases" ? G : "transparent" }}
        >
          Gestión de Clases
        </button>
      </div>

      {/* Contenedor Pestaña: Personal */}
      {pestana === "personal" && (
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-6">
          <h2 className="text-xl font-bold uppercase tracking-wider mb-6 text-white" style={{ fontFamily: FB }}>
            Equipo de Trabajo Registrado
          </h2>

          {cargandoLista ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${Y}40`, borderTopColor: Y }} />
              <span className="text-xs uppercase text-zinc-500 font-bold" style={{ fontFamily: FM }}>Cargando staff...</span>
            </div>
          ) : usuarios.length === 0 ? (
            <p className="text-center text-zinc-600 uppercase text-xs tracking-wider py-8" style={{ fontFamily: FM }}>
              // No hay personal registrado además del administrador principal.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {usuarios.map((user) => {
                const colorRol = badgeColores[user.rol] || Y;
                return (
                  <div
                    key={user.id}
                    className="p-4 rounded-lg border bg-zinc-900/30 flex flex-col justify-between gap-4 transition-all hover:bg-zinc-900/50"
                    style={{ borderColor: `${colorRol}25` }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-bold text-white uppercase tracking-wider" style={{ fontFamily: FB }}>
                            {user.nombre}
                          </h3>
                          <p className="text-xs text-zinc-500 font-mono" style={{ fontFamily: FM }}>
                            {user.email}
                          </p>
                        </div>
                        <span
                          className="text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-widest"
                          style={{ backgroundColor: `${colorRol}15`, color: colorRol, fontFamily: FM }}
                        >
                          {user.rol}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 font-semibold" style={{ fontFamily: FB }}>
                        Teléfono: <span className="text-white">{user.telefono || "Sin registrar"}</span>
                      </p>

                      {user.rol === "entrenador" && (
                        <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/40 text-xs text-zinc-400 space-y-1">
                          <p style={{ fontFamily: FB }}>
                            Turno: <span className="text-white font-bold">{user.detallesPerfil?.horarioTurno || "Sin asignar"}</span>
                          </p>
                          {user.detallesPerfil?.especialidades && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {user.detallesPerfil.especialidades.map((esp: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] uppercase text-zinc-300 font-mono"
                                >
                                  {esp}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-800/50 pt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: user.estado === "activo" ? G : R }} />
                        <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: user.estado === "activo" ? G : R, fontFamily: FM }}>
                          {user.estado === "activo" ? "Activo" : "Inactivo"}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleEstado(user.id, user.estado)}
                        className="px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded cursor-pointer hover:bg-zinc-800/80 transition-colors border text-zinc-400 border-zinc-800 hover:text-white"
                        style={{ fontFamily: FM }}
                      >
                        {user.estado === "activo" ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Contenedor Pestaña: Clases */}
      {pestana === "clases" && (
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-6">
          <h2 className="text-xl font-bold uppercase tracking-wider mb-6 text-white" style={{ fontFamily: FB }}>
            Agenda y Clases del Gimnasio
          </h2>

          {cargandoLista ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${G}40`, borderTopColor: G }} />
              <span className="text-xs uppercase text-zinc-500 font-bold" style={{ fontFamily: FM }}>Cargando agenda...</span>
            </div>
          ) : clases.length === 0 ? (
            <p className="text-center text-zinc-600 uppercase text-xs tracking-wider py-8" style={{ fontFamily: FM }}>
              // No hay clases agendadas en este momento.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clases.map((clase) => {
                const inscritosCount = clase.alumnosInscritos?.length || 0;
                const cupoLleno = inscritosCount >= clase.cupoMaximo;
                const coachName = obtenerNombreEntrenador(clase.entrenadorId);

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
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500 font-mono uppercase" style={{ fontFamily: FM }}>Coach:</span>
                          <span className="font-bold text-yellow-500 uppercase">{coachName}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500 font-mono uppercase" style={{ fontFamily: FM }}>Horario:</span>
                          <span className="font-bold text-white uppercase">{formatearHorario(clase.horario)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500 font-mono uppercase" style={{ fontFamily: FM }}>Cupos:</span>
                          <span className={`font-bold ${cupoLleno ? "text-red-500" : "text-emerald-400"}`}>
                            {inscritosCount} / {clase.cupoMaximo}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end border-t border-zinc-800/50 pt-3">
                      <button
                        onClick={() => handleCancelarClase(clase.id)}
                        className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-black rounded cursor-pointer border border-zinc-800 text-zinc-500 hover:text-white hover:border-red-950 hover:bg-red-950/20 transition-all"
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

      {/* Modal para Crear Staff */}
      {abrirModalStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="w-full max-w-lg p-6 rounded-2xl border bg-zinc-950 relative"
            style={{ borderColor: `${Y}30`, ...bg(Y, 0.4) }}
          >
            <button
              onClick={() => setAbrirModalStaff(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-xl font-black uppercase tracking-wider text-white mb-2" style={{ fontFamily: FD }}>
              Registrar Nuevo Staff
            </h3>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-6" style={{ fontFamily: FM }}>
              // Generar credencial y configurar rol
            </p>

            {errorStaff && (
              <div className="mb-4 px-4 py-2 bg-red-950/20 border border-red-900/50 text-red-500 rounded text-xs" style={{ fontFamily: FB }}>
                {errorStaff}
              </div>
            )}

            {exitoStaff && (
              <div className="mb-4 px-4 py-3 bg-green-950/20 border border-green-900/50 text-green-400 rounded text-xs space-y-1" style={{ fontFamily: FB }}>
                <p className="font-bold">{exitoStaff}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">// Comparte estos accesos con el nuevo personal.</p>
              </div>
            )}

            {!exitoStaff ? (
              <form onSubmit={handleSubmitStaff} className="space-y-4">
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
                      placeholder="Ej: Juan Pérez"
                      className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white focus:border-yellow-500/50"
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
                      placeholder="Ej: +502 12345678"
                      className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white focus:border-yellow-500/50"
                      style={{ fontFamily: FB }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@ingsgym.com"
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white focus:border-yellow-500/50"
                    style={{ fontFamily: FB }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                      Rol del Staff
                    </label>
                    <select
                      value={rol}
                      onChange={(e) => setRol(e.target.value as any)}
                      className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white focus:border-yellow-500/50"
                      style={{ fontFamily: FB }}
                    >
                      <option value="recepcionista">Recepcionista</option>
                      <option value="entrenador">Entrenador</option>
                      <option value="administrador">Administrador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                      Contraseña Temporal
                    </label>
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white focus:border-yellow-500/50 font-mono"
                      style={{ fontFamily: FM }}
                    />
                  </div>
                </div>

                {rol === "entrenador" && (
                  <div className="p-3 border border-zinc-800 bg-zinc-900/40 rounded-lg space-y-3">
                    <p className="text-[10px] uppercase text-zinc-500 tracking-wider font-mono">// Perfil Profesional de Entrenador</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                          Turno de Trabajo
                        </label>
                        <select
                          value={turno}
                          onChange={(e) => setTurno(e.target.value)}
                          className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white"
                          style={{ fontFamily: FB }}
                        >
                          <option value="Mañana">Mañana</option>
                          <option value="Tarde">Tarde</option>
                          <option value="Noche">Noche</option>
                          <option value="Completo">Turno Completo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                          Especialidades
                        </label>
                        <input
                          type="text"
                          value={especialidades}
                          onChange={(e) => setEspecialidades(e.target.value)}
                          placeholder="Separadas por comas (Spinning, Yoga)"
                          className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white"
                          style={{ fontFamily: FB }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setAbrirModalStaff(false)}
                    className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded text-xs font-bold uppercase transition-colors cursor-pointer"
                    style={{ fontFamily: FB }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardandoStaff}
                    className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black cursor-pointer hover:brightness-110 transition-all disabled:opacity-50"
                    style={{
                      background: Y,
                      clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                      ...bg(Y, 0.4),
                      fontFamily: FD,
                    }}
                  >
                    {guardandoStaff ? "Registrando..." : "Crear Staff"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setAbrirModalStaff(false);
                    setExitoStaff("");
                  }}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black cursor-pointer hover:brightness-110 transition-all"
                  style={{
                    background: Y,
                    clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                    ...bg(Y, 0.4),
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
              Programar Clase (Global)
            </h3>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-6" style={{ fontFamily: FM }}>
              // Crear horario y asignar un coach del equipo
            </p>

            {errorClase && (
              <div className="mb-4 px-4 py-2 bg-red-950/20 border border-red-900/50 text-red-500 rounded text-xs" style={{ fontFamily: FB }}>
                {errorClase}
              </div>
            )}

            <form onSubmit={handleSubmitClase} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                  Nombre de la Clase
                </label>
                <input
                  type="text"
                  required
                  value={claseNombre}
                  onChange={(e) => setClaseNombre(e.target.value)}
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
                  value={claseDescripcion}
                  onChange={(e) => setClaseDescripcion(e.target.value)}
                  placeholder="Describe el enfoque y requisitos de la clase..."
                  rows={3}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white focus:border-green-500/50 resize-none"
                  style={{ fontFamily: FB }}
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                  Asignar Entrenador (Coach)
                </label>
                <select
                  required
                  value={claseEntrenadorId}
                  onChange={(e) => setClaseEntrenadorId(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white focus:border-green-500/50"
                  style={{ fontFamily: FB }}
                >
                  <option value="">-- Seleccionar Entrenador --</option>
                  {entrenadoresActivos.map((coach) => (
                    <option key={coach.id} value={coach.id}>
                      {coach.nombre} ({coach.detallesPerfil?.horarioTurno || "Sin turno"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                    Fecha y Hora
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={claseHorario}
                    onChange={(e) => setClaseHorario(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm focus:outline-none text-white focus:border-green-500/50"
                    style={{ fontFamily: FB }}
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                    Cupo Máximo
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={claseCupo}
                    onChange={(e) => setClaseCupo(Number(e.target.value))}
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
