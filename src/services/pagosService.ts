import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// ── Referencia a la colección ──────────────────────────

const COLECCION = "pagos";

// ── Tipos ──────────────────────────────────────────────

export interface Pago {
  usuarioId: string;
  monto: number;
  fechaPago: Timestamp;
  metodoPago: "efectivo" | "tarjeta" | "transferencia";
  concepto: string;
  registradoPor: string;
}

export interface NuevoPago {
  usuarioId: string;
  monto: number;
  metodoPago: "efectivo" | "tarjeta" | "transferencia";
  concepto: string;
  registradoPor: string;
}

// ── Funciones CRUD ─────────────────────────────────────

/**
 * Registra un nuevo pago en Firestore.
 * La fecha de pago se establece automáticamente con el timestamp del servidor.
 *
 * @param datos - Datos del pago a registrar
 * @returns El ID del documento creado
 */
export async function registrarPago(datos: NuevoPago): Promise<string> {
  const docRef = await addDoc(collection(db, COLECCION), {
    usuarioId: datos.usuarioId,
    monto: datos.monto,
    fechaPago: serverTimestamp(),
    metodoPago: datos.metodoPago,
    concepto: datos.concepto,
    registradoPor: datos.registradoPor,
  });

  return docRef.id;
}

/**
 * Obtiene todos los pagos de un usuario específico.
 *
 * @param userId - UID del usuario
 * @returns Array de pagos del usuario, ordenados por fecha
 */
export async function obtenerPagosPorUsuario(
  userId: string
): Promise<(Pago & { id: string })[]> {
  const q = query(
    collection(db, COLECCION),
    where("usuarioId", "==", userId),
    orderBy("fechaPago", "desc")
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Pago),
  }));
}

/**
 * Obtiene todos los pagos del sistema.
 * Pensado para uso de administradores y recepcionistas.
 *
 * @returns Array de todos los pagos, ordenados por fecha descendente
 */
export async function listarPagos(): Promise<(Pago & { id: string })[]> {
  const q = query(
    collection(db, COLECCION),
    orderBy("fechaPago", "desc")
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Pago),
  }));
}

/**
 * Obtiene los pagos registrados por un miembro del personal específico.
 *
 * @param personalId - UID del personal que registró los pagos
 * @returns Array de pagos registrados por ese personal
 */
export async function obtenerPagosPorPersonal(
  personalId: string
): Promise<(Pago & { id: string })[]> {
  const q = query(
    collection(db, COLECCION),
    where("registradoPor", "==", personalId),
    orderBy("fechaPago", "desc")
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Pago),
  }));
}
