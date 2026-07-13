import React from "react";
import { useReveal } from "../../hooks/useReveal";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;     // Retraso en segundos antes de iniciar la animación (por defecto 0).
  y?: number;         // Desplazamiento inicial en el eje Y en píxeles (por defecto 36).
  className?: string; // Clases opcionales de Tailwind.
}

/**
 * Componente contenedor que aplica una animación de transición suave
 * (fade-in y slide-up) al elemento cuando éste se vuelve visible al hacer scroll.
 * Utiliza el hook useReveal internamente.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 36,
  className = "",
}: RevealProps) {
  const { ref, v } = useReveal();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        // Si es visible (v === true), opacidad 1 y sin desplazamiento.
        // Si no, opacidad 0 y desplazado hacia abajo.
        opacity: v ? 1 : 0,
        transform: v ? "none" : `translateY(${y}px)`,
        // Transiciones con curva bezier personalizada para suavidad máxima
        transition: `opacity .8s ease ${delay}s, transform .8s cubic-bezier(.22, .68, 0, 1.05) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
