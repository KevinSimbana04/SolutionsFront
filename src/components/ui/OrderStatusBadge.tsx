import { formatearEstado } from "@/features/orders/constants/orderStatus";

function getEstadoClassName(estado: string): string {
    if (estado === "LISTO_PARA_ENTREGA" || estado === "ENTREGADO") {
        return "bg-green-100 text-green-700";
    }
    if (
        estado === "CANCELADO"
        || estado === "SIN_REPARACION"
        || estado === "PRESUPUESTO_RECHAZADO"
        || estado === "PRESUPUESTO_VENCIDO"
    ) {
        return "bg-red-100 text-red-700";
    }
    if (
        estado === "EN_DIAGNOSTICO"
        || estado === "EN_REPARACION"
        || estado === "EN_PRUEBAS"
    ) {
        return "bg-blue-100 text-blue-700";
    }
    return "bg-amber-100 text-amber-700";
}

export default function OrderStatusBadge({ estado }: { estado: string }) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getEstadoClassName(estado)}`}
        >
            {formatearEstado(estado)}
        </span>
    );
}