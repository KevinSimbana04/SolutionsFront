import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { diagnosticoService } from "@/features/diagnosis/api/diagnosis.service";
import type { DiagnosticoResponse } from "@/features/diagnosis/types";
import { ordenService } from "@/features/orders/api/order.service";
import type { DetalleOrdenResponse, OrdenResponse } from "@/features/orders/types";
import { reparacionService } from "@/features/repairs/api/repair.service";
import type { ReparacionResponse } from "@/features/repairs/types";


import { getErrorMessage } from "@/utils/error.utils"
import { formatearFecha, formatearFechaHora } from "@/utils/date.utils";
import {
    ESTADOS_ORDEN_FINALIZADA,
    formatearEstado,
} from "@/features/orders/constants/orderStatus";

import OrderStatusBadge from "@/components/ui/OrderStatusBadge";

interface InformacionOrdenFinalizada {
    detalle: DetalleOrdenResponse;
    diagnostico: DiagnosticoResponse | null;
    diagnosticoError: string | null;
    reparaciones: ReparacionResponse[];
}


export default function TechnicalFinishedList() {
    const [ordenes, setOrdenes] = useState<OrdenResponse[]>([]);
    const [ordenSeleccionadaId, setOrdenSeleccionadaId] = useState<number | null>(null);
    const [informacionCargada, setInformacionCargada] = useState<{
        ordenId: number;
        informacion: InformacionOrdenFinalizada;
    } | null>(null);
    const [detalleFallidoId, setDetalleFallidoId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    const ordenSeleccionada = ordenes.find(
        (orden) => orden.ordenId === ordenSeleccionadaId,
    ) ?? null;
    const estadoOrdenSeleccionada = ordenSeleccionada?.estadoOrden;
    const informacion = informacionCargada?.ordenId === ordenSeleccionadaId
        ? informacionCargada.informacion
        : null;
    const detailError = detalleFallidoId === ordenSeleccionadaId;
    const detailLoading = ordenSeleccionadaId !== null && !informacion && !detailError;

    useEffect(() => {
        let isCurrent = true;

        const cargarOrdenes = async () => {
            try {
                const data = await ordenService.listarBandejaTecnico();
                if (!isCurrent) return;

                const finalizadas = data.filter((orden) =>
                    ESTADOS_ORDEN_FINALIZADA.has(orden.estadoOrden),
                );
                setOrdenes(finalizadas);
                setLoadError(false);
                setOrdenSeleccionadaId((actual) =>
                    finalizadas.some((orden) => orden.ordenId === actual)
                        ? actual
                        : null,
                );
            } catch (error) {
                if (isCurrent) {
                    setLoadError(true);
                    toast.error(getErrorMessage(error, "No se pudieron cargar las órdenes finalizadas."));
                }
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        };

        void cargarOrdenes();
        return () => {
            isCurrent = false;
        };
    }, [reloadKey]);

    useEffect(() => {
        if (!ordenSeleccionadaId || !estadoOrdenSeleccionada) return;

        let isCurrent = true;

        const cargarInformacionCompleta = async () => {
            try {
                const [detalle, reparaciones] = await Promise.all([
                    ordenService.obtenerDetalle(ordenSeleccionadaId),
                    reparacionService.listarBitacora(ordenSeleccionadaId),
                ]);
                if (!isCurrent) return;

                const hayDiagnosticoEnHistorial = detalle.historial.some((evento) =>
                    [
                        "PENDIENTE_PRESUPUESTO",
                        "SIN_REPARACION",
                        "PRESUPUESTO_ENVIADO",
                        "PRESUPUESTO_APROBADO",
                        "PRESUPUESTO_RECHAZADO",
                        "PRESUPUESTO_VENCIDO",
                        "EN_REPARACION",
                        "EN_ESPERA_REPUESTOS",
                        "EN_PRUEBAS",
                        "LISTO_PARA_ENTREGA",
                        "ENTREGADO",
                    ].includes(evento.estadoNuevo),
                );
                const necesitaDiagnostico = estadoOrdenSeleccionada !== "CANCELADO"
                    || hayDiagnosticoEnHistorial;
                let diagnostico: DiagnosticoResponse | null = null;
                let diagnosticoError: string | null = null;

                if (necesitaDiagnostico) {
                    try {
                        diagnostico = await diagnosticoService.obtenerDiagnostico(ordenSeleccionadaId);
                    } catch (error) {
                        diagnosticoError = getErrorMessage(error, "No se pudo consultar el diagnóstico.");
                        toast.error(diagnosticoError);
                    }
                }

                if (isCurrent) {
                    setInformacionCargada({
                        ordenId: ordenSeleccionadaId,
                        informacion: { detalle, diagnostico, diagnosticoError, reparaciones },
                    });
                    setDetalleFallidoId(null);
                }
            } catch (error) {
                if (isCurrent) {
                    setDetalleFallidoId(ordenSeleccionadaId);
                    toast.error(getErrorMessage(error, "No se pudo cargar la información de la orden."));
                }
            }
        };

        void cargarInformacionCompleta();
        return () => {
            isCurrent = false;
        };
    }, [ordenSeleccionadaId, estadoOrdenSeleccionada, reloadKey]);

    const encabezadoOrden = ordenSeleccionada && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 px-5 py-5 sm:px-7">
            <div>
                <p className="text-footer font-medium uppercase tracking-wide text-gray-500">
                    Información de cierre
                </p>
                <h2 className="mt-1 text-h2 text-dark">{ordenSeleccionada.codigo}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
            <OrderStatusBadge estado={ordenSeleccionada.estadoOrden} />
                <button
                    type="button"
                    onClick={() => setOrdenSeleccionadaId(null)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-main font-medium text-gray-700 hover:bg-gray-50"
                >
                    Volver a las órdenes
                </button>
            </div>
        </header>
    );

    return (
        <main className="w-full min-h-[calc(100vh-9rem)]">
            {!ordenSeleccionada && (
            <section className="flex min-h-[32rem] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <header className="border-b border-gray-200 px-5 py-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-h2 text-dark">Órdenes finalizadas</h1>
                            <p className="mt-1 text-footer text-gray-500">
                                Consulta el cierre y el trabajo realizado.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setInformacionCargada(null);
                                setDetalleFallidoId(null);
                                setIsLoading(true);
                                setReloadKey((key) => key + 1);
                            }}
                            disabled={isLoading}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-footer font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Actualizar
                        </button>
                    </div>
                    <p className="mt-3 text-footer text-gray-500">
                        {isLoading ? "Cargando..." : `${ordenes.length} órdenes finalizadas`}
                    </p>
                </header>

                <div className="flex-1 p-4">
                    {isLoading ? (
                        <p className="py-8 text-center text-main text-gray-500">
                            Cargando órdenes finalizadas...
                        </p>
                    ) : loadError ? (
                        <p className="py-8 text-center text-main text-red-600">
                            No se pudieron cargar las órdenes. Usa «Actualizar» para reintentar.
                        </p>
                    ) : ordenes.length === 0 ? (
                        <p className="py-8 text-center text-main text-gray-500">
                            Todavía no tienes órdenes finalizadas.
                        </p>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {ordenes.map((orden) => (
                            <button
                                key={orden.ordenId}
                                type="button"
                                onClick={() => {
                                    setInformacionCargada(null);
                                    setDetalleFallidoId(null);
                                    setOrdenSeleccionadaId(orden.ordenId);
                                }}
                                className="w-full rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-primary hover:bg-primary/5"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <span className="font-semibold text-dark">{orden.codigo}</span>
                                    <OrderStatusBadge estado={orden.estadoOrden} />
                                </div>
                                <p className="mt-2 text-main text-dark">{orden.equipoResumen}</p>
                                <p className="mt-1 line-clamp-2 text-footer text-gray-600">
                                    {orden.fallaReportada || "Sin falla reportada"}
                                </p>
                            </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            )}

            {ordenSeleccionada && (
            <section className="min-h-[32rem] w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {encabezadoOrden}
                {detailLoading ? (
                    <p className="p-8 text-center text-main text-gray-500">
                        Cargando información completa de la orden...
                    </p>
                ) : detailError || !informacion ? (
                    <div className="p-8 text-center">
                        <p className="mb-4 text-main text-red-600">
                            No se pudo cargar la información de la orden.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setInformacionCargada(null);
                                setDetalleFallidoId(null);
                                setReloadKey((key) => key + 1);
                            }}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-main font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : (
                    <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
                        <div className="space-y-6 p-5 sm:p-7">
                            <section aria-labelledby="finalizada-detalle-title">
                                <h3 id="finalizada-detalle-title" className="mb-4 text-h3 text-dark">
                                    Datos de la orden y del equipo
                                </h3>
                                <dl className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-label text-gray-500">Cliente</dt>
                                        <dd className="mt-1 text-main text-dark">
                                            {ordenSeleccionada.clienteNombreCompleto}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-label text-gray-500">Técnico asignado</dt>
                                        <dd className="mt-1 text-main text-dark">
                                            {ordenSeleccionada.tecnicoNombreCompleto}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-label text-gray-500">Equipo</dt>
                                        <dd className="mt-1 text-main text-dark">
                                            {ordenSeleccionada.equipoResumen}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-label text-gray-500">Accesorios recibidos</dt>
                                        <dd className="mt-1 whitespace-pre-wrap text-main text-dark">
                                            {informacion.detalle.accesorios || "Sin accesorios registrados"}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-label text-gray-500">Fecha de ingreso</dt>
                                        <dd className="mt-1 text-main text-dark">
                                            {formatearFecha(informacion.detalle.fechaCreacion)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-label text-gray-500">Entrega estimada</dt>
                                        <dd className="mt-1 text-main text-dark">
                                            {formatearFecha(ordenSeleccionada.fechaEstimadaEntrega)}
                                        </dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-label text-gray-500">Falla reportada</dt>
                                        <dd className="mt-1 whitespace-pre-wrap text-main text-dark">
                                            {ordenSeleccionada.fallaReportada || "Sin falla reportada"}
                                        </dd>
                                    </div>
                                    {informacion.detalle.datosGenerales.fechaDeEntrega && (
                                        <div>
                                            <dt className="text-label text-gray-500">Fecha de entrega</dt>
                                            <dd className="mt-1 text-main text-dark">
                                                {formatearFecha(informacion.detalle.datosGenerales.fechaDeEntrega)}
                                            </dd>
                                        </div>
                                    )}
                                    {informacion.detalle.motivoCancelacion && (
                                        <div className="sm:col-span-2">
                                            <dt className="text-label text-gray-500">Motivo de cancelación</dt>
                                            <dd className="mt-1 whitespace-pre-wrap text-main text-dark">
                                                {informacion.detalle.motivoCancelacion}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </section>

                            <section aria-labelledby="finalizada-diagnostico-title" className="border-t border-gray-200 pt-5">
                                <h3 id="finalizada-diagnostico-title" className="mb-3 text-h3 text-dark">
                                    Diagnóstico técnico
                                </h3>
                                {informacion.diagnostico ? (
                                    <dl className="grid gap-3 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <dt className="text-label text-gray-500">Causa técnica</dt>
                                            <dd className="mt-1 whitespace-pre-wrap text-main text-dark">
                                                {informacion.diagnostico.causaProbableTecnico}
                                            </dd>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <dt className="text-label text-gray-500">Pruebas realizadas</dt>
                                            <dd className="mt-1 whitespace-pre-wrap text-main text-dark">
                                                {informacion.diagnostico.pruebasRealizadas}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-label text-gray-500">Viabilidad</dt>
                                            <dd className="mt-1 text-main text-dark">
                                                {informacion.diagnostico.posibilidadesReparacion === "TIENE_REPARACION"
                                                    ? "Tiene reparación"
                                                    : "Sin reparación"}
                                            </dd>
                                        </div>
                                        {informacion.diagnostico.valorManoObra !== null && (
                                            <div>
                                                <dt className="text-label text-gray-500">Mano de obra sugerida</dt>
                                                <dd className="mt-1 text-main text-dark">
                                                    ${Number(informacion.diagnostico.valorManoObra).toFixed(2)}
                                                </dd>
                                            </div>
                                        )}
                                        {informacion.diagnostico.repuestosRequeridos && (
                                            <div className="sm:col-span-2">
                                                <dt className="text-label text-gray-500">Repuestos recomendados</dt>
                                                <dd className="mt-1 whitespace-pre-wrap text-main text-dark">
                                                    {informacion.diagnostico.repuestosRequeridos}
                                                </dd>
                                            </div>
                                        )}
                                        {informacion.diagnostico.justificacionInvalida && (
                                            <div className="sm:col-span-2">
                                                <dt className="text-label text-gray-500">Justificación sin reparación</dt>
                                                <dd className="mt-1 whitespace-pre-wrap text-main text-dark">
                                                    {informacion.diagnostico.justificacionInvalida}
                                                </dd>
                                            </div>
                                        )}
                                        {informacion.diagnostico.observacionesTecnico && (
                                            <div className="sm:col-span-2">
                                                <dt className="text-label text-gray-500">Observaciones técnicas</dt>
                                                <dd className="mt-1 whitespace-pre-wrap text-main text-dark">
                                                    {informacion.diagnostico.observacionesTecnico}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                ) : informacion.diagnosticoError ? (
                                    <p className="text-main text-red-600">{informacion.diagnosticoError}</p>
                                ) : (
                                    <p className="text-main text-gray-500">
                                        No se emitió un diagnóstico para esta orden.
                                    </p>
                                )}
                            </section>

                            <section aria-labelledby="finalizada-reparacion-title" className="border-t border-gray-200 pt-5">
                                <h3 id="finalizada-reparacion-title" className="mb-3 text-h3 text-dark">
                                    Bitácora de reparación y pruebas
                                </h3>
                                {informacion.reparaciones.length === 0 ? (
                                    <p className="text-main text-gray-500">
                                        No hay avances de reparación registrados.
                                    </p>
                                ) : (
                                    <ol className="space-y-3">
                                        {informacion.reparaciones.map((reparacion) => (
                                            <li key={reparacion.id} className="rounded-lg border border-gray-200 p-4">
                                                <div className="flex flex-wrap items-start justify-between gap-2">
                                                    <p className="text-main font-semibold text-dark">
                                                        {formatearEstado(reparacion.estadoOperativo)}
                                                    </p>
                                                    <p className="text-footer text-gray-500">
                                                        {formatearFechaHora(reparacion.fechaInicio)}
                                                    </p>
                                                </div>
                                                <p className="mt-2 whitespace-pre-wrap text-main text-gray-700">
                                                    {reparacion.bitacoraDeAcciones}
                                                </p>
                                                {reparacion.resultadoPrueba && (
                                                    <p className="mt-2 text-main text-gray-700">
                                                        <span className="font-medium">Resultado de pruebas: </span>
                                                        {reparacion.resultadoPrueba === "PRUEBAS_SATISFACTORIAS"
                                                            ? "Satisfactorias"
                                                            : "Fallidas"}
                                                    </p>
                                                )}
                                                {reparacion.historialPruebas && (
                                                    <p className="mt-1 whitespace-pre-wrap text-main text-gray-700">
                                                        <span className="font-medium">Observaciones: </span>
                                                        {reparacion.historialPruebas}
                                                    </p>
                                                )}
                                                {reparacion.motivoFallo && (
                                                    <p className="mt-1 whitespace-pre-wrap text-main text-gray-700">
                                                        <span className="font-medium">Motivo de falla o espera: </span>
                                                        {reparacion.motivoFallo}
                                                    </p>
                                                )}
                                                {reparacion.evidencia && (
                                                    <p className="mt-1 break-all text-footer text-gray-500">
                                                        Evidencia: {reparacion.evidencia}
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                )}
                            </section>
                        </div>
                    </div>
                )}
            </section>
            )}
        </main>
    );
}
