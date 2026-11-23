export type EstadoOperativoReparacion =
    | "EN_REPARACION"
    | "EN_ESPERA_REPUESTOS"
    | "REPARACION_TERMINADA"
    | "EN_PRUEBAS";

export type ResultadoPrueba = "PRUEBAS_SATISFACTORIAS" | "PRUEBAS_FALLIDAS";

export interface RegistrarAvanceReparacionRequest {
    estadoOperativo: EstadoOperativoReparacion;
    bitacoraDeAcciones: string;
    motivoFallo?: string;
    resultadoPrueba?: ResultadoPrueba;
    historialPruebas?: string;
    evidencia?: string;
    repuestosUtilizadosIds?: number[];
}

export interface ReparacionResponse {
    id: number;
    ordenId: number;
    codigoOrden: string;
    tecnicoNombreCompleto: string;
    estadoOperativo: EstadoOperativoReparacion;
    bitacoraDeAcciones: string;
    resultadoPrueba: ResultadoPrueba | null;
    motivoFallo: string | null;
    historialPruebas: string | null;
    evidencia: string | null;
    fechaInicio: string;
    fechaFin: string | null;
    nuevoEstadoOrden: string;
}
