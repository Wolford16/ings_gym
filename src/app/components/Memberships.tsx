import { useState } from "react";
import { Check } from "lucide-react";
import SectionHeading from "./common/SectionHeading";
import Reveal from "./common/Reveal";
import Spray from "./common/Spray";
import { R, O, C, FD, FB, FM, METAL, tg, bg } from "./common/styleConstants";

// Datos de los 3 planes de membresía
const plans = [
  {
    tier: "BÁSICO",
    price: "$5",
    period: "/mes",
    tag: "El punto de entrada",
    color: C, // Color de acento cromo
    feats: [
      "Acceso 6 días/semana",
      "Zona de pesas libre",
      "Vestuarios y duchas",
      "Casillero incluido",
      "Clases grupales básicas",
    ],
    cta: "EMPIEZA AQUÍ",
  },
  {
    tier: "PRO",
    price: "$15",
    period: "/mes",
    tag: "El más elegido",
    color: O, // Color de acento naranja neón
    feats: [
      "Acceso 7 días ilimitado",
      "Todas las zonas del gym",
      "2 sesiones/mes con coach",
      "Clases premium incluidas",
      "Plan de evaluación mensual",
      "App de progreso INGS",
    ],
    cta: "ÚNETE AL PRO",
    featured: true, // Plan destacado (popular)
  },
  {
    tier: "ELITE",
    price: "$50",
    period: "/mes",
    tag: "Sin límites",
    color: R, // Color de acento rojo neón
    feats: [
      "VIP access 24/7",
      "Coach personal ilimitado",
      "Nutrición personalizada",
      "Prioridad en todas las clases",
      "Zona privada exclusiva",
      "Ropa INGS GYM",
      "Eventos y retiros",
    ],
    cta: "IR AL ELITE",
  },
];

/**
 * Componente de la Sección de Membresías.
 * Muestra los tres niveles de precios presentados como placas de metal cepillado pesadas,
 * con remaches decorativos en las esquinas y retroiluminación reactiva al pasar el ratón.
 */
export default function Memberships() {
  // Estado para saber cuál de las tarjetas tiene el cursor encima (hover)
  const [hov, setHov] = useState<number | null>(null);

  return (
    <section
      id="membresias"
      className="relative py-24 md:py-32 overflow-hidden"
      style={{ background: "#080808" }} // Fondo extremadamente oscuro
    >
      {/* ─── IMAGEN DE FONDO DE UNSPLASH ─── */}
      {/* Imagen que muestra cadenas de acero y pesas desenfocadas para añadir textura industrial.
          Se le aplica una opacidad muy baja (5%) para que no compita con el texto */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1560350894-68244ac04656?w=1920&h=1080&fit=crop&auto=format"
          alt="Metal chains background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Capa de oscurecimiento sobre la imagen de fondo */}
      <div className="absolute inset-0" style={{ background: "rgba(8, 8, 8, 0.88)" }} />

      {/* Luz neón naranja de fondo */}
      <Spray color={O} x="50%" y="50%" size={700} opacity={0.04} />

      {/* Borde superior neón tricolor desvanecido */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${R}, ${O}, transparent)` }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5">

        {/* Encabezado de la sección */}
        <Reveal>
          <SectionHeading
            tag="// Membresías"
            pre="ELIGE TU"
            accent="NIVEL"
            sub="Placas metálicas forjadas a tu medida. Sin contratos trampa, sin letra pequeña corporativa."
          />
        </Reveal>

        {/* Contenedor de las 3 tarjetas de planes */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((pl, i) => (
            <Reveal key={pl.tier} delay={i * 0.15}>
              <div
                className="relative h-full flex flex-col p-8 cursor-default"
                onMouseEnter={() => setHov(i)}
                onMouseLeave={() => setHov(null)}
                style={{
                  // Si el plan es el destacado, tiene un degradado especial de óxido/cobre
                  background: pl.featured
                    ? "linear-gradient(160deg, #1e0a00, #2a1000, #180800)"
                    : METAL,
                  border: `1px solid ${pl.color}${hov === i ? "75" : "28"}`,
                  clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%)",
                  // Efecto de elevación al pasar el mouse
                  transform: hov === i ? "translateY(-10px)" : "none",
                  transition: "all .38s cubic-bezier(.22, .68, 0, 1.2)",
                  // Sombra de brillo neón activa en hover
                  ...(hov === i ? bg(pl.color, 0.95) : {}),
                }}
              >
                {/* Insignia de "MÁS POPULAR" para el plan destacado */}
                {pl.featured && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 text-xs font-black uppercase tracking-widest"
                    style={{
                      fontFamily: FM,
                      background: O,
                      color: "#080808",
                      ...bg(O, 0.5),
                    }}
                  >
                    MÁS POPULAR
                  </div>
                )}

                {/* Brillo neón interno en la esquina superior derecha */}
                <div
                  className="absolute top-0 right-0 w-24 h-24 opacity-15 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at top right, ${pl.color}, transparent 70%)`,
                  }}
                />

                {/* Remaches de acero posicionados en esquinas contrarias */}
                {[[6, 6], [0, 0]].map((_, j) => (
                  <div
                    key={j}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      bottom: j === 0 ? 10 : undefined,
                      top: j === 1 ? 10 : undefined,
                      right: j === 0 ? 10 : undefined,
                      left: j === 1 ? 10 : undefined,
                      background: C,
                      opacity: 0.45,
                      border: `1px solid ${C}70`,
                    }}
                  />
                ))}

                {/* Encabezado del plan */}
                <div className="mb-5">
                  <div
                    className="text-xs uppercase tracking-[0.4em] mb-1.5"
                    style={{ fontFamily: FM, color: pl.color, opacity: 0.75 }}
                  >
                    {pl.tag}
                  </div>
                  <div
                    className="text-3xl font-black uppercase tracking-widest"
                    style={{ fontFamily: FD, color: pl.color, ...tg(pl.color, 0.42) }}
                  >
                    {pl.tier}
                  </div>
                </div>

                {/* Precio */}
                <div className="flex items-end gap-1 mb-6">
                  <span
                    className="text-5xl font-black text-white"
                    style={{ fontFamily: FD, ...tg(pl.color, 0.3) }}
                  >
                    {pl.price}
                  </span>
                  <span className="text-gray-600 mb-1.5 text-lg" style={{ fontFamily: FB }}>
                    {pl.period}
                  </span>
                </div>

                {/* Línea divisoria metálica */}
                <div
                  className="w-full h-px mb-6"
                  style={{ background: `linear-gradient(to right, ${pl.color}70, transparent)` }}
                />

                {/* Lista de características */}
                <ul className="flex-1 space-y-3 mb-8">
                  {pl.feats.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check
                        size={13}
                        className="mt-1 flex-shrink-0"
                        style={{ color: pl.color }}
                      />
                      <span className="text-gray-400 text-base" style={{ fontFamily: FB }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Botón de llamado a la acción (CTA) con clipPath angular */}
                <a
                  href="#contacto"
                  className="block text-center py-3 font-black uppercase tracking-widest text-sm spray-hover"
                  style={{
                    fontFamily: FD,
                    background: pl.featured ? O : "transparent",
                    color: pl.featured ? "#080808" : pl.color,
                    border: pl.featured ? "none" : `2px solid ${pl.color}65`,
                    clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                    ...(pl.featured ? bg(O, 0.65) : {}),
                  }}
                >
                  {pl.cta}
                </a>

                {/* Fila de 3 pequeños remaches indicadores decorativos en la esquina inferior izquierda */}
                <div className="absolute bottom-3 left-4 flex gap-2">
                  {[0, 1, 2].map((r) => (
                    <div
                      key={r}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: `${pl.color}40`,
                        border: `1px solid ${pl.color}60`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
