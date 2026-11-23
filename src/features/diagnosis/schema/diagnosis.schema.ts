import { z } from "zod";

const textoOpcionalSchema = z
    .string()
    .trim()
    .transform((valor) => valor || undefined);

function convertirNumeroOpcional(valor: string): number | undefined {
    if (!valor.trim()) return undefined;
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : Number.NaN;
}

export const diagnosticoSchema = z
    .object({
        causaProbableTecnico: z
            .string()
            .trim()
            .min(10, { message: "La falla técnica debe tener al menos 10 caracteres" }),
        pruebasRealizadas: z
            .string()
            .trim()
            .min(10, { message: "Las pruebas realizadas deben tener al menos 10 caracteres" }),
        posibilidadesReparacion: z.enum(["TIENE_REPARACION", "SIN_REPARACION"]).or(z.literal("")),
        repuestosRequeridos: textoOpcionalSchema,
        valorManoObra: z.string().transform(convertirNumeroOpcional),
        tiempoEstimado: z.string().transform(convertirNumeroOpcional),
        justificacionInvalida: textoOpcionalSchema,
        observacionesTecnico: textoOpcionalSchema,
    })
    .superRefine((data, context) => {
        if (
            data.valorManoObra !== undefined
            && (!Number.isFinite(data.valorManoObra) || data.valorManoObra < 0)
        ) {
            context.addIssue({
                code: "custom",
                path: ["valorManoObra"],
                message: "El valor de mano de obra debe ser un número igual o mayor que cero",
            });
        }

        if (
            data.tiempoEstimado !== undefined
            && (
                !Number.isInteger(data.tiempoEstimado)
                || data.tiempoEstimado < 1
                || data.tiempoEstimado > 30
            )
        ) {
            context.addIssue({
                code: "custom",
                path: ["tiempoEstimado"],
                message: "El tiempo estimado debe ser un número entero entre 1 y 30 días",
            });
        }

        if (!data.posibilidadesReparacion) {
            context.addIssue({
                code: "custom",
                path: ["posibilidadesReparacion"],
                message: "Selecciona el dictamen de viabilidad",
            });
            return;
        }

        if (data.posibilidadesReparacion === "TIENE_REPARACION") {
            if (
                data.valorManoObra === undefined
                || !Number.isFinite(data.valorManoObra)
                || data.valorManoObra <= 0
            ) {
                context.addIssue({
                    code: "custom",
                    path: ["valorManoObra"],
                    message: "Ingresa un costo de mano de obra mayor que cero",
                });
            }

            if (data.tiempoEstimado === undefined) {
                context.addIssue({
                    code: "custom",
                    path: ["tiempoEstimado"],
                    message: "El tiempo estimado debe ser un número entero entre 1 y 30 días",
                });
            }
        }

        if (
            data.posibilidadesReparacion === "SIN_REPARACION"
            && (data.justificacionInvalida?.length ?? 0) < 15
        ) {
            context.addIssue({
                code: "custom",
                path: ["justificacionInvalida"],
                message: "La justificación debe tener al menos 15 caracteres",
            });
        }
    });

export type DiagnosticoFormInput = z.input<typeof diagnosticoSchema>;
export type DiagnosticoFormData = z.output<typeof diagnosticoSchema>;
