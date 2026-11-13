import { apiClient } from '@/lib/axios';
import type { EmpleadoRequest, EmpleadoResponse } from '../types';

export const empleadoService = {
    crearEmpleado: async (data: EmpleadoRequest): Promise<EmpleadoResponse> => {
        const response = await apiClient.post<EmpleadoResponse>('/empleados', data);
        return response.data;
    },
    
    listarEmpleados: async (): Promise<EmpleadoResponse[]> => {
        const response = await apiClient.get<EmpleadoResponse[]>('/empleados');
        return response.data;
    },
    
    actualizarEmpleado: async (empleadoId: number, data: EmpleadoRequest): Promise<EmpleadoResponse> => {
        const response = await apiClient.put<EmpleadoResponse>(`/empleados/${empleadoId}`, data);
        return response.data;
    },
    
    obtenerEmpleadoPorId: async (empleadoId: number): Promise<EmpleadoResponse> => {
        const response = await apiClient.get<EmpleadoResponse>(`/empleados/${empleadoId}`);
        return response.data;
    },
    
    desactivarEmpleado: async (empleadoId: number, motivo: string): Promise<{ mensaje: string }> => {
        const response = await apiClient.patch<{ mensaje: string }>(
            `/empleados/${empleadoId}/desactivar`,
            { motivo }
        );
        return response.data;
    }
};