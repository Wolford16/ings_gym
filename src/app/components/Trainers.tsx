import { Star } from "lucide-react";
import SectionHeading from "./common/SectionHeading";
import Reveal from "./common/Reveal";
import Spray from "./common/Spray";
import { R, O, G, FD, FB, FM, METAL, tg, bg } from "./common/styleConstants";

// Listado de los 3 entrenadores del gimnasio
const coaches = [
  {
    name: "Ariel «El Toro» Andino",
    role: "Fuerza & Powerlifting",
    exp: "10 años · Campeón Nacional",
    bio: "Ha formado a más de 400 atletas. Especialista en periodización de fuerza máxima y mentalidad de competición. Si quieres mover hierro en serio, El Toro te enseña.",
    // IMAGEN DE UNSPLASH: Hombre musculoso levantando barra
    img: "https://images.unsplash.com/photo-1628935291759-bbaf33a66dc6?w=600&h=750&fit=crop&auto=format",
    color: R,
    tag: "FUERZA",
  },
  {
    name: "Dariela «La Pantera» Velasquez",
    role: "Boxeo & Artes Marciales",
    exp: "4 años · Boxeadora Pro",
    bio: "Técnica implacable, impacto brutal. Su metodología fusiona el boxeo clásico con HIIT funcional. Dos clases con ella y tu cuerpo cambia para siempre.",
    // IMAGEN DE UNSPLASH: Mujer entrenando boxeo con vendas
    img: "https://images.unsplash.com/photo-1683848644235-7ac932a8aaea?w=600&h=750&fit=crop&auto=format",
    color: O,
    tag: "COMBATE",
  },
  {
    name: "Cesar «El Maestro» Orellana",
    role: "Street Workout & Calistenia",
    exp: "5 años · Pionero del Barrio",
    bio: "No necesitas máquinas. Tu cuerpo es el equipo. El Maestro domina cada movimiento desde el suelo hasta la barra. Enseña lo que vive.",
    // IMAGEN DE UNSPLASH: Joven haciendo calistenia en barras
    img: "https://images.unsplash.com/photo-1603570074851-c1ba8d7def6a?w=600&h=750&fit=crop&auto=format",
    color: G,
    tag: "CALISTENIA",
  },
];

/**
 * Componente de la Sección de Entrenadores.
 * Presenta a los coaches en tarjetas verticales de diseño angular. Las fotografías
 * usan un filtro en escala de grises y oscuro que cobra color y brillo de color
 * de acento de forma espectacular al pasar el cursor (hover).
 */
export default function Trainers() {
  return (
    <section
      id="entrenadores"
      className="relative py-24 md:py-32 overflow-hidden"
      style={{ background: "#0b0b0b" }} // Fondo oscuro
    >
      {/* Línea horizontal neón superior */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${O}, transparent)` }}
      />

      {/* Destello neón verde de fondo */}
      <Spray color={G} x="80%" y="20%" size={400} opacity={0.04} />

      <div className="max-w-7xl mx-auto px-5">

        {/* Encabezado */}
        <Reveal>
          <SectionHeading
            tag="// Entrenadores"
            pre="NUESTROS"
            accent="COACHES"
            sub="No son instructores de folleto. Son guerreros del barrio que viven lo que enseñan — cada rep, cada ronda."
          />
        </Reveal>

        {/* Tarjetas de entrenadores */}
        <div className="grid md:grid-cols-3 gap-8">
          {coaches.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.14}>
              <div
                className="group relative overflow-hidden cursor-default"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)" }}
              >
                {/* ─── FOTOGRAFÍA CON EFECTOS HOVER ─── */}
                <div className="relative h-80 bg-gray-900 overflow-hidden">
                  {/* Fotografía de Unsplash con filtros dinámicos en hover */}
                  <img
                    src={c.img}
                    alt={c.name}
                    className="w-full h-full object-cover object-top grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-90 transition-all duration-700 group-hover:scale-105"
                  />

                  {/* Capa de color de acento semitransparente sobre la foto al hacer hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                    style={{ background: c.color }}
                  />
                  {/* Gradiente oscuro inferior sobre la foto para legibilidad del nombre */}
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(8,8,8,1) 0%, rgba(8,8,8,0.3) 50%, transparent 100%)" }}
                  />

                  {/* Etiqueta autoadhesiva de especialidad inclinada con resplandor neón */}
                  <div
                    className="absolute top-4 left-4 px-3 py-1 text-xs font-black uppercase tracking-widest"
                    style={{
                      fontFamily: FM,
                      background: c.color,
                      color: "#080808",
                      transform: "rotate(-3deg)",
                      ...bg(c.color, 0.6),
                    }}
                  >
                    {c.tag}
                  </div>

                  {/* Gota decorativa escurriendo en el borde superior derecho de la foto */}
                  <div
                    className="absolute top-0 right-3 w-1 rounded-b-full"
                    style={{ height: 40, background: c.color, opacity: 0.55 }}
                  />

                  {/* Nombre impreso sobre la fotografía */}
                  <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                    <div
                      className="text-xl font-black uppercase tracking-wider text-white"
                      style={{ fontFamily: FD, textShadow: `0 0 15px ${c.color}70` }}
                    >
                      {c.name}
                    </div>
                  </div>
                </div>

                {/* ─── PANEL DE INFORMACIÓN DETALLADA ─── */}
                <div
                  className="p-6"
                  style={{
                    background: METAL, // Metal cepillado
                    border: `1px solid ${c.color}22`,
                    borderTop: `2px solid ${c.color}60`, // Línea superior de acento más gruesa
                  }}
                >
                  {/* Rol o especialidad del entrenador */}
                  <div
                    className="font-black uppercase tracking-widest mb-1 text-base"
                    style={{ fontFamily: FB, color: c.color, ...tg(c.color, 0.3) }}
                  >
                    {c.role}
                  </div>
                  {/* Experiencia y logros */}
                  <div
                    className="text-xs uppercase tracking-widest text-gray-600 mb-3"
                    style={{ fontFamily: FM }}
                  >
                    {c.exp}
                  </div>
                  {/* Biografía explicativa */}
                  <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: FB }}>
                    {c.bio}
                  </p>

                  {/* Valoración con estrellas (5 estrellas del color del entrenador) */}
                  <div className="flex gap-1 mt-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        size={12}
                        fill={c.color}
                        style={{ color: c.color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
