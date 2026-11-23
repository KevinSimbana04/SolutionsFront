import { useState } from "react";

import ModalShell from "@/components/ui/ModalShell";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge";
import ClientBudgetPanel from "@/features/budgets/components/clientBudget/clientBudgetPanel";
import { formatearFecha } from "@/utils/date.utils";
import { ESTADOS_CON_PRESUPUESTO } from "../../constants/orderStatus";
import type { DetalleOrdenClienteResponse, ResumenOrdenClienteResponse } from "../../types";

interface ClientOrderDetailModalProps {
    orden: ResumenOrdenClienteResponse;
    detalle: DetalleOrdenClienteResponse | null;
    isLoading: boolean;
    loadError: boolean;
    onClose: () => void;
    onRetry: () => void;
    onBudgetResponded: () => void;
}

export default function ClientOrderDetailModal({
    orden,
    detalle,
    isLoading,
    loadError,
    onClose,
    onRetry,
    onBudgetResponded,
}: ClientOrderDetailModalProps) {
    const estadoActual = detalle?.estadoActual ?? orden.estadoOrden;
    const tienePresupuestoPendiente = estadoActual === "PRESUPUESTO_ENVIADO";
    const mostrarTabPresupuesto = ESTADOS_CON_PRESUPUESTO.has(estadoActual);
    const [tab, setTab] = useState<"equipo" | "presupuesto">(
        orden.estadoOrden === "PRESUPUESTO_ENVIADO" ? "presupuesto" : "equipo",
    );

    return (
        <ModalShell
            title={`Orden ${orden.codigo}`}
            subtitle={orden.equipoResumen}
            onClose={onClose}
        >
            <div className="mb-4">
                <OrderStatusBadge estado={estadoActual} />
            </div>

            {!isLoading && !loadError && detalle && (
                <div className="mb-6 flex gap-2 border-b border-gray-200">
                    <button
                        type="button"
                        onClick={() => setTab("equipo")}
                        className={`border-b-2 px-4 py-2 text-main font-medium transition-colors ${
                            tab === "equipo"
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-dark"
                        }`}
                    >
                        Datos del equipo
                    </button>
                    {mostrarTabPresupuesto && (
                        <button
                            type="button"
                            onClick={() => setTab("presupuesto")}
                            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2 text-main font-medium transition-colors ${
                                tab === "presupuesto"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-gray-500 hover:text-dark"
                            }`}
                        >
                            Presupuesto
                            {tienePresupuestoPendiente && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                                    Pendiente
                                </span>
                            )}
                        </button>
                    )}
                </div>
            )}

            {isLoading ? (
                <p className="py-10 text-center text-main text-gray-500">
                    Cargando detalle de la orden...
                </p>
            ) : loadError || !detalle ? (
                <div className="py-8 text-center">
                    <p className="mb-4 text-main text-gray-600">
                        No se pudo cargar el detalle de esta orden.
                    </p>
                    <button
                        type="button"
                        onClick={onRetry}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-main font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Reintentar
                    </button>
                </div>
            ) : tab === "presupuesto" && mostrarTabPresupuesto ? (
                <ClientBudgetPanel
                    ordenId={orden.ordenId}
                    estadoOrden={detalle.estadoActual}
                    onResponded={onBudgetResponded}
                />
            ) : (
                <div className="grid gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-3">
                    <div className={`grid gap-3 sm:grid-cols-2 ${detalle.fotografiaInicial ? "sm:col-span-2" : "sm:col-span-3"}`}>
                        <div>
                            <span className="block text-footer text-gray-500">Equipo</span>
                            <span className="mt-1 block text-main font-medium text-dark">
                                {detalle.equipoMarcaModelo}
                            </span>
                        </div>
                        <div>
                            <span className="block text-footer text-gray-500">Número de serie</span>
                            <span className="mt-1 block text-main text-dark">{detalle.numeroSerie}</span>
                        </div>
                        <div>
                            <span className="block text-footer text-gray-500">Fecha de ingreso</span>
                            <span className="mt-1 block text-main text-dark">
                                {formatearFecha(detalle.fechaCreacion)}
                            </span>
                        </div>
                        <div>
                            <span className="block text-footer text-gray-500">Entrega estimada</span>
                            <span className="mt-1 block text-main text-dark">
                                {formatearFecha(detalle.fechaEstimadaEntrega)}
                            </span>
                        </div>
                    </div>

                    {detalle.fotografiaInicial && (
                        <img
                            src={detalle.fotografiaInicial}
                            alt={`Equipo de la orden ${detalle.codigo}`}
                            className="h-28 w-full rounded-lg border border-gray-200 bg-white object-contain p-1"
                        />
                    )}
                </div>
            )}
        </ModalShell>
    );
}