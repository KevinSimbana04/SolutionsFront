import { LuEye } from "react-icons/lu";

import OrderStatusBadge from "@/components/ui/OrderStatusBadge";
import { formatearFecha } from "@/utils/date.utils";
import type { ResumenOrdenClienteResponse } from "../../types";

interface ClientOrderCardProps {
    orden: ResumenOrdenClienteResponse;
    onSelect: (orden: ResumenOrdenClienteResponse) => void;
}

function obtenerProgresoOrden(estado: string): { porcentaje: number; texto: string } {
    if (["SOLICITUD_RECIBIDA", "EQUIPO_INGRESADO", "PENDIENTE_ASIGNACION", "ASIGNADO_A_TECNICO", "RECIBIDO_POR_TECNICO"].includes(estado)) {
        return { porcentaje: 18, texto: "Paso 1 de 6 · Recibido en taller" };
    }
    if (estado === "EN_DIAGNOSTICO") {
        return { porcentaje: 35, texto: "Paso 2 de 6 · En diagnóstico técnico" };
    }
    if (["PENDIENTE_PRESUPUESTO", "PRESUPUESTO_ENVIADO", "PRESUPUESTO_APROBADO"].includes(estado)) {
        return {
            porcentaje: 52,
            texto: estado === "PRESUPUESTO_ENVIADO"
                ? "Paso 3 de 6 · Requiere tu aprobación"
                : "Paso 3 de 6 · Presupuesto",
        };
    }
    if (["EN_REPARACION", "EN_ESPERA_REPUESTOS", "REQUIERE_NUEVA_INTERVENCION"].includes(estado)) {
        return { porcentaje: 72, texto: "Paso 4 de 6 · En reparación" };
    }
    if (estado === "EN_PRUEBAS") {
        return { porcentaje: 88, texto: "Paso 5 de 6 · Pruebas de calidad" };
    }
    if (["LISTO_PARA_ENTREGA", "ENTREGADO"].includes(estado)) {
        return { porcentaje: 100, texto: estado === "ENTREGADO" ? "Finalizado · Entregado" : "Listo para retirar" };
    }
    return { porcentaje: 0, texto: "Orden cerrada" };
}

export default function ClientOrderCard({ orden, onSelect }: ClientOrderCardProps) {
    const progreso = obtenerProgresoOrden(orden.estadoOrden);
    const requiereAprobacion = orden.estadoOrden === "PRESUPUESTO_ENVIADO";

    return (
        <article
            className={`flex flex-col justify-between rounded-xl border bg-white p-5 shadow-xs transition-shadow hover:shadow-md ${
                requiereAprobacion ? "border-amber-300 ring-1 ring-amber-200" : "border-gray-200"
            }`}
        >
            <div>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <span className="text-xs font-semibold tracking-wide text-primary">
                            {orden.codigo}
                        </span>
                        <h3 className="mt-0.5 text-h3 text-dark">{orden.equipoResumen}</h3>
                    </div>
                    <OrderStatusBadge estado={orden.estadoOrden} />
                </div>

                {progreso.porcentaje > 0 && (
                    <div className="mt-4">
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span className={requiereAprobacion ? "font-semibold text-amber-700" : "text-gray-600"}>
                                {progreso.texto}
                            </span>
                            <span className="font-medium text-gray-500">{progreso.porcentaje}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                                className={`h-full rounded-full transition-all ${
                                    progreso.porcentaje === 100
                                        ? "bg-green-500"
                                        : requiereAprobacion
                                            ? "bg-amber-500"
                                            : "bg-primary"
                                }`}
                                style={{ width: `${progreso.porcentaje}%` }}
                            />
                        </div>
                    </div>
                )}

                <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-xs">
                    <div>
                        <dt className="text-gray-500">Fecha de ingreso</dt>
                        <dd className="mt-0.5 font-medium text-dark">
                            {formatearFecha(orden.fechaCreacion)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-gray-500">
                            {orden.fechaDeEntrega ? "Fecha de entrega" : "Entrega estimada"}
                        </dt>
                        <dd className="mt-0.5 font-medium text-dark">
                            {formatearFecha(orden.fechaDeEntrega ?? orden.fechaEstimadaEntrega)}
                        </dd>
                    </div>
                </dl>
            </div>

            <div className="mt-4 flex justify-end">
                <button
                    type="button"
                    onClick={() => onSelect(orden)}
                    aria-label={`Ver datos y presupuesto de la orden ${orden.codigo}`}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-main font-medium transition-colors ${
                        requiereAprobacion
                            ? "bg-primary text-white hover:bg-primary-hover"
                            : "border border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-primary"
                    }`}
                >
                    <LuEye className="h-4 w-4" />
                    {requiereAprobacion ? "Revisar presupuesto" : "Ver orden"}
                </button>
            </div>
        </article>
    );
}