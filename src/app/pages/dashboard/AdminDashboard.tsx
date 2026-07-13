import { FD, FB, FM, Y } from "../../components/common/styleConstants";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black uppercase tracking-wider text-white" style={{ fontFamily: FD }}>
          Administración Global
        </h1>
        <p className="text-zinc-500 text-sm uppercase tracking-widest" style={{ fontFamily: FM }}>
          // Panel del Administrador General
        </p>
      </div>

      <div className="p-6 rounded-xl border border-yellow-900/50 bg-yellow-950/10">
        <h2 className="text-lg font-bold mb-4 uppercase tracking-wider text-yellow-500" style={{ fontFamily: FB }}>
          Control Maestro del Sistema
        </h2>
        <p className="text-zinc-400 text-sm mb-4" style={{ fontFamily: FB }}>
          Este panel otorga control completo sobre la base de datos de INGS GYM, configuración de membresías, auditoría de transacciones, creación de cuentas para el staff (recepcionistas y entrenadores) y reportes financieros avanzados.
        </p>
        <span
          className="inline-block text-xs uppercase tracking-widest px-3 py-1 font-bold rounded"
          style={{ backgroundColor: `${Y}20`, color: Y }}
        >
          Acceso Restringido: Solo Administrador
        </span>
      </div>
    </div>
  );
}
