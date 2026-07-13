import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import BrickBg from "./common/BrickBg";
import SectionHeading from "./common/SectionHeading";
import Reveal from "./common/Reveal";
import Spray from "./common/Spray";
import { R, O, G, Y, FD, FG, FM, tg, bg } from "./common/styleConstants";

// Listado de reseñas de miembros
const reviews = [
  {
    q: "INGS GYM me cambió la vida. No exagero. Llegué sin autoestima y ahora compito en regionales. La comunidad aquí es diferente — genuina, sin poses, puro trabajo.",
    name: "Roberto Salas",
    label: "Miembro desde 2026",
    color: R, // Rojo neón
  },
  {
    q: "Vengo de los gimnasios caros del centro y ninguno se acerca a esto. La energía, los entrenadores, el ambiente... esto es lo real. Esto es lo que busca la gente que va en serio.",
    name: "Valentina Cruz",
    label: "Miembro desde 2026",
    color: O, // Naranja neón
  },
  {
    q: "El Maestro Miguel me enseñó que no necesito máquinas para ser fuerte. En seis meses logré cosas que nunca creí posibles. INGS GYM no es un gimnasio — es una escuela de vida.",
    name: "Diego Herrera",
    label: "Miembro desde 2026",
    color: G, // Verde eléctrico
  },
  {
    q: "Como boxeadora amateur, encontré en Ana Torres a la mejor mentora que pude imaginar. INGS GYM es mi segunda casa. Acá me siento parte de algo real.",
    name: "Paola Méndez",
    label: "Miembro desde 2026",
    color: Y, // Amarillo neón
  },
];

/**
 * Componente de la Sección de Testimonios (Reseñas).
 * Cuenta con un carrusel dinámico automatizado que rota la reseña visible cada 5 segundos
 * y permite navegación manual mediante botones direccionales e indicadores lineales en bisel.
 * Aplica la animación css `sprayIn` en cada cambio.
 */
export default function Testimonials() {
  const [active, setActive] = useState(0);

  // Efecto para la transición automática de las diapositivas
  useEffect(() => {
    const t = setInterval(() => {
      setActive((a) => (a + 1) % reviews.length);
    }, 5000); // 5000 ms = 5 segundos

    // Limpieza del intervalo al cambiar de diapositiva o desmontar el componente
    return () => clearInterval(t);
  }, [active]);

  const r = reviews[active];

  return (
    <section
      className="relative py-24 md:py-32 overflow-hidden"
      style={{ background: "#0c0c0c" }} // Fondo oscuro
    >
      {/* Patrón de pared de ladrillos decorativo */}
      <BrickBg opacity={0.055} />

      {/* Destello neón verde de fondo */}
      <Spray color={G} x="90%" y="50%" size={400} opacity={0.04} />

      {/* Línea horizontal neón verde superior */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${G}, transparent)` }}
      />

      {/* ─── IMAGEN DE FONDO DE UNSPLASH ─── */}
      {/* Imagen difuminada de un atleta ejercitándose en la penumbra para dar ambientación.
          Tiene una opacidad muy baja (5%) para integrarse sutilmente en el fondo negro */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
        <img
          src="https://images.unsplash.com/photo-1581515290072-58a77ef204ec?w=1920&h=1080&fit=crop&auto=format"
          alt="Gym training background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5">

        {/* Encabezado de la sección */}
        <Reveal>
          <SectionHeading
            tag="// Testimonios"
            pre="LO QUE DICE"
            accent="LA GENTE"
            sub="Sin guiones, sin actores. Esto lo escribieron las personas que lo vivieron."
          />
        </Reveal>

        {/* Poster / Tarjeta de la Reseña Activa */}
        {/* Se usa 'key={active}' para forzar el remontaje del componente y disparar
            la animación CSS 'sprayIn' en cada cambio de diapositiva */}
        <div className="relative" key={active}>
          <div
            className="relative p-10 md:p-14"
            style={{
              // Gradiente de fondo oscuro de cuatro puntos
              background: "linear-gradient(135deg, #110000, #1a0900, #0c0c00, #001108)",
              border: `2px solid ${r.color}45`,
              clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 28px), calc(100% - 28px) 100%, 0 100%)",
              ...bg(r.color, 0.6),
              // Animación CSS definida en animations.css
              animation: "sprayIn .55s ease both",
            }}
          >
            {/* Adorno superior izquierdo simulando cinta adhesiva pegando el póster a la pared */}
            <div
              className="absolute -top-1 -left-1 w-16 h-4 opacity-40"
              style={{ background: Y, transform: "rotate(-3deg)" }}
            />
            <div
              className="absolute -top-1 left-10 w-12 h-4 opacity-30"
              style={{ background: Y, transform: "rotate(1deg)" }}
            />

            {/* Icono de comillas gigante al fondo de la tarjeta */}
            <div
              className="absolute top-4 left-6 text-[7rem] leading-none select-none pointer-events-none"
              style={{ fontFamily: FG, color: r.color, opacity: 0.08 }}
            >
              &ldquo;
            </div>

            {/* Resplandores neón en esquinas internas del poster */}
            <div
              className="absolute top-0 left-0 w-28 h-28 pointer-events-none"
              style={{ background: `radial-gradient(circle at top left, ${r.color}30, transparent 60%)` }}
            />
            <div
              className="absolute bottom-0 right-0 w-36 h-24 pointer-events-none"
              style={{ background: `radial-gradient(circle at bottom right, ${r.color}15, transparent 60%)` }}
            />

            {/* Icono de cita de Lucide con filtro neón */}
            <Quote
              size={26}
              className="mb-6"
              style={{ color: r.color, filter: `drop-shadow(0 0 8px ${r.color}90)` }}
            />

            {/* Texto de la reseña */}
            <p
              className="text-xl md:text-2xl font-black leading-relaxed text-white mb-8"
              style={{ fontFamily: FD, textShadow: "2px 2px 0 #000" }}
            >
              &ldquo;{r.q}&rdquo;
            </p>

            {/* Fila del autor de la reseña */}
            <div className="flex items-center gap-4">
              {/* Inicial del nombre encerrada en un octágono neón recortado con clipPath */}
              <div
                className="w-11 h-11 flex items-center justify-center font-black text-lg flex-shrink-0"
                style={{
                  fontFamily: FG,
                  background: r.color,
                  color: "#080808",
                  clipPath: "polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)",
                }}
              >
                {r.name[0]}
              </div>

              {/* Nombre e información */}
              <div>
                <div className="font-black uppercase tracking-widest text-white" style={{ fontFamily: FD }}>
                  {r.name}
                </div>
                <div
                  className="text-xs uppercase tracking-widest mt-0.5"
                  style={{ fontFamily: FM, color: r.color }}
                >
                  {r.label}
                </div>
              </div>

              {/* Valoración en estrellas */}
              <div className="ml-auto flex gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    fill={r.color}
                    style={{ color: r.color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ─── CONTROLES DE NAVEGACIÓN MANUAL ─── */}
          <div className="flex items-center justify-center gap-6 mt-8">
            {/* Botón de anterior */}
            <button
              onClick={() => setActive((a) => (a - 1 + reviews.length) % reviews.length)}
              className="p-2 spray-hover"
              style={{ color: O, border: `1px solid ${O}40` }}
              aria-label="Anterior"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Indicadores lineales tipo barra neón */}
            <div className="flex gap-3">
              {reviews.map((rv, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Testimonio ${i + 1}`}
                  className="transition-all duration-300"
                  style={{
                    // El botón activo es más ancho y brilla
                    width: active === i ? 30 : 10,
                    height: 10,
                    background: active === i ? rv.color : "#2a2a2a",
                    clipPath: "polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)",
                    ...(active === i ? bg(rv.color, 0.5) : {}),
                  }}
                />
              ))}
            </div>

            {/* Botón de siguiente */}
            <button
              onClick={() => setActive((a) => (a + 1) % reviews.length)}
              className="p-2 spray-hover"
              style={{ color: O, border: `1px solid ${O}40` }}
              aria-label="Siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
