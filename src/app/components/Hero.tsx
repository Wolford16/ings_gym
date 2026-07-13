import { motion } from "motion/react";
import Barbell from "./common/Barbell";
import Spray from "./common/Spray";
import { R, O, G, FD, FG, FM, tg, bg } from "./common/styleConstants";

/**
 * Componente de la Sección Hero (Cabecera Principal).
 * Presenta una atmósfera oscura e industrial de gimnasio subterráneo, utilizando
 * múltiples imágenes de fondo superpuestas, manchas de spray neón, una barra
 * de pesas SVG animada y títulos estilizados con tipografías impactantes.
 */
export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/* ─── IMÁGENES DE FONDO DE UNSPLASH ─── */}

      {/* IMAGEN 1: Túnel con grafiti y luces rojas / oscuras. 
          Se le aplica 'luminosity' para unificarla con el tono del sitio */}
      <img
        src="https://images.unsplash.com/photo-1651675804338-8a1cbfb5bd54?w=1920&h=1080&fit=crop&auto=format"
        alt="Graffiti tunnel background"
        className="absolute inset-0 w-full h-full object-cover opacity-35"
        style={{ mixBlendMode: "luminosity" }}
      />

      {/* IMAGEN 2: Silueta de barra olímpica en gimnasio industrial oscuro. 
          Agrega textura de gimnasio y profundidad */}
      <img
        src="https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=1920&h=1080&fit=crop&auto=format"
        alt="Gym barbell background"
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      />

      {/* ─── SUPERPOSICIONES DE COLOR Y GRADIENTES ─── */}

      {/* Degradado general para oscurecer y fusionar las imágenes */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, rgba(8, 0, 0, 0.85) 0%, rgba(8, 8, 8, 0.5) 55%, rgba(0, 6, 10, 0.88) 100%)",
        }}
      />
      {/* Degradado radial para simular un reflector neón rojo en la esquina inferior izquierda */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 65% at 20% 70%, ${R}25 0%, transparent 60%)`,
        }}
      />
      {/* Degradado radial para simular un reflector neón naranja en la esquina superior derecha */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 85% 20%, ${O}14 0%, transparent 55%)`,
        }}
      />

      {/* Manchas de pintura en aerosol (aerosol blobs) de colores neón en posiciones específicas */}
      <Spray color={R} x="8%" y="30%" size={400} opacity={0.09} />
      <Spray color={O} x="92%" y="70%" size={350} opacity={0.08} />
      <Spray color={G} x="50%" y="90%" size={280} opacity={0.05} />

      {/* Efecto de líneas de escaneo de TV clásica (Scanlines) sobre toda la pantalla */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.08) 0, rgba(0, 0, 0, 0.08) 1px, transparent 1px, transparent 4px)",
        }}
      />

      {/* Rayos/líneas verticales de luz simulados con gradientes finos */}
      {[20, 50, 78].map((pct, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: `${pct}%`,
            width: 1.5,
            background: `linear-gradient(to bottom, transparent, ${i === 1 ? R : O}${i === 1 ? "40" : "22"}, transparent)`,
            opacity: 0.6,
          }}
        />
      ))}

      {/* ─── CONTENIDO PRINCIPAL DE LA PÁGINA ─── */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">

        {/* Etiqueta superior del gimnasio con animación de entrada (Framer Motion) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-7"
        >
          <span
            className="inline-block text-xs tracking-[0.45em] uppercase px-5 py-2"
            style={{
              fontFamily: FM,
              color: O,
              border: `1px solid ${O}55`,
              background: `${O}08`,
            }}
          >
            // EST. 2026 · BARRIO UNDERGROUND FITNESS //
          </span>
        </motion.div>

        {/* Barbell central animado en escala y entrada */}
        <motion.div
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.18 }}
          className="flex justify-center mb-6"
        >
          <Barbell w={220} />
        </motion.div>

        {/* Título y Subtítulo principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.35 }}
        >
          <h1
            className="font-black leading-none uppercase tracking-widest mb-3"
            style={{
              fontFamily: FD,
              fontSize: "clamp(4.5rem, 14vw, 10.5rem)",
              color: "white",
              // Sombra de texto 3D neón roja multinivel muy premium
              textShadow: `0 0 30px ${R}, 0 0 65px ${R}55, 0 0 110px ${R}22, 6px 6px 0 #000, 12px 12px 0 rgba(255, 21, 0, 0.15)`,
            }}
          >
            <span style={{ color: R }}>INGS</span> GYM
          </h1>

          {/* Subtítulo grafiti con animación flotante CSS (.float-tag) */}
          <div
            className="float-tag inline-block"
            style={{
              fontFamily: FG,
              fontSize: "clamp(1.1rem, 3vw, 1.8rem)",
              color: O,
              textShadow: `0 0 20px ${O}90`,
              transform: "rotate(-2deg)",
            }}
          >
            Underground Fitness · Barrio Culture · Puro Trabajo
          </div>
        </motion.div>

        {/* Eslogan secundario */}
        <motion.p
          className="text-2xl md:text-4xl font-black uppercase tracking-wider text-white mt-10 mb-10 leading-tight"
          style={{
            fontFamily: FD,
            textShadow: "4px 4px 0 #000",
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          SIN EXCUSAS.{" "}
          <span style={{ color: R, ...tg(R) }}>SIN ATAJOS.</span>
          <br />SOLO TRABAJO.
        </motion.p>

        {/* Botones de acción principales */}
        <motion.div
          className="flex flex-col sm:flex-row gap-5 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <a
            href="#membresias"
            className="spray-hover px-12 py-4 font-black uppercase tracking-widest text-white text-lg"
            style={{
              fontFamily: FD,
              background: `linear-gradient(135deg, ${R}, #c00)`,
              clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
              ...bg(R, 1.2),
            }}
          >
            ÚNETE AL MOVIMIENTO
          </a>
          <a
            href="#nosotros"
            className="spray-hover px-12 py-4 font-black uppercase tracking-widest text-white text-lg border"
            style={{
              fontFamily: FD,
              borderColor: `${O}65`,
              clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
            }}
          >
            CONOCE MÁS
          </a>
        </motion.div>

        {/* Fila de estadísticas rápidas */}
        <motion.div
          className="mt-16 flex justify-center gap-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
        >
          {[
            ["500+", "Miembros"],
            ["12", "Entrenadores"],
            ["8", "Años en el barrio"],
          ].map(([n, l]) => (
            <div key={l} className="text-center">
              <div
                className="text-3xl font-black neon-pulse"
                style={{ fontFamily: FD, color: R, ...tg(R, 0.8) }}
              >
                {n}
              </div>
              <div
                className="text-xs uppercase tracking-widest mt-1"
                style={{ fontFamily: FM, color: "#666" }}
              >
                {l}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Degradado negro inferior para transición suave con la siguiente sección */}
      <div
        className="absolute bottom-0 left-0 right-0 h-52 pointer-events-none"
        style={{
          background: "linear-gradient(to top, #080808 0%, rgba(8, 8, 8, 0.6) 50%, transparent 100%)",
        }}
      />

      {/* Indicador animado de scroll hacia abajo */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div
          className="text-xs uppercase tracking-[0.4em]"
          style={{ fontFamily: FM, color: "#444" }}
        >
          scroll
        </div>
        <motion.div
          className="w-px h-14"
          style={{
            background: `linear-gradient(to bottom, ${R}90, transparent)`,
          }}
          animate={{ scaleY: [1, 0.25, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      </div>
    </section>
  );
}
