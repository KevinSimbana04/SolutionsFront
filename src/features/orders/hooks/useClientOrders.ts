import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { ordenService } from "../api/order.service";
import type { DetalleOrdenClienteResponse, ResumenOrdenClienteResponse } from "../types";
import { getErrorMessage } from "@/utils/error.utils";

export function useClientOrders() {
    const [ordenes, setOrdenes] = useState<ResumenOrdenClienteResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const [ordenSeleccionada, setOrdenSeleccionada] = useState<ResumenOrdenClienteResponse | null>(null);
    const [detalle, setDetalle] = useState<DetalleOrdenClienteResponse | null>(null);
    const [detalleCargando, setDetalleCargando] = useState(false);
    const [detalleError, setDetalleError] = useState(false);
    const detalleRequestId = useRef(0);

    useEffect(() => {
        let isCurrent = true;

        const cargarOrdenes = async () => {
            setIsLoading(true);
            setLoadError(false);
            try {
                const data = await ordenService.listarMisReparaciones();
                if (isCurrent) setOrdenes(data);
            } catch (error) {
                if (isCurrent) {
                    setLoadError(true);
                    toast.error(getErrorMessage(error, "No se pudieron cargar tus órdenes."));
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

    const verDetalle = async (orden: ResumenOrdenClienteResponse) => {
        const requestId = ++detalleRequestId.current;
        setOrdenSeleccionada(orden);
        setDetalle(null);
        setDetalleCargando(true);
        setDetalleError(false);
        try {
            const data = await ordenService.obtenerDetalleReparacionCliente(orden.ordenId);
            if (requestId === detalleRequestId.current) setDetalle(data);
        } catch (error) {
            if (requestId === detalleRequestId.current) {
                setDetalleError(true);
                toast.error(getErrorMessage(error, "No se pudo cargar el detalle de la orden."));
            }
        } finally {
            if (requestId === detalleRequestId.current) setDetalleCargando(false);
        }
    };

    const cerrarDetalle = () => {
        detalleRequestId.current += 1;
        setOrdenSeleccionada(null);
        setDetalle(null);
        setDetalleError(false);
    };

    const recargar = () => setReloadKey((key) => key + 1);

    return {
        ordenes,
        isLoading,
        loadError,
        ordenSeleccionada,
        detalle,
        detalleCargando,
        detalleError,
        verDetalle,
        cerrarDetalle,
        recargar,
    };
}