import { apiClient } from '@/lib/axios'; 
import type { LoginCredentials, AuthResponse, ActivarCuentaRequest } from '../types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<{ mensaje: string }> => {

    const response = await apiClient.post<{ mensaje: string }>('/auth/logout');
    return response.data;
  },

  activarCuenta: async (data: ActivarCuentaRequest): Promise<{ mensaje: string }> => {
    const response = await apiClient.post<{ mensaje: string }>('/auth/activar-cuenta', data);
    return response.data;
  },
  configurarCredenciales: async (data: {
    usuarioActual: string;
    contraseniaActual: string;
    nuevaContrasenia: string;
    nuevoUsuario?: string;
  }): Promise<{ mensaje: string }> => {
    const response = await apiClient.post<{ mensaje: string }>('/auth/configurar-credenciales', data);
    return response.data;
  },
};