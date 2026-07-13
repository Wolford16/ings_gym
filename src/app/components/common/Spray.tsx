interface SprayProps {
  color: string;    // Color del aerosol (hexadecimal).
  x: string;        // Posición horizontal (por ejemplo, '10%').
  y: string;        // Posición vertical (por ejemplo, '50%').
  size?: number;    // Tamaño del círculo en píxeles (por defecto 300).
  opacity?: number; // Opacidad del efecto (por defecto 0.12).
}

/**
 * Componente que renderiza una mancha de pintura difuminada (spray paint blob).
 * Se utiliza para dar ambiente "underground" de iluminación neón en los fondos.
 */
export default function Spray({ color, x, y, size = 300, opacity = 0.12 }: SprayProps) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, ${color}40 35%, transparent 70%)`,
        opacity,
        filter: "blur(28px)",
        transform: "translate(-50%, -50%)", // Centra la mancha en las coordenadas (x, y)
      }}
      aria-hidden="true"
    />
  );
}
