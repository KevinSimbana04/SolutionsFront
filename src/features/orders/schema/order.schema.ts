import { z } from "zod";

const identificadorSchema = z
    .string()
    .min(1, { message: "Selecciona una opción" })
    .regex(/^[1-9]\d*$/, { message: "Selecciona una opción válida" })
    .transform(Number)
    .pipe(
        z
            .number()
            .int({ message: "El identificador no es válido" })
            .positive({ message: "Selecciona una opción válida" }),
    );

function obtenerFechaLocalActual(): string {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}

function esFechaValida(fecha: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;

    const [anio, mes, dia] = fecha.split("-").map(Number);
    const valor = new Date(anio, mes - 1, dia);
    return valor.getFullYear() === anio
        && valor.getMonth() === mes - 1
        && valor.getDate() === dia;
}

export const crearOrdenSchema = z.object({
    clienteId: identificadorSchema,
    equipoId: identificadorSchema,
    tecnicoId: identificadorSchema,
    fechaEstimadaEntrega: z
        .string()
        .min(1, { message: "La fecha estimada de entrega es obligatoria" })
        .refine(esFechaValida, { message: "Ingresa una fecha válida" })
        .refine(
            (fecha) => !esFechaValida(fecha) || fecha >= obtenerFechaLocalActual(),
            { message: "La fecha estimada no puede ser anterior a hoy" },
        ),
});

export type CrearOrdenFormInput = z.input<typeof crearOrdenSchema>;
export type CrearOrdenFormData = z.output<typeof crearOrdenSchema>;