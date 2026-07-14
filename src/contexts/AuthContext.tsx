import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

// ── Tipos ──────────────────────────────────────────────

/** Datos del documento Firestore del usuario */
export interface DatosUsuario {
  nombre: string;
  email: string;
  telefono: string;
  rol: "usuario" | "recepcionista" | "entrenador" | "administrador";
  estado: "activo" | "inactivo";
  fechaCreacion: any; // Firestore Timestamp
  requiereCambioContrasena: boolean;
  detallesPerfil: Record<string, any>;
}

interface AuthContextType {
  /** Usuario de Firebase Auth (null si no hay sesión) */
  usuario: User | null;
  /** Documento Firestore del usuario (null si no se ha cargado) */
  datosUsuario: DatosUsuario | null;
  /** Indica si se está verificando la sesión */
  cargando: boolean;
  /** Inicia sesión con email y contraseña */
  iniciarSesion: (email: string, password: string) => Promise<DatosUsuario>;
  /** Cierra la sesión actual */
  cerrarSesion: () => Promise<void>;
  /** Cambia la contraseña y actualiza el flag en Firestore */
  cambiarContrasena: (nuevaPassword: string) => Promise<void>;
}

// ── Contexto ───────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook para acceder al contexto de autenticación.
 * Debe usarse dentro de un <AuthProvider>.
 */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
  }
  return ctx;
}

// ── Provider ───────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Proveedor de autenticación que envuelve toda la app.
 * Escucha cambios de sesión en Firebase Auth y lee el documento
 * correspondiente del usuario en Firestore.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [datosUsuario, setDatosUsuario] = useState<DatosUsuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // Escuchar cambios de sesión en tiempo real
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUsuario(firebaseUser);

      if (firebaseUser) {
        // Leer el documento de Firestore del usuario autenticado
        try {
          const docRef = doc(db, "usuarios", firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setDatosUsuario(docSnap.data() as DatosUsuario);
          } else {
            // El usuario existe en Auth pero no tiene documento en Firestore
            console.warn(
              "Usuario autenticado sin documento en Firestore:",
              firebaseUser.uid
            );
            setDatosUsuario(null);
          }
        } catch (error) {
          console.error("Error al leer datos del usuario:", error);
          setDatosUsuario(null);
        }
      } else {
        setDatosUsuario(null);
      }

      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Inicia sesión con email y contraseña.
   * Retorna los datos de Firestore del usuario para decidir redirección.
   */
  async function iniciarSesion(
    email: string,
    password: string
  ): Promise<DatosUsuario> {
    const credencial = await signInWithEmailAndPassword(auth, email, password);

    // Leer datos de Firestore inmediatamente
    const docRef = doc(db, "usuarios", credencial.user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(
        "No se encontró el perfil del usuario en la base de datos."
      );
    }

    const datos = docSnap.data() as DatosUsuario;

    // Verificar que la cuenta esté activa
    if (datos.estado === "inactivo") {
      await signOut(auth);
      throw new Error("Tu cuenta ha sido desactivada. Contacta al administrador.");
    }

    setDatosUsuario(datos);
    return datos;
  }

  /** Cierra la sesión actual */
  async function cerrarSesion(): Promise<void> {
    await signOut(auth);
    setUsuario(null);
    setDatosUsuario(null);
  }

  /**
   * Cambia la contraseña del usuario actual en Firebase Auth
   * y actualiza el flag `requiereCambioContrasena` a false en Firestore.
   */
  async function cambiarContrasena(nuevaPassword: string): Promise<void> {
    if (!usuario) {
      throw new Error("No hay usuario autenticado.");
    }

    // Cambiar contraseña en Firebase Auth
    await updatePassword(usuario, nuevaPassword);

    // Actualizar flag en Firestore
    const docRef = doc(db, "usuarios", usuario.uid);
    await updateDoc(docRef, { requiereCambioContrasena: false });

    // Actualizar estado local
    setDatosUsuario((prev) =>
      prev ? { ...prev, requiereCambioContrasena: false } : null
    );
  }

  const value: AuthContextType = {
    usuario,
    datosUsuario,
    cargando,
    iniciarSesion,
    cerrarSesion,
    cambiarContrasena,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
