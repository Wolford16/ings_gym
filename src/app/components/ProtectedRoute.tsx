import { Navigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { R, FM } from "./common/styleConstants";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Roles permitidos para acceder a esta ruta. Si no se especifica, cualquier rol puede acceder. */
  rolesPermitidos?: string[];
}

/**
 * Componente wrapper que protege rutas del dashboard.
 *
 * Lógica de verificación:
 * 1. Si está cargando → muestra spinner
 * 2. Si no hay usuario autenticado → redirige a /login
 * 3. Si requiere cambio de contraseña → redirige a /cambio-contrasena
 * 4. Si el usuario no tiene el rol necesario → redirige a su dashboard correspondiente
 * 5. Si todo está bien → renderiza los children
 */
export default function ProtectedRoute({
  children,
  rolesPermitidos,
}: ProtectedRouteProps) {
  const { usuario, datosUsuario, cargando } = useAuth();

  // Estado de carga: spinner minimalista al estilo INGS GYM
  if (cargando) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "#060606" }}
      >
        <div
          className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: `${R}40`, borderTopColor: R }}
        />
        <span
          className="text-xs uppercase tracking-widest text-gray-500"
          style={{ fontFamily: FM }}
        >
          Verificando acceso...
        </span>
      </div>
    );
  }

  // Sin sesión → Login
  if (!usuario || !datosUsuario) {
    return <Navigate to="/login" replace />;
  }

  // Requiere cambio de contraseña obligatorio
  if (datosUsuario.requiereCambioContrasena) {
    return <Navigate to="/cambio-contrasena" replace />;
  }

  // Si el usuario es de rol 'usuario' (cliente), no debe ver el Panel General u otros paneles
  if (datosUsuario.rol === "usuario" && (!rolesPermitidos || !rolesPermitidos.includes("usuario"))) {
    return <Navigate to="/dashboard/usuario" replace />;
  }

  // Verificar permisos de rol
  if (rolesPermitidos && !rolesPermitidos.includes(datosUsuario.rol)) {
    // Redirigir al dashboard que corresponda según su rol
    const rutaPorRol: Record<string, string> = {
      usuario: "/dashboard/usuario",
      recepcionista: "/dashboard/recepcionista",
      entrenador: "/dashboard/entrenador",
      administrador: "/dashboard/administrador",
    };

    const rutaDestino = rutaPorRol[datosUsuario.rol] || "/dashboard";
    return <Navigate to={rutaDestino} replace />;
  }

  // Todo OK → renderizar contenido protegido
  return <>{children}</>;
}
