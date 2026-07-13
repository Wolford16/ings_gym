import { FD, FB, FM, O } from "../../components/common/styleConstants";

export default function ReceptionistDashboard() {
  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black uppercase tracking-wider text-white" style={{ fontFamily: FD }}>
          Administración de Clientes & Pagos
        </h1>
        <p className="text-zinc-500 text-sm uppercase tracking-widest" style={{ fontFamily: FM }}>
          // Panel de la Recepcionista
        </p>
      </div>

      <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950">
        <h2 className="text-lg font-bold mb-4 uppercase tracking-wider text-white" style={{ fontFamily: FB }}>
          Gestión de Recepción
        </h2>
        <p className="text-zinc-400 text-sm mb-4" style={{ fontFamily: FB }}>
          Este módulo está diseñado para registrar nuevos usuarios, cobrar mensualidades, activar planes de membresía y coordinar agendas de clases diarias.
        </p>
        <span
          className="inline-block text-xs uppercase tracking-widest px-3 py-1 font-bold rounded"
          style={{ backgroundColor: `${O}20`, color: O }}
        >
          Acceso Autorizado: Recepcionista y Administrador
        </span>
      </div>
    </div>
  );
}
