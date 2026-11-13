import type { Rol } from '@/store/authStore';

export interface ClienteRequest {
    identificacion: string;
    nombres: string;
    apellidos: string;
    telefono: string;
    correo: string;
    direccion: string;
}

export interface ClienteResponse {
    clienteId: number;
    usuarioId: number;
    identificacion: string;
    nombres: string;
    apellidos: string;
    telefono: string;
    direccion: string;
    rol: Rol;
    correo: string;
    nombreUsuario: string;
    estadoCuenta: boolean;
    bloqueado: boolean;
    fechaCreacion: string;
    mensaje: string;
}