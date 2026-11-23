import { apiClient } from "@/lib/axios";
import type { DiagnosticoRequest, DiagnosticoResponse } from "../types";

export const diagnosticoService = {
    emitirDiagnostico: async (
        ordenId: number,
        data: DiagnosticoRequest,
    ): Promise<DiagnosticoResponse> => {
        const response = await apiClient.post<DiagnosticoResponse>(
            `/ordenes/${ordenId}/diagnostico`,
            data,
        );
        return response.data;
    },

    obtenerDiagnostico: async (ordenId: number): Promise<DiagnosticoResponse> => {
        const response = await apiClient.get<DiagnosticoResponse>(
            `/ordenes/${ordenId}/diagnostico`,
        );
        return response.data;
    },
};
