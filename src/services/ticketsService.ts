import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export interface HistorialTicket {
  fecha: any; // Timestamp de Firestore
  cambio: string;
  autor: string;
}

export interface Ticket {
  id?: string;
  usuarioId: string;
  creadorNombre: string;
  creadorRol: "usuario" | "entrenador";
  titulo: string;
  descripcion: string;
  tipo: "Limpieza" | "Máquina" | "Sugerencia" | "Otros";
  fechaCreacion: any; // Timestamp de Firestore
  estado: "pendiente" | "proceso" | "resuelto";
  asignadoId: string;
  asignadoNombre: string;
  historial: HistorialTicket[];
}

const COLECCION = "tickets";

/**
 * Crea un nuevo ticket en Firestore.
 */
export async function crearTicket(
  datos: Omit<Ticket, "fechaCreacion" | "estado" | "asignadoId" | "asignadoNombre" | "historial">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLECCION), {
    ...datos,
    estado: "pendiente",
    asignadoId: "",
    asignadoNombre: "",
    fechaCreacion: serverTimestamp(),
    historial: [
      {
        fecha: new Date(),
        cambio: "Ticket creado y marcado como pendiente.",
        autor: datos.creadorNombre,
      },
    ],
  });
  return docRef.id;
}

/**
 * Obtiene todos los tickets registrados en el sistema (para Administrador).
 */
export async function obtenerTodosLosTickets(): Promise<Ticket[]> {
  const q = query(collection(db, COLECCION), orderBy("fechaCreacion", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Ticket, "id">),
  }));
}

/**
 * Obtiene los tickets creados por un usuario específico (para Clientes/Entrenadores).
 */
export async function obtenerTicketsPorUsuario(userId: string): Promise<Ticket[]> {
  const q = query(
    collection(db, COLECCION),
    where("usuarioId", "==", userId),
    orderBy("fechaCreacion", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Ticket, "id">),
  }));
}

/**
 * Actualiza un ticket (asignación, cambio de estado, agregar historial).
 */
export async function actualizarTicket(
  ticketId: string,
  camposActualizar: Partial<Omit<Ticket, "historial">>,
  mensajeHistorial: string,
  autorCambio: string
): Promise<void> {
  const docRef = doc(db, COLECCION, ticketId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("El ticket no existe.");
  }

  const ticketActual = docSnap.data() as Ticket;
  const historialActualizado = [
    ...(ticketActual.historial || []),
    {
      fecha: new Date(),
      cambio: mensajeHistorial,
      autor: autorCambio,
    },
  ];

  await updateDoc(docRef, {
    ...camposActualizar,
    historial: historialActualizado,
  });
}
