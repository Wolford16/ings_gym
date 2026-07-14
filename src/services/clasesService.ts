import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// ── Referencia a la colección ──────────────────────────

const COLECCION = "clases";

// ── Tipos ──────────────────────────────────────────────

export interface Clase {
  nombre: string;
  descripcion: string;
  entrenadorId: string;
  horario: Timestamp;
  cupoMaximo: number;
  alumnosInscritos: string[];
}

export interface NuevaClase {
  nombre: string;
  descripcion: string;
  entrenadorId: string;
  horario: Date;
  cupoMaximo: number;
}

// ── Funciones CRUD ─────────────────────────────────────

/**
 * Crea una nueva clase en Firestore.
 *
 * @param datos - Datos de la nueva clase
 * @returns El ID del documento creado
 */
export async function crearClase(datos: NuevaClase): Promise<string> {
  const docRef = await addDoc(collection(db, COLECCION), {
    nombre: datos.nombre,
    descripcion: datos.descripcion,
    entrenadorId: datos.entrenadorId,
    horario: datos.horario,
    cupoMaximo: datos.cupoMaximo,
    alumnosInscritos: [],
  });

  return docRef.id;
}

/**
 * Obtiene una clase por su ID.
 *
 * @param id - ID del documento
 * @returns Los datos de la clase o null si no existe
 */
export async function obtenerClase(id: string): Promise<Clase | null> {
  const docRef = doc(db, COLECCION, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  return docSnap.data() as Clase;
}

/**
 * Obtiene todas las clases disponibles.
 *
 * @returns Array de clases con su ID
 */
export async function obtenerClases(): Promise<(Clase & { id: string })[]> {
  const snapshot = await getDocs(collection(db, COLECCION));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Clase),
  }));
}

/**
 * Obtiene las clases asignadas a un entrenador específico.
 *
 * @param entrenadorId - UID del entrenador
 * @returns Array de clases del entrenador
 */
export async function obtenerClasesPorEntrenador(
  entrenadorId: string
): Promise<(Clase & { id: string })[]> {
  const q = query(
    collection(db, COLECCION),
    where("entrenadorId", "==", entrenadorId)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Clase),
  }));
}

/**
 * Actualiza campos parciales de una clase.
 *
 * @param id - ID del documento de la clase
 * @param datos - Campos a actualizar
 */
export async function actualizarClase(
  id: string,
  datos: Partial<Omit<Clase, "alumnosInscritos">>
): Promise<void> {
  const docRef = doc(db, COLECCION, id);
  await updateDoc(docRef, datos);
}

/**
 * Inscribe un alumno en una clase.
 * Usa `arrayUnion` para agregar el UID sin duplicados.
 *
 * @param claseId - ID de la clase
 * @param userId - UID del alumno a inscribir
 */
export async function inscribirAlumno(
  claseId: string,
  userId: string
): Promise<void> {
  const docRef = doc(db, COLECCION, claseId);

  // Verificar que no exceda el cupo máximo
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error("La clase no existe.");

  const clase = docSnap.data() as Clase;
  if (clase.alumnosInscritos.length >= clase.cupoMaximo) {
    throw new Error("La clase ha alcanzado su cupo máximo.");
  }

  if (clase.alumnosInscritos.includes(userId)) {
    throw new Error("El alumno ya está inscrito en esta clase.");
  }

  await updateDoc(docRef, {
    alumnosInscritos: arrayUnion(userId),
  });
}

/**
 * Desinscribe un alumno de una clase.
 * Usa `arrayRemove` para quitar el UID.
 *
 * @param claseId - ID de la clase
 * @param userId - UID del alumno a desinscribir
 */
export async function desinscribirAlumno(
  claseId: string,
  userId: string
): Promise<void> {
  const docRef = doc(db, COLECCION, claseId);
  await updateDoc(docRef, {
    alumnosInscritos: arrayRemove(userId),
  });
}

/**
 * Elimina una clase de Firestore.
 *
 * @param id - ID del documento de la clase
 */
export async function eliminarClase(id: string): Promise<void> {
  const docRef = doc(db, COLECCION, id);
  await deleteDoc(docRef);
}
