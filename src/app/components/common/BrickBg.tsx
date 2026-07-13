interface BrickBgProps {
  opacity?: number; // Opacidad del patrón de ladrillos (por defecto 0.06).
}

/**
 * Componente decorativo que dibuja un patrón geométrico de pared de ladrillos en CSS.
 * Se dibuja como una superposición absoluta y bloquea eventos de ratón.
 */
export default function BrickBg({ opacity = 0.06 }: BrickBgProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Capa base del patrón de ladrillos */}
      <div
        className="w-full h-full"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, #555 0, #555 1px, transparent 1px, transparent 28px),
            repeating-linear-gradient(90deg, #555 0, #555 1px, transparent 1px, transparent 52px)
          `,
        }}
      />
      {/* Capa de compensación para desfasar las filas alternas y lograr el aspecto real de tabique */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg,
            transparent 0, transparent 14px,
            #444 14px, #444 15px,
            transparent 15px, transparent 28px
          )`,
          backgroundPositionX: "26px",
        }}
      />
    </div>
  );
}
