import { useState, useEffect, useRef } from "react";

/**
 * Hook personalizado que utiliza la API de IntersectionObserver para detectar cuándo
 * un elemento entra en el área visible de la pantalla (viewport).
 * 
 * Se utiliza para activar animaciones de tipo "reveal" (revelado) al hacer scroll.
 * 
 * @param threshold Porcentaje de visibilidad del elemento requerido para activar la animación (0.12 = 12%).
 * @returns Un objeto con:
 *   - `ref`: Referencia de React que debe vincularse al elemento HTML que se desea observar.
 *   - `v`: Booleano que cambia a `true` cuando el elemento ha entrado en la vista.
 */
export function useReveal(threshold = 0.12) {
  // Referencia al elemento HTML que queremos observar
  const ref = useRef<HTMLDivElement>(null);
  
  // Estado que indica si el elemento es visible en pantalla
  const [v, setV] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Crear el observador de intersección
    const io = new IntersectionObserver(
      ([entry]) => {
        // Si el elemento entra en intersección (es visible), activamos el estado
        if (entry.isIntersecting) {
          setV(true);
          // Opcional: Podríamos dejar de observar una vez revelado, pero
          // mantendremos la lógica original exacta.
        }
      },
      { threshold }
    );

    // Comenzar la observación del elemento
    io.observe(el);

    // Limpieza al desmontar el componente: desconectamos el observador
    return () => io.disconnect();
  }, [threshold]);

  return { ref, v };
}
