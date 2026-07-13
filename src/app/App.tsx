import { BrowserRouter, Routes, Route } from "react-router";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import GeneralDashboard from "./pages/dashboard/GeneralDashboard";
import UserDashboard from "./pages/dashboard/UserDashboard";
import ReceptionistDashboard from "./pages/dashboard/ReceptionistDashboard";
import TrainerDashboard from "./pages/dashboard/TrainerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";

/**
 * Componente raíz que define el enrutamiento de la aplicación mediante React Router v7.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal pública: Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Ruta pública de Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas privadas del Dashboard con estructura de layout común */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<GeneralDashboard />} />
          <Route path="usuario" element={<UserDashboard />} />
          <Route path="recepcionista" element={<ReceptionistDashboard />} />
          <Route path="entrenador" element={<TrainerDashboard />} />
          <Route path="administrador" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
