import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";

import { empleadoService } from "@/features/employee/api/employee.service";
import type { TecnicoDisponible } from "@/features/employee/types";
import { ordenService } from "../api/order.service";
import type {
    ActualizarRecepcionOrdenRequest,
    DetalleOrdenResponse,
    OrdenResponse,
} from "../types";

import { getErrorMessage } from "@/utils/error.utils"

import ModalShell from "@/components/ui/ModalShell";


interface OrderReceptionEditModalProps {
    orden: OrdenResponse;
    onClose: () => void;
    onSaved: () => void;
}


const inputClassName =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function OrderReceptionEditModal({
    orden,
    onClose,
    onSaved,
}: OrderReceptionEditModalProps) {
    const [tecnicos, setTecnicos] = useState<TecnicoDisponible[]>([]);
    const [detalle, setDetalle] = useState<DetalleOrdenResponse | null>(null);
    const [tecnicoId, setTecnicoId] = useState(String(orden.tecnicoId));
    const [motivoReasignacion, setMotivoReasignacion] = useState("");
    const [fallaReportada, setFallaReportada] = useState(orden.fallaReportada);
    const [accesorios, setAccesorios] = useState("");
    const [valoresIniciales, setValoresIniciales] = useState<{
        fallaReportada: string;
        accesorios: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let isCurrent = true;

        const cargarDatos = async () => {
            try {
                const [detalleOrden, tecnicosDisponibles] = await Promise.all([
                    ordenService.obtenerDetalle(orden.ordenId),
                    empleadoService.listarTecnicos(),
                ]);
                if (!isCurrent) return;

                const fallaInicial = detalleOrden.datosGenerales.fallaReportada ?? "";
                const accesoriosIniciales = detalleOrden.accesorios ?? "";
                setDetalle(detalleOrden);
                setTecnicos(tecnicosDisponibles);
                setFallaReportada(fallaInicial);
                setAccesorios(accesoriosIniciales);
                setValoresIniciales({
                    fallaReportada: fallaInicial,
                    accesorios: accesoriosIniciales,
                });
            } catch (error) {
                if (isCurrent) {
                    setLoadError(true);
                    toast.error(getErrorMessage(error, "No se pudieron cargar los datos de recepción."));
                }
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        };

        void cargarDatos();
        return () => {
            isCurrent = false;
        };
    }, [orden.ordenId]);

    const tecnicoCambiado = Number(tecnicoId) !== orden.tecnicoId;

    const guardarCambios = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!valoresIniciales) return;

        const fallaFinal = fallaReportada.trim();
        const accesoriosFinales = accesorios.trim();
        const fallaCambiada = fallaFinal !== valoresIniciales.fallaReportada.trim();
        const accesoriosCambiados =
            accesoriosFinales !== valoresIniciales.accesorios.trim();

        if (tecnicoCambiado && motivoReasignacion.trim().length < 10) {
            toast.error("Justifica la reasignación con al menos 10 caracteres.");
            return;
        }
        if (fallaCambiada && fallaFinal.length < 10) {
            toast.error("La falla reportada debe tener al menos 10 caracteres.");
            return;
        }
        if (!tecnicoCambiado && !fallaCambiada && !accesoriosCambiados) {
            toast.info("No hay cambios para guardar.");
            return;
        }

        const request: ActualizarRecepcionOrdenRequest = {};
        if (tecnicoCambiado) {
            request.tecnicoId = Number(tecnicoId);
            request.motivoReasignacion = motivoReasignacion.trim();
        }
        if (fallaCambiada) request.fallaReportada = fallaFinal;
        if (accesoriosCambiados) request.accesorios = accesoriosFinales;

        setIsSubmitting(true);
        try {
            await ordenService.actualizarRecepcion(orden.ordenId, request);
            toast.success("Cambios de recepción guardados.");
            onSaved();
        } catch (error) {
            toast.error(getErrorMessage(error, "No se pudieron guardar los cambios."));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ModalShell
            title="Editar recepción y reasignar técnico"
            subtitle={`${orden.codigo} · ${orden.clienteNombreCompleto} · ${orden.equipoResumen}`}
            onClose={() => {
                if (!isSubmitting) onClose();
            }}
            maxWidthClass="max-w-2xl"
        >
                <div className="mb-5 rounded-lg bg-sky-50 px-4 py-3 text-main text-sky-900">
                    Editable mientras el técnico no confirme la recepción física.
                </div>

                {isLoading ? (
                    <p className="py-8 text-center text-main text-gray-500">
                        Cargando datos de recepción...
                    </p>
                ) : loadError || !detalle ? (
                    <p className="py-8 text-center text-main text-red-600">
                        No se pudieron cargar los datos. Cierra la ventana y vuelve a intentarlo.
                    </p>
                ) : (
                    <form onSubmit={guardarCambios} className="space-y-4">
                        <div>
                            <label htmlFor="recepcion-tecnico" className="mb-1 block text-label text-dark">
                                Técnico asignado
                            </label>
                            <select
                                id="recepcion-tecnico"
                                value={tecnicoId}
                                onChange={(event) => setTecnicoId(event.target.value)}
                                disabled={isSubmitting}
                                className={inputClassName}
                            >
                                {!tecnicos.some((tecnico) => tecnico.empleadoId === orden.tecnicoId) && (
                                    <option value={orden.tecnicoId}>
                                        {orden.tecnicoNombreCompleto} (asignación actual)
                                    </option>
                                )}
                                {tecnicos.map((tecnico) => (
                                    <option key={tecnico.empleadoId} value={tecnico.empleadoId}>
                                        {tecnico.nombres} {tecnico.apellidos}
                                    </option>
                                ))}
                            </select>
                            {!tecnicos.some((tecnico) => tecnico.empleadoId !== orden.tecnicoId) && (
                                <p className="mt-1 text-footer text-amber-700">
                                    No hay otros técnicos disponibles para reasignar esta orden.
                                </p>
                            )}
                        </div>

                        {tecnicoCambiado && (
                            <div>
                                <label htmlFor="recepcion-motivo-reasignacion" className="mb-1 block text-label text-dark">
                                    Motivo de reasignación
                                </label>
                                <textarea
                                    id="recepcion-motivo-reasignacion"
                                    rows={2}
                                    minLength={10}
                                    required
                                    value={motivoReasignacion}
                                    onChange={(event) => setMotivoReasignacion(event.target.value)}
                                    disabled={isSubmitting}
                                    className={inputClassName}
                                    placeholder="Explica por qué se asigna a otro técnico (mínimo 10 caracteres)"
                                />
                                <p className="mt-1 text-footer text-gray-500">
                                    La reasignación quedará registrada en el historial de la orden.
                                </p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="recepcion-falla" className="mb-1 block text-label text-dark">
                                Falla reportada
                            </label>
                            <textarea
                                id="recepcion-falla"
                                rows={2}
                                value={fallaReportada}
                                onChange={(event) => setFallaReportada(event.target.value)}
                                disabled={isSubmitting}
                                className={inputClassName}
                            />
                        </div>

                        <div>
                            <label htmlFor="recepcion-accesorios" className="mb-1 block text-label text-dark">
                                Accesorios entregados
                            </label>
                            <input
                                id="recepcion-accesorios"
                                type="text"
                                value={accesorios}
                                onChange={(event) => setAccesorios(event.target.value)}
                                disabled={isSubmitting}
                                className={inputClassName}
                            />
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-main font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-lg bg-primary px-4 py-2 text-main font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? "Guardando..." : "Guardar cambios"}
                            </button>
                        </div>
                    </form>
                )}
        </ModalShell>
    );
}