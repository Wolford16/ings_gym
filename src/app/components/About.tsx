import { Shield, Zap, Trophy } from "lucide-react";
import BrickBg from "./common/BrickBg";
import Spray from "./common/Spray";
import Reveal from "./common/Reveal";
import MonoTag from "./common/MonoTag";
import { R, O, G, Y, C, FD, FG, FB, FM, METAL, tg } from "./common/styleConstants";

// Pilares conceptuales de la sección "Nosotros"
const pillars = [
  {
    icon: <Shield size={30} />,
    word: "DISCIPLINA",
    color: R,
    text: "La disciplina forja lo que el talento no puede sostener. Aquí entrenamos la mente primero y el cuerpo después.",
  },
  {
    icon: <Zap size={30} />,
    word: "CONSTANCIA",
    color: O,
    text: "Un día no cambia nada. Mil días lo cambian todo. En INGS GYM construimos hábitos de acero.",
  },
  {
    icon: <Trophy size={30} />,
    word: "SUPERACIÓN",
    color: G,
    text: "Tu único rival eres tú de ayer. Cada sesión es una victoria sobre el que quería rendirse.",
  },
];

/**
 * Componente de la Sección "Nosotros" (About).
 * Narra la historia del gimnasio e introduce los pilares mediante tarjetas metálicas estilizadas
 * con remaches de acero e iluminación neón dinámica.
 */
export default function About() {
  return (
    <section
      id="nosotros"
      className="relative py-24 md:py-32 overflow-hidden"
      style={{ background: "#090909" }} // Gris extremadamente oscuro de fondo
    >
      {/* Pared de ladrillos sutil */}
      <BrickBg opacity={0.04} />

      {/* Destellos de iluminación neón */}
      <Spray color={R} x="5%" y="50%" size={500} opacity={0.06} />
      <Spray color={O} x="95%" y="40%" size={450} opacity={0.05} />

      {/* Línea vertical de acento tricolor en el extremo izquierdo de la sección */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2"
        style={{ background: `linear-gradient(to bottom, ${R}, ${O}, ${G})` }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5">

        {/* Rejilla de dos columnas (Texto a la izquierda, Imagen a la derecha) */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">

          {/* Columna Izquierda: Historia y Estadísticas */}
          <Reveal>
            <MonoTag>// Nuestra historia</MonoTag>
            <h2
              className="text-4xl md:text-5xl font-black uppercase leading-tight mb-6 text-white"
              style={{ fontFamily: FD }}
            >
              NACIMOS EN LA<br />
              <span style={{ color: R, ...tg(R, 0.5) }}>CALLE.</span><br />
              VIVIMOS EN EL GYM.
            </h2>
            <p className="text-lg leading-relaxed text-gray-400 mb-4" style={{ fontFamily: FB }}>
              INGS GYM nació en 2026 en un garaje del barrio con dos barras, un saco de boxeo
              roto y voluntad a prueba de todo. Lo que empezó como un refugio para los que no
              encajaban en los gimnasios corporativos, hoy es la comunidad underground más
              auténtica de la ciudad.
            </p>
            <p className="text-lg leading-relaxed text-gray-400" style={{ fontFamily: FB }}>
              No vendemos sueños de revista. Vendemos trabajo real, comunidad real y resultados
              que se forjan en el esfuerzo diario. No hay máquinas innecesarias ni espejos de
              vanidad — hay hierro, sudor y propósito.
            </p>

            {/* Lista horizontal de hitos/números del gimnasio */}
            <div className="flex gap-8 mt-8">
              {[
                ["10K+", "Sesiones al año"],
                ["98%", "Satisfacción"],
                ["#1", "Del barrio"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div
                    className="text-2xl font-black"
                    style={{ fontFamily: FD, color: R, ...tg(R, 0.6) }}
                  >
                    {n}
                  </div>
                  <div
                    className="text-xs uppercase tracking-widest"
                    style={{ fontFamily: FM, color: "#555" }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Columna Derecha: Imagen del Mural de Grafiti */}
          <Reveal delay={0.2}>
            <div className="relative">
              {/* Contenedor con clipPath para dar bordes con bisel angular */}
              <div
                className="overflow-hidden aspect-[4/3] bg-gray-900"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 88%, 93% 100%, 0 100%)" }}
              >
                {/* ─── IMAGEN DE FONDO DE UNSPLASH ─── */}
                {/* Imagen que retrata un mural urbano de grafiti de colores para reflejar cultura de barrio */}
                <img
                  src="https://images.unsplash.com/photo-1563697013858-7d658cdb639d?w=800&h=600&fit=crop&auto=format"
                  alt="Graffiti mural colorido"
                  className="w-full h-full object-cover brightness-[0.65]"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(135deg, ${R}30, transparent 60%)` }}
                />
              </div>

              {/* Etiqueta flotante con estilo grafiti inclinada y animada (.float-tag) */}
              <div
                className="absolute -bottom-5 -right-5 px-5 py-3 float-tag"
                style={{
                  fontFamily: FG,
                  fontSize: "1.6rem",
                  color: Y,
                  background: "#080808",
                  border: `2px solid ${Y}55`,
                  transform: "rotate(3deg)",
                  textShadow: `0 0 14px ${Y}80`,
                }}
              >
                desde el barrio ✊
              </div>

              {/* Mancha pequeña de spray decorativa en la esquina superior izquierda de la foto */}
              <div
                className="absolute -top-4 -left-4 w-14 h-14 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${R}90, transparent 70%)`,
                  filter: "blur(6px)",
                }}
              />
            </div>
          </Reveal>
        </div>

        {/* Sección Inferior: Fila de tarjetas de los pilares (Disciplina, Constancia, Superación) */}
        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <Reveal key={p.word} delay={i * 0.14}>
              <div
                className="relative p-8 group spray-hover cursor-default"
                style={{
                  background: METAL, // Fondo degradado simulando metal cepillado
                  border: `1px solid ${p.color}25`,
                  clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%)",
                }}
              >
                {/* Resplandor diagonal de neón en la esquina superior izquierda */}
                <div
                  className="absolute top-0 left-0 w-10 h-10 pointer-events-none"
                  style={{ background: `linear-gradient(135deg, ${p.color}70, transparent 60%)` }}
                />

                {/* Remaches metálicos de cromo en las esquinas superiores */}
                {[[4, 4], [4, 12], [12, 4]].map(([x, y], j) => (
                  <div
                    key={j}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{ top: y, left: x, background: C, opacity: 0.5 }}
                  />
                ))}

                {/* Icono del pilar con efecto hover de escala y resplandor neón */}
                <div
                  className="mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{
                    color: p.color,
                    filter: `drop-shadow(0 0 10px ${p.color}90)`,
                  }}
                >
                  {p.icon}
                </div>

                {/* Título del pilar */}
                <div
                  className="text-2xl font-black uppercase tracking-widest mb-3"
                  style={{ fontFamily: FD, color: p.color, ...tg(p.color, 0.55) }}
                >
                  {p.word}
                </div>

                {/* Texto del pilar */}
                <p className="text-gray-400 text-base leading-relaxed" style={{ fontFamily: FB }}>
                  {p.text}
                </p>

                {/* Línea horizontal neón inferior que se intensifica al hacer hover */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500 opacity-30 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(to right, transparent, ${p.color}, transparent)`,
                  }}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
