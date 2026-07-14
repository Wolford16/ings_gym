import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "../contexts/AuthContext";

// Páginas públicas
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import CambioContrasenaPage from "./pages/CambioContrasenaPage";

// Páginas del Dashboard
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import GeneralDashboard from "./pages/dashboard/GeneralDashboard";
import UserDashboard from "./pages/dashboard/UserDashboard";
import ReceptionistDashboard from "./pages/dashboard/ReceptionistDashboard";
import TrainerDashboard from "./pages/dashboard/TrainerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";

// Componente de protección de rutas
import ProtectedRoute from "./components/ProtectedRoute";

/**
 * Componente raíz de la aplicación INGS GYM.
 *
 * - AuthProvider envuelve toda la app para proveer estado de autenticación
 * - Las rutas públicas (/, /login) no requieren autenticación
 * - Las rutas de /dashboard/* están protegidas y requieren autenticación + rol válido
 * - /cambio-contrasena se muestra cuando el flag requiereCambioContrasena es true
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Rutas públicas ────────────────────────── */}

          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Cambio de contraseña obligatorio (primer inicio de sesión) */}
          <Route path="/cambio-contrasena" element={<CambioContrasenaPage />} />

          {/* ── Rutas protegidas del Dashboard ────────── */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard general (accesible para todos los roles autenticados) */}
            <Route index element={<GeneralDashboard />} />

            {/* Dashboard específico por rol */}
            <Route
              path="usuario"
              element={
                <ProtectedRoute rolesPermitidos={["usuario"]}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="recepcionista"
              element={
                <ProtectedRoute rolesPermitidos={["recepcionista", "administrador"]}>
                  <ReceptionistDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="entrenador"
              element={
                <ProtectedRoute rolesPermitidos={["entrenador", "administrador"]}>
                  <TrainerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="administrador"
              element={
                <ProtectedRoute rolesPermitidos={["administrador"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
