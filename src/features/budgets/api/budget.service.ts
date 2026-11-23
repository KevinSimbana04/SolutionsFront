import { apiClient } from "@/lib/axios";
import type {
    CrearPresupuestoRequest,
    PresupuestoResponse,
    RepuestoAprobado,
    ResponderPresupuestoRequest,
} from "../types";

export const presupuestoService = {
    emitirPresupuesto: async (
        ordenId: number,
        data: CrearPresupuestoRequest,
    ): Promise<PresupuestoResponse> => {
        const response = await apiClient.post<PresupuestoResponse>(
            `/ordenes/${ordenId}/presupuesto`,
            data,
        );
        return response.data;
    },

    consultarPresupuesto: async (ordenId: number): Promise<PresupuestoResponse> => {
        const response = await apiClient.get<PresupuestoResponse>(
            `/ordenes/${ordenId}/presupuesto`,
        );
        return response.data;
    },

    responderPresupuesto: async (
        ordenId: number,
        data: ResponderPresupuestoRequest,
    ): Promise<PresupuestoResponse> => {
        const response = await apiClient.patch<PresupuestoResponse>(
            `/ordenes/${ordenId}/presupuesto/responder`,
            data,
        );
        return response.data;
    },

    listarRepuestosAprobados: async (ordenId: number): Promise<RepuestoAprobado[]> => {
        const response = await apiClient.get<RepuestoAprobado[]>(
            `/ordenes/${ordenId}/presupuesto/repuestos-aprobados`,
        );
        return response.data;
    },
};
