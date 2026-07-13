import { FD, FG, FB, FM, R, G, O, Y } from "../../components/common/styleConstants";

export default function GeneralDashboard() {
  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black uppercase tracking-wider" style={{ fontFamily: FD }}>
          Panel de Control INGS GYM
        </h1>
        <p className="text-zinc-500 text-sm uppercase tracking-widest" style={{ fontFamily: FM }}>
          // Estado de enrutamiento - Fase 1
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950">
          <h2 className="text-lg font-bold mb-4 uppercase tracking-wider text-white" style={{ fontFamily: FB }}>
            Arquitectura de Roles Definida
          </h2>
          <ul className="space-y-3 text-sm text-zinc-400" style={{ fontFamily: FB }}>
            <li className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: R }} />
              <strong>Usuario:</strong> Consulta de membresía, clases y pagos.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: O }} />
              <strong>Recepcionista:</strong> Administración de membresías, usuarios, pagos y clases.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: G }} />
              <strong>Entrenador:</strong> Control de clases y seguimiento de alumnos.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: Y }} />
              <strong>Administrador:</strong> Acceso completo y configuraciones críticas.
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold mb-2 uppercase tracking-wider text-white" style={{ fontFamily: FB }}>
              Simulación de Vistas
            </h2>
            <p className="text-zinc-400 text-sm mb-4 leading-relaxed" style={{ fontFamily: FB }}>
              En esta Fase 1, puedes hacer clic en las opciones del menú lateral para navegar por las subrutas del dashboard. En las siguientes fases, el acceso estará restringido según el rol del usuario autenticado.
            </p>
          </div>
          <div className="text-xs text-zinc-600 uppercase tracking-widest font-mono" style={{ fontFamily: FM }}>
            Configuración: React Router v7 & Subrutas dinámicas
          </div>
        </div>
      </div>
    </div>
  );
}
