import { FD, FB, FM, G } from "../../components/common/styleConstants";

export default function TrainerDashboard() {
  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black uppercase tracking-wider text-white" style={{ fontFamily: FD }}>
          Mis Alumnos & Clases
        </h1>
        <p className="text-zinc-500 text-sm uppercase tracking-widest" style={{ fontFamily: FM }}>
          // Panel del Entrenador / Coach
        </p>
      </div>

      <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950">
        <h2 className="text-lg font-bold mb-4 uppercase tracking-wider text-white" style={{ fontFamily: FB }}>
          Planificación & Rutinas
        </h2>
        <p className="text-zinc-400 text-sm mb-4" style={{ fontFamily: FB }}>
          Aquí podrás consultar tu itinerario de clases asignadas, visualizar el listado de alumnos matriculados y registrar el progreso físico de tus alumnos.
        </p>
        <span
          className="inline-block text-xs uppercase tracking-widest px-3 py-1 font-bold rounded"
          style={{ backgroundColor: `${G}20`, color: G }}
        >
          Acceso Autorizado: Entrenador y Administrador
        </span>
      </div>
    </div>
  );
}
