import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

export interface Notificacion {
  id?: string;
  usuarioId: string; // UID del destinatario, o "todos", o rol ("usuario", "entrenador", "recepcionista")
  titulo: string;
  mensaje: string;
  leido: boolean;
  fechaCreacion: any;
  tipo: "sistema" | "ticket" | "anuncio";
}

const COLECCION = "notificaciones";

/**
 * Envía una nueva notificación.
 */
export async function enviarNotificacion(
  datos: Omit<Notificacion, "fechaCreacion" | "leido">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLECCION), {
    ...datos,
    leido: false,
    fechaCreacion: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Obtiene las notificaciones dirigidas a un usuario específico (incluye anuncios para "todos" o su "rol").
 */
export async function obtenerNotificacionesUsuario(
  userId: string,
  rol: "usuario" | "recepcionista" | "entrenador" | "administrador"
): Promise<Notificacion[]> {
  // En Firestore no se puede hacer un 'where in' de forma limpia combinando 'OR' de forma compleja,
  // por lo que es más fácil y eficiente cargar notificaciones dirigidas al UID del usuario,
  // dirigidas a "todos" y dirigidas a su rol, y luego ordenarlas en cliente o hacer queries separadas.
  // Haremos 3 consultas en paralelo para unificar los datos.
  const ref = collection(db, COLECCION);
  
  const qUsuario = query(ref, where("usuarioId", "==", userId));
  const qTodos = query(ref, where("usuarioId", "==", "todos"));
  const qRol = query(ref, where("usuarioId", "==", rol));

  const [snapUser, snapTodos, snapRol] = await Promise.all([
    getDocs(qUsuario),
    getDocs(qTodos),
    getDocs(qRol),
  ]);

  const combinadas: Notificacion[] = [];

  const procesarSnap = (snap: any) => {
    snap.forEach((doc: any) => {
      combinadas.push({
        id: doc.id,
        ...doc.data(),
      });
    });
  };

  procesarSnap(snapUser);
  procesarSnap(snapTodos);
  procesarSnap(snapRol);

  // Ordenar por fechaCreacion descendente
  return combinadas.sort((a, b) => {
    const tA = a.fechaCreacion?.toDate ? a.fechaCreacion.toDate().getTime() : new Date(a.fechaCreacion || 0).getTime();
    const tB = b.fechaCreacion?.toDate ? b.fechaCreacion.toDate().getTime() : new Date(b.fechaCreacion || 0).getTime();
    return tB - tA;
  });
}

/**
 * Marca una notificación como leída.
 */
export async function marcarNotificacionLeida(id: string): Promise<void> {
  const docRef = doc(db, COLECCION, id);
  await updateDoc(docRef, { leido: true });
}

/**
 * Marca todas las notificaciones de un usuario como leídas.
 */
export async function marcarTodasLeidas(notificaciones: Notificacion[]): Promise<void> {
  const batch = writeBatch(db);
  notificaciones.forEach((notif) => {
    if (!notif.leido && notif.id) {
      const docRef = doc(db, COLECCION, notif.id);
      batch.update(docRef, { leido: true });
    }
  });
  await batch.commit();
}
