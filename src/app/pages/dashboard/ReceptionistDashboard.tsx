import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { Timestamp, collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import {
  crearUsuario,
  listarUsuarios,
  actualizarUsuario,
} from "../../../services/usuariosService";
import {
  registrarPago,
  listarPagos,
} from "../../../services/pagosService";
import {
  registrarVisita,
  obtenerTodasLasVisitas,
  type Visita,
} from "../../../services/visitasService";
import {
  enviarNotificacion,
} from "../../../services/notificacionesService";
import { useAuth, type DatosUsuario } from "../../../contexts/AuthContext";
import { R, O, G, Y, FD, FB, FM, bg } from "../../components/common/styleConstants";

export default function ReceptionistDashboard() {
  const { usuario, datosUsuario } = useAuth();
  
  // Pestañas
  const [pestana, setPestana] = useState<"clientes" | "caja" | "visitas">("clientes");

  // Estados de Clientes
  const [clientes, setClientes] = useState<(DatosUsuario & { id: string })[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<(DatosUsuario & { id: string })[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [abrirModal, setAbrirModal] = useState(false);
  const [filtro, setFiltro] = useState("");

  // Formulario Nuevo Cliente
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("Gym2026!");
  const [membresia, setMembresia] = useState("Mensual");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  const [exitoMsg, setExitoMsg] = useState("");

  // Estados de Caja & Pagos
  const [pagos, setPagos] = useState<any[]>([]);
  const [cargandoPagos, setCargandoPagos] = useState(false);
  const [abrirModalPago, setAbrirModalPago] = useState(false);
  const [pagoClienteId, setPagoClienteId] = useState("");
  const [pagoMonto, setPagoMonto] = useState(30);
  const [pagoConcepto, setPagoConcepto] = useState("Mensualidad");
  const [pagoMetodo, setPagoMetodo] = useState<"efectivo" | "tarjeta" | "transferencia">("efectivo");
  const [guardandoPago, setGuardandoPago] = useState(false);

  // Estados de Visitas
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [cargandoVisitas, setCargandoVisitas] = useState(false);
  const [abrirModalVisita, setAbrirModalVisita] = useState(false);
  const [visitaNombre, setVisitaNombre] = useState("");
  const [visitaEmail, setVisitaEmail] = useState("");
  const [visitaTelefono, setVisitaTelefono] = useState("");
  const [visitaNotas, setVisitaNotas] = useState("");
  const [guardandoVisita, setGuardandoVisita] = useState(false);

  // Cargar datos principales
  useEffect(() => {
    cargarClientes();
  }, []);

  // Cargar datos según pestaña activa
  useEffect(() => {
    if (pestana === "caja") {
      cargarPagos();
    } else if (pestana === "visitas") {
      cargarVisitas();
    }
  }, [pestana]);

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

  // Autocompletar vencimiento
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

  // Autocompletar monto del pago al cambiar concepto
  useEffect(() => {
    if (pagoConcepto === "Mensualidad") setPagoMonto(30);
    else if (pagoConcepto === "Trimestre") setPagoMonto(80);
    else if (pagoConcepto === "Semestre") setPagoMonto(150);
    else if (pagoConcepto === "Anualidad") setPagoMonto(280);
  }, [pagoConcepto]);

  async function cargarClientes() {
    setCargandoLista(true);
    try {
      const todos = await listarUsuarios();
      const soloClientes = todos.filter((u) => u.rol === "usuario");
      setClientes(soloClientes);
      setClientesFiltrados(soloClientes);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    } finally {
      setCargandoLista(false);
    }
  }

  async function cargarPagos() {
    setCargandoPagos(true);
    try {
      const data = await listarPagos();
      setPagos(data);
    } catch (error) {
      console.error("Error al cargar pagos:", error);
    } finally {
      setCargandoPagos(false);
    }
  }

  async function cargarVisitas() {
    setCargandoVisitas(true);
    try {
      const data = await obtenerTodasLasVisitas();
      setVisitas(data);
    } catch (error) {
      console.error("Error al cargar visitas:", error);
    } finally {
      setCargandoVisitas(false);
    }
  }

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

  // Registrar cliente
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorForm("");
    setExitoMsg("");
    setGuardando(true);

    if (!fechaVencimiento) {
      setErrorForm("Por favor, selecciona una fecha de vencimiento.");
      setGuardando(false);
      return;
    }

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
      secondaryApp = initializeApp(config, "temp-reception-auth");
      const secondaryAuth = getAuth(secondaryApp);

      const credenciales = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );
      const newUid = credenciales.user.uid;
      await signOut(secondaryAuth);

      const dateObj = new Date(fechaVencimiento + "T23:59:59");
      const timestampVencimiento = Timestamp.fromDate(dateObj);

      const detallesPerfil = {
        membresiaTipo: membresia,
        fechaVencimiento: timestampVencimiento,
      };

      await crearUsuario(newUid, {
        nombre,
        email,
        telefono,
        rol: "usuario",
        detallesPerfil,
      });

      // Crear primer pago automático
      let montoPago = 30;
      if (membresia === "Trimestral") montoPago = 80;
      else if (membresia === "Semestral") montoPago = 150;
      else if (membresia === "Anual") montoPago = 280;

      await registrarPago({
        usuarioId: newUid,
        monto: montoPago,
        metodoPago: "efectivo",
        concepto: `Inscripción y Membresía ${membresia}`,
        registradoPor: usuario?.uid || "recepcionista",
      });

      // Enviar notificación de bienvenida
      await enviarNotificacion({
        usuarioId: newUid,
        titulo: "¡Bienvenido a INGS GYM!",
        mensaje: `Hola ${nombre}, tu membresía de tipo ${membresia} está activa y vence el ${formatearFecha(timestampVencimiento)}.`,
        tipo: "sistema",
      });

      setExitoMsg(`¡Cliente registrado con éxito! Contraseña: ${password}`);
      setNombre("");
      setEmail("");
      setTelefono("");
      setFechaVencimiento("");
      setMembresia("Mensual");
      setPassword("Gym2026!");
      
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
      setGuardando(true);
      setGuardando(false);
    }
  }

  // Registrar un pago manual (Renovación o Pago de servicios)
  async function handleRegistrarPago(e: React.FormEvent) {
    e.preventDefault();
    if (!pagoClienteId) {
      alert("Debes seleccionar un cliente.");
      return;
    }
    setGuardandoPago(true);
    try {
      await registrarPago({
        usuarioId: pagoClienteId,
        monto: Number(pagoMonto),
        metodoPago: pagoMetodo,
        concepto: pagoConcepto,
        registradoPor: usuario?.uid || "recepcionista",
      });

      // Si el concepto es de mensualidades/anualidades, actualizamos el vencimiento del usuario
      let diasSumar = 0;
      let planTipo = "";
      if (pagoConcepto === "Mensualidad") { diasSumar = 30; planTipo = "Mensual"; }
      else if (pagoConcepto === "Trimestre") { diasSumar = 90; planTipo = "Trimestral"; }
      else if (pagoConcepto === "Semestre") { diasSumar = 180; planTipo = "Semestral"; }
      else if (pagoConcepto === "Anualidad") { diasSumar = 365; planTipo = "Anual"; }

      if (diasSumar > 0) {
        // Encontrar fecha actual de vencimiento del cliente
        const clienteObj = clientes.find((c) => c.id === pagoClienteId);
        let baseDate = new Date();
        if (clienteObj?.detallesPerfil?.fechaVencimiento) {
          const vDate = clienteObj.detallesPerfil.fechaVencimiento.toDate
            ? clienteObj.detallesPerfil.fechaVencimiento.toDate()
            : new Date(clienteObj.detallesPerfil.fechaVencimiento);
          // Si el vencimiento futuro es mayor a hoy, renovamos a partir de ahí. Si ya venció, a partir de hoy.
          if (vDate > baseDate) baseDate = vDate;
        }

        const nuevoVence = new Date(baseDate.getTime() + diasSumar * 24 * 60 * 60 * 1000);
        await actualizarUsuario(pagoClienteId, {
          detallesPerfil: {
            membresiaTipo: planTipo,
            fechaVencimiento: Timestamp.fromDate(nuevoVence),
          },
        });

        // Enviar notificación al cliente
        await enviarNotificacion({
          usuarioId: pagoClienteId,
          titulo: "Membresía Renovada",
          mensaje: `Se ha registrado tu pago de ${pagoConcepto}. Tu membresía se ha extendido hasta el ${nuevoVence.toLocaleDateString("es-ES")}.`,
          tipo: "sistema",
        });
      }

      setPagoClienteId("");
      setPagoConcepto("Mensualidad");
      setPagoMonto(30);
      setAbrirModalPago(false);
      cargarClientes();
      cargarPagos();
      alert("Pago registrado con éxito.");
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el pago.");
    } finally {
      setGuardandoPago(false);
    }
  }

  // Registrar visita de prospecto
  async function handleRegistrarVisita(e: React.FormEvent) {
    e.preventDefault();
    setGuardandoVisita(true);
    try {
      await registrarVisita({
        nombre: visitaNombre,
        email: visitaEmail,
        telefono: visitaTelefono,
        notas: visitaNotas,
        registradoPor: usuario?.uid || "recepcionista",
      });

      setVisitaNombre("");
      setVisitaEmail("");
      setVisitaTelefono("");
      setVisitaNotas("");
      setAbrirModalVisita(false);
      cargarVisitas();
      alert("Visita de prospección registrada.");
    } catch (error) {
      console.error(error);
      alert("No se pudo registrar la visita.");
    } finally {
      setGuardandoVisita(false);
    }
  }

  // Formateos
  function formatearFecha(timestamp: any): string {
    if (!timestamp) return "Sin definir";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function estaVencido(timestamp: any): boolean {
    if (!timestamp) return true;
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date < new Date();
  }

  const clientesVencidos = clientes.filter((c) => estaVencido(c.detallesPerfil?.fechaVencimiento));

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-white" style={{ fontFamily: FD }}>
            Gestión de Recepción
          </h1>
        </div>

        <div className="flex gap-2 self-start md:self-auto">
          {pestana === "clientes" && (
            <button
              onClick={() => {
                setErrorForm("");
                setExitoMsg("");
                setAbrirModal(true);
              }}
              className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white cursor-pointer hover:brightness-110 active:scale-95 transition-all"
              style={{
                background: O,
                color: "#fff",
                clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                ...bg(O, 0.4),
                fontFamily: FD,
              }}
            >
              + Registrar Socio
            </button>
          )}

          {pestana === "caja" && (
            <button
              onClick={() => setAbrirModalPago(true)}
              className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white cursor-pointer hover:brightness-110 active:scale-95 transition-all"
              style={{
                background: O,
                color: "#fff",
                clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                ...bg(O, 0.4),
                fontFamily: FD,
              }}
            >
              + Cobrar Cuota
            </button>
          )}

          {pestana === "visitas" && (
            <button
              onClick={() => setAbrirModalVisita(true)}
              className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white cursor-pointer hover:brightness-110 active:scale-95 transition-all"
              style={{
                background: O,
                color: "#fff",
                clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                ...bg(O, 0.4),
                fontFamily: FD,
              }}
            >
              + Registrar Visita
            </button>
          )}
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex border-b border-zinc-800 gap-1" style={{ fontFamily: FB }}>
        <button
          onClick={() => setPestana("clientes")}
          className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
            pestana === "clientes"
              ? "border-b-2 text-orange-500 bg-zinc-900/20"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          style={{ borderColor: pestana === "clientes" ? O : "transparent" }}
        >
          Socios & Membresías
        </button>
        <button
          onClick={() => setPestana("caja")}
          className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
            pestana === "caja"
              ? "border-b-2 text-orange-500 bg-zinc-900/20"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          style={{ borderColor: pestana === "caja" ? O : "transparent" }}
        >
          Caja & Pagos
        </button>
        <button
          onClick={() => setPestana("visitas")}
          className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
            pestana === "visitas"
              ? "border-b-2 text-orange-500 bg-zinc-900/20"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          style={{ borderColor: pestana === "visitas" ? O : "transparent" }}
        >
          Visitas Prospección
        </button>
      </div>

      {/* PESTAÑA: Clientes */}
      {pestana === "clientes" && (
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: FB }}>
              Lista de Socios Activos
            </h2>
            <div className="relative max-w-sm w-full">
              <input
                type="text"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Buscar por nombre, correo o tel..."
                className="w-full pl-3 pr-8 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs focus:outline-none text-white focus:border-orange-500/50"
                style={{ fontFamily: FB }}
              />
            </div>
          </div>

          {cargandoLista ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-orange-500" />
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <p className="text-center text-zinc-600 uppercase text-xs tracking-wider py-8" style={{ fontFamily: FM }}>
              // Ningún socio registrado en el sistema.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-widest text-[10px]" style={{ fontFamily: FM }}>
                    <th className="py-3 px-4">Socio / Correo</th>
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
                      <tr key={cliente.id} className="hover:bg-zinc-900/10">
                        <td className="py-4 px-4">
                          <div className="font-bold text-white uppercase">{cliente.nombre}</div>
                          <div className="text-xs text-zinc-500 font-mono" style={{ fontFamily: FM }}>{cliente.email}</div>
                        </td>
                        <td className="py-4 px-4 text-zinc-300 font-mono text-xs">{cliente.telefono || "-"}</td>
                        <td className="py-4 px-4 text-zinc-300">
                          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono">
                            {cliente.detallesPerfil?.membresiaTipo || "Ninguno"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`font-semibold ${vencido ? "text-red-500 animate-pulse" : "text-emerald-400"}`}>
                            {formatearFecha(cliente.detallesPerfil?.fechaVencimiento)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-black" style={{ backgroundColor: inactivo ? `${R}15` : `${G}15`, color: inactivo ? R : G, fontFamily: FM }}>
                            {inactivo ? "Inactivo" : "Activo"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => toggleEstado(cliente.id, cliente.estado)}
                            className="px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded border border-zinc-800 hover:text-white"
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
      )}

      {/* PESTAÑA: Caja & Pagos */}
      {pestana === "caja" && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Historial de transacciones */}
          <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-6 md:col-span-2 space-y-6">
            <h2 className="text-xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: FB }}>
              Historial General de Caja
            </h2>

            {cargandoPagos ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-orange-500" />
              </div>
            ) : pagos.length === 0 ? (
              <p className="text-center text-zinc-600 uppercase text-xs tracking-wider py-8" style={{ fontFamily: FM }}>
                // No hay registros de pago en caja.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-widest text-[10px]" style={{ fontFamily: FM }}>
                      <th className="py-3 px-4">Socio UID</th>
                      <th className="py-3 px-4">Concepto</th>
                      <th className="py-3 px-4">Método</th>
                      <th className="py-3 px-4 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60 font-mono text-xs text-zinc-400">
                    {pagos.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-900/10">
                        <td className="py-3 px-4 text-white font-bold">{p.usuarioId.substring(0, 8)}...</td>
                        <td className="py-3 px-4 uppercase">{p.concepto}</td>
                        <td className="py-3 px-4 uppercase text-zinc-500">{p.metodoPago}</td>
                        <td className="py-3 px-4 text-right text-green-400 font-bold">${p.monto}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Socios con membresía vencida */}
          <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-6 space-y-6">
            <h3 className="text-lg font-bold uppercase text-red-500" style={{ fontFamily: FB }}>
              Membresías Vencidas
            </h3>
            <p className="text-zinc-500 text-xs uppercase font-mono">// Socios pendientes de cobro</p>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {clientesVencidos.length === 0 ? (
                <p className="text-center text-zinc-600 text-xs uppercase" style={{ fontFamily: FM }}>
                  // Al día. No hay morosos.
                </p>
              ) : (
                clientesVencidos.map((Moroso) => (
                  <div key={Moroso.id} className="p-3 border border-zinc-900 rounded bg-zinc-900/10 flex flex-col justify-between gap-2">
                    <div>
                      <span className="font-bold text-white uppercase text-xs block">{Moroso.nombre}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{Moroso.email}</span>
                    </div>
                    <button
                      onClick={() => {
                        setPagoClienteId(Moroso.id);
                        setPagoConcepto("Mensualidad");
                        setPagoMonto(30);
                        setAbrirModalPago(true);
                      }}
                      className="w-full py-1 text-[10px] uppercase tracking-wider font-black bg-red-950/20 text-red-500 border border-red-900/50 hover:bg-red-950/40 rounded transition-all cursor-pointer text-center"
                      style={{ fontFamily: FM }}
                    >
                      Cobrar y Renovar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: Visitas */}
      {pestana === "visitas" && (
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-6 space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: FB }}>
            Clientes Potenciales (Prospección)
          </h2>

          {cargandoVisitas ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-orange-500" />
            </div>
          ) : visitas.length === 0 ? (
            <p className="text-center text-zinc-600 uppercase text-xs tracking-wider py-8" style={{ fontFamily: FM }}>
              // No hay registros de visitas interesados.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visitas.map((v) => (
                <div key={v.id} className="p-4 border border-zinc-800 bg-zinc-900/10 rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-white uppercase text-sm">{v.nombre}</span>
                    <span className="text-[9px] text-zinc-500 font-mono">
                      {v.fecha?.toDate ? v.fecha.toDate().toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono">Tel: {v.telefono} | {v.email}</p>
                  <p className="text-xs text-zinc-500 italic bg-zinc-950/50 p-2 border border-zinc-900 rounded">
                    "{v.notas || "Sin observaciones."}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Registrar Cliente */}
      {abrirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl border bg-zinc-950 border-orange-900/50">
            <button onClick={() => setAbrirModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white font-bold cursor-pointer">✕</button>
            <h3 className="text-xl font-black uppercase text-white mb-2" style={{ fontFamily: FD }}>Registrar Nuevo Socio</h3>

            {errorForm && <div className="mb-4 px-4 py-2 bg-red-950/20 border border-red-900/50 text-red-500 rounded text-xs">{errorForm}</div>}
            {exitoMsg && <div className="mb-4 px-4 py-3 bg-green-950/20 border border-green-900/50 text-green-400 rounded text-xs font-bold">{exitoMsg}</div>}

            {!exitoMsg ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" required placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white" />
                  <input type="text" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="email" required placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white" />
                  <input type="text" required placeholder="Clave temporal" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white font-mono" />
                </div>
                <div className="p-3 border border-zinc-800 bg-zinc-900/40 rounded-lg grid grid-cols-2 gap-4">
                  <select value={membresia} onChange={(e) => setMembresia(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white">
                    <option value="Mensual">Mensual</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Semestral">Semestral</option>
                    <option value="Anual">Anual</option>
                  </select>
                  <input type="date" required value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white" />
                </div>
                <button type="submit" disabled={guardando} className="w-full py-2.5 bg-orange-600 hover:brightness-110 font-bold uppercase rounded text-xs text-white">
                  {guardando ? "Guardando..." : "Registrar Socio"}
                </button>
              </form>
            ) : (
              <button onClick={() => { setAbrirModal(false); setExitoMsg(""); }} className="w-full py-2.5 bg-zinc-900 text-white rounded text-xs uppercase">Entendido</button>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Cobrar Pago */}
      {abrirModalPago && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl border bg-zinc-950 border-orange-900/50">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-black uppercase text-white" style={{ fontFamily: FD }}>Registrar Cobro de Cuota</h3>
              <button onClick={() => setAbrirModalPago(false)} className="text-zinc-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleRegistrarPago} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                  Seleccionar Socio
                </label>
                <select
                  required
                  value={pagoClienteId}
                  onChange={(e) => setPagoClienteId(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none"
                  style={{ fontFamily: FB }}
                >
                  <option value="">-- Elegir Socio --</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                    Plan / Concepto
                  </label>
                  <select
                    value={pagoConcepto}
                    onChange={(e) => setPagoConcepto(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none"
                    style={{ fontFamily: FB }}
                  >
                    <option value="Mensualidad">Mensualidad (30 días)</option>
                    <option value="Trimestre">Trimestre (90 días)</option>
                    <option value="Semestre">Semestre (180 días)</option>
                    <option value="Anualidad">Anualidad (365 días)</option>
                    <option value="Inscripción">Matrícula / Inscripción</option>
                    <option value="Otros">Otros Servicios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                    Monto Cobrado
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={pagoMonto}
                    onChange={(e) => setPagoMonto(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white font-mono focus:outline-none"
                    style={{ fontFamily: FM }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                  Método de Pago
                </label>
                <select
                  value={pagoMetodo}
                  onChange={(e) => setPagoMetodo(e.target.value as any)}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none"
                  style={{ fontFamily: FB }}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta Crédito/Débito</option>
                  <option value="transferencia">Transferencia Bancaria</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAbrirModalPago(false)}
                  className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded text-xs font-bold uppercase transition-colors cursor-pointer"
                  style={{ fontFamily: FB }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoPago}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white cursor-pointer bg-orange-600 hover:brightness-110 transition-all disabled:opacity-50"
                  style={{
                    clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                    ...bg(O, 0.4),
                    fontFamily: FD,
                  }}
                >
                  {guardandoPago ? "Guardando..." : "Registrar Pago"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Registrar Visita */}
      {abrirModalVisita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl border bg-zinc-950 border-orange-900/50">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-black uppercase text-white" style={{ fontFamily: FD }}>Registrar Visita de Interesado</h3>
              <button onClick={() => setAbrirModalVisita(false)} className="text-zinc-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleRegistrarVisita} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={visitaNombre}
                  onChange={(e) => setVisitaNombre(e.target.value)}
                  placeholder="Ej: Marcos Ramírez"
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none"
                  style={{ fontFamily: FB }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={visitaEmail}
                    onChange={(e) => setVisitaEmail(e.target.value)}
                    placeholder="marcos@email.com"
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none"
                    style={{ fontFamily: FB }}
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    required
                    value={visitaTelefono}
                    onChange={(e) => setVisitaTelefono(e.target.value)}
                    placeholder="Ej: +502 44332211"
                    className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none"
                    style={{ fontFamily: FB }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-zinc-400 font-bold mb-1" style={{ fontFamily: FB }}>
                  Notas / Observaciones del interés
                </label>
                <textarea
                  value={visitaNotas}
                  onChange={(e) => setVisitaNotas(e.target.value)}
                  placeholder="Vino a preguntar por planes anuales..."
                  rows={3}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none resize-none"
                  style={{ fontFamily: FB }}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAbrirModalVisita(false)}
                  className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded text-xs font-bold uppercase transition-colors cursor-pointer"
                  style={{ fontFamily: FB }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoVisita}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white cursor-pointer bg-orange-600 hover:brightness-110 transition-all disabled:opacity-50"
                  style={{
                    clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                    ...bg(O, 0.4),
                    fontFamily: FD,
                  }}
                >
                  {guardandoVisita ? "Registrando..." : "Registrar Visita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
