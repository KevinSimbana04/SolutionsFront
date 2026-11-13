import { z } from 'zod';

const passwordFuerte = z
    .string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    .regex(/[a-z]/, { message: 'Debe contener al menos una letra minúscula' })
    .regex(/[A-Z]/, { message: 'Debe contener al menos una letra mayúscula' })
    .regex(/[0-9]/, { message: 'Debe contener al menos un número' })
    .regex(/[^a-zA-Z0-9]/, { message: 'Debe contener al menos un carácter especial (ej. !@#$%)' });


export const loginSchema = z.object({
    userName: z
        .string()
        .trim()
        .min(1, { message: 'El usuario o cédula es obligatorio' }),
    password: z
        .string()
        .min(1, { message: 'La contraseña es obligatoria' }), 
});


export const activarCuentaSchema = z
    .object({
        nuevaPassword: passwordFuerte,
        confirmarPassword: z
            .string()
            .min(1, { message: 'Debes confirmar la contraseña' }),
    })
    .refine((data) => data.nuevaPassword === data.confirmarPassword, {
        message: 'Las contraseña no coinciden',
        path: ['confirmarPassword'],
    });


export const actualizarContraseniaSchema = z
    .object({
        usuarioActual: z.string().min(1, 'El usuario es obligatorio'),
        contraseniaActual: z.string().min(1, 'La contraseña actual es obligatoria'),
        nuevaContrasenia: passwordFuerte,
        confirmarNuevaContrasenia: z.string().min(1, 'Debes confirmar la contraseña'),
    })
    .refine((data) => data.nuevaContrasenia === data.confirmarNuevaContrasenia, {
        message: 'Las contraseña nueva no coinciden',
        path: ['confirmarNuevaContrasenia'],
    })
    .refine((data) => data.contraseniaActual !== data.nuevaContrasenia, {
        message: 'La nueva contraseña no puede ser igual a la actual',
        path: ['nuevaContrasenia'],
    });


export type LoginFormData = z.infer<typeof loginSchema>;
export type ActivarCuentaFormData = z.infer<typeof activarCuentaSchema>;
export type ActualizarContraseniaFormData = z.infer<typeof actualizarContraseniaSchema>;