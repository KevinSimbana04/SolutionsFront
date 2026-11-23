import { z } from "zod";

const resultadoPruebaSchema = z
    .enum(["PRUEBAS_SATISFACTORIAS", "PRUEBAS_FALLIDAS"])
    .or(z.literal(""))
    .transform((resultado) => resultado || undefined);

const textoOpcionalSchema = z
    .string()
    .trim()
    .transform((valor) => valor || undefined);

export const registrarAvanceReparacionSchema = z
    .object({
        estadoOperativo: z.enum([
            "EN_REPARACION",
            "EN_ESPERA_REPUESTOS",
            "REPARACION_TERMINADA",
            "EN_PRUEBAS",
        ]),
        bitacoraDeAcciones: z
            .string()
            .trim()
            .min(10, { message: "La bitácora debe tener al menos 10 caracteres" }),
        motivoFallo: textoOpcionalSchema,
        resultadoPrueba: resultadoPruebaSchema,
        historialPruebas: textoOpcionalSchema,
        repuestosUtilizadosIds: z
            .array(z.string().regex(/^[1-9]\d*$/, { message: "El repuesto seleccionado no es válido" }))
            .transform((ids) => ids.map(Number)),
    })
    .superRefine((data, context) => {
        if (
            data.estadoOperativo === "EN_ESPERA_REPUESTOS"
            && (data.motivoFallo?.length ?? 0) < 10
        ) {
            context.addIssue({
                code: "custom",
                path: ["motivoFallo"],
                message: "Indica el motivo de espera de repuestos (mínimo 10 caracteres)",
            });
        }

        if (data.estadoOperativo !== "EN_PRUEBAS") return;

        if (!data.resultadoPrueba) {
            context.addIssue({
                code: "custom",
                path: ["resultadoPrueba"],
                message: "Selecciona el resultado de las pruebas",
            });
            return;
        }

        if (
            data.resultadoPrueba === "PRUEBAS_SATISFACTORIAS"
            && (data.historialPruebas?.length ?? 0) < 10
        ) {
            context.addIssue({
                code: "custom",
                path: ["historialPruebas"],
                message: "Describe las pruebas realizadas (mínimo 10 caracteres)",
            });
        }

        if (
            data.resultadoPrueba === "PRUEBAS_FALLIDAS"
            && (data.motivoFallo?.length ?? 0) < 10
        ) {
            context.addIssue({
                code: "custom",
                path: ["motivoFallo"],
                message: "Indica el motivo del fallo en las pruebas (mínimo 10 caracteres)",
            });
        }
    });

export type RegistrarAvanceReparacionFormInput =
    z.input<typeof registrarAvanceReparacionSchema>;
export type RegistrarAvanceReparacionFormData =
    z.output<typeof registrarAvanceReparacionSchema>;
