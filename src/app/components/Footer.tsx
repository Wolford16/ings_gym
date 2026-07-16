import BrickBg from "./common/BrickBg";
import { Link } from "react-router";
import { R, O, FD, FG, FB, FM, tg, bg } from "./common/styleConstants";

/**
 * Componente Footer (Pie de página).
 * Incluye un fondo ligero de ladrillos, la firma de la marca INGS GYM con estilo neón/grafiti,
 * enlaces rápidos de navegación, el manifiesto del gimnasio, botón directo de registro
 * y créditos de derechos de autor con estilo monospace.
 */
export default function Footer() {
  return (
    <footer
      className="relative py-14 overflow-hidden"
      style={{
        background: "#040404", // Negro casi puro de fondo
        borderTop: `1px solid ${R}20`, // Borde superior con rojo neón atenuado
      }}
    >
      {/* Patrón de ladrillos en el fondo a muy baja opacidad */}
      <BrickBg opacity={0.025} />

      <div className="relative z-10 max-w-7xl mx-auto px-5">

        {/* Rejilla de tres columnas en escritorio */}
        <div className="grid md:grid-cols-3 gap-10 mb-10">

          {/* Columna 1: Marca y Filosofía */}
          <div>
            <div
              className="text-4xl font-black tracking-widest mb-2"
              style={{ fontFamily: FD, ...tg(R) }}
            >
              <span style={{ color: R }}>INGS</span>
              <span className="text-white"> GYM</span>
            </div>

            {/* Tag de estilo grafiti flotante (.float-tag) */}
            <div
              className="float-tag inline-block text-lg mb-4"
              style={{ fontFamily: FG, color: O }}
            >
              Underground Fitness
            </div>

            <p className="text-gray-600 text-sm leading-relaxed" style={{ fontFamily: FB }}>
              Nacidos en la calle. Forjados en el esfuerzo. La comunidad underground más auténtica del barrio.
            </p>
          </div>

          {/* Columna 2: Enlaces de navegación rápida */}
          <div>
            <div
              className="text-xs uppercase tracking-widest text-gray-700 mb-4"
              style={{ fontFamily: FM }}
            >
              // Navegación
            </div>
            <div className="space-y-3">
              {["Nosotros", "Membresías", "Entrenadores", "Instalaciones", "Testimonios", "Contacto"].map((l) => (
                <a
                  key={l}
                  href={`#${l.toLowerCase()}`}
                  className="block text-gray-500 hover:text-white uppercase tracking-wider text-base"
                  style={{
                    fontFamily: FB,
                    transition: "color .2s",
                  }}
                >
                  {l}
                </a>
              ))}
              <Link
                to="/login"
                className="block text-gray-500 hover:text-white uppercase tracking-wider text-base"
                style={{
                  fontFamily: FB,
                  transition: "color .2s",
                }}
              >
                Acceder (Intranet)
              </Link>
            </div >
          </div >

          {/* Columna 3: Manifiesto y CTA */}
          < div className="flex flex-col justify-between" >
            <div>
              <div
                className="text-xs uppercase tracking-widest text-gray-700 mb-4"
                style={{ fontFamily: FM }}
              >
                // Manifiesto
              </div>
              <div
                className="text-2xl font-black leading-snug mb-6 text-white"
                style={{ fontFamily: FD }}
              >
                SIN EXCUSAS.<br />
                <span style={{ color: R }}>SIN ATAJOS.</span><br />
                SOLO TRABAJO.
              </div>
            </div>

            {/* Botón directo neón con bisel recortado por clipPath */}
            <a
              href="#membresias"
              className="inline-block text-center px-8 py-3 font-black uppercase tracking-widest text-sm spray-hover"
              style={{
                fontFamily: FD,
                background: R,
                color: "white",
                clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                ...bg(R, 0.75),
              }}
            >
              ÚNETE HOY
            </a>
          </div >
        </div >

        {/* Fila inferior de Copyright con tipografía mono técnica */}
        < div
          className="pt-5 flex flex-col md:flex-row items-center justify-between gap-3"
          style={{
            borderTop: `1px solid ${R}12`,
            fontFamily: FM,
            fontSize: "0.7rem",
            color: "#3a3a3a",
          }
          }
        >
          <span className="uppercase tracking-widest">
            © 2026 INGS GYM · Todos los derechos reservados
          </span>
          <span style={{ color: R }} className="uppercase tracking-widest">
            // BARRIO · GRIT · GRIND · GLORIA
          </span>
        </div >
      </div >
    </footer >
  );
}
