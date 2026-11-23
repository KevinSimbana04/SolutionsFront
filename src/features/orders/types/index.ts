export type EstadoOrden =
    | "SOLICITUD_RECIBIDA"
    | "EQUIPO_INGRESADO"
    | "PENDIENTE_ASIGNACION"
    | "ASIGNADO_A_TECNICO"
    | "RECIBIDO_POR_TECNICO"
    | "EN_DIAGNOSTICO"
    | "PENDIENTE_PRESUPUESTO"
    | "SIN_REPARACION"
    | "PRESUPUESTO_ENVIADO"
    | "PRESUPUESTO_APROBADO"
    | "PRESUPUESTO_RECHAZADO"
    | "PRESUPUESTO_VENCIDO"
    | "EN_REPARACION"
    | "EN_ESPERA_REPUESTOS"
    | "EN_PRUEBAS"
    | "REQUIERE_NUEVA_INTERVENCION"
    | "LISTO_PARA_ENTREGA"
    | "ENTREGADO"
    | "CANCELADO";

export interface CrearOrdenRequest {
    clienteId: number;
    equipoId: number;
    tecnicoId: number;
    fechaEstimadaEntrega: string;
}

export interface ActualizarRecepcionOrdenRequest {
    tecnicoId?: number;
    fallaReportada?: string;
    accesorios?: string;
    motivoReasignacion?: string;
}

export interface CancelarOrdenRequest {
    motivo: string;
}

export interface OrdenResponse {
    ordenId: number;
    codigo: string;
    estadoOrden: string;
    fechaEstimadaEntrega: string;
    fechaDeEntrega: string | null;
    clienteId: number;
    clienteNombreCompleto: string;
    equipoId: number;
    equipoResumen: string;
    fallaReportada: string;
    tecnicoId: number;
    tecnicoNombreCompleto: string;
}

export interface HistorialOrdenResponse {
    fechaModificacion: string;
    usuarioResponsable: string;
    rolUsuario: string;
    estadoAnterior: string | null;
    estadoNuevo: string;
    notasSeguimiento: string | null;
}

export interface DetalleOrdenResponse {
    datosGenerales: OrdenResponse;
    fechaCreacion: string;
    administrativoNombreCompleto: string | null;
    accesorios: string | null;
    motivoCancelacion: string | null;
    historial: HistorialOrdenResponse[];
}

export interface ResumenOrdenClienteResponse {
    ordenId: number;
    codigo: string;
    estadoOrden: EstadoOrden;
    equipoResumen: string;
    fechaCreacion: string;
    fechaEstimadaEntrega: string;
    fechaDeEntrega: string | null;
}

export interface EstadoLineaTiempoOrden {
    estado: string;
    fechaHora: string;
}

export interface DetalleOrdenClienteResponse {
    id: number;
    codigo: string;
    estadoActual: string;
    fechaCreacion: string;
    fechaEstimadaEntrega: string;
    equipoMarcaModelo: string;
    numeroSerie: string;
    fotografiaInicial: string | null;
    lineaTiempo: EstadoLineaTiempoOrden[];
}

export interface FiltroOrden {
    tecnicoId?: number;
    clienteId?: number;
    estado?: EstadoOrden;
    busqueda?: string;
    fechaInicio?: string;
    fechaFin?: string;
}

export interface PaginaResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}