import type { Rol } from '@/store/authStore';

export interface LoginCredentials {
  userName: string;
  password: string;
}

export interface AuthResponse {
  token: string | null;
  nombreUsuario: string;
  rol: Rol;
  tiempoExpiracionMinutos: number;
  requiereCambioClave: boolean;
  mensaje: string;
}

// Ahora solo enviamos el token al backend
export interface ActivarCuentaRequest {
  token: string;
}