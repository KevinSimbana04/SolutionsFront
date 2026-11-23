import { apiClient } from "@/lib/axios";
import type {
    ActualizarRecepcionOrdenRequest,
    CancelarOrdenRequest,
    CrearOrdenRequest,
    DetalleOrdenClienteResponse,
    DetalleOrdenResponse,
    FiltroOrden,
    OrdenResponse,
    PaginaResponse,
    ResumenOrdenClienteResponse,
} from "../types";

type FiltrosBandejaTecnico = Pick<
    FiltroOrden,
    "estado" | "busqueda" | "fechaInicio" | "fechaFin"
>;

type ConsultaGlobalOrdenesParams = Pick<
    FiltroOrden,
    "tecnicoId" | "estado" | "busqueda" | "fechaInicio" | "fechaFin"
> & {
    page?: number;
    size?: number;
    sort?: string;
};

export const ordenService = {
    crearOrden: async (data: CrearOrdenRequest): Promise<OrdenResponse> => {
        const response = await apiClient.post<OrdenResponse>("/ordenes", data);
        return response.data;
    },

    

    actualizarRecepcion: async (
        ordenId: number,
        data: ActualizarRecepcionOrdenRequest,
    ): Promise<OrdenResponse> => {
        const response = await apiClient.patch<OrdenResponse>(
            `/ordenes/${ordenId}/recepcion`,
            data,
        );
        return response.data;
    },

    cancelarOrden: async (
        ordenId: number,
        data: CancelarOrdenRequest,
    ): Promise<OrdenResponse> => {
        const response = await apiClient.patch<OrdenResponse>(
            `/ordenes/${ordenId}/cancelar`,
            data,
        );
        return response.data;
    },

    obtenerDetalle: async (ordenId: number): Promise<DetalleOrdenResponse> => {
        const response = await apiClient.get<DetalleOrdenResponse>(`/ordenes/${ordenId}`);
        return response.data;
    },

    listarBandejaTecnico: async (
        filtros?: FiltrosBandejaTecnico,
    ): Promise<OrdenResponse[]> => {
        const response = await apiClient.get<OrdenResponse[]>("/ordenes/tecnico", {
            params: filtros,
        });
        return response.data;
    },

    confirmarRecepcionTecnico: async (ordenId: number): Promise<OrdenResponse> => {
        const response = await apiClient.patch<OrdenResponse>(
            `/ordenes/tecnico/${ordenId}/confirmar-recepcion`,
        );
        return response.data;
    },

    iniciarDiagnostico: async (ordenId: number): Promise<OrdenResponse> => {
        const response = await apiClient.patch<OrdenResponse>(
            `/ordenes/tecnico/${ordenId}/iniciar-diagnostico`,
        );
        return response.data;
    },

    listarMisReparaciones: async (): Promise<ResumenOrdenClienteResponse[]> => {
        const response = await apiClient.get<ResumenOrdenClienteResponse[]>(
            "/ordenes/cliente/mis-reparaciones",
        );
        return response.data;
    },

    obtenerDetalleReparacionCliente: async (
        ordenId: number,
    ): Promise<DetalleOrdenClienteResponse> => {
        const response = await apiClient.get<DetalleOrdenClienteResponse>(
            `/ordenes/cliente/mis-reparaciones/${ordenId}`,
        );
        return response.data;
    },

    consultarGlobalAdmin: async (
        filtros?: ConsultaGlobalOrdenesParams,
    ): Promise<PaginaResponse<OrdenResponse>> => {
        const response = await apiClient.get<PaginaResponse<OrdenResponse>>(
            "/ordenes/admin",
            { params: filtros },
        );
        return response.data;
    },

    consultarExpedientePorSerie: async (
        numeroSerie: string,
    ): Promise<OrdenResponse[]> => {
        const response = await apiClient.get<OrdenResponse[]>(
            `/ordenes/equipo/serie/${encodeURIComponent(numeroSerie)}`,
        );
        return response.data;
    },
};