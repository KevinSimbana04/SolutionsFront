import { apiClient } from "@/lib/axios";
import type { RegistrarAvanceReparacionRequest, ReparacionResponse } from "../types";

export const reparacionService = {
    registrarAvance: async (
        ordenId: number,
        data: RegistrarAvanceReparacionRequest,
    ): Promise<ReparacionResponse> => {
        const response = await apiClient.post<ReparacionResponse>(
            `/ordenes/${ordenId}/reparacion`,
            data,
        );
        return response.data;
    },

    listarBitacora: async (ordenId: number): Promise<ReparacionResponse[]> => {
        const response = await apiClient.get<ReparacionResponse[]>(
            `/ordenes/${ordenId}/reparacion`,
        );
        return response.data;
    },
};
