import { useState } from "react";

import DiagnosisForm from "@/features/diagnosis/components/diagnosisForm";
import RepairForm from "@/features/repairs/components/repairForm";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge";
import { formatearFecha } from "@/utils/date.utils";
import { ordenService } from "../../api/order.service";
import {
    ESTADOS_HABILITADOS_REPARACION,
    ESTADOS_ORDEN,
    formatearEstado,
} from "../../constants/orderStatus";
import { useTechnicalOrders } from "../../hooks/useTechnicalOrders";
import type { EstadoOrden, OrdenResponse } from "../../types";

export default function TechnicalOrderQueue() {
    const {
        ordenes,
        filtrosInput,
        setFiltrosInput,
        isLoading,
        loadError,
        ordenEnProceso,
        aplicarFiltros,
        limpiarFiltros,
        ejecutarAccion,
        recargar,
    } = useTechnicalOrders();

    const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenResponse | null>(null);
    const [ordenDiagnosticoSeleccionada, setOrdenDiagnosticoSeleccionada] =
        useState<OrdenResponse | null>(null);

    return (
        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-5">
                <div>
                    <h1 className="text-h1 text-dark">Bandeja de trabajo</h1>
                    <p className="mt-1 text-footer text-gray-500">
                        Consulta tus órdenes, registra diagnósticos y avances de reparación.
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
                onSubmit={aplicarFiltros}
                className="grid gap-4 border-b border-gray-100 px-6 py-4 sm:grid-cols-2 xl:grid-cols-5"
            >
                <div className="xl:col-span-2">
                    <label htmlFor="tecnico-busqueda" className="mb-1 block text-label text-dark">
                        Búsqueda
                    </label>
                    <input
                        id="tecnico-busqueda"
                        type="search"
                        value={filtrosInput.busqueda}
                        onChange={(event) =>
                            setFiltrosInput((actual) => ({ ...actual, busqueda: event.target.value }))
                        }
                        placeholder="Código, nombre o identificación del cliente"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div>
                    <label htmlFor="tecnico-estado" className="mb-1 block text-label text-dark">
                        Estado
                    </label>
                    <select
                        id="tecnico-estado"
                        value={filtrosInput.estado}
                        onChange={(event) =>
                            setFiltrosInput((actual) => ({
                                ...actual,
                                estado: event.target.value as EstadoOrden | "",
                            }))
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        <option value="">Todos los estados</option>
                        {ESTADOS_ORDEN.map((estado) => (
                            <option key={estado} value={estado}>
                                {formatearEstado(estado)}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="tecnico-fecha-inicio" className="mb-1 block text-label text-dark">
                        Desde
                    </label>
                    <input
                        id="tecnico-fecha-inicio"
                        type="date"
                        value={filtrosInput.fechaInicio}
                        max={filtrosInput.fechaFin || undefined}
                        onChange={(event) =>
                            setFiltrosInput((actual) => ({ ...actual, fechaInicio: event.target.value }))
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div>
                    <label htmlFor="tecnico-fecha-fin" className="mb-1 block text-label text-dark">
                        Hasta
                    </label>
                    <input
                        id="tecnico-fecha-fin"
                        type="date"
                        value={filtrosInput.fechaFin}
                        min={filtrosInput.fechaInicio || undefined}
                        onChange={(event) =>
                            setFiltrosInput((actual) => ({ ...actual, fechaFin: event.target.value }))
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div className="flex flex-wrap items-end gap-3 sm:col-span-2 xl:col-span-5">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-lg bg-primary px-4 py-2 text-main font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                        Aplicar filtros
                    </button>
                    <button
                        type="button"
                        onClick={limpiarFiltros}
                        disabled={isLoading}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-main font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Limpiar
                    </button>
                </div>
            </form>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left">
                    <thead className="bg-gray-50 text-table uppercase text-gray-500">
                        <tr>
                            <th className="px-6 py-3">Orden</th>
                            <th className="px-6 py-3">Cliente</th>
                            <th className="px-6 py-3">Equipo</th>
                            <th className="px-6 py-3">Falla reportada</th>
                            <th className="px-6 py-3">Estado</th>
                            <th className="px-6 py-3">Entrega estimada</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-main">
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                    Cargando órdenes asignadas...
                                </td>
                            </tr>
                        ) : loadError ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                    No se pudo cargar la bandeja. Usa «Actualizar» para intentarlo de nuevo.
                                </td>
                            </tr>
                        ) : ordenes.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                    No hay órdenes asignadas con estos filtros.
                                </td>
                            </tr>
                        ) : (
                            ordenes.map((orden) => (
                                <tr key={orden.ordenId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <span className="block font-medium text-dark">{orden.codigo}</span>
                                        <span className="text-footer text-gray-500">#{orden.ordenId}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">{orden.clienteNombreCompleto}</td>
                                    <td className="px-6 py-4 text-gray-700">{orden.equipoResumen}</td>
                                    <td className="max-w-xs px-6 py-4 text-gray-600">{orden.fallaReportada}</td>
                                    <td className="px-6 py-4">
                                        <OrderStatusBadge estado={orden.estadoOrden} />
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {formatearFecha(orden.fechaEstimadaEntrega)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            {orden.estadoOrden === "ASIGNADO_A_TECNICO" && (
                                                <button
                                                    type="button"
                                                    onClick={() => void ejecutarAccion(
                                                        orden.ordenId,
                                                        ordenService.confirmarRecepcionTecnico,
                                                        "Recepción confirmada.",
                                                    )}
                                                    disabled={ordenEnProceso !== null}
                                                    className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-400"
                                                >
                                                    {ordenEnProceso === orden.ordenId
                                                        ? "Procesando..."
                                                        : "Confirmar recepción"}
                                                </button>
                                            )}
                                            {orden.estadoOrden === "RECIBIDO_POR_TECNICO" && (
                                                <button
                                                    type="button"
                                                    onClick={() => void ejecutarAccion(
                                                        orden.ordenId,
                                                        ordenService.iniciarDiagnostico,
                                                        "Diagnóstico iniciado.",
                                                    )}
                                                    disabled={ordenEnProceso !== null}
                                                    className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-400"
                                                >
                                                    {ordenEnProceso === orden.ordenId
                                                        ? "Procesando..."
                                                        : "Iniciar diagnóstico"}
                                                </button>
                                            )}
                                            {orden.estadoOrden === "EN_DIAGNOSTICO" && (
                                                <button
                                                    type="button"
                                                    onClick={() => setOrdenDiagnosticoSeleccionada(orden)}
                                                    disabled={ordenEnProceso !== null}
                                                    className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-400"
                                                >
                                                    Emitir diagnóstico
                                                </button>
                                            )}
                                            {ESTADOS_HABILITADOS_REPARACION.has(orden.estadoOrden) && (
                                                <button
                                                    type="button"
                                                    onClick={() => setOrdenSeleccionada(orden)}
                                                    disabled={ordenEnProceso !== null}
                                                    className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-400"
                                                >
                                                    Registrar avance
                                                </button>
                                            )}
                                            {orden.estadoOrden !== "ASIGNADO_A_TECNICO"
                                                && orden.estadoOrden !== "RECIBIDO_POR_TECNICO"
                                                && orden.estadoOrden !== "EN_DIAGNOSTICO"
                                                && !ESTADOS_HABILITADOS_REPARACION.has(orden.estadoOrden) && (
                                                    <span className="text-footer text-gray-500">
                                                        Sin acciones pendientes
                                                    </span>
                                                )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {ordenSeleccionada && (
                <RepairForm
                    ordenId={ordenSeleccionada.ordenId}
                    codigoOrden={ordenSeleccionada.codigo}
                    onClose={() => setOrdenSeleccionada(null)}
                    onSaved={() => {
                        setOrdenSeleccionada(null);
                        recargar();
                    }}
                />
            )}
            {ordenDiagnosticoSeleccionada && (
                <DiagnosisForm
                    ordenId={ordenDiagnosticoSeleccionada.ordenId}
                    codigoOrden={ordenDiagnosticoSeleccionada.codigo}
                    onClose={() => setOrdenDiagnosticoSeleccionada(null)}
                    onSaved={() => {
                        setOrdenDiagnosticoSeleccionada(null);
                        recargar();
                    }}
                />
            )}
        </section>
    );
}