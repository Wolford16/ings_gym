import React from "react";
import { O, FM } from "./styleConstants";

interface MonoTagProps {
  children: React.ReactNode;
  color?: string; // Color neón de la etiqueta (por defecto O - naranja neón).
}

/**
 * Componente que renderiza una pequeña etiqueta de estilo monospace (código/técnico)
 * con letras mayúsculas espaciadas, borde fino y fondo semitransparente.
 */
export default function MonoTag({ children, color = O }: MonoTagProps) {
  return (
    <span
      className="inline-block text-xs tracking-[.38em] uppercase px-3 py-1 mb-5"
      style={{
        fontFamily: FM,
        color,
        border: `1px solid ${color}50`,
        background: `${color}09`, // Agrega un 9% de opacidad al color de fondo
      }}
    >
      {children}
    </span>
  );
}
