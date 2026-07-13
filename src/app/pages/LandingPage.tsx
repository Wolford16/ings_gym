import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Memberships from "../components/Memberships";
import Trainers from "../components/Trainers";
import Facilities from "../components/Facilities";
import Testimonials from "../components/Testimonials";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

// Componentes comunes compartidos
import SprayDivider from "../components/common/SprayDivider";

// Constantes de colores para los divisores de sección
import { R, O, G, Y } from "../components/common/styleConstants";

/**
 * Componente de la página de inicio (Landing Page).
 * Agrupa todas las secciones públicas del gimnasio.
 */
export default function LandingPage() {
  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden">
      {/* Barra de navegación responsiva y pegajosa */}
      <Navbar />

      {/* Cabecera / Sección de impacto */}
      <Hero />
      
      {/* Divisor rojo neón */}
      <SprayDivider color={R} />

      {/* Historia de INGS GYM y pilares corporativos */}
      <About />
      
      {/* Divisor naranja neón invertido */}
      <SprayDivider color={O} flip />

      {/* Planes y Precios */}
      <Memberships />
      
      {/* Divisor verde eléctrico */}
      <SprayDivider color={G} />

      {/* Listado y Biografías de Coaches */}
      <Trainers />
      
      {/* Divisor naranja neón invertido */}
      <SprayDivider color={O} flip />

      {/* Galería de Zonas del Gimnasio */}
      <Facilities />
      
      {/* Divisor amarillo neón */}
      <SprayDivider color={Y} />

      {/* Carrusel de reseñas de miembros */}
      <Testimonials />
      
      {/* Divisor rojo neón invertido */}
      <SprayDivider color={R} flip />

      {/* Formulario de contacto y datos físicos */}
      <Contact />

      {/* Pie de página con manifiesto y navegación */}
      <Footer />
    </div>
  );
}
