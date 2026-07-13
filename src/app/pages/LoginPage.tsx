import { Link } from "react-router";
import { R, O, FD, FG, FB, FM, tg, bg } from "../components/common/styleConstants";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative px-5 overflow-hidden"
      style={{
        background: "#060606",
      }}
    >
      {/* Elementos decorativos de fondo (luces de neón atenuadas) */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none opacity-20"
        style={{ background: R }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none opacity-20"
        style={{ background: O }}
      />

      {/* Tarjeta de Login (Glassmorphism) */}
      <div
        className="relative z-10 w-full max-w-md p-8 md:p-10 rounded-2xl border"
        style={{
          background: "rgba(18, 18, 18, 0.8)",
          backdropFilter: "blur(20px)",
          borderColor: `${R}30`,
          ...bg(R, 0.4),
        }}
      >
        {/* Cabecera del Formulario */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-4xl font-black tracking-widest block mb-2 transition-transform hover:scale-105"
            style={{ fontFamily: FD, ...tg(R) }}
          >
            <span style={{ color: R }}>INGS</span>
            <span className="text-white"> GYM</span>
          </Link>
          <p
            className="text-xs uppercase tracking-widest text-gray-500"
            style={{ fontFamily: FM }}
          >
            // Acceso de Usuarios y Personal
          </p>
        </div>

        {/* Formulario (Campos estéticos funcionales en el cliente) */}
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label
              className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold"
              style={{ fontFamily: FB }}
            >
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="nombre@ingsgym.com"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
              style={{
                background: "#121212",
                borderColor: "#333",
                color: "#fff",
                fontFamily: FB,
                fontSize: "1rem",
              }}
              required
            />
          </div>

          <div>
            <label
              className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold"
              style={{ fontFamily: FB }}
            >
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
              style={{
                background: "#121212",
                borderColor: "#333",
                color: "#fff",
                fontFamily: FB,
                fontSize: "1rem",
              }}
              required
            />
          </div>

          {/* Botón de Acceso */}
          <button
            type="submit"
            className="w-full py-3.5 text-base font-black uppercase tracking-widest text-center cursor-pointer transition-all hover:brightness-110 active:scale-[0.99]"
            style={{
              fontFamily: FD,
              background: R,
              color: "#fff",
              clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
              ...bg(R, 0.75),
            }}
          >
            ENTRAR
          </button>
        </form>

        {/* Enlace para volver a la Landing */}
        <div className="mt-8 text-center border-t border-gray-800 pt-6">
          <Link
            to="/"
            className="text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
            style={{ fontFamily: FM }}
          >
            ← Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}
