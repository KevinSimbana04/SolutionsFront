import { z } from "zod";

const montoSchema = z
    .string()
    .trim()
    .min(1, { message: "Este valor es obligatorio" })
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Ingresa un monto válido con máximo dos decimales" })
    .transform(Number)
    .pipe(z.number().finite().min(0, { message: "El monto no puede ser negativo" }));

const cantidadSchema = z
    .string()
    .regex(/^[1-9]\d*$/, { message: "La cantidad debe ser un entero mayor a cero" })
    .transform(Number)
    .pipe(z.number().int().positive());

export const crearPresupuestoSchema = z.object({
    costoManoObra: montoSchema,
    repuestos: z.array(z.object({
        nombreRepuesto: z.string()
            .trim()
            .min(1, { message: "El nombre del repuesto es obligatorio" })
            .max(120, { message: "El nombre no puede superar 120 caracteres" }),
        cantidad: cantidadSchema,
        costoUnitario: montoSchema,
    })),
});

export type CrearPresupuestoFormInput = z.input<typeof crearPresupuestoSchema>;
export type CrearPresupuestoFormData = z.output<typeof crearPresupuestoSchema>;
