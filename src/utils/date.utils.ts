export function formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return "Pendiente";

    const [fechaParte] = fecha.split("T");
    const [anio, mes, dia] = fechaParte.split("-").map(Number);
    if (!anio || !mes || !dia) return fecha;

    return new Date(anio, mes - 1, dia).toLocaleDateString();
}

export function formatearFechaHora(fechaHora: string | null | undefined): string {
    if (!fechaHora) return "Pendiente";
    const fecha = new Date(fechaHora);
    return Number.isNaN(fecha.getTime()) ? fechaHora : fecha.toLocaleString();
}

export function getTodayLocalDate(): string {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}