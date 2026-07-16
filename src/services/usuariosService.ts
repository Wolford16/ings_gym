import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type { DatosUsuario } from "../contexts/AuthContext";

// ── Referencia a la colección ──────────────────────────

const COLECCION = "usuarios";

// ── Tipo para crear un nuevo usuario ───────────────────

export interface NuevoUsuario {
  nombre: string;
  email: string;
  telefono: string;
  rol: "usuario" | "recepcionista" | "entrenador" | "administrador";
  detallesPerfil?: Record<string, any>;
}

// ── Funciones CRUD ─────────────────────────────────────

/**
 * Crea un nuevo documento de usuario en Firestore.
 * El ID del documento debe coincidir con el UID de Firebase Auth.
 *
 * @param uid - UID del usuario creado en Firebase Auth
 * @param datos - Datos del nuevo usuario
 */
export async function crearUsuario(
  uid: string,
  datos: NuevoUsuario
): Promise<void> {
  const docRef = doc(db, COLECCION, uid);

  const documento: DatosUsuario = {
    nombre: datos.nombre,
    email: datos.email,
    telefono: datos.telefono,
    rol: datos.rol,
    estado: "activo",
    fechaCreacion: serverTimestamp(),
    requiereCambioContrasena: true, // Siempre true para nuevas cuentas
    detallesPerfil: datos.detallesPerfil || {},
  };

  await setDoc(docRef, documento);
}

/**
 * Obtiene los datos de un usuario por su UID.
 *
 * @param uid - UID del usuario
 * @returns Los datos del usuario o null si no existe
 */
export async function obtenerUsuario(
  uid: string
): Promise<DatosUsuario | null> {
  const docRef = doc(db, COLECCION, uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  return docSnap.data() as DatosUsuario;
}

/**
 * Actualiza campos parciales de un documento de usuario.
 *
 * @param uid - UID del usuario
 * @param datos - Campos a actualizar
 */
export async function actualizarUsuario(
  uid: string,
  datos: Partial<DatosUsuario>
): Promise<void> {
  const docRef = doc(db, COLECCION, uid);
  await updateDoc(docRef, datos);
}

/**
 * Obtiene todos los usuarios de la colección.
 * Pensado para uso de administradores y recepcionistas.
 *
 * @returns Array de usuarios con su UID como id
 */
export async function listarUsuarios(): Promise<
  (DatosUsuario & { id: string })[]
> {
  const q = query(collection(db, COLECCION));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as DatosUsuario),
  }));
}

/**
 * Obtiene usuarios filtrados por rol.
 *
 * @param rol - Rol a filtrar
 * @returns Array de usuarios con el rol especificado
 */
export async function listarUsuariosPorRol(
  rol: DatosUsuario["rol"]
): Promise<(DatosUsuario & { id: string })[]> {
  const q = query(collection(db, COLECCION), where("rol", "==", rol));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as DatosUsuario),
  }));
}
