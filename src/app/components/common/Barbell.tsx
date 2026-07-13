import { R, O, C } from "./styleConstants";

interface BarbellProps {
  w?: number; // Ancho del SVG. El alto se calcula automáticamente (w * 0.42).
}

/**
 * Componente que renderiza una barra de pesas (barbell) e iconos de puños cerrados sujetándola,
 * con gradientes metálicos y detalles de iluminación neón.
 */
export default function Barbell({ w = 200 }: BarbellProps) {
  const h = w * 0.42;
  
  return (
    <svg width={w} height={h} viewBox="0 0 200 84" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Gradientes lineales para los discos de la izquierda y derecha */}
        <linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={O} />
          <stop offset="100%" stopColor="#a33d00" />
        </linearGradient>
        <linearGradient id="bg2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={O} />
          <stop offset="100%" stopColor="#a33d00" />
        </linearGradient>
        
        {/* Gradiente para la barra metálica de acero */}
        <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#444" />
          <stop offset="30%" stopColor={C} />
          <stop offset="70%" stopColor={C} />
          <stop offset="100%" stopColor="#444" />
        </linearGradient>
        
        {/* Filtro de desenfoque gaussiano para dar efecto de brillo neón */}
        <filter id="gf">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Gradiente para el sombreado de la piel de los puños */}
        <linearGradient id="fist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4956a" />
          <stop offset="100%" stopColor="#a06540" />
        </linearGradient>
      </defs>

      {/* Barra de pesas principal con filtro de brillo */}
      <rect x="40" y="37" width="120" height="10" rx="5" fill="url(#bar)" filter="url(#gf)" />

      {/* Discos del lado izquierdo */}
      <rect x="3" y="18" width="16" height="48" rx="3" fill="url(#bg1)" />
      <rect x="19" y="22" width="20" height="40" rx="2" fill={O} opacity=".8" />

      {/* Discos del lado derecho */}
      <rect x="181" y="18" width="16" height="48" rx="3" fill="url(#bg2)" />
      <rect x="161" y="22" width="20" height="40" rx="2" fill={O} opacity=".8" />

      {/* Topes metálicos (collars) */}
      <rect x="38" y="32" width="8" height="20" rx="2" fill={C} opacity=".9" />
      <rect x="154" y="32" width="8" height="20" rx="2" fill={C} opacity=".9" />

      {/* Puño izquierdo sujetando la barra (representado por rectángulos agrupados) */}
      <rect x="60" y="24" width="10" height="20" rx="4" fill="url(#fist)" />
      <rect x="71" y="22" width="10" height="22" rx="4" fill="url(#fist)" />
      <rect x="82" y="23" width="10" height="21" rx="4" fill="url(#fist)" />
      <rect x="58" y="42" width="38" height="26" rx="5" fill="url(#fist)" />
      <rect x="48" y="45" width="14" height="18" rx="5" fill="url(#fist)" />

      {/* Puño derecho sujetando la barra */}
      <rect x="120" y="24" width="10" height="20" rx="4" fill="url(#fist)" />
      <rect x="109" y="22" width="10" height="22" rx="4" fill="url(#fist)" />
      <rect x="98" y="23" width="10" height="21" rx="4" fill="url(#fist)" />
      <rect x="94" y="42" width="38" height="26" rx="5" fill="url(#fist)" />
      <rect x="128" y="45" width="14" height="18" rx="5" fill="url(#fist)" />

      {/* Línea horizontal central con luz neón roja */}
      <line x1="3" y1="42" x2="197" y2="42" stroke={R} strokeWidth=".8" opacity=".5" />
    </svg>
  );
}
