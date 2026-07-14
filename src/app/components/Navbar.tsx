import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router";
import { R, FD, FB, tg, bg } from "./common/styleConstants";

/**
 * Componente Navbar para la barra de navegación superior.
 * Es responsivo (se colapsa en un menú hamburguesa en móviles) y reacciona al scroll
 * difuminando el fondo y reduciendo su tamaño vertical para mejorar el contraste.
 */
export default function Navbar() {
  // Estado para controlar si el menú móvil está abierto
  const [open, setOpen] = useState(false);

  // Estado para controlar si el usuario ha hecho scroll hacia abajo
  const [sc, setSc] = useState(false);

  useEffect(() => {
    // Función que evalúa la posición del scroll vertical
    const handleScroll = () => setSc(window.scrollY > 55);

    // Escucha el evento de scroll en la ventana global
    window.addEventListener("scroll", handleScroll);

    // Limpieza al desmontar el componente
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Enlaces de navegación de la landing page
  const links = [
    ["Nosotros", "#nosotros"],
    ["Membresías", "#membresias"],
    ["Entrenadores", "#entrenadores"],
    ["Instalaciones", "#instalaciones"],
    ["Contacto", "#contacto"],
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        // Si hace scroll (sc === true), fondo oscuro opaco y desenfoque (glassmorphic effect)
        background: sc ? "rgba(6, 6, 6, 0.97)" : "linear-gradient(to bottom, rgba(6, 6, 6, 0.88), transparent)",
        backdropFilter: sc ? "blur(16px)" : "none",
        borderBottom: sc ? `1px solid ${R}22` : "none",
        // Padding vertical dinámico (más compacto al hacer scroll)
        padding: sc ? "10px 0" : "22px 0",
        transition: "all .35s ease",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 flex items-center justify-between">
        {/* Logotipo INGS GYM con efecto de iluminación neón */}
        <a
          href="#"
          className="font-black tracking-widest text-2xl flex items-center gap-2"
          style={{ fontFamily: FD }}
        >
          <span style={{ color: R, ...tg(R, 1.1) }}>INGS</span>
          <span className="text-white">GYM</span>
        </a>

        {/* Menú de navegación principal en pantallas de escritorio */}
        <div className="hidden md:flex items-center gap-7">
          {links.map(([l, h]) => (
            <a
              key={l}
              href={h}
              className="text-sm font-semibold uppercase tracking-widest text-gray-400 hover:text-white"
              style={{
                fontFamily: FB,
                transition: "color .2s",
              }}
            >
              {l}
            </a>
          ))}
          {/* Botón de unirse en neón con bordes angulares recortados mediante clipPath */}
          <a
            href="#membresias"
            className="text-sm font-black uppercase tracking-widest px-6 py-2.5 hover:brightness-115 spray-hover"
            style={{
              fontFamily: FD,
              background: R,
              color: "#fff",
              clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
              ...bg(R, 0.75),
            }}
          >
            ÚNETE
          </a>
          {/* Botón Acceder para el enrutamiento */}
          <Link
            to="/login"
            className="text-sm font-black uppercase tracking-widest px-5 py-2 hover:brightness-115 transition-all text-white border ml-2 spray-hover"
            style={{
              fontFamily: FD,
              borderColor: R,
              clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
              ...tg(R, 0.5),
            }}
          >
            ACCEDER
          </Link>
        </div>

        {/* Botón de menú hamburguesa para pantallas móviles */}
        <button
          className="md:hidden text-white p-1"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Menú desplegable para móviles */}
      {open && (
        <div
          className="md:hidden flex flex-col gap-5 px-6 pt-5 pb-8"
          style={{
            background: "rgba(6, 6, 6, 0.99)",
            borderTop: `1px solid ${R}30`,
          }}
        >
          {links.map(([l, h]) => (
            <a
              key={l}
              href={h}
              className="text-xl font-bold uppercase tracking-widest text-gray-200"
              style={{ fontFamily: FB }}
              onClick={() => setOpen(false)}
            >
              {l}
            </a>
          ))}
          {/* Botón de unirse en el menú móvil */}
          <a
            href="#membresias"
            className="text-base font-black uppercase tracking-widest px-6 py-3 text-center"
            className="text-base font-black uppercase tracking-widest px-6 py-3 text-center mb-2"
            style={{
              fontFamily: FD,
              background: R,
              color: "#fff",
              ...bg(R),
            }}
            onClick={() => setOpen(false)}
          >
            ÚNETE AL MOVIMIENTO
          </a>
          {/* Botón Acceder en el menú móvil */}
          <Link
            to="/login"
            className="text-base font-black uppercase tracking-widest px-6 py-3 text-center border text-white"
            style={{
              fontFamily: FD,
              borderColor: R,
              ...tg(R, 0.5),
            }}
            onClick={() => setOpen(false)}
          >
            ACCEDER
          </Link>
        </div>
      )}
    </nav>
  );
}
