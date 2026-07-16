import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export interface RutinaGuardada {
  id?: string;
  usuarioId: string;
  nombre: string;
  enfoque: string;
  duracion: string;
  ejerciciosIds: string[];
  fechaCreacion: any;
}

const COLECCION = "rutinas";

/**
 * Guarda una nueva rutina personalizada en Firestore.
 */
export async function guardarRutina(datos: Omit<RutinaGuardada, "fechaCreacion">): Promise<string> {
  const docRef = await addDoc(collection(db, COLECCION), {
    ...datos,
    fechaCreacion: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Obtiene las rutinas guardadas por un usuario específico.
 */
export async function obtenerRutinasPorUsuario(userId: string): Promise<RutinaGuardada[]> {
  const q = query(
    collection(db, COLECCION),
    where("usuarioId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<RutinaGuardada, "id">),
  }));
}

/**
 * Elimina una rutina guardada por ID.
 */
export async function eliminarRutina(id: string): Promise<void> {
  const docRef = doc(db, COLECCION, id);
  await deleteDoc(docRef);
}
