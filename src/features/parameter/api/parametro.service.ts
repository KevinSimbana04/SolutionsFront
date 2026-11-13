import { apiClient } from "@/lib/axios";
import type { ParametroGeneral } from "../types";

export const parametrosService = {
    obtenerParametros: async (): Promise<ParametroGeneral> => {
        const response = await apiClient.get<ParametroGeneral>("/parametros");
        return response.data;
    },
    actualizarParametros: async (data: ParametroGeneral): Promise<ParametroGeneral> => {
        const response = await apiClient.put<ParametroGeneral>("/parametros", data);
        return response.data;
    },
};