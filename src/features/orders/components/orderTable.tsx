import { useState } from "react";
import {
    LuClipboardCheck,
    LuHistory,
    LuReceipt,
    LuStethoscope,
    LuUserCheck,
} from "react-icons/lu";

import { useAuthStore } from "@/store/authStore";
import BudgetCreateModal from "@/features/budgets/components/budgetCreateModal";
import BudgetDetailsModal from "@/features/budgets/components/budgetDetailsModal";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge";
import { formatearFecha } from "@/utils/date.utils";
import {
    ESTADOS_CON_PRESUPUESTO,
    ESTADOS_INICIALES,
} from "../constants/orderStatus";
import { useAdminOrders } from "../hooks/useAdminOrders";
import type { OrdenResponse } from "../types";
import OrderHistoryModal from "./orderHistoryModal";
import OrderReceptionEditModal from "./orderReceptionEditModal";

interface OrdenTableProps {
    refreshKey?: number;
}

const iconButtonClassName =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40";

export default function OrdenTable({ refreshKey = 0 }: OrdenTableProps) {
    const rolActual = useAuthStore((state) => state.user?.role);
    const {
        ordenes,
        pagina,
        setPagina,
        busquedaInput,
        setBusquedaInput,
        isLoading,
        loadError,
        buscarOrdenes,
        recargar,
    } = useAdminOrders(refreshKey);

    const [ordenParaPresupuestar, setOrdenParaPresupuestar] = useState<OrdenResponse | null>(null);
    const [ordenParaConsultarPresupuesto, setOrdenParaConsultarPresupuesto] =
        useState<OrdenResponse | null>(null);
    const [ordenParaEditarRecepcion, setOrdenParaEditarRecepcion] =
        useState<OrdenResponse | null>(null);
    const [ordenParaVerHistorial, setOrdenParaVerHistorial] = useState<OrdenResponse | null>(null);

    return (
        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-5">
                <div>
                    <h2 className="text-h2 text-dark">Órdenes registradas</h2>
                    <p className="mt-1 text-footer text-gray-500">
                        Consulta las órdenes de trabajo y su estado actual.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={recargar}
                    disabled={isLoading}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-main font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Actualizar
                </button>
            </div>

            <form
                onSubmit={buscarOrdenes}
                className="flex flex-wrap gap-3 border-b border-gray-100 px-6 py-4"
            >
                <label htmlFor="buscar-orden" className="sr-only">
                    Buscar orden por código, nombre o identificación del cliente
                </label>
                <input
                    id="buscar-orden"
                    type="search"
                    value={busquedaInput}
                    onChange={(event) => setBusquedaInput(event.target.value)}
                    placeholder="Buscar por código, nombre o identificación del cliente"
                    className="min-w-[220px] max-w-xl flex-1 rounded-md border border-gray-300 px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                    type="submit"
                    className="rounded-lg border border-gray-300 px-4 py-2 text-main font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                    Buscar
                </button>
            </form>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[1120px] text-left">
                    <thead className="bg-gray-50 text-table uppercase text-gray-500">
                        <tr>
                            <th className="px-6 py-3">Código</th>
                            <th className="px-6 py-3">Cliente</th>
                            <th className="px-6 py-3">Equipo</th>
                            <th className="px-6 py-3">Técnico</th>
                            <th className="px-6 py-3">Estado</th>
                            <th className="px-6 py-3">Entrega estimada</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-main">
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                    Cargando órdenes...
                                </td>
                            </tr>
                        ) : loadError ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                    No se pudo cargar la lista. Usa «Actualizar» para intentarlo de nuevo.
                                </td>
                            </tr>
                        ) : !ordenes || ordenes.content.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                    No se encontraron órdenes.
                                </td>
                            </tr>
                        ) : (
                            ordenes.content.map((orden) => (
                                <tr key={orden.ordenId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-dark">{orden.codigo}</td>
                                    <td className="px-6 py-4 text-gray-600">{orden.clienteNombreCompleto}</td>
                                    <td className="px-6 py-4 text-gray-600">{orden.equipoResumen}</td>
                                    <td className="px-6 py-4 text-gray-600">{orden.tecnicoNombreCompleto}</td>
                                    <td className="px-6 py-4">
                                        <OrderStatusBadge estado={orden.estadoOrden} />
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {formatearFecha(orden.fechaEstimadaEntrega)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap justify-end gap-2">
                                            {orden.estadoOrden === "PENDIENTE_PRESUPUESTO" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setOrdenParaPresupuestar(orden)}
                                                    aria-label={`Emitir presupuesto para ${orden.codigo}`}
                                                    title="Emitir presupuesto"
                                                    className={`${iconButtonClassName} bg-primary text-white hover:bg-primary-hover`}
                                                >
                                                    <LuStethoscope className="h-4 w-4" aria-hidden="true" />
                                                </button>
                                            ) : ESTADOS_CON_PRESUPUESTO.has(orden.estadoOrden) ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setOrdenParaConsultarPresupuesto(orden)}
                                                    aria-label={`Ver presupuesto de ${orden.codigo}`}
                                                    title="Ver presupuesto"
                                                    className={`${iconButtonClassName} text-gray-700 hover:bg-gray-100`}
                                                >
                                                    <LuReceipt className="h-4 w-4" aria-hidden="true" />
                                                </button>
                                            ) : null}
                                            {rolActual === "ADMINISTRADOR" && (
                                                <button
                                                    type="button"
                                                    onClick={() => setOrdenParaVerHistorial(orden)}
                                                    aria-label={`Ver historial de ${orden.codigo}`}
                                                    title="Ver historial"
                                                    className={`${iconButtonClassName} text-gray-700 hover:bg-gray-100`}
                                                >
                                                    <LuHistory className="h-4 w-4" aria-hidden="true" />
                                                </button>
                                            )}
                                            {ESTADOS_INICIALES.has(orden.estadoOrden) && (
                                                <button
                                                    type="button"
                                                    onClick={() => setOrdenParaEditarRecepcion(orden)}
                                                    aria-label={`Editar recepción y técnico de ${orden.codigo}`}
                                                    title="Editar recepción y reasignar técnico"
                                                    className={`${iconButtonClassName} text-gray-700 hover:bg-gray-100`}
                                                >
                                                    <LuClipboardCheck className="h-4 w-4" aria-hidden="true" />
                                                    <LuUserCheck className="-ml-1 h-4 w-4" aria-hidden="true" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-4 text-main text-gray-600">
                <span>
                    {ordenes ? `${ordenes.totalElements} órdenes en total` : ""}
                </span>
                <div className="flex items-center gap-3">
                    <span>
                        Página {ordenes ? ordenes.number + 1 : pagina + 1} de {ordenes
                            ? Math.max(ordenes.totalPages, 1)
                            : 1}
                    </span>
                    <button
                        type="button"
                        onClick={() => setPagina((actual) => Math.max(actual - 1, 0))}
                        disabled={isLoading || pagina === 0}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <button
                        type="button"
                        onClick={() => setPagina((actual) => actual + 1)}
                        disabled={isLoading || !ordenes || ordenes.last}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Siguiente
                    </button>
                </div>
            </div>

            {ordenParaPresupuestar && (
                <BudgetCreateModal
                    ordenId={ordenParaPresupuestar.ordenId}
                    codigoOrden={ordenParaPresupuestar.codigo}
                    onClose={() => setOrdenParaPresupuestar(null)}
                    onCreated={() => {
                        setOrdenParaPresupuestar(null);
                        recargar();
                    }}
                />
            )}
            {ordenParaConsultarPresupuesto && (
                <BudgetDetailsModal
                    ordenId={ordenParaConsultarPresupuesto.ordenId}
                    codigoOrden={ordenParaConsultarPresupuesto.codigo}
                    onClose={() => setOrdenParaConsultarPresupuesto(null)}
                />
            )}
            {ordenParaEditarRecepcion && (
                <OrderReceptionEditModal
                    orden={ordenParaEditarRecepcion}
                    onClose={() => setOrdenParaEditarRecepcion(null)}
                    onSaved={() => {
                        setOrdenParaEditarRecepcion(null);
                        recargar();
                    }}
                />
            )}
            {rolActual === "ADMINISTRADOR" && ordenParaVerHistorial && (
                <OrderHistoryModal
                    ordenId={ordenParaVerHistorial.ordenId}
                    codigoOrden={ordenParaVerHistorial.codigo}
                    onClose={() => setOrdenParaVerHistorial(null)}
                />
            )}
        </section>
    );
}