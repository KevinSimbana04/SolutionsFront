export interface RepuestoAprobado {
    id: number;
    nombreRepuesto: string;
    cantidad: number;
    utilizadoReparacion: boolean;
}

export interface RepuestoPresupuestoRequest {
    nombreRepuesto: string;
    cantidad: number;
    costoUnitario: number;
}

export interface CrearPresupuestoRequest {
    costoManoObra: number;
    repuestos: RepuestoPresupuestoRequest[];
}

export interface ResponderPresupuestoRequest {
    decision: "APROBAR" | "RECHAZAR";
    confirmacion?: boolean;
    motivoRechazo?: string;
    comentarioAdicional?: string;
}

export interface PresupuestoResponse {
    id: number;
    ordenId: number;
    codigoOrden: string;
    equipoMarcaModelo: string;
    costoManoObra: number;
    costoRepuestos: number;
    subtotal: number;
    valorIva: number;
    totalPagar: number;
    estadoPresupuesto: string;
    confirmacion: boolean;
    motivoRechazo: string | null;
    fechaEstimadaEntrega: string;
    fechaEnvio: string;
    fechaLimite: string;
    detallesRepuesto: DetalleRepuestoPresupuesto[];
}

export interface DetalleRepuestoPresupuesto {
    id: number;
    nombreRepuesto: string;
    cantidad: number;
    costoUnitario: number;
    utilizadoReparacion: boolean;
}
