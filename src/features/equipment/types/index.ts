export type TipoEquipo =
    | "Computadora_de_escritorio" | "Laptop" | "Teléfono" | "Tablet"
    | "Impresora" | "Camara" | "DVR_NVR" | "Monitor" | "Parlantes" | "Otro";

export interface EquipoRequest {
    clienteId: number;
    tipoEquipo: TipoEquipo;
    marca: string;
    modelo: string;
    numeroSerie: string;
    color: string;
    accesorios: string;
    estadoFisicoInicial: string;
    fotografiaInicial: string;
    fallaReportada: string;
    observaciones?: string;
}

export interface EquipoResponse extends EquipoRequest {
    equipoId: number;
    nombreCliente: string;
    cedulaCliente: string;
    mensaje: string | null;
}