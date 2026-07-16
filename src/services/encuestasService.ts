import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export interface Encuesta {
  id?: string;
  usuarioId: string;
  mes: string; // Formato "AAAA-MM" (ej: "2026-07")
  calificacion: number; // 1 a 5 estrellas
  fecha: any;
}

const COLECCION = "encuestas";

/**
 * Registra una respuesta de encuesta de satisfacción.
 */
export async function registrarEncuesta(
  datos: Omit<Encuesta, "fecha">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLECCION), {
    ...datos,
    fecha: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Verifica si un usuario ya respondió la encuesta en el mes indicado.
 */
export async function verificarEncuestaRespondida(
  userId: string,
  mes: string
): Promise<boolean> {
  const q = query(
    collection(db, COLECCION),
    where("usuarioId", "==", userId),
    where("mes", "==", mes)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Obtiene todas las encuestas respondidas para generar estadísticas.
 */
export async function obtenerTodasLasEncuestas(): Promise<Encuesta[]> {
  const snapshot = await getDocs(collection(db, COLECCION));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Encuesta, "id">),
  }));
}
