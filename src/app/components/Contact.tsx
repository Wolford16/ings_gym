import React, { useState } from "react";
import {
  MapPin, Clock, Phone, Mail, Send,
  Instagram, Youtube, Facebook, Twitter
} from "lucide-react";
import SectionHeading from "./common/SectionHeading";
import Reveal from "./common/Reveal";
import Spray from "./common/Spray";
import { R, O, G, Y, FD, FG, FB, FM, METAL, tg, bg } from "./common/styleConstants";

/**
 * Componente de la Sección de Contacto.
 * Contiene un formulario funcional e interactivo que maneja estados de envío de React
 * (muestra pantalla de éxito al enviar) y una sección lateral de información física
 * con la dirección, horarios, teléfonos y enlaces a redes sociales neón.
 */
export default function Contact() {
  // Estado local para los campos del formulario
  const [form, setForm] = useState({ name: "", email: "", phone: "", msg: "" });

  // Estado local para controlar si se ha enviado el mensaje
  const [sent, setSent] = useState(false);

  // Helper para actualizar dinámicamente un campo específico en el estado del formulario
  const handleChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // Estilo base de los inputs del formulario
  const inputStyle: React.CSSProperties = {
    background: "#0d0d0d",
    border: `1px solid ${R}28`, // Rojo neón con baja opacidad
    color: "white",
    fontFamily: FB,
    padding: "12px 16px",
    width: "100%",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color .25s, box-shadow .25s",
  };

  // Listado de datos de contacto
  const info = [
    { icon: <MapPin size={18} />, label: "Dirección", val: "Bulevar princical, edificio Velasquez" },
    { icon: <Clock size={18} />, label: "Horarios", val: "Lun–Vie 05:00–23:00 · Sáb 07:00–21:00" },
    { icon: <Phone size={18} />, label: "Teléfono", val: "+504 6767-6969" },
    { icon: <Mail size={18} />, label: "Email", val: "infoingsgym@gmail.com" },
  ];

  // Configuración de redes sociales
  const socials = [
    { icon: <Instagram size={20} />, label: "Instagram", color: O },
    { icon: <Youtube size={20} />, label: "YouTube", color: R },
    { icon: <Facebook size={20} />, label: "Facebook", color: "#1877f2" },
    { icon: <Twitter size={20} />, label: "Twitter", color: "#1da1f2" },
  ];

  return (
    <section
      id="contacto"
      className="relative py-24 md:py-32 overflow-hidden"
      style={{ background: "#080808" }} // Fondo oscuro
    >
      {/* Línea horizontal neón superior */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${R}, transparent)` }}
      />
      {/* Línea de acento neón vertical en el extremo izquierdo de la sección */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2"
        style={{ background: `linear-gradient(to bottom, ${R}, ${O})` }}
      />

      {/* Destello neón rojo en el fondo inferior derecho */}
      <Spray color={R} x="85%" y="80%" size={400} opacity={0.05} />

      <div className="relative z-10 max-w-7xl mx-auto px-5">

        {/* Encabezado */}
        <Reveal>
          <SectionHeading
            tag="// Contacto"
            pre="HABLA CON"
            accent="NOSOTROS"
            sub="¿Listo para cruzar la puerta? El barrio te espera. No hay mejor momento que ahora."
          />
        </Reveal>

        <div className="grid md:grid-cols-2 gap-10 items-start">

          {/* ─── COLUMNA IZQUIERDA: FORMULARIO DE MENSAJE ─── */}
          <Reveal>
            <div
              className="p-8 md:p-10 relative"
              style={{
                background: METAL, // Metal cepillado
                border: `1px solid ${R}22`,
                clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 22px), calc(100% - 22px) 100%, 0 100%)",
              }}
            >
              {/* Gotas/líneas finas decorativas en la esquina superior izquierda del formulario */}
              <div className="absolute top-0 left-0 w-px" style={{ height: 55, background: R, opacity: 0.7 }} />
              <div className="absolute top-0 left-0 h-px w-14" style={{ background: R, opacity: 0.7 }} />

              <div
                className="text-xl font-black uppercase tracking-widest mb-7 text-white"
                style={{ fontFamily: FD, ...tg(R, 0.4) }}
              >
                ENVÍA UN MENSAJE
              </div>

              {/* Si sent === true, renderizamos el mensaje de éxito del envío */}
              {sent ? (
                <div className="text-center py-14">
                  <div
                    className="text-5xl font-black uppercase mb-4"
                    style={{ fontFamily: FD, color: G, ...tg(G) }}
                  >
                    ¡RECIBIDO!
                  </div>
                  <p className="text-gray-400" style={{ fontFamily: FB }}>
                    Te contactaremos pronto. Bienvenido al movimiento.
                  </p>
                </div>
              ) : (
                // Formulario
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true); // Activa la vista de éxito
                  }}
                  className="space-y-4"
                >
                  {/* Fila de Nombre y Teléfono */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {([
                      ["name", "Nombre", "Tu nombre", "text"],
                      ["phone", "Teléfono", "+1 555 000 0000", "tel"],
                    ] as const).map(([k, label, ph, type]) => (
                      <div key={k}>
                        <label
                          className="block text-xs uppercase tracking-widest text-gray-600 mb-2"
                          style={{ fontFamily: FM }}
                        >
                          {label}
                        </label>
                        <input
                          type={type}
                          placeholder={ph}
                          value={form[k]}
                          onChange={handleChange(k)}
                          style={inputStyle}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Input Email */}
                  <div>
                    <label
                      className="block text-xs uppercase tracking-widest text-gray-600 mb-2"
                      style={{ fontFamily: FM }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="tucorreo@ejemplo.com"
                      value={form.email}
                      onChange={handleChange("email")}
                      style={inputStyle}
                    />
                  </div>

                  {/* Input Mensaje */}
                  <div>
                    <label
                      className="block text-xs uppercase tracking-widest text-gray-600 mb-2"
                      style={{ fontFamily: FM }}
                    >
                      Mensaje
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="¿En qué podemos ayudarte?"
                      value={form.msg}
                      onChange={handleChange("msg")}
                      style={{ ...inputStyle, resize: "none" }} // Evita cambiar tamaño manualmente
                    />
                  </div>

                  {/* Botón de Enviar */}
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-3 w-full py-4 font-black uppercase tracking-widest text-white spray-hover"
                    style={{
                      fontFamily: FD,
                      background: `linear-gradient(135deg, ${R}, #c00)`,
                      clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                      ...bg(R, 0.75),
                    }}
                  >
                    <Send size={18} /> ENVIAR MENSAJE
                  </button>
                </form>
              )}
            </div>
          </Reveal>

          {/* ─── COLUMNA DERECHA: INFORMACIÓN FÍSICA Y REDES ─── */}
          <Reveal delay={0.2}>
            <div className="space-y-8">

              {/* Información Física */}
              <div className="space-y-5">
                {info.map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    {/* Caja de icono neón roja */}
                    <div
                      className="p-2.5 flex-shrink-0"
                      style={{
                        color: R,
                        border: `1px solid ${R}40`,
                        background: `${R}08`,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div
                        className="text-xs uppercase tracking-widest text-gray-600 mb-0.5"
                        style={{ fontFamily: FM }}
                      >
                        {item.label}
                      </div>
                      <div className="text-white text-lg" style={{ fontFamily: FB }}>
                        {item.val}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botones de Redes Sociales con color y fondo neón específico */}
              <div>
                <div
                  className="text-xs uppercase tracking-widest text-gray-600 mb-4"
                  style={{ fontFamily: FM }}
                >
                  // Síguenos en redes
                </div>
                <div className="flex gap-4">
                  {socials.map((s) => (
                    <button
                      key={s.label}
                      aria-label={s.label}
                      className="p-3 spray-hover"
                      style={{
                        color: s.color,
                        border: `2px solid ${s.color}50`,
                        background: `${s.color}09`,
                      }}
                    >
                      {s.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bloque de cita urbana decorativa con cinta adhesiva simulada */}
              <div
                className="p-6 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${R}10, ${O}07)`,
                  border: `1px solid ${O}30`,
                  clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
                }}
              >
                {/* Cinta adhesiva neón en bisel superior */}
                <div
                  className="absolute -top-1 left-6 w-10 h-3 opacity-35"
                  style={{ background: Y, transform: "rotate(-2deg)" }}
                />

                {/* Frase célebre de grafiti */}
                <div
                  className="text-2xl font-black leading-tight mb-2"
                  style={{
                    fontFamily: FG,
                    color: O,
                    textShadow: `0 0 16px ${O}75`,
                    transform: "rotate(-1deg)",
                    display: "inline-block",
                  }}
                >
                  &ldquo;El primer paso<br />es cruzar la puerta.&rdquo;
                </div>

                <div
                  className="text-xs uppercase tracking-widest mt-2"
                  style={{ fontFamily: FM, color: "#555" }}
                >
                  — Carlos «El Toro», Head Coach
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
