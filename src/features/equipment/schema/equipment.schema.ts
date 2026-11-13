import { z } from "zod";

export const tiposEquipo = [
    "Computadora_de_escritorio", "Laptop", "Teléfono", "Tablet", 
    "Impresora", "Camara", "DVR_NVR", "Monitor", "Parlantes", "Otro",
] as const;

export const equipoSchema = z.object({
    clienteId: z.string().min(1, { message: "Selecciona un cliente" }),
    tipoEquipo: z.enum(tiposEquipo, { message: "Selecciona el tipo de equipo" }),
    marca: z.string().trim().min(1).max(50),
    modelo: z.string().trim().min(1).max(50),
    numeroSerie: z.string().trim().min(5).max(30),
    color: z.string().trim().min(1),
    accesorios: z.string().trim().min(1),
    estadoFisicoInicial: z.string().trim().min(10),
    fotografiaInicial: z.string().min(1).regex(/^data:image\/(?:jpeg|png);base64,/, { message: "Debe ser JPG o PNG" }),
    fallaReportada: z.string().trim().min(10),
    observaciones: z.string().trim().optional(),
});

export type EquipoFormData = z.infer<typeof equipoSchema>;