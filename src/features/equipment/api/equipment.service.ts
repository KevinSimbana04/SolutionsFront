import { apiClient } from "@/lib/axios";
import type { EquipoRequest, EquipoResponse } from "../types";

export const equipoService = {
    registrarEquipo: async (data: EquipoRequest): Promise<EquipoResponse> => {
        const response = await apiClient.post<EquipoResponse>("/equipos", data);
        return response.data;
    },
    listarEquipos: async (clienteId?: number): Promise<EquipoResponse[]> => {
        const response = await apiClient.get<EquipoResponse[]>("/equipos", {
            params: clienteId === undefined ? undefined : { clienteId },
        });
        return response.data;
    },
    obtenerEquipoPorId: async (equipoId: number): Promise<EquipoResponse> => {
        const response = await apiClient.get<EquipoResponse>(`/equipos/${equipoId}`);
        return response.data;
    },
    actualizarEquipo: async (equipoId: number, data: EquipoRequest): Promise<EquipoResponse> => {
        const response = await apiClient.put<EquipoResponse>(`/equipos/${equipoId}`, data);
        return response.data;
    },
};