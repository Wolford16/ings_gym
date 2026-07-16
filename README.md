<p align="center">
  <strong>🏋️ INGS GYM</strong><br/>
  <em>Sistema de Gestión Integral para Gimnasio</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6.3.5-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Firebase-12.16-FFCA28?style=flat-square&logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/TypeScript-TSX-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?style=flat-square&logo=tailwindcss" alt="TailwindCSS" />
</p>

---

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Características Principales](#-características-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Roles y Permisos](#-roles-y-permisos)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Servicios (Firestore)](#-servicios-firestore)
- [Modelo de Datos](#-modelo-de-datos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Ejecución](#-ejecución)
- [Rutas de la Aplicación](#-rutas-de-la-aplicación)
- [Sistema de Diseño](#-sistema-de-diseño)
- [Atribuciones](#-atribuciones)

---

## 🏢 Descripción del Proyecto

**INGS GYM** es una aplicación web completa para la gestión integral de un gimnasio. Combina una **landing page** pública con estética urbana/underground y un **dashboard administrativo** protegido con sistema de roles. El proyecto fue diseñado originalmente en Figma y desarrollado con React + Firebase.

La aplicación permite gestionar usuarios, membresías, clases, pagos, rutinas personalizadas, tickets de soporte, encuestas de satisfacción, visitas de prospectos y notificaciones en tiempo real.

---

## ✨ Características Principales

### Landing Page Pública
- **Hero Section** con animaciones de impacto visual
- **Sección "Acerca de"** con historia y pilares corporativos
- **Planes de Membresía** con precios y beneficios
- **Entrenadores** con biografías y especialidades
- **Instalaciones** con galería de zonas del gimnasio
- **Testimonios** en formato carrusel de reseñas
- **Formulario de Contacto** con datos físicos del gimnasio
- **Footer** con manifiesto y navegación

### Dashboard Administrativo
- **Autenticación** con Firebase Auth (email + contraseña)
- **Cambio de contraseña obligatorio** en primer inicio de sesión
- **Panel General** con resumen de operaciones (staff)
- **Panel de Cliente** para consultar membresía, clases y pagos
- **Módulo Recepcionista** para gestión de usuarios, pagos y visitas
- **Módulo Entrenador** para control de clases y seguimiento de alumnos
- **Módulo Administrador** con acceso completo y configuraciones críticas
- **Zona de Rutinas** con banco de ejercicios para todos los roles
- **Sistema de Notificaciones** en tiempo real con listener de Firestore
- **Sistema de Tickets** para reportes internos (limpieza, máquinas, sugerencias)
- **Encuestas de Satisfacción** mensuales con calificación por estrellas

---

## 🛠 Stack Tecnológico

| Categoría         | Tecnología                          | Versión    |
|:------------------|:------------------------------------|:-----------|
| **Framework**     | React                               | 18.3.1     |
| **Bundler**       | Vite                                | 6.3.5      |
| **Lenguaje**      | TypeScript (TSX)                    | —          |
| **Estilos**       | TailwindCSS                         | 4.1.12     |
| **Backend/BaaS**  | Firebase (Auth, Firestore, Analytics) | 12.16.0  |
| **Enrutamiento**  | React Router                        | 7.13.0     |
| **Animaciones**   | Motion (Framer Motion)              | 12.23.24   |
| **UI Components** | Radix UI, shadcn/ui, MUI            | —          |
| **Gráficos**      | Recharts                            | 2.15.2     |
| **Formularios**   | React Hook Form                     | 7.55.0     |
| **Notificaciones**| Sonner                              | 2.0.3      |
| **Carrusel**      | Embla Carousel, React Slick         | —          |
| **Drag & Drop**   | React DnD                           | 16.0.1     |

---

## 🏗 Arquitectura del Sistema

```
┌────────────────────────────────────────────────────────────────┐
│                        CLIENTE (SPA)                           │
│                     React + Vite + TS                          │
├────────────┬───────────────────────────────┬───────────────────┤
│  Landing   │        Dashboard              │    Servicios      │
│   Page     │   (Rutas Protegidas)          │   (Firestore)     │
│            │                               │                   │
│ • Navbar   │ • GeneralDashboard            │ • usuarios        │
│ • Hero     │ • UserDashboard               │ • clases          │
│ • About    │ • ReceptionistDashboard       │ • pagos           │
│ • Members  │ • TrainerDashboard            │ • tickets         │
│ • Trainers │ • AdminDashboard              │ • rutinas         │
│ • Facilit. │ • RutinasPage                 │ • notificaciones  │
│ • Testim.  │                               │ • encuestas       │
│ • Contact  │                               │ • visitas         │
│ • Footer   │                               │                   │
├────────────┴───────────────────────────────┴───────────────────┤
│                     Firebase (BaaS)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Auth         │  │  Firestore   │  │  Analytics   │         │
│  │  (Email/Pass) │  │  (NoSQL DB)  │  │  (Métricas)  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────────────────────────────────────────┘
```

### Flujo de Autenticación

```
Usuario → /login → Firebase Auth → Firestore (datos de perfil)
                                         │
                              ┌──────────┴──────────┐
                              │ requiereCambio       │
                              │ Contrasena?          │
                              ├─── true ────► /cambio-contrasena
                              └─── false ───► /dashboard/{rol}
```

---

## 👥 Roles y Permisos

El sistema implementa **4 roles** con permisos diferenciados. Cada rol tiene un color asignado en la interfaz:

| Rol                | Color         | Código   | Accesos                                                                |
|:-------------------|:--------------|:---------|:-----------------------------------------------------------------------|
| **Usuario**        | 🔴 Rojo neón  | `#ff1500`| Panel de cliente, zona de rutinas, tickets propios, encuesta mensual   |
| **Recepcionista**  | 🟠 Naranja    | `#ff6600`| Panel general, módulo recepción, gestión de usuarios/pagos/visitas     |
| **Entrenador**     | 🟢 Verde      | `#39ff14`| Panel general, módulo entrenador, control de clases, zona de rutinas   |
| **Administrador**  | 🟡 Dorado     | `#ffd700`| Acceso completo a todos los módulos y configuraciones                  |

### Matriz de Acceso a Rutas

| Ruta                      | Usuario | Recepcionista | Entrenador | Administrador |
|:--------------------------|:-------:|:-------------:|:----------:|:-------------:|
| `/`                       | ✅      | ✅            | ✅         | ✅            |
| `/login`                  | ✅      | ✅            | ✅         | ✅            |
| `/cambio-contrasena`      | ✅      | ✅            | ✅         | ✅            |
| `/dashboard`              | ❌      | ✅            | ✅         | ✅            |
| `/dashboard/usuario`      | ✅      | ❌            | ❌         | ❌            |
| `/dashboard/rutinas`      | ✅      | ✅            | ✅         | ✅            |
| `/dashboard/recepcionista`| ❌      | ✅            | ❌         | ✅            |
| `/dashboard/entrenador`   | ❌      | ❌            | ✅         | ✅            |
| `/dashboard/administrador`| ❌      | ❌            | ❌         | ✅            |

> **Nota:** El componente `ProtectedRoute` redirige automáticamente a los usuarios al dashboard correspondiente según su rol cuando intentan acceder a rutas no autorizadas.

---

## 📁 Estructura del Proyecto

```
gym/
├── .env.local                    # Variables de entorno (Firebase config)
├── .gitignore                    # Archivos ignorados por Git
├── ATTRIBUTIONS.md               # Créditos y licencias de terceros
├── README.md                     # Este archivo
├── index.html                    # Punto de entrada HTML
├── package.json                  # Dependencias y scripts
├── pnpm-workspace.yaml           # Configuración de workspace pnpm
├── postcss.config.mjs            # Configuración de PostCSS
├── vite.config.ts                # Configuración de Vite + plugins
│
├── src/
│   ├── main.tsx                  # Punto de entrada de React
│   ├── firebase.ts               # Inicialización de Firebase (Auth, Firestore, Analytics)
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx        # Proveedor de autenticación global (useAuth)
│   │
│   ├── services/                 # Capa de acceso a datos (Firestore CRUD)
│   │   ├── clasesService.ts      # Gestión de clases (crear, inscribir, desinscribir)
│   │   ├── encuestasService.ts   # Encuestas de satisfacción mensuales
│   │   ├── notificacionesService.ts # Notificaciones en tiempo real
│   │   ├── pagosService.ts       # Registro y consulta de pagos
│   │   ├── rutinasService.ts     # Rutinas personalizadas guardadas
│   │   ├── ticketsService.ts     # Tickets de soporte con historial
│   │   ├── usuariosService.ts    # CRUD de usuarios (perfiles Firestore)
│   │   └── visitasService.ts     # Registro de visitas de prospectos
│   │
│   ├── styles/                   # Hojas de estilo globales
│   │   ├── index.css             # Punto de entrada de estilos
│   │   ├── tailwind.css          # Importación de Tailwind
│   │   ├── globals.css           # Estilos globales base
│   │   ├── theme.css             # Tokens de tema (colores, variables CSS)
│   │   ├── fonts.css             # Importación de tipografías
│   │   └── animations.css        # Animaciones CSS personalizadas
│   │
│   └── app/
│       ├── App.tsx               # Componente raíz con BrowserRouter y rutas
│       │
│       ├── data/
│       │   └── bancoEjercicios.ts # Banco de 14 ejercicios (pecho, espalda, piernas, hombros, brazos)
│       │
│       ├── hooks/
│       │   └── useReveal.ts      # Hook para animaciones de revelación con IntersectionObserver
│       │
│       ├── components/           # Componentes reutilizables
│       │   ├── Navbar.tsx        # Barra de navegación responsiva sticky
│       │   ├── Hero.tsx          # Sección hero con animaciones de impacto
│       │   ├── About.tsx         # Historia y pilares del gimnasio
│       │   ├── Memberships.tsx   # Planes de membresía y precios
│       │   ├── Trainers.tsx      # Listado de entrenadores
│       │   ├── Facilities.tsx    # Galería de instalaciones
│       │   ├── Testimonials.tsx  # Carrusel de testimonios
│       │   ├── Contact.tsx       # Formulario de contacto
│       │   ├── Footer.tsx        # Pie de página
│       │   ├── ProtectedRoute.tsx # Wrapper de protección de rutas por rol
│       │   │
│       │   └── common/           # Componentes compartidos y utilidades
│       │       ├── Barbell.tsx       # Decoración SVG de barra de pesas
│       │       ├── BrickBg.tsx       # Fondo de textura de ladrillos
│       │       ├── MonoTag.tsx       # Etiqueta estilo monospace
│       │       ├── Reveal.tsx        # Wrapper de animación de revelación
│       │       ├── SectionHeading.tsx # Encabezado de sección reutilizable
│       │       ├── Spray.tsx         # Efecto de spray/graffiti decorativo
│       │       ├── SprayDivider.tsx  # Divisor con efecto de spray entre secciones
│       │       └── styleConstants.ts # Tokens de diseño (colores, fuentes, gradientes)
│       │
│       └── pages/                # Páginas de la aplicación
│           ├── LandingPage.tsx       # Página de inicio pública
│           ├── LoginPage.tsx         # Página de inicio de sesión
│           ├── CambioContrasenaPage.tsx # Cambio de contraseña obligatorio
│           │
│           └── dashboard/            # Páginas del área protegida
│               ├── DashboardLayout.tsx       # Layout con sidebar + notificaciones
│               ├── GeneralDashboard.tsx      # Vista general (staff)
│               ├── UserDashboard.tsx         # Panel del cliente
│               ├── ReceptionistDashboard.tsx # Módulo de recepción
│               ├── TrainerDashboard.tsx      # Módulo del entrenador
│               ├── AdminDashboard.tsx        # Módulo de administración
│               └── RutinasPage.tsx           # Zona de rutinas (todos los roles)
│
└── dist/                         # Archivos de producción (build)
```

---

## 🔌 Servicios (Firestore)

Cada servicio corresponde a una colección en Cloud Firestore y expone funciones CRUD asíncronas:

### `usuariosService.ts` — Colección: `usuarios`
| Función                   | Descripción                                       |
|:--------------------------|:--------------------------------------------------|
| `crearUsuario(uid, datos)`| Crea un documento de usuario vinculado al UID de Auth |
| `obtenerUsuario(uid)`     | Obtiene los datos de perfil de un usuario          |
| `actualizarUsuario(uid, datos)` | Actualiza campos parciales del perfil        |
| `listarUsuarios()`        | Lista todos los usuarios (para admin/recepcionista)|
| `listarUsuariosPorRol(rol)` | Filtra usuarios por rol                         |

### `clasesService.ts` — Colección: `clases`
| Función                   | Descripción                                       |
|:--------------------------|:--------------------------------------------------|
| `crearClase(datos)`       | Crea una nueva clase grupal                        |
| `obtenerClase(id)`        | Obtiene una clase por su ID                        |
| `obtenerClases()`         | Lista todas las clases disponibles                 |
| `obtenerClasesPorEntrenador(id)` | Filtra clases por entrenador asignado      |
| `actualizarClase(id, datos)` | Actualiza datos de una clase                    |
| `inscribirAlumno(claseId, userId)` | Inscribe un alumno (valida cupo máximo)   |
| `desinscribirAlumno(claseId, userId)` | Elimina un alumno de la lista           |
| `eliminarClase(id)`       | Elimina una clase                                  |

### `pagosService.ts` — Colección: `pagos`
| Función                   | Descripción                                       |
|:--------------------------|:--------------------------------------------------|
| `registrarPago(datos)`    | Registra un pago con timestamp del servidor        |
| `obtenerPagosPorUsuario(userId)` | Historial de pagos de un usuario            |
| `listarPagos()`           | Todos los pagos del sistema (admin/recepcionista)  |
| `obtenerPagosPorPersonal(id)` | Pagos registrados por un miembro del staff    |

### `ticketsService.ts` — Colección: `tickets`
| Función                   | Descripción                                       |
|:--------------------------|:--------------------------------------------------|
| `crearTicket(datos)`      | Crea un ticket con estado "pendiente" e historial  |
| `obtenerTodosLosTickets()`| Lista todos los tickets (admin)                    |
| `obtenerTicketsPorUsuario(userId)` | Tickets creados por un usuario            |
| `actualizarTicket(id, campos, mensaje, autor)` | Actualiza estado y agrega historial |

### `rutinasService.ts` — Colección: `rutinas`
| Función                   | Descripción                                       |
|:--------------------------|:--------------------------------------------------|
| `guardarRutina(datos)`    | Guarda una rutina personalizada                    |
| `obtenerRutinasPorUsuario(userId)` | Lista las rutinas de un usuario           |
| `eliminarRutina(id)`      | Elimina una rutina guardada                        |

### `notificacionesService.ts` — Colección: `notificaciones`
| Función                   | Descripción                                       |
|:--------------------------|:--------------------------------------------------|
| `enviarNotificacion(datos)` | Envía una notificación (a UID, "todos" o un rol)|
| `obtenerNotificacionesUsuario(userId, rol)` | Obtiene notificaciones del usuario |
| `marcarNotificacionLeida(id)` | Marca una notificación como leída            |
| `marcarTodasLeidas(notificaciones)` | Marca todas como leídas (batch)         |

### `encuestasService.ts` — Colección: `encuestas`
| Función                   | Descripción                                       |
|:--------------------------|:--------------------------------------------------|
| `registrarEncuesta(datos)`| Registra una encuesta de satisfacción (1-5 estrellas)|
| `verificarEncuestaRespondida(userId, mes)` | Verifica si ya respondió este mes  |
| `obtenerTodasLasEncuestas()` | Todas las encuestas para estadísticas         |

### `visitasService.ts` — Colección: `visitas`
| Función                   | Descripción                                       |
|:--------------------------|:--------------------------------------------------|
| `registrarVisita(datos)`  | Registra una visita de prospección                 |
| `obtenerTodasLasVisitas()`| Lista todas las visitas registradas                |

---

## 📊 Modelo de Datos

### Colección `usuarios`
```typescript
{
  nombre: string;
  email: string;
  telefono: string;
  rol: "usuario" | "recepcionista" | "entrenador" | "administrador";
  estado: "activo" | "inactivo";
  fechaCreacion: Timestamp;
  requiereCambioContrasena: boolean;
  detallesPerfil: Record<string, any>;
}
```

### Colección `clases`
```typescript
{
  nombre: string;
  descripcion: string;
  entrenadorId: string;
  horario: Timestamp;
  cupoMaximo: number;
  alumnosInscritos: string[];   // Array de UIDs
}
```

### Colección `pagos`
```typescript
{
  usuarioId: string;
  monto: number;
  fechaPago: Timestamp;
  metodoPago: "efectivo" | "tarjeta" | "transferencia";
  concepto: string;
  registradoPor: string;       // UID del personal
}
```

### Colección `tickets`
```typescript
{
  usuarioId: string;
  creadorNombre: string;
  creadorRol: "usuario" | "entrenador";
  titulo: string;
  descripcion: string;
  tipo: "Limpieza" | "Máquina" | "Sugerencia" | "Otros";
  fechaCreacion: Timestamp;
  estado: "pendiente" | "proceso" | "resuelto";
  asignadoId: string;
  asignadoNombre: string;
  historial: {
    fecha: Timestamp;
    cambio: string;
    autor: string;
  }[];
}
```

### Colección `rutinas`
```typescript
{
  usuarioId: string;
  nombre: string;
  enfoque: string;
  duracion: string;
  ejerciciosIds: string[];     // IDs del banco de ejercicios
  fechaCreacion: Timestamp;
}
```

### Colección `notificaciones`
```typescript
{
  usuarioId: string;            // UID específico, "todos", o nombre de rol
  titulo: string;
  mensaje: string;
  leido: boolean;
  fechaCreacion: Timestamp;
  tipo: "sistema" | "ticket" | "anuncio";
}
```

### Colección `encuestas`
```typescript
{
  usuarioId: string;
  mes: string;                  // Formato "AAAA-MM" (ej: "2026-07")
  calificacion: number;         // 1 a 5 estrellas
  fecha: Timestamp;
}
```

### Colección `visitas`
```typescript
{
  nombre: string;
  email: string;
  telefono: string;
  fecha: Timestamp;
  notas: string;
  registradoPor: string;        // UID del recepcionista
}
```

---

## ⚙️ Instalación y Configuración

### Prerrequisitos

- **Node.js** ≥ 18
- **npm** o **pnpm**
- Cuenta de **Firebase** con proyecto configurado (Authentication, Firestore, Analytics)

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd gym

# 2. Instalar dependencias
npm install
# o con pnpm:
pnpm install

# 3. Configurar variables de entorno
# Crear el archivo .env.local en la raíz del proyecto (ver sección siguiente)

# 4. Iniciar servidor de desarrollo
npm run dev
```

---

## 🔐 Variables de Entorno

Crea un archivo **`.env.local`** en la raíz del proyecto con las credenciales de tu proyecto Firebase:

```env
VITE_FIREBASE_API_KEY="tu-api-key"
VITE_FIREBASE_AUTH_DOMAIN="tu-proyecto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="tu-proyecto"
VITE_FIREBASE_STORAGE_BUCKET="tu-proyecto.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abc123"
VITE_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"
```

> ⚠️ **Importante:** El archivo `.env.local` está incluido en `.gitignore` y **no se sube al repositorio**. Cada desarrollador debe crear el suyo con las credenciales del proyecto Firebase compartido.

---

## 🚀 Ejecución

| Comando          | Descripción                                      |
|:-----------------|:-------------------------------------------------|
| `npm run dev`    | Inicia el servidor de desarrollo en modo HMR     |
| `npm run build`  | Genera la versión de producción en `/dist`        |

El servidor de desarrollo levanta por defecto en `http://localhost:5173`.

---

## 🗺 Rutas de la Aplicación

| Ruta                        | Componente                  | Tipo       |
|:----------------------------|:----------------------------|:-----------|
| `/`                         | `LandingPage`               | Pública    |
| `/login`                    | `LoginPage`                 | Pública    |
| `/cambio-contrasena`        | `CambioContrasenaPage`      | Pública*   |
| `/dashboard`                | `DashboardLayout` → `GeneralDashboard`  | Protegida  |
| `/dashboard/usuario`        | `DashboardLayout` → `UserDashboard`     | Protegida  |
| `/dashboard/rutinas`        | `DashboardLayout` → `RutinasPage`       | Protegida  |
| `/dashboard/recepcionista`  | `DashboardLayout` → `ReceptionistDashboard` | Protegida |
| `/dashboard/entrenador`     | `DashboardLayout` → `TrainerDashboard`  | Protegida  |
| `/dashboard/administrador`  | `DashboardLayout` → `AdminDashboard`    | Protegida  |

> \* La ruta `/cambio-contrasena` es accesible públicamente pero solo muestra contenido relevante cuando el usuario tiene el flag `requiereCambioContrasena: true`.

---

## 🎨 Sistema de Diseño

La aplicación utiliza una estética **urbana / underground** con efectos de neón y texturas industriales.

### Paleta de Colores

| Token | Color                | Hex       | Uso                           |
|:------|:---------------------|:----------|:------------------------------|
| `R`   | 🔴 Rojo neón         | `#ff1500` | Acentos, rol Usuario          |
| `O`   | 🟠 Naranja neón      | `#ff6600` | Destacados, rol Recepcionista |
| `G`   | 🟢 Verde eléctrico   | `#39ff14` | Éxito/acción, rol Entrenador  |
| `Y`   | 🟡 Oro / Amarillo    | `#ffd700` | Premium, rol Administrador    |
| `C`   | ⚪ Plata cromo       | `#b0bec5` | Elementos metálicos           |

### Tipografías

| Token | Fuente                  | Uso                                  |
|:------|:------------------------|:-------------------------------------|
| `FD`  | Black Ops One           | Títulos grandes / estilo militar     |
| `FG`  | Permanent Marker        | Estilo grafiti / pintado a mano      |
| `FB`  | Barlow Condensed        | Textos informativos condensados      |
| `FM`  | Share Tech Mono         | Detalles técnicos y etiquetas mono   |

### Utilidades de Estilo

| Función         | Descripción                                            |
|:----------------|:-------------------------------------------------------|
| `tg(color, s)`  | Genera `text-shadow` con resplandor neón               |
| `bg(color, s)`  | Genera `box-shadow` con resplandor exterior neón       |
| `METAL`         | Gradiente lineal tipo metal industrial                 |
| `STEEL`         | Gradiente lineal tipo acero oscuro                     |

---

## 📝 Atribuciones

- Componentes UI basados en [shadcn/ui](https://ui.shadcn.com/) — licencia [MIT](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md).
- Fotografías de [Unsplash](https://unsplash.com) — [licencia Unsplash](https://unsplash.com/license).
- Diseño original disponible en [Figma](https://www.figma.com/design/ADy3sI5XIh8tfAWam1zwII/Landing-page-para-INGS-GYM).

---

<p align="center">
  <sub>Desarrollado como proyecto de la materia <strong>Gestión de la Seguridad</strong> · INGS GYM © 2026</sub>
</p>