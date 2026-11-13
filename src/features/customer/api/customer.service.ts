import { apiClient } from "@/lib/axios";
import type { ClienteRequest, ClienteResponse } from "../types";

export const clienteService = {
    crearCliente: async (data: ClienteRequest): Promise<ClienteResponse> => {
        const response = await apiClient.post<ClienteResponse>("/clientes", data);
        return response.data;
    },
    listarClientes: async (buscar?: string): Promise<ClienteResponse[]> => {
        const response = await apiClient.get<ClienteResponse[]>("/clientes", {
            params: buscar ? { buscar } : undefined,
        });
        return response.data;
    },
    obtenerClientePorId: async (clienteId: number): Promise<ClienteResponse> => {
        const response = await apiClient.get<ClienteResponse>(`/clientes/${clienteId}`);
        return response.data;
    },
    actualizarCliente: async (clienteId: number, data: ClienteRequest): Promise<ClienteResponse> => {
        const response = await apiClient.put<ClienteResponse>(`/clientes/${clienteId}`, data);
        return response.data;
    },
    desactivarCliente: async (clienteId: number, motivo: string): Promise<{ mensaje: string }> => {
        const response = await apiClient.patch<{ mensaje: string }>(`/clientes/${clienteId}/desactivar`, { motivo });
        return response.data;
    },
};