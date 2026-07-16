import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";
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
import {
  obtenerTodosLosTickets,
  actualizarTicket,
  type Ticket,
} from "../../../services/ticketsService";
import {
  enviarNotificacion,
} from "../../../services/notificacionesService";
import {
  obtenerTodasLasEncuestas,
} from "../../../services/encuestasService";
import {
  listarPagos,
  type Pago,
} from "../../../services/pagosService";
import type { DatosUsuario } from "../../../contexts/AuthContext";
import { R, O, G, Y, FD, FB, FM, bg, tg } from "../../components/common/styleConstants";

export default function AdminDashboard() {
  const [pestana, setPestana] = useState<"personal" | "clases" | "metricas" | "tickets" | "anuncios" | "reportes">("personal");
  const [usuarios, setUsuarios] = useState<(DatosUsuario & { id: string })[]>([]);
  const [clases, setClases] = useState<(Clase & { id: string })[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagos, setPagos] = useState<(Pago & { id: string })[]>([]);
  const [encuestas, setEncuestas] = useState<any[]>([]);
  const [entrenadoresActivos, setEntrenadoresActivos] = useState<(DatosUsuario & { id: string })[]>([]);
  
  const [cargandoLista, setCargandoLista] = useState(true);
  
  // Modales
  const [abrirModalStaff, setAbrirModalStaff] = useState(false);
  const [abrirModalClase, setAbrirModalClase] = useState(false);
  const [ticketAsignarSeleccionado, setTicketAsignarSeleccionado] = useState<Ticket | null>(null);

  // Formulario Staff
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

  // Formulario Clases
  const [claseNombre, setClaseNombre] = useState("");
  const [claseDescripcion, setClaseDescripcion] = useState("");
  const [claseHorario, setClaseHorario] = useState("");
  const [claseCupo, setClaseCupo] = useState(15);
  const [claseEntrenadorId, setClaseEntrenadorId] = useState("");
  const [guardandoClase, setGuardandoClase] = useState(false);
  const [errorClase, setErrorClase] = useState("");

  // Formulario Anuncios
  const [anuncioTitulo, setAnuncioTitulo] = useState("");
  const [anuncioMensaje, setAnuncioMensaje] = useState("");
  const [anuncioDestinatario, setAnuncioDestinatario] = useState("todos");
  const [enviandoAnuncio, setEnviandoAnuncio] = useState(false);

  // Estados de Asignación de Ticket
  const [staffAsignadoId, setStaffAsignadoId] = useState("");
  const [pagoMonto, setPagoMonto] = useState(30);

  useEffect(() => {
    cargarDatos();
  }, [pestana]);

  async function cargarDatos() {
    setCargandoLista(true);
    try {
      const todosUsuarios = await listarUsuarios();
      
      // Filtrar entrenadores activos
      const coaches = todosUsuarios.filter((u) => u.rol === "entrenador" && u.estado === "activo");
      setEntrenadoresActivos(coaches);

      // Cargar otros conjuntos
      const [todasClases, todosTickets, todosPagos, todasEncuestas] = await Promise.all([
        obtenerClases(),
        obtenerTodosLosTickets(),
        listarPagos(),
        obtenerTodasLasEncuestas(),
      ]);

      setClases(todasClases);
      setTickets(todosTickets);
      setPagos(todosPagos);
      setEncuestas(todasEncuestas);
      setUsuarios(todosUsuarios);
    } catch (error) {
      console.error("Error al cargar datos del administrador:", error);
    } finally {
      setCargandoLista(false);
    }
  }

  // Métricas calculadas
  const clientesActivos = usuarios.filter((u) => u.rol === "usuario" && u.estado === "activo");
  
  const ingresosMes = pagos
    .filter((p) => {
      if (!p.fechaPago) return false;
      const pDate = p.fechaPago.toDate ? p.fechaPago.toDate() : new Date(p.fechaPago);
      const hoy = new Date();
      return pDate.getMonth() === hoy.getMonth() && pDate.getFullYear() === hoy.getFullYear();
    })
    .reduce((sum, p) => sum + p.monto, 0);

  const ticketsPendientes = tickets.filter((t) => t.estado === "pendiente").length;
  const maquinasReportadas = tickets.filter((t) => t.tipo === "Máquina" && t.estado !== "resuelto").length;

  const membresiasVencen7Dias = usuarios.filter((u) => {
    if (u.rol !== "usuario" || !u.detallesPerfil?.fechaVencimiento) return false;
    const vDate = u.detallesPerfil.fechaVencimiento.toDate
      ? u.detallesPerfil.fechaVencimiento.toDate()
      : new Date(u.detallesPerfil.fechaVencimiento);
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const diffMs = vDate.getTime() - hoy.getTime();
    const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return dias > 0 && dias <= 7;
  }).length;

  const satisfaccionPromedio = encuestas.length > 0
    ? (encuestas.reduce((sum, e) => sum + e.calificacion, 0) / encuestas.length).toFixed(1)
    : "0.0";

  // Toggle Cuenta Staff
  async function toggleEstado(uid: string, estadoActual: string) {
    const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";
    try {
      await actualizarUsuario(uid, { estado: nuevoEstado });
      setUsuarios((prev) =>
        prev.map((u) => (u.id === uid ? { ...u, estado: nuevoEstado as any } : u))
      );
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  }

  // Cancelar Clase
  async function handleCancelarClase(id: string) {
    if (!confirm("¿Deseas cancelar esta clase?")) return;
    try {
      await eliminarClase(id);
      setClases((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error al cancelar clase:", error);
    }
  }

  // Cambiar Asignación de Ticket
  async function handleAsignarTicket() {
    if (!ticketAsignarSeleccionado) return;
    const staffObj = usuarios.find((u) => u.id === staffAsignadoId);
    if (!staffObj) return;

    try {
      await actualizarTicket(
        ticketAsignarSeleccionado.id!,
        {
          asignadoId: staffAsignadoId,
          asignadoNombre: staffObj.nombre,
        },
        `Ticket asignado a ${staffObj.nombre}.`,
        "Administrador"
      );

      // Enviar notificación al asignado
      await enviarNotificacion({
        usuarioId: staffAsignadoId,
        titulo: "Ticket de Soporte Asignado",
        mensaje: `Se te ha asignado el ticket: "${ticketAsignarSeleccionado.titulo}".`,
        tipo: "ticket",
      });

      setTicketAsignarSeleccionado(null);
      setStaffAsignadoId("");
      cargarDatos();
      alert("Ticket asignado.");
    } catch (error) {
      console.error(error);
    }
  }

  // Cambiar Estado de Ticket
  async function handleCambiarEstadoTicket(ticketId: string, nuevoEstado: "pendiente" | "proceso" | "resuelto") {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    try {
      await actualizarTicket(
        ticketId,
        { estado: nuevoEstado },
        `Estado del ticket cambiado a: ${nuevoEstado.toUpperCase()}.`,
        "Administrador"
      );

      // Enviar notificación al creador del ticket
      await enviarNotificacion({
        usuarioId: ticket.usuarioId,
        titulo: `Ticket ${nuevoEstado.toUpperCase()}`,
        mensaje: `Tu reporte: "${ticket.titulo}" fue marcado como ${nuevoEstado}.`,
        tipo: "ticket",
      });

      cargarDatos();
    } catch (error) {
      console.error(error);
    }
  }

  // Enviar Anuncio
  async function handleEnviarAnuncio(e: React.FormEvent) {
    e.preventDefault();
    setEnviandoAnuncio(true);
    try {
      await enviarNotificacion({
        usuarioId: anuncioDestinatario,
        titulo: anuncioTitulo,
        mensaje: anuncioMensaje,
        tipo: "anuncio",
      });
      setAnuncioTitulo("");
      setAnuncioMensaje("");
      alert("¡Anuncio publicado con éxito!");
    } catch (error) {
      console.error(error);
      alert("No se pudo publicar el anuncio.");
    } finally {
      setEnviandoAnuncio(false);
    }
  }

  // Exportar reportes en CSV
  function handleExportarCSV(tipoExport: "usuarios" | "pagos" | "tickets") {
    let cabeceras = "";
    let filas = "";
    let nombreArchivo = "";

    if (tipoExport === "usuarios") {
      cabeceras = "ID,Nombre,Email,Telefono,Rol,Estado,Plan,Vencimiento\n";
      filas = usuarios
        .map((u) => {
          const vence = u.detallesPerfil?.fechaVencimiento
            ? (u.detallesPerfil.fechaVencimiento.toDate ? u.detallesPerfil.fechaVencimiento.toDate().toLocaleDateString() : new Date(u.detallesPerfil.fechaVencimiento).toLocaleDateString())
            : "N/A";
          return `"${u.id}","${u.nombre}","${u.email}","${u.telefono || ""}","${u.rol}","${u.estado}","${u.detallesPerfil?.membresiaTipo || "N/A"}","${vence}"`;
        })
        .join("\n");
      nombreArchivo = "socios_ingsgym.csv";
    } else if (tipoExport === "pagos") {
      cabeceras = "ID,SocioUID,Concepto,Metodo,Monto,Fecha\n";
      filas = pagos
        .map((p) => {
          const fechaStr = p.fechaPago?.toDate ? p.fechaPago.toDate().toLocaleDateString() : "";
          return `"${p.id}","${p.usuarioId}","${p.concepto}","${p.metodoPago}","${p.monto}","${fechaStr}"`;
        })
        .join("\n");
      nombreArchivo = "pagos_ingsgym.csv";
    } else if (tipoExport === "tickets") {
      cabeceras = "ID,Creador,Rol,Titulo,Descripcion,Tipo,Estado,Asignado\n";
      filas = tickets
        .map((t) => {
          return `"${t.id}","${t.creadorNombre}","${t.creadorRol}","${t.titulo}","${t.descripcion.replace(/"/g, '""')}","${t.tipo}","${t.estado}","${t.asignadoNombre || "Sin asignar"}"`;
        })
        .join("\n");
      nombreArchivo = "tickets_ingsgym.csv";
    }

    const blob = new Blob([cabeceras + filas], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", nombreArchivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Registrar Staff
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
      const credenciales = await createUserWithEmailAndPassword(secondaryAuth, email, password);
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

      setExitoStaff(`¡Cuenta creada! Contraseña: ${password}`);
      setNombre("");
      setEmail("");
      setTelefono("");
      setEspecialidades("");
      cargarDatos();
    } catch (err: any) {
      setErrorStaff(err.message || "Error al registrar.");
    } finally {
      if (secondaryApp) await secondaryApp.delete().catch(console.error);
      setGuardandoStaff(false);
    }
  }

  // Programar clase
  async function handleSubmitClase(e: React.FormEvent) {
    e.preventDefault();
    setErrorClase("");
    setGuardandoClase(true);
    if (!claseEntrenadorId) {
      setErrorClase("Debes asignar un entrenador.");
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
      setAbrirModalClase(false);
      cargarDatos();
    } catch (error: any) {
      setErrorClase(error.message);
    } finally {
      setGuardandoClase(false);
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
        </div>

        {/* Botones de acción */}
        <div className="self-start md:self-auto">
          {pestana === "personal" && (
            <button
              onClick={() => {
                setErrorStaff("");
                setExitoStaff("");
                setAbrirModalStaff(true);
              }}
              className="px-5 py-2.5 text-xs font-black uppercase text-black cursor-pointer bg-yellow-500 rounded"
              style={{ fontFamily: FD }}
            >
              + Agregar Personal
            </button>
          )}
          {pestana === "clases" && (
            <button
              onClick={() => {
                setErrorClase("");
                setAbrirModalClase(true);
              }}
              className="px-5 py-2.5 text-xs font-black uppercase text-black cursor-pointer bg-green-400 rounded"
              style={{ fontFamily: FD }}
            >
              + Programar Clase
            </button>
          )}
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex flex-wrap border-b border-zinc-800 gap-1" style={{ fontFamily: FB }}>
        {[
          { key: "personal", label: "Personal", color: Y },
          { key: "clases", label: "Clases", color: G },
          { key: "metricas", label: "Métricas", color: O },
          { key: "tickets", label: "Tickets", color: R },
          { key: "anuncios", label: "Anuncios", color: Y },
          { key: "reportes", label: "Reportes", color: O },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setPestana(tab.key as any)}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              pestana === tab.key
                ? "border-b-2 text-white bg-zinc-900/20"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
            style={{ borderColor: pestana === tab.key ? tab.color : "transparent" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* PESTAÑA: Métricas */}
      {pestana === "metricas" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Socios Activos", val: clientesActivos.length, col: G },
              { label: "Vencen 7 días", val: membresiasVencen7Dias, col: Y },
              { label: "Ingresos Mes", val: `$${ingresosMes}`, col: G },
              { label: "Tickets Pendientes", val: ticketsPendientes, col: R },
              { label: "Fallas Reportadas", val: maquinasReportadas, col: R },
              { label: "Satisfacción Promedio", val: `${satisfaccionPromedio} ★`, col: Y },
            ].map((card, i) => (
              <div key={i} className="p-4 border border-zinc-900 rounded-lg bg-zinc-950/80 flex flex-col justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">{card.label}</span>
                <span className="text-3xl font-black block mt-2 text-white" style={{ fontFamily: FD, color: card.col }}>
                  {card.val}
                </span>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 border border-zinc-900 rounded-lg bg-zinc-950">
              <h3 className="text-lg font-bold uppercase text-white mb-4" style={{ fontFamily: FB }}>
                Acciones Administrativas
              </h3>
              <div className="grid grid-cols-2 gap-3" style={{ fontFamily: FB }}>
                <button onClick={() => setPestana("tickets")} className="p-4 rounded border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 text-left text-xs uppercase tracking-wider">
                  → Gestionar Tickets
                </button>
                <button onClick={() => setPestana("anuncios")} className="p-4 rounded border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 text-left text-xs uppercase tracking-wider">
                  → Publicar Anuncio
                </button>
                <button onClick={() => setPestana("reportes")} className="p-4 rounded border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 text-left text-xs uppercase tracking-wider">
                  → Módulo de Reportes
                </button>
                <button onClick={() => setPestana("personal")} className="p-4 rounded border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 text-left text-xs uppercase tracking-wider">
                  → Gestionar Personal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: Tickets */}
      {pestana === "tickets" && (
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-6 space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-wider text-white animate-pulse" style={{ fontFamily: FB }}>
            Administración Global de Tickets
          </h2>

          {cargandoLista ? (
            <div className="py-12 flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-red-500" /></div>
          ) : tickets.length === 0 ? (
            <p className="text-center text-zinc-600 uppercase text-xs" style={{ fontFamily: FM }}>// No hay tickets de soporte reportados.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {tickets.map((t) => (
                <div key={t.id} className="p-4 border border-zinc-900 bg-zinc-900/10 rounded-lg flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white uppercase text-sm">{t.titulo}</span>
                      <span className={`text-[10px] uppercase font-black font-mono tracking-widest px-2 py-0.5 rounded ${
                        t.estado === "pendiente" ? "bg-yellow-950/40 text-yellow-500" : t.estado === "proceso" ? "bg-orange-950/40 text-orange-500" : "bg-green-950/40 text-green-400"
                      }`}>
                        {t.estado}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{t.descripcion}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      Creado por: <span className="text-white">{t.creadorNombre}</span> ({t.creadorRol})
                    </p>
                    {t.asignadoNombre && (
                      <p className="text-[10px] text-zinc-500 font-mono">
                        Asignado a: <span className="text-zinc-300">{t.asignadoNombre}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 border-t border-zinc-900 pt-3 items-center justify-between">
                    {/* Botones de acción rápida */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCambiarEstadoTicket(t.id!, "proceso")}
                        className="px-2 py-1 text-[9px] uppercase font-bold border border-orange-900/50 hover:bg-orange-950/20 text-orange-500 rounded cursor-pointer"
                        style={{ fontFamily: FM }}
                      >
                        En Proceso
                      </button>
                      <button
                        onClick={() => handleCambiarEstadoTicket(t.id!, "resuelto")}
                        className="px-2 py-1 text-[9px] uppercase font-bold border border-green-900/50 hover:bg-green-950/20 text-green-400 rounded cursor-pointer"
                        style={{ fontFamily: FM }}
                      >
                        Resolver
                      </button>
                    </div>

                    <button
                      onClick={() => setTicketAsignarSeleccionado(t)}
                      className="px-2.5 py-1 text-[9px] uppercase font-black text-black bg-yellow-500 rounded cursor-pointer"
                      style={{ fontFamily: FM }}
                    >
                      Asignar Staff
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA: Anuncios */}
      {pestana === "anuncios" && (
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-6 max-w-xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: FB }}>
              Redactar Anuncio del Administrador
            </h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mt-0.5" style={{ fontFamily: FM }}>
              // Envío masivo de alertas al personal y clientes
            </p>
          </div>

          <form onSubmit={handleEnviarAnuncio} className="space-y-4">
            <div>
              <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                Destinatarios
              </label>
              <select
                value={anuncioDestinatario}
                onChange={(e) => setAnuncioDestinatario(e.target.value)}
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white"
                style={{ fontFamily: FB }}
              >
                <option value="todos">Todos los Usuarios</option>
                <option value="usuario">Solo Clientes (Usuarios)</option>
                <option value="entrenador">Solo Entrenadores</option>
                <option value="recepcionista">Solo Recepcionistas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                Título del Anuncio
              </label>
              <input
                type="text"
                required
                value={anuncioTitulo}
                onChange={(e) => setAnuncioTitulo(e.target.value)}
                placeholder="Ej: Mantenimiento de instalaciones"
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white"
                style={{ fontFamily: FB }}
              />
            </div>

            <div>
              <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                Contenido del Anuncio
              </label>
              <textarea
                required
                value={anuncioMensaje}
                onChange={(e) => setAnuncioMensaje(e.target.value)}
                placeholder="Escribe el mensaje del anuncio aquí..."
                rows={5}
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white resize-none"
                style={{ fontFamily: FB }}
              />
            </div>

            <button
              type="submit"
              disabled={enviandoAnuncio}
              className="w-full py-2.5 bg-yellow-500 hover:brightness-110 font-bold uppercase rounded text-xs text-black"
              style={{ fontFamily: FD }}
            >
              {enviandoAnuncio ? "Publicando..." : "Publicar Anuncio Global"}
            </button>
          </form>
        </div>
      )}

      {/* PESTAÑA: Reportes */}
      {pestana === "reportes" && (
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: FB }}>
              Módulo de Reportes y Auditoría
            </h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mt-0.5" style={{ fontFamily: FM }}>
              // Descargas y vistas de impresión
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4" style={{ fontFamily: FB }}>
            <div className="p-4 rounded border border-zinc-900 bg-zinc-900/10 flex flex-col justify-between gap-4">
              <div>
                <h4 className="font-bold text-white uppercase text-sm">Reporte de Socios</h4>
                <p className="text-xs text-zinc-500 mt-1">Exportar base de datos de socios con planes y estados.</p>
              </div>
              <button
                onClick={() => handleExportarCSV("usuarios")}
                className="w-full py-2 bg-orange-600 hover:brightness-110 text-xs font-black uppercase text-white rounded cursor-pointer"
              >
                Exportar CSV
              </button>
            </div>

            <div className="p-4 rounded border border-zinc-900 bg-zinc-900/10 flex flex-col justify-between gap-4">
              <div>
                <h4 className="font-bold text-white uppercase text-sm">Reporte de Ingresos</h4>
                <p className="text-xs text-zinc-500 mt-1">Exportar historial de caja y cobros registrados.</p>
              </div>
              <button
                onClick={() => handleExportarCSV("pagos")}
                className="w-full py-2 bg-orange-600 hover:brightness-110 text-xs font-black uppercase text-white rounded cursor-pointer"
              >
                Exportar CSV
              </button>
            </div>

            <div className="p-4 rounded border border-zinc-900 bg-zinc-900/10 flex flex-col justify-between gap-4">
              <div>
                <h4 className="font-bold text-white uppercase text-sm">Reporte de Incidencias</h4>
                <p className="text-xs text-zinc-500 mt-1">Exportar tickets abiertos, en proceso y resueltos.</p>
              </div>
              <button
                onClick={() => handleExportarCSV("tickets")}
                className="w-full py-2 bg-orange-600 hover:brightness-110 text-xs font-black uppercase text-white rounded cursor-pointer"
              >
                Exportar CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Asignar Ticket a Personal */}
      {ticketAsignarSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-2xl border bg-zinc-950 border-red-900/50">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-black uppercase text-white" style={{ fontFamily: FD }}>Asignar Ticket</h3>
              <button onClick={() => setTicketAsignarSeleccionado(null)} className="text-zinc-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                  Elegir Miembro del Staff
                </label>
                <select
                  required
                  value={staffAsignadoId}
                  onChange={(e) => setStaffAsignadoId(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none"
                  style={{ fontFamily: FB }}
                >
                  <option value="">-- Seleccionar --</option>
                  {usuarios
                    .filter((u) => u.rol !== "usuario" && u.estado === "activo")
                    .map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.nombre} ({staff.rol})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-zinc-900">
                <button
                  onClick={() => setTicketAsignarSeleccionado(null)}
                  className="px-4 py-2 border border-zinc-800 text-zinc-500 rounded text-xs font-bold uppercase transition-colors cursor-pointer"
                  style={{ fontFamily: FB }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAsignarTicket}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black bg-yellow-500 rounded cursor-pointer"
                  style={{ fontFamily: FD }}
                >
                  Asignar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: Personal */}
      {pestana === "personal" && (
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-6">
          <h2 className="text-xl font-bold uppercase tracking-wider mb-6 text-white" style={{ fontFamily: FB }}>
            Equipo de Trabajo Registrado
          </h2>

          {cargandoLista ? (
            <div className="py-12 flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-yellow-500" /></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {usuarios
                .filter((u) => u.rol !== "usuario")
                .map((user) => {
                  const colorRol = badgeColores[user.rol] || Y;
                  return (
                    <div key={user.id} className="p-4 rounded-lg border bg-zinc-900/30 flex flex-col justify-between gap-4" style={{ borderColor: `${colorRol}25` }}>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-bold text-white uppercase tracking-wider" style={{ fontFamily: FB }}>{user.nombre}</h3>
                            <p className="text-xs text-zinc-500 font-mono" style={{ fontFamily: FM }}>{user.email}</p>
                          </div>
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-widest" style={{ backgroundColor: `${colorRol}15`, color: colorRol, fontFamily: FM }}>
                            {user.rol}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">Tel: <span className="text-white">{user.telefono || "Sin registrar"}</span></p>
                      </div>

                      <div className="flex items-center justify-between border-t border-zinc-800/50 pt-3">
                        <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: user.estado === "activo" ? G : R, fontFamily: FM }}>
                          {user.estado === "activo" ? "Activo" : "Inactivo"}
                        </span>
                        <button onClick={() => toggleEstado(user.id, user.estado)} className="px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded border border-zinc-800 hover:text-white">
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

      {/* PESTAÑA: Clases */}
      {pestana === "clases" && (
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-6">
          <h2 className="text-xl font-bold uppercase tracking-wider mb-6 text-white" style={{ fontFamily: FB }}>
            Agenda y Clases del Gimnasio
          </h2>

          {cargandoLista ? (
            <div className="py-12 flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-green-400" /></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clases.map((clase) => {
                const inscritosCount = clase.alumnosInscritos?.length || 0;
                const cupoLleno = inscritosCount >= clase.cupoMaximo;

                return (
                  <div key={clase.id} className="p-5 rounded-lg border bg-zinc-900/30 flex flex-col justify-between gap-4 border-zinc-800">
                    <div className="space-y-3">
                      <h3 className="text-base font-bold text-white uppercase">{clase.nombre}</h3>
                      <p className="text-xs text-zinc-400">{clase.descripcion}</p>
                      <div className="space-y-1 text-xs">
                        <p>Horario: <span className="font-bold text-white">{formatearHorario(clase.horario)}</span></p>
                        <p>Cupos: <span className={`font-bold ${cupoLleno ? "text-red-500" : "text-emerald-400"}`}>{inscritosCount} / {clase.cupoMaximo}</span></p>
                      </div>
                    </div>
                    <div className="flex justify-end border-t border-zinc-800/50 pt-3">
                      <button onClick={() => handleCancelarClase(clase.id)} className="px-3 py-1 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white border border-zinc-800">
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

      {/* MODAL: Agregar Staff */}
      {abrirModalStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl border bg-zinc-950 border-yellow-900/50">
            <button onClick={() => setAbrirModalStaff(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white font-bold cursor-pointer">✕</button>
            <h3 className="text-xl font-black uppercase text-white mb-6" style={{ fontFamily: FD }}>Registrar Staff</h3>

            {errorStaff && <div className="mb-4 px-4 py-2 bg-red-950/20 border border-red-900/50 text-red-500 rounded text-xs">{errorStaff}</div>}
            {exitoStaff && <div className="mb-4 px-4 py-3 bg-green-950/20 border border-green-900/50 text-green-400 rounded text-xs font-bold">{exitoStaff}</div>}

            {!exitoStaff ? (
              <form onSubmit={handleSubmitStaff} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" required placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white" />
                  <input type="text" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="email" required placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white" />
                  <input type="text" required placeholder="Clave temporal" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select value={rol} onChange={(e) => setRol(e.target.value as any)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white">
                    <option value="recepcionista">Recepcionista</option>
                    <option value="entrenador">Entrenador</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
                {rol === "entrenador" && (
                  <div className="p-3 border border-zinc-800 bg-zinc-900/40 rounded-lg grid grid-cols-2 gap-4">
                    <select value={turno} onChange={(e) => setTurno(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white">
                      <option value="Mañana">Mañana</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noche">Noche</option>
                    </select>
                    <input type="text" placeholder="Especialidades" value={especialidades} onChange={(e) => setEspecialidades(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white" />
                  </div>
                )}
                <button type="submit" disabled={guardandoStaff} className="w-full py-2.5 bg-yellow-500 hover:brightness-110 text-black font-bold uppercase rounded text-xs">
                  Crear Staff
                </button>
              </form>
            ) : (
              <button onClick={() => { setAbrirModalStaff(false); setExitoStaff(""); }} className="w-full py-2.5 bg-zinc-900 text-white rounded text-xs uppercase">Entendido</button>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Programar Clase */}
      {abrirModalClase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl border bg-zinc-950 border-green-900/50">
            <button onClick={() => setAbrirModalClase(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white font-bold cursor-pointer">✕</button>
            <h3 className="text-xl font-black uppercase text-white mb-6" style={{ fontFamily: FD }}>Programar Clase</h3>

            {errorClase && <div className="mb-4 px-4 py-2 bg-red-950/20 border border-red-900/50 text-red-500 rounded text-xs">{errorClase}</div>}

            <form onSubmit={handleSubmitClase} className="space-y-4">
              <input type="text" required placeholder="Nombre de la clase" value={claseNombre} onChange={(e) => setClaseNombre(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white" />
              <textarea placeholder="Descripción" value={claseDescripcion} onChange={(e) => setClaseDescripcion(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white" />
              <select required value={claseEntrenadorId} onChange={(e) => setClaseEntrenadorId(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white">
                <option value="">-- Elegir Entrenador --</option>
                {entrenadoresActivos.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="datetime-local" required value={claseHorario} onChange={(e) => setClaseHorario(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white" />
                <input type="number" required min={1} value={claseCupo} onChange={(e) => setClaseCupo(Number(e.target.value))} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white" />
              </div>
              <button type="submit" disabled={guardandoClase} className="w-full py-2.5 bg-green-500 text-black font-bold uppercase rounded text-xs">
                Programar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
