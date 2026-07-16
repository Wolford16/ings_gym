import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export interface Visita {
  id?: string;
  nombre: string;
  email: string;
  telefono: string;
  fecha: any; // Timestamp de Firestore
  notas: string;
  registradoPor: string;
}

const COLECCION = "visitas";

/**
 * Registra una nueva visita de prospección.
 */
export async function registrarVisita(
  datos: Omit<Visita, "fecha">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLECCION), {
    ...datos,
    fecha: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Obtiene todas las visitas de prospección registradas.
 */
export async function obtenerTodasLasVisitas(): Promise<Visita[]> {
  const q = query(collection(db, COLECCION), orderBy("fecha", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Visita, "id">),
  }));
}
