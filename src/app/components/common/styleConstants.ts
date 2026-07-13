/**
 * constantes de diseño y paleta de colores del proyecto INGS GYM
 * Estos valores definen el tema visual "underground" del gimnasio.
 */

// Paleta de colores neón y metálicos
export const R = "#ff1500";   // Rojo neón
export const O = "#ff6600";   // Naranja neón
export const G = "#39ff14";   // Verde eléctrico
export const Y = "#ffd700";   // Oro / Amarillo neón
export const C = "#b0bec5";   // Plata cromo

// Estilos de fuentes tipográficas específicas
export const FD = "'Black Ops One', sans-serif";     // Fuente para títulos grandes / militares
export const FG = "'Permanent Marker', cursive";     // Fuente estilo grafiti / pintado a mano
export const FB = "'Barlow Condensed', sans-serif";  // Fuente condensada para textos informativos
export const FM = "'Share Tech Mono', monospace";    // Fuente monospace para detalles técnicos y tags

// Gradientes de fondo tipo industrial / metálico
export const METAL = `linear-gradient(158deg,#2e2e2e 0%,#3c3c3c 20%,#1e1e1e 45%,#353535 70%,#242424 100%)`;
export const STEEL = `linear-gradient(180deg,#1a1a1a,#111,#0e0e0e)`;

/**
 * Genera el estilo CSS para un sombreado de texto (resplandor de neón).
 * @param color Color en formato hexadecimal.
 * @param s Factor de escala para el tamaño del resplandor (por defecto 1).
 */
export const tg = (color: string, s = 1) => ({
  textShadow: `0 0 ${8 * s}px ${color}, 0 0 ${22 * s}px ${color}70, 0 0 ${50 * s}px ${color}28`,
});

/**
 * Genera el estilo CSS para una sombra de caja (resplandor exterior de neón).
 * @param color Color en formato hexadecimal.
 * @param s Factor de escala para el tamaño del resplandor (por defecto 1).
 */
export const bg = (color: string, s = 1) => ({
  boxShadow: `0 0 ${12 * s}px ${color}80, 0 0 ${28 * s}px ${color}40, 0 0 ${60 * s}px ${color}15`,
});
