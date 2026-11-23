import { LuCheck } from "react-icons/lu";

const PASOS = [
    { key: "INGRESO", label: "Ingreso" },
    { key: "DIAGNOSTICO", label: "Diagnóstico" },
    { key: "PRESUPUESTO", label: "Presupuesto" },
    { key: "REPARACION", label: "Reparación" },
    { key: "PRUEBAS", label: "Pruebas" },
    { key: "LISTO", label: "Listo" },
];

function obtenerIndicePaso(estado: string): number {
    if (["SOLICITUD_RECIBIDA", "EQUIPO_INGRESADO", "PENDIENTE_ASIGNACION", "ASIGNADO_A_TECNICO", "RECIBIDO_POR_TECNICO"].includes(estado)) return 0;
    if (estado === "EN_DIAGNOSTICO") return 1;
    if (["PENDIENTE_PRESUPUESTO", "PRESUPUESTO_ENVIADO", "PRESUPUESTO_APROBADO"].includes(estado)) return 2;
    if (["EN_REPARACION", "EN_ESPERA_REPUESTOS", "REQUIERE_NUEVA_INTERVENCION"].includes(estado)) return 3;
    if (estado === "EN_PRUEBAS") return 4;
    if (["LISTO_PARA_ENTREGA", "ENTREGADO"].includes(estado)) return 5;
    return -1; // CANCELADO, SIN_REPARACION, PRESUPUESTO_RECHAZADO
}

export default function OrderStepper({ estadoActual }: { estadoActual: string }) {
    const pasoActual = obtenerIndicePaso(estadoActual);
    if (pasoActual === -1) return null;

    return (
        <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
            <ol className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {PASOS.map((paso, idx) => {
                    const completado = idx < pasoActual;
                    const activo = idx === pasoActual;
                    return (
                        <li key={paso.key} className="flex flex-col items-center text-center">
                            <span
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                                    completado
                                        ? "bg-emerald-600 text-white"
                                        : activo
                                            ? "bg-primary text-white ring-4 ring-primary/15"
                                            : "bg-gray-200 text-gray-500"
                                }`}
                            >
                                {completado ? <LuCheck className="h-4 w-4" /> : idx + 1}
                            </span>
                            <span
                                className={`mt-1.5 text-[11px] font-medium ${
                                    activo ? "text-primary font-semibold" : completado ? "text-dark" : "text-gray-400"
                                }`}
                            >
                                {paso.label}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}