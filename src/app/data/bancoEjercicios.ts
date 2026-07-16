export interface Ejercicio {
  id: string;
  nombre: string;
  musculo: "pecho" | "espalda" | "piernas" | "hombros" | "brazos";
  descripcion: string;
  recomendaciones: string;
  gifUrl: string;
}

export const bancoEjercicios: Ejercicio[] = [
  // PECHO
  {
    id: "pecho_1",
    nombre: "Press de Banca Plano",
    musculo: "pecho",
    descripcion: "Acostado en un banco plano, baja la barra olímpica controladamente hasta la parte media del pecho y luego empújala verticalmente hacia arriba bloqueando los codos arriba.",
    recomendaciones: "4 series de 8-12 repeticiones. Descanso de 90 segundos.",
    gifUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80" // Imagen de fitness estática o gif simulado
  },
  {
    id: "pecho_2",
    nombre: "Aperturas con Mancuernas",
    musculo: "pecho",
    descripcion: "Acostado en banco plano, mantén las mancuernas sobre el pecho con los codos ligeramente flexionados. Abre los brazos en forma de arco hasta sentir el estiramiento en los pectorales.",
    recomendaciones: "3 series de 12-15 repeticiones. Descanso de 60 segundos.",
    gifUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80"
  },
  {
    id: "pecho_3",
    nombre: "Flexiones de Pecho (Push-ups)",
    musculo: "pecho",
    descripcion: "En posición de plancha alta, mantén el abdomen contraído y baja el cuerpo doblando los brazos hasta que el pecho casi toque el suelo, luego empuja hacia arriba.",
    recomendaciones: "4 series al fallo muscular. Descanso de 60 segundos.",
    gifUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&q=80"
  },

  // ESPALDA
  {
    id: "espalda_1",
    nombre: "Dominadas Pronas (Pull-ups)",
    musculo: "espalda",
    descripcion: "Sujeta la barra con agarre prono amplio. Levanta el cuerpo contrayendo las dorsales hasta que la barbilla pase la barra. Baja controladamente.",
    recomendaciones: "4 series de 6-10 repeticiones. Descanso de 90 segundos.",
    gifUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&q=80"
  },
  {
    id: "espalda_2",
    nombre: "Remo con Barra",
    musculo: "espalda",
    descripcion: "Sujeta la barra olímpica con las rodillas ligeramente dobladas y el torso inclinado hacia adelante a 45 grados. Lleva la barra hacia el ombligo retrayendo las escápulas.",
    recomendaciones: "4 series de 8-10 repeticiones. Descanso de 90 segundos.",
    gifUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80"
  },
  {
    id: "espalda_3",
    nombre: "Jalón al Pecho en Polea",
    musculo: "espalda",
    descripcion: "Sentado en la máquina, sujeta la barra con agarre amplio. Tira de la barra hacia la parte superior del pecho inclinando levemente el torso hacia atrás.",
    recomendaciones: "3 series de 10-12 repeticiones. Descanso de 75 segundos.",
    gifUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80"
  },

  // PIERNAS
  {
    id: "piernas_1",
    nombre: "Sentadilla Libre con Barra (Squats)",
    musculo: "piernas",
    descripcion: "Coloca la barra sobre los trapecios. Con los pies a la anchura de los hombros, baja la cadera empujando las rodillas hacia afuera hasta romper el paralelo de 90 grados.",
    recomendaciones: "4 series de 6-8 repeticiones. Descanso de 120 segundos.",
    gifUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80"
  },
  {
    id: "piernas_2",
    nombre: "Prensa de Piernas (Leg Press)",
    musculo: "piernas",
    descripcion: "Sentado en la máquina, apoya los pies en la plataforma. Libera el seguro y baja la plataforma flexionando las rodillas a 90 grados. Empuja con fuerza sin bloquear las rodillas.",
    recomendaciones: "4 series de 10-12 repeticiones. Descanso de 90 segundos.",
    gifUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80"
  },
  {
    id: "piernas_3",
    nombre: "Zancadas con Mancuernas",
    musculo: "piernas",
    descripcion: "Sujeta una mancuerna en cada mano. Da un paso largo hacia adelante y baja la cadera hasta que la rodilla trasera casi toque el suelo. Empuja de vuelta al inicio.",
    recomendaciones: "3 series de 12 repeticiones por pierna. Descanso de 60 segundos.",
    gifUrl: "https://images.unsplash.com/photo-1584863265044-f8dbe899fb35?w=400&q=80"
  },

  // HOMBROS
  {
    id: "hombros_1",
    nombre: "Press Militar con Barra",
    musculo: "hombros",
    descripcion: "De pie, sujeta la barra a la altura del pecho. Empuja la barra directamente por encima de la cabeza extendiendo completamente los brazos y metiendo la cabeza al final.",
    recomendaciones: "4 series de 8 repeticiones. Descanso de 90 segundos.",
    gifUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80"
  },
  {
    id: "hombros_2",
    nombre: "Elevaciones Laterales con Mancuernas",
    musculo: "hombros",
    descripcion: "De pie, sujeta las mancuernas a los lados del cuerpo. Eleva los brazos lateralmente con una ligera flexión de codos hasta que queden paralelos al suelo.",
    recomendaciones: "4 series de 12-15 repeticiones. Descanso de 60 segundos.",
    gifUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80"
  },

  // BRAZOS
  {
    id: "brazos_1",
    nombre: "Curl de Bíceps con Barra EZ",
    musculo: "brazos",
    descripcion: "Sujeta la barra EZ con agarre supino. Mantén los codos pegados a los costados del cuerpo y flexiona los brazos elevando la barra hacia los hombros sin balancear el torso.",
    recomendaciones: "3 series de 10-12 repeticiones. Descanso de 60 segundos.",
    gifUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80"
  },
  {
    id: "brazos_2",
    nombre: "Fondos de Tríceps en Paralelas",
    musculo: "brazos",
    descripcion: "Sostente en las barras paralelas con los brazos extendidos. Baja el cuerpo flexionando los codos hacia atrás hasta formar un ángulo de 90 grados, luego empuja hacia arriba.",
    recomendaciones: "3 series de 8-12 repeticiones. Descanso de 75 segundos.",
    gifUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&q=80"
  }
];
