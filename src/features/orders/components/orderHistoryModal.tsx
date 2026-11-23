import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import ModalShell from "@/components/ui/ModalShell";
import { formatearFechaHora } from "@/utils/date.utils";
import { getErrorMessage } from "@/utils/error.utils";
import { ordenService } from "../api/order.service";
import { formatearEstado } from "../constants/orderStatus";
import type { DetalleOrdenResponse } from "../types";

interface OrderHistoryModalProps {
    ordenId: number;
    codigoOrden: string;
    onClose: () => void;
}

export default function OrderHistoryModal({
    ordenId,
    codigoOrden,
    onClose,
}: OrderHistoryModalProps) {
    const [detalle, setDetalle] = useState<DetalleOrdenResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let isCurrent = true;

        const cargarHistorial = async () => {
            try {
                const data = await ordenService.obtenerDetalle(ordenId);
                if (isCurrent) setDetalle(data);
            } catch (error) {
                if (isCurrent) {
                    setLoadError(true);
                    toast.error(getErrorMessage(error, "No se pudo consultar el historial de la orden."));
                }
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        };

        void cargarHistorial();
        return () => {
            isCurrent = false;
        };
    }, [ordenId, reloadKey]);

    return (
        <ModalShell
            title="Historial de la orden"
            subtitle={codigoOrden}
            onClose={onClose}
            maxWidthClass="max-w-2xl"
        >
            {isLoading ? (
                <p className="py-8 text-center text-main text-gray-500">
                    Cargando historial...
                </p>
            ) : loadError || !detalle ? (
                <div className="py-6 text-center">
                    <p className="mb-4 text-main text-red-600">
                        No se pudo consultar el historial de esta orden.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setDetalle(null);
                            setLoadError(false);
                            setIsLoading(true);
                            setReloadKey((key) => key + 1);
                        }}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-main font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Reintentar
                    </button>
                </div>
            ) : detalle.historial.length === 0 ? (
                <p className="py-8 text-center text-main text-gray-500">
                    Esta orden todavía no tiene movimientos en el historial.
                </p>
            ) : (
                <ol className="space-y-4">
                    {detalle.historial.map((evento, index) => (
                        <li
                            key={`${evento.fechaModificacion}-${evento.estadoNuevo}-${index}`}
                            className="relative border-l-2 border-primary/20 pb-1 pl-5 last:border-transparent"
                        >
                            <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-white" />
                            <p className="text-main font-semibold text-dark">
                                {evento.estadoAnterior
                                    ? `${formatearEstado(evento.estadoAnterior)} → `
                                    : ""}
                                {formatearEstado(evento.estadoNuevo)}
                            </p>
                            <p className="mt-1 text-footer text-gray-500">
                                {formatearFechaHora(evento.fechaModificacion)}
                                {" · "}
                                {evento.usuarioResponsable} ({evento.rolUsuario})
                            </p>
                            {evento.notasSeguimiento && (
                                <p className="mt-2 whitespace-pre-wrap text-main text-gray-700">
                                    {evento.notasSeguimiento}
                                </p>
                            )}
                        </li>
                    ))}
                </ol>
            )}
        </ModalShell>
    );
}