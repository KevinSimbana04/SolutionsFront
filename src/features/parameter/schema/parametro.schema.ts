import { z } from "zod";

const mensajeSoloNumeros = "Debe ser un número válido";

export const parametrosSchema = z.object({
    iva: z.number({ error: mensajeSoloNumeros }).int().min(0, "Mínimo 0").max(100, "Máximo 100"),
    tiempoGarantia: z.number({ error: mensajeSoloNumeros }).int().min(1, "Mínimo 1 mes").max(30, "Máximo 30 meses"),
    tiempoMaximoEntrega: z.number({ error: mensajeSoloNumeros }).int().min(1, "Mínimo 1 día").max(5, "Máximo 5 días"),
    tiempoLimiteDiagnostico: z.number({ error: mensajeSoloNumeros }).int().min(1, "Mínimo 1 día").max(15, "Máximo 15 días"),
    tiempoLimitePresupuesto: z.number({ error: mensajeSoloNumeros }).int().min(1, "Mínimo 1 día").max(3, "Máximo 3 días"),
});

export type ParametrosFormData = z.infer<typeof parametrosSchema>;