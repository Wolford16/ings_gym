import { FD, FB, FM, R } from "../../components/common/styleConstants";

export default function UserDashboard() {
  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black uppercase tracking-wider text-white" style={{ fontFamily: FD }}>
          Mi Membresía & Clases
        </h1>
        <p className="text-zinc-500 text-sm uppercase tracking-widest" style={{ fontFamily: FM }}>
          // Panel del Usuario / Cliente
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950 col-span-2">
          <h2 className="text-lg font-bold mb-4 uppercase tracking-wider" style={{ fontFamily: FB }}>
            Información del Socio
          </h2>
          <p className="text-zinc-400 text-sm" style={{ fontFamily: FB }}>
            Aquí podrás visualizar tu estado actual, tus cuotas de membresía, historial de facturación y las clases en las que estás inscrito.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-red-900/50 bg-red-950/20">
          <h2 className="text-lg font-bold mb-2 uppercase tracking-wider text-red-500" style={{ fontFamily: FB }}>
            Estado de Membresía
          </h2>
          <p className="text-2xl font-black text-white mb-2" style={{ fontFamily: FD }}>
            ACTIVO
          </p>
          <p className="text-zinc-500 text-xs uppercase tracking-wider" style={{ fontFamily: FM }}>
            Vence: 31 de Julio de 2026
          </p>
        </div>
      </div>
    </div>
  );
}
