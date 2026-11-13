import type { Rol } from '@/store/authStore';

// El backend solo permite estos roles para los empleados
export type EmpleadoRol = Extract<Rol, 'ADMINISTRATIVO' | 'TECNICO'>;

export interface EmpleadoRequest {
    identificacion: string;
    nombres: string;
    apellidos: string;
    telefono: string;
    correo: string;
    direccion: string;
    rol: EmpleadoRol;
    cargo: string;
}

export interface EmpleadoResponse {
    empleadoId: number;
    usuarioId: number;
    identificacion: string;
    nombres: string;
    apellidos: string;
    telefono: string;
    direccion: string;
    cargo: string;
    rol: EmpleadoRol;
    correo: string;
    estadoCuenta: boolean;
    bloqueado: boolean;
    fechaCreacion: string;
    mensaje: string;
}