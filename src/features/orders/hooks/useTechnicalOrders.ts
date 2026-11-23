import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";

import { ordenService } from "../api/order.service";
import type { EstadoOrden, FiltroOrden, OrdenResponse } from "../types";
import { getErrorMessage } from "@/utils/error.utils";

const FILTROS_VACIOS = {
    busqueda: "",
    estado: "" as EstadoOrden | "",
    fechaInicio: "",
    fechaFin: "",
};

export function useTechnicalOrders() {
    const [ordenes, setOrdenes] = useState<OrdenResponse[]>([]);
    const [filtrosInput, setFiltrosInput] = useState(FILTROS_VACIOS);
    const [filtrosAplicados, setFiltrosAplicados] = useState<Partial<FiltroOrden>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const [ordenEnProceso, setOrdenEnProceso] = useState<number | null>(null);

    useEffect(() => {
        let isCurrent = true;

        const cargarOrdenes = async () => {
            setIsLoading(true);
            setLoadError(false);
            try {
                const data = await ordenService.listarBandejaTecnico(filtrosAplicados);
                if (isCurrent) setOrdenes(data);
            } catch (error) {
                if (isCurrent) {
                    setLoadError(true);
                    toast.error(getErrorMessage(error, "No se pudieron cargar las órdenes asignadas."));
                }
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        };

        void cargarOrdenes();
        return () => {
            isCurrent = false;
        };
    }, [filtrosAplicados, reloadKey]);

    const aplicarFiltros = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (filtrosInput.fechaInicio && filtrosInput.fechaFin && filtrosInput.fechaInicio > filtrosInput.fechaFin) {
            toast.error("La fecha inicial no puede ser posterior a la fecha final.");
            return;
        }
        setFiltrosAplicados({
            busqueda: filtrosInput.busqueda.trim() || undefined,
            estado: filtrosInput.estado || undefined,
            fechaInicio: filtrosInput.fechaInicio || undefined,
            fechaFin: filtrosInput.fechaFin || undefined,
        });
    };

    const limpiarFiltros = () => {
        setFiltrosInput(FILTROS_VACIOS);
        setFiltrosAplicados({});
    };

    const ejecutarAccion = async (
        ordenId: number,
        accion: (id: number) => Promise<OrdenResponse>,
        mensajeExito: string,
    ) => {
        setOrdenEnProceso(ordenId);
        try {
            const actualizada = await accion(ordenId);
            setOrdenes((actuales) =>
                actuales.map((orden) => (orden.ordenId === actualizada.ordenId ? actualizada : orden)),
            );
            toast.success(mensajeExito);
        } catch (error) {
            toast.error(getErrorMessage(error, "No se pudo actualizar el estado de la orden."));
        } finally {
            setOrdenEnProceso(null);
        }
    };

    const recargar = () => setReloadKey((key) => key + 1);

    return {
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
    };
}