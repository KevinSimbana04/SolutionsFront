import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { ordenService } from "@/features/orders/api/order.service";
import type {
    DetalleOrdenResponse,
    OrdenResponse,
} from "@/features/orders/types";
import DiagnosisForm from "@/features/diagnosis/components/diagnosisForm";
import RepairForm from "@/features/repairs/components/repairForm";

import { getErrorMessage } from "@/utils/error.utils";
import { formatearFecha } from "@/utils/date.utils";
import {
    ESTADOS_HABILITADOS_REPARACION,
    ESTADOS_ORDEN_FINALIZADA,
} from "@/features/orders/constants/orderStatus";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge"


export default function TechnicalInProgressList() {
    const [ordenes, setOrdenes] = useState<OrdenResponse[]>([]);
    const [ordenSeleccionadaId, setOrdenSeleccionadaId] = useState<number | null>(null);
    const [detalleCargado, setDetalleCargado] = useState<{
        ordenId: number;
        detalle: DetalleOrdenResponse;
    } | null>(null);
    const [detalleFallidoId, setDetalleFallidoId] = useState<number | null>(null);
    const [busqueda, setBusqueda] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [ordenEnProceso, setOrdenEnProceso] = useState<number | null>(null);
    const [ordenDiagnosticoSeleccionada, setOrdenDiagnosticoSeleccionada] =
        useState<OrdenResponse | null>(null);
    const [ordenReparacionSeleccionada, setOrdenReparacionSeleccionada] =
        useState<OrdenResponse | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    const ordenesFiltradas = useMemo(() => {
        const termino = busqueda.trim().toLocaleLowerCase();
        if (!termino) return ordenes;

        return ordenes.filter((orden) =>
            [
                orden.codigo,
                orden.equipoResumen,
                orden.clienteNombreCompleto,
                orden.fallaReportada,
                orden.estadoOrden,
            ].some((valor) => valor?.toLocaleLowerCase().includes(termino)),
        );
    }, [busqueda, ordenes]);

    const ordenSeleccionada = ordenes.find(
        (orden) => orden.ordenId === ordenSeleccionadaId,
    ) ?? null;
    const detalle = detalleCargado?.ordenId === ordenSeleccionadaId
        ? detalleCargado.detalle
        : null;
    const detailError = detalleFallidoId === ordenSeleccionadaId;
    const detailLoading = ordenSeleccionadaId !== null && !detalle && !detailError;

    useEffect(() => {
        let isCurrent = true;

        const cargarOrdenes = async () => {
            setIsLoading(true);
            setLoadError(false);
            try {
                // Este endpoint devuelve únicamente las órdenes del técnico autenticado.
                const data = await ordenService.listarBandejaTecnico();
                if (!isCurrent) return;

                const activas = data.filter((orden) =>
                    !ESTADOS_ORDEN_FINALIZADA.has(orden.estadoOrden),
                );
                setOrdenes(activas);
                setOrdenSeleccionadaId((actual) =>
                    activas.some((orden) => orden.ordenId === actual)
                        ? actual
                        : null,
                );
            } catch (error) {
                if (isCurrent) {
                    setLoadError(true);
                    toast.error(getErrorMessage(error, "No se pudieron cargar tus órdenes asignadas."));
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
        if (!ordenSeleccionadaId) return;

        let isCurrent = true;

        const cargarDetalle = async () => {
            try {
                const data = await ordenService.obtenerDetalle(ordenSeleccionadaId);
                if (isCurrent) {
                    setDetalleCargado({ ordenId: ordenSeleccionadaId, detalle: data });
                    setDetalleFallidoId(null);
                }
            } catch (error) {
                if (isCurrent) {
                    setDetalleFallidoId(ordenSeleccionadaId);
                    toast.error(getErrorMessage(error, "No se pudo cargar el detalle de la orden."));
                }
            }
        };

        void cargarDetalle();
        return () => {
            isCurrent = false;
        };
    }, [ordenSeleccionadaId, reloadKey]);

    const ejecutarAccion = async (
        orden: OrdenResponse,
        accion: (ordenId: number) => Promise<OrdenResponse>,
        mensajeExito: string,
        abrirDiagnostico = false,
    ) => {
        setOrdenEnProceso(orden.ordenId);
        try {
            const actualizada = await accion(orden.ordenId);
            setOrdenes((actuales) =>
                actuales.map((item) =>
                    item.ordenId === actualizada.ordenId ? actualizada : item,
                ),
            );
            toast.success(mensajeExito);
            if (abrirDiagnostico) setOrdenDiagnosticoSeleccionada(actualizada);
        } catch (error) {
            toast.error(getErrorMessage(error, "No se pudo actualizar el estado de la orden."));
        } finally {
            setOrdenEnProceso(null);
        }
    };

    const renderAccion = (orden: OrdenResponse) => {
        const isProcessing = ordenEnProceso === orden.ordenId;
        const buttonClassName =
            "rounded-lg bg-primary px-4 py-2 text-main font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-400";

        if (orden.estadoOrden === "ASIGNADO_A_TECNICO") {
            return (
                <button
                    type="button"
                    onClick={() => void ejecutarAccion(
                        orden,
                        ordenService.confirmarRecepcionTecnico,
                        "Recepción confirmada.",
                    )}
                    disabled={ordenEnProceso !== null}
                    className={buttonClassName}
                >
                    {isProcessing ? "Procesando..." : "Confirmar recepción"}
                </button>
            );
        }

        if (orden.estadoOrden === "RECIBIDO_POR_TECNICO") {
            return (
                <button
                    type="button"
                    onClick={() => void ejecutarAccion(
                        orden,
                        ordenService.iniciarDiagnostico,
                        "Diagnóstico iniciado.",
                        true,
                    )}
                    disabled={ordenEnProceso !== null}
                    className={buttonClassName}
                >
                    {isProcessing ? "Procesando..." : "Iniciar diagnóstico"}
                </button>
            );
        }

        if (orden.estadoOrden === "EN_DIAGNOSTICO") {
            return (
                <button
                    type="button"
                    onClick={() => setOrdenDiagnosticoSeleccionada(orden)}
                    disabled={ordenEnProceso !== null}
                    className={buttonClassName}
                >
                    Emitir diagnóstico
                </button>
            );
        }

        if (ESTADOS_HABILITADOS_REPARACION.has(orden.estadoOrden)) {
            return (
                <button
                    type="button"
                    onClick={() => setOrdenReparacionSeleccionada(orden)}
                    disabled={ordenEnProceso !== null}
                    className={buttonClassName}
                >
                    Registrar avance de reparación
                </button>
            );
        }

        return <p className="text-footer text-gray-500">No hay acciones pendientes para esta orden.</p>;
    };

    return (
        <main className="w-full min-h-[calc(100vh-9rem)]">
            {!ordenSeleccionada && (
            <section className="flex min-h-[32rem] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-5 py-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-h2 text-dark">Órdenes en proceso</h1>
                            <p className="mt-1 text-footer text-gray-500">
                                Recepción, diagnóstico y reparación de tus órdenes asignadas.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setDetalleCargado(null);
                                setDetalleFallidoId(null);
                                setReloadKey((key) => key + 1);
                            }}
                            disabled={isLoading}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-footer font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Actualizar
                        </button>
                    </div>
                    <label htmlFor="busqueda-orden-tecnico" className="sr-only">
                        Buscar órdenes asignadas
                    </label>
                    <input
                        id="busqueda-orden-tecnico"
                        type="search"
                        value={busqueda}
                        onChange={(event) => setBusqueda(event.target.value)}
                        placeholder="Buscar por orden, equipo o cliente"
                        className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>

                <div className="flex-1 p-4">
                    {isLoading ? (
                        <p className="py-8 text-center text-main text-gray-500">
                            Cargando órdenes asignadas...
                        </p>
                    ) : loadError ? (
                        <p className="py-8 text-center text-main text-gray-500">
                            No se pudo cargar la bandeja. Usa «Actualizar» para intentarlo de nuevo.
                        </p>
                    ) : ordenesFiltradas.length === 0 ? (
                        <p className="py-8 text-center text-main text-gray-500">
                            {ordenes.length === 0
                                ? "No tienes órdenes en proceso. Consulta las órdenes finalizadas en su sección."
                                : "No hay órdenes que coincidan con la búsqueda."}
                        </p>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {ordenesFiltradas.map((orden) => (
                                <button
                                    key={orden.ordenId}
                                    type="button"
                                    onClick={() => {
                                        if (ordenSeleccionadaId !== orden.ordenId) {
                                            setDetalleCargado(null);
                                            setDetalleFallidoId(null);
                                        }
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
                                    <p className="mt-2 text-footer text-gray-500">
                                        Entrega estimada: {formatearFecha(orden.fechaEstimadaEntrega)}
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
                        <header className="border-b border-gray-200 px-5 py-5 sm:px-7">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-footer font-medium uppercase tracking-wide text-gray-500">
                                        Recepción y diagnóstico
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
                            </div>
                        </header>

                        <div className="space-y-6 p-5 sm:p-7">
                            <section aria-labelledby="detalle-recepcion-title">
                                <h3 id="detalle-recepcion-title" className="mb-4 text-h3 text-dark">
                                    Detalles de recepción
                                </h3>
                                {detailLoading ? (
                                    <p className="text-main text-gray-500">Cargando detalle de la orden...</p>
                                ) : detailError ? (
                                    <p className="text-main text-red-600">
                                        No se pudo cargar el detalle. Actualiza la bandeja para reintentar.
                                    </p>
                                ) : detalle ? (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-label text-gray-500">Equipo</p>
                                            <p className="mt-1 text-main font-medium text-dark">
                                                {ordenSeleccionada.equipoResumen}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-label text-gray-500">Cliente</p>
                                            <p className="mt-1 text-main text-dark">
                                                {ordenSeleccionada.clienteNombreCompleto}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-label text-gray-500">Accesorios declarados</p>
                                            <p className="mt-1 whitespace-pre-wrap text-main text-dark">
                                                {detalle.accesorios || "Sin accesorios registrados"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-label text-gray-500">Fecha estimada de entrega</p>
                                            <p className="mt-1 text-main text-dark">
                                                {formatearFecha(ordenSeleccionada.fechaEstimadaEntrega)}
                                            </p>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <p className="text-label text-gray-500">Falla reportada</p>
                                            <p className="mt-1 text-main text-dark">
                                                {ordenSeleccionada.fallaReportada || "Sin falla reportada"}
                                            </p>
                                        </div>
                                    </div>
                                ) : null}
                            </section>

                            <div className="border-t border-gray-200 pt-5">
                                <h3 className="mb-2 text-h3 text-dark">Siguiente paso</h3>
                                <p className="mb-4 text-main text-gray-600">
                                    Las acciones disponibles dependen del estado actual de esta orden.
                                </p>
                                {renderAccion(ordenSeleccionada)}
                            </div>
                        </div>
                </section>
            )}

            {ordenDiagnosticoSeleccionada && (
                <DiagnosisForm
                    ordenId={ordenDiagnosticoSeleccionada.ordenId}
                    codigoOrden={ordenDiagnosticoSeleccionada.codigo}
                    onClose={() => setOrdenDiagnosticoSeleccionada(null)}
                    onSaved={() => {
                        setOrdenDiagnosticoSeleccionada(null);
                        setDetalleCargado(null);
                        setDetalleFallidoId(null);
                        setReloadKey((key) => key + 1);
                    }}
                />
            )}
            {ordenReparacionSeleccionada && (
                <RepairForm
                    ordenId={ordenReparacionSeleccionada.ordenId}
                    codigoOrden={ordenReparacionSeleccionada.codigo}
                    onClose={() => setOrdenReparacionSeleccionada(null)}
                    onSaved={() => {
                        setOrdenReparacionSeleccionada(null);
                        setDetalleCargado(null);
                        setDetalleFallidoId(null);
                        setReloadKey((key) => key + 1);
                    }}
                />
            )}
        </main>
    );
}
