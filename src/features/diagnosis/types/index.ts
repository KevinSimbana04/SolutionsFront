export type PosibilidadReparacion = "TIENE_REPARACION" | "SIN_REPARACION";

export interface DiagnosticoRequest {
    causaProbableTecnico: string;
    pruebasRealizadas: string;
    posibilidadesReparacion: PosibilidadReparacion;
    repuestosRequeridos?: string;
    valorManoObra?: number;
    tiempoEstimado?: number;
    justificacionInvalida?: string;
    evidenciaFotografica?: string;
    observacionesTecnico?: string;
}

export interface DiagnosticoResponse {
    id: number;
    ordenId: number;
    codigoOrden: string;
    tecnicoNombreCompleto: string;
    causaProbableTecnico: string;
    pruebasRealizadas: string;
    posibilidadesReparacion: PosibilidadReparacion;
    repuestosRequeridos: string | null;
    valorManoObra: number | null;
    tiempoEstimado: number | null;
    justificacionInvalida: string | null;
    evidenciaFotografica: string | null;
    observacionesTecnico: string | null;
    fechaEmision: string;
    nuevoEstadoOrden: string;
}
