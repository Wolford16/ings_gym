import SectionHeading from "./common/SectionHeading";
import Reveal from "./common/Reveal";
import Spray from "./common/Spray";
import { R, O, G, Y, C, FD, FM, tg, bg } from "./common/styleConstants";

// Configuración de las cinco áreas de las instalaciones
const facilities = [
  {
    label: "ÁREA DE PESAS",
    sub: "Hierro libre, barras olímpicas, potencias",
    // IMAGEN DE UNSPLASH: Zona de mancuernas alineadas
    img: "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=900&h=600&fit=crop&auto=format",
    color: R, // Rojo neón
    span: "md:col-span-2", // Ocupa 2 columnas en la rejilla en pantallas de escritorio
    h: "300px",
  },
  {
    label: "ZONA DE BOXEO",
    sub: "Sacos, guantes, ring completo",
    // IMAGEN DE UNSPLASH: Saco de boxeo colgando en gimnasio
    img: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=700&h=600&fit=crop&auto=format",
    color: O, // Naranja neón
    span: "",
    h: "300px",
  },
  {
    label: "ENTRENAMIENTO FUNCIONAL",
    sub: "TRX, kettlebells, plataformas",
    // IMAGEN DE UNSPLASH: Cuerdas de batalla (battle ropes) en el piso
    img: "https://images.unsplash.com/photo-1722925541142-5db2668ca492?w=700&h=500&fit=crop&auto=format",
    color: G, // Verde eléctrico
    span: "",
    h: "260px",
  },
  {
    label: "STREET WORKOUT",
    sub: "Barras de tracción, dip bars, paralelas",
    // IMAGEN DE UNSPLASH: Barras de calistenia al aire libre o gimnasio
    img: "https://images.unsplash.com/photo-1603570074851-c1ba8d7def6a?w=700&h=500&fit=crop&auto=format",
    color: Y, // Oro / Amarillo
    span: "",
    h: "260px",
  },
  {
    label: "EQUIPAMIENTO PREMIUM",
    sub: "Todo el gear que necesitás",
    // IMAGEN DE UNSPLASH: Discos olímpicos apilados de colores
    img: "https://images.unsplash.com/photo-1672344048213-76b6e77304bd?w=700&h=500&fit=crop&auto=format",
    color: C, // Cromo / Plata
    span: "",
    h: "260px",
  },
];

/**
 * Componente de la Sección de Instalaciones (Gallery).
 * Muestra las zonas del gimnasio en una grilla asimétrica dinámica (masonry-like grid).
 * Cada celda tiene bordes recortados en bisel, desaturación de imagen al 100% que
 * recobra color e iluminación neón de fondo al hacer hover.
 */
export default function Facilities() {
  return (
    <section
      id="instalaciones"
      className="relative py-24 md:py-32 overflow-hidden"
      style={{ background: "#070707" }} // Fondo oscuro uniforme
    >
      {/* Barra de acento neón vertical en el extremo derecho */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2"
        style={{ background: `linear-gradient(to bottom, ${R}, ${O}, ${G})` }}
      />
      
      {/* Destello neón amarillo de fondo */}
      <Spray color={Y} x="10%" y="70%" size={350} opacity={0.04} />

      <div className="max-w-7xl mx-auto px-5">
        
        {/* Encabezado */}
        <Reveal>
          <SectionHeading
            tag="// Instalaciones"
            pre="NUESTRO"
            accent="ESPACIO"
            sub="Un campo de batalla construido para los que van en serio. Industrial, crudo, auténtico."
          />
        </Reveal>

        {/* Rejilla de celdas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {facilities.map((f, i) => (
            <Reveal key={f.label} delay={i * 0.09} className={f.span}>
              <div
                className="relative group overflow-hidden cursor-default"
                style={{
                  height: f.h,
                  clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)",
                }}
              >
                {/* Imagen del área con efectos hover de color y escala */}
                <img
                  src={f.img}
                  alt={f.label}
                  className="w-full h-full object-cover grayscale brightness-[0.6] group-hover:grayscale-0 group-hover:brightness-[0.75] transition-all duration-700 group-hover:scale-108"
                />
                
                {/* Capa de tinte de color de acento al hacer hover */}
                <div
                  className="absolute inset-0 group-hover:opacity-30 transition-opacity duration-400 opacity-0"
                  style={{ background: f.color }}
                />
                {/* Filtro sutil oscuro intermedio */}
                <div className="absolute inset-0" style={{ background: "rgba(8, 8, 8, 0.42)" }} />

                {/* Textos inferiores descriptivos */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div
                    className="font-black uppercase tracking-widest text-base"
                    style={{ fontFamily: FD, color: f.color, ...tg(f.color, 0.65) }}
                  >
                    {f.label}
                  </div>
                  <div
                    className="text-xs uppercase tracking-widest text-gray-600 mt-1"
                    style={{ fontFamily: FM }}
                  >
                    {f.sub}
                  </div>
                  {/* Línea horizontal de adorno que crece hacia la derecha en hover */}
                  <div
                    className="h-0.5 mt-3 w-0 group-hover:w-16 transition-all duration-400"
                    style={{ background: f.color }}
                  />
                </div>

                {/* Pequeño indicador circular (luz de estado neón) en la esquina superior derecha */}
                <div
                  className="absolute top-3 right-3 w-3 h-3 rounded-full"
                  style={{ background: f.color, ...bg(f.color, 0.9) }}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
