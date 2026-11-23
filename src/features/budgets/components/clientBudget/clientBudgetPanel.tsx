import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { presupuestoService } from "../../api/budget.service";
import type { PresupuestoResponse } from "../../types";
import BudgetSummary from "../budgetSummary";

import { getErrorMessage } from "@/utils/error.utils"
import {
    ESTADOS_CON_PRESUPUESTO,
} from "@/features/orders/constants/orderStatus";


interface ClientBudgetPanelProps {
    ordenId: number;
    estadoOrden: string;
    onResponded: () => void;
}


export default function ClientBudgetPanel({
    ordenId,
    estadoOrden,
    onResponded,
}: ClientBudgetPanelProps) {
    const [presupuesto, setPresupuesto] = useState<PresupuestoResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const [confirmacion, setConfirmacion] = useState(false);
    const [motivoRechazo, setMotivoRechazo] = useState("");
    const [comentarioAdicional, setComentarioAdicional] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let isCurrent = true;

        const cargarPresupuesto = async () => {
            setIsLoading(true);
            setLoadError(false);
            try {
                const data = await presupuestoService.consultarPresupuesto(ordenId);
                if (isCurrent) setPresupuesto(data);
            } catch (error) {
                if (isCurrent) {
                    setLoadError(true);
                    toast.error(getErrorMessage(error, "No se pudo consultar el presupuesto."));
                }
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        };

        if (ESTADOS_CON_PRESUPUESTO.has(estadoOrden)) {
            void cargarPresupuesto();
        }

        return () => {
            isCurrent = false;
        };
    }, [estadoOrden, ordenId, reloadKey]);

    if (!ESTADOS_CON_PRESUPUESTO.has(estadoOrden)) return null;

    const responder = async (
        decision: "APROBAR" | "RECHAZAR",
    ) => {
        if (decision === "APROBAR" && !confirmacion) {
            toast.warning("Confirma la aceptación del presupuesto antes de aprobarlo.");
            return;
        }

        const motivo = motivoRechazo.trim();
        const comentario = comentarioAdicional.trim();
        if (decision === "RECHAZAR" && !motivo) {
            toast.warning("Ingresa el motivo del rechazo.");
            return;
        }
        if (decision === "RECHAZAR" && motivo.toLocaleUpperCase() === "OTRO" && comentario.length < 5) {
            toast.warning("Para el motivo OTRO, agrega un comentario de al menos 5 caracteres.");
            return;
        }
        const motivoFinal = decision === "RECHAZAR"
            ? `${motivo}${comentario ? ` - ${comentario}` : ""}`
            : "";
        if (motivoFinal.length > 200) {
            toast.warning("El motivo de rechazo no puede superar 200 caracteres.");
            return;
        }

        setIsSubmitting(true);
        try {
            await presupuestoService.responderPresupuesto(ordenId, decision === "APROBAR"
                ? { decision, confirmacion: true }
                : {
                    decision,
                    motivoRechazo: motivo,
                    comentarioAdicional: comentario || undefined,
                });
            toast.success(decision === "APROBAR"
                ? "Has aprobado el presupuesto."
                : "Has rechazado el presupuesto.");
            onResponded();
        } catch (error) {
            toast.error(getErrorMessage(error, "No se pudo registrar tu respuesta."));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="mb-4 text-h3 text-primary">Presupuesto de reparación</h3>
            {isLoading ? (
                <p className="py-6 text-center text-main text-gray-500">Cargando presupuesto...</p>
            ) : loadError || !presupuesto ? (
                <div className="rounded-lg bg-gray-50 p-5 text-center">
                    <p className="mb-3 text-main text-gray-600">
                        No se pudo cargar el presupuesto de esta orden.
                    </p>
                    <button
                        type="button"
                        onClick={() => setReloadKey((key) => key + 1)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-main font-medium text-gray-700 hover:bg-white"
                    >
                        Reintentar
                    </button>
                </div>
            ) : (
                <>
                    <BudgetSummary presupuesto={presupuesto} />
                    {estadoOrden === "PRESUPUESTO_ENVIADO"
                        && presupuesto.estadoPresupuesto === "PENDIENTE_APROBACION" && (
                        <div className="mt-6 space-y-5 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                            <label className="flex items-start gap-3 text-main text-dark">
                                <input
                                    type="checkbox"
                                    checked={confirmacion}
                                    onChange={(event) => setConfirmacion(event.target.checked)}
                                    disabled={isSubmitting}
                                    className="mt-1 h-4 w-4 accent-primary"
                                />
                                <span>
                                    Confirmo que revisé el detalle y acepto el costo total del presupuesto.
                                </span>
                            </label>
                            <button
                                type="button"
                                onClick={() => void responder("APROBAR")}
                                disabled={isSubmitting}
                                className="rounded-lg bg-primary px-4 py-2 text-main font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? "Procesando..." : "Aprobar presupuesto"}
                            </button>

                            <div className="border-t border-blue-100 pt-4">
                                <label htmlFor={`motivo-rechazo-${ordenId}`} className="mb-1 block text-main font-medium text-dark">
                                    Si no aceptas, indica el motivo del rechazo
                                </label>
                                <textarea
                                    id={`motivo-rechazo-${ordenId}`}
                                    value={motivoRechazo}
                                    onChange={(event) => setMotivoRechazo(event.target.value)}
                                    maxLength={200}
                                    rows={3}
                                    disabled={isSubmitting}
                                    placeholder="Escribe el motivo"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                {motivoRechazo.trim().toLocaleUpperCase() === "OTRO" && (
                                    <div className="mt-3">
                                        <label htmlFor={`comentario-rechazo-${ordenId}`} className="mb-1 block text-main font-medium text-dark">
                                            Comentario adicional (mínimo 5 caracteres)
                                        </label>
                                        <textarea
                                            id={`comentario-rechazo-${ordenId}`}
                                            value={comentarioAdicional}
                                            onChange={(event) => setComentarioAdicional(event.target.value)}
                                            maxLength={195}
                                            rows={2}
                                            disabled={isSubmitting}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => void responder("RECHAZAR")}
                                    disabled={isSubmitting}
                                    className="mt-3 rounded-lg border border-red-300 px-4 py-2 text-main font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting ? "Procesando..." : "Rechazar presupuesto"}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
