import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";

import { ordenService } from "../api/order.service";
import type { OrdenResponse, PaginaResponse } from "../types";
import { getErrorMessage } from "@/utils/error.utils";

const TAMANO_PAGINA = 10;

export function useAdminOrders(refreshKey = 0) {
    const [ordenes, setOrdenes] = useState<PaginaResponse<OrdenResponse> | null>(null);
    const [pagina, setPagina] = useState(0);
    const [busquedaInput, setBusquedaInput] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let isCurrent = true;

        const cargarOrdenes = async () => {
            setIsLoading(true);
            setLoadError(false);
            try {
                const data = await ordenService.consultarGlobalAdmin({
                    page: pagina,
                    size: TAMANO_PAGINA,
                    busqueda: busqueda || undefined,
                });
                if (isCurrent) setOrdenes(data);
            } catch (error) {
                if (isCurrent) {
                    setLoadError(true);
                    toast.error(getErrorMessage(error, "No se pudieron cargar las órdenes."));
                }
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        };

        void cargarOrdenes();
        return () => {
            isCurrent = false;
        };
    }, [pagina, busqueda, refreshKey, reloadKey]);

    const buscarOrdenes = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPagina(0);
        setBusqueda(busquedaInput.trim());
    };

    const recargar = () => setReloadKey((key) => key + 1);

    return {
        ordenes,
        pagina,
        setPagina,
        busquedaInput,
        setBusquedaInput,
        isLoading,
        loadError,
        buscarOrdenes,
        recargar,
    };
}