import { R } from "./styleConstants";

interface SprayDividerProps {
  color?: string;  // Color de la pintura/gotas (por defecto R - rojo neón).
  flip?: boolean;  // Invierte el sentido vertical de las gotas (por defecto false).
}

/**
 * Componente divisor que representa una línea de pintura de aerosol con
 * gotas que chorrean verticalmente. Se utiliza entre secciones de la página.
 */
export default function SprayDivider({ color = R, flip = false }: SprayDividerProps) {
  // Posiciones en porcentaje (%) horizontales de las gotas que escurren
  const drips = [10, 22, 35, 48, 58, 70, 82, 91];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: 56,
        marginTop: -2,
        marginBottom: -2,
      }}
      aria-hidden="true"
    >
      {/* Línea horizontal central con gradiente de desvanecimiento en los extremos */}
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{
          background: `linear-gradient(to right, transparent, ${color}90, ${color}, ${color}90, transparent)`,
        }}
      />

      {/* Renderizar cada gota chorreando */}
      {drips.map((pct, i) => (
        <div
          key={i}
          className="absolute top-0 w-1 rounded-b-full"
          style={{
            left: `${pct}%`,
            // El largo de la gota varía matemáticamente para lucir natural
            height: `${20 + (i % 3) * 18}px`,
            background: color,
            opacity: 0.55 + (i % 2) * 0.2,
            // El grosor de la gota varía entre 2px y 4px
            width: `${2 + (i % 3)}px`,
            filter: `drop-shadow(0 0 4px ${color})`,
            // Permite invertir verticalmente la gota si es necesario (ej. para fin de sección)
            transform: flip ? "scaleY(-1)" : "none",
            transformOrigin: "top center",
          }}
        />
      ))}
    </div>
  );
}
