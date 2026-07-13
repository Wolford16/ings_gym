import MonoTag from "./MonoTag";
import { R, FD, FB, tg } from "./styleConstants";

interface SectionHeadingProps {
  tag: string;          // Contenido del tag superior (ej. '// Membresías').
  pre: string;          // Primera parte del título principal.
  accent?: string;      // Palabra opcional resaltada en color rojo neón.
  sub?: string;         // Párrafo descriptivo secundario.
  cAlign?: "center" | "left" | "right"; // Alineación de texto (por defecto "center").
}

/**
 * Componente de título estándar para las secciones principales de la landing page.
 * Muestra una etiqueta mono, un título en mayúsculas gigantes con sombreado 3D y
 * un texto explicativo opcional.
 */
export default function SectionHeading({
  tag,
  pre,
  accent,
  sub,
  cAlign = "center",
}: SectionHeadingProps) {
  return (
    <div className={`mb-14 text-${cAlign}`}>
      {/* Etiqueta superior monospace */}
      <MonoTag>{tag}</MonoTag>
      
      {/* Título gigante con fuente gruesa Black Ops One */}
      <h2
        className="text-5xl md:text-7xl font-black uppercase leading-none tracking-wider text-white mb-4"
        style={{
          fontFamily: FD,
          textShadow: "4px 4px 0 #000", // Sombra dura estilo cómic/retro
        }}
      >
        {pre}
        {accent && (
          <span style={{ color: R, ...tg(R, 0.7) }}>
            {" "}{accent}
          </span>
        )}
      </h2>

      {/* Subtítulo descriptivo en Barlow Condensed */}
      {sub && (
        <p
          className="text-lg max-w-2xl mx-auto mt-3"
          style={{
            fontFamily: FB,
            color: "#888", // Gris oscuro atenuado
            fontWeight: 400,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
