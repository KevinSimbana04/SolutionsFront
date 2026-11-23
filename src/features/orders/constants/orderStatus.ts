import type { EstadoOrden } from "../types";

export const ESTADOS_ORDEN: EstadoOrden[] = [
    "SOLICITUD_RECIBIDA",
    "EQUIPO_INGRESADO",
    "PENDIENTE_ASIGNACION",
    "ASIGNADO_A_TECNICO",
    "RECIBIDO_POR_TECNICO",
    "EN_DIAGNOSTICO",
    "PENDIENTE_PRESUPUESTO",
    "SIN_REPARACION",
    "PRESUPUESTO_ENVIADO",
    "PRESUPUESTO_APROBADO",
    "PRESUPUESTO_RECHAZADO",
    "PRESUPUESTO_VENCIDO",
    "EN_REPARACION",
    "EN_ESPERA_REPUESTOS",
    "EN_PRUEBAS",
    "REQUIERE_NUEVA_INTERVENCION",
    "LISTO_PARA_ENTREGA",
    "ENTREGADO",
    "CANCELADO",
];

export const ESTADOS_INICIALES = new Set<string>([
    "SOLICITUD_RECIBIDA",
    "EQUIPO_INGRESADO",
    "PENDIENTE_ASIGNACION",
    "ASIGNADO_A_TECNICO",
]);

export const ESTADOS_CON_PRESUPUESTO = new Set<string>([
    "PRESUPUESTO_ENVIADO",
    "PRESUPUESTO_APROBADO",
    "PRESUPUESTO_RECHAZADO",
    "PRESUPUESTO_VENCIDO",
    "EN_REPARACION",
    "EN_ESPERA_REPUESTOS",
    "EN_PRUEBAS",
    "REQUIERE_NUEVA_INTERVENCION",
    "LISTO_PARA_ENTREGA",
    "ENTREGADO",
]);

export const ESTADOS_HABILITADOS_REPARACION = new Set<string>([
    "PRESUPUESTO_APROBADO",
    "EN_REPARACION",
    "EN_ESPERA_REPUESTOS",
    "EN_PRUEBAS",
    "REQUIERE_NUEVA_INTERVENCION",
]);

export const ESTADOS_ORDEN_FINALIZADA = new Set<string>([
    "LISTO_PARA_ENTREGA",
    "ENTREGADO",
    "SIN_REPARACION",
    "PRESUPUESTO_RECHAZADO",
    "PRESUPUESTO_VENCIDO",
    "CANCELADO",
]);

export function formatearEstado(estado: string): string {
    return estado
        .toLocaleLowerCase()
        .split("_")
        .map((palabra, index) =>
            index === 0 ? palabra.charAt(0).toLocaleUpperCase() + palabra.slice(1) : palabra,
        )
        .join(" ");
}