import { z } from 'zod';

export const empleadoSchema = z.object({
    identificacion: z
        .string()
        .trim()
        .regex(/^\d{10}$/, { message: 'La identificación debe contener exactamente 10 dígitos' }),
    nombres: z
        .string()
        .trim()
        .min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
        .max(15, { message: 'Los nombres no pueden exceder los 15 caracteres' })
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El nombre solo puede contener letras y espacios' }),
    apellidos: z
        .string()
        .trim()
        .min(3, { message: 'El apellido debe tener al menos 3 caracteres' })
        .max(15, { message: 'El apellido no puede exceder los 15 caracteres' })
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El apellido solo puede contener letras y espacios' }),
    telefono: z
        .string()
        .trim()
        .regex(/^\d{10}$/, { message: 'El teléfono debe contener exactamente 10 dígitos' }),
    correo: z
        .string()
        .trim()
        .email({ message: 'El correo electrónico no es válido' }),
    direccion: z
        .string()
        .trim()
        .min(10, { message: 'La dirección debe tener al menos 10 caracteres' })
        .max(200, { message: 'La dirección no puede exceder los 200 caracteres' }),
    cargo: z
        .string()
        .trim()
        .min(1, { message: 'El cargo es obligatorio' }),
    rol: z.enum(['ADMINISTRADOR', 'ADMINISTRATIVO', 'TECNICO'], { message: 'El rol es obligatorio' })
});

export type EmpleadoFormData = z.infer<typeof empleadoSchema>;