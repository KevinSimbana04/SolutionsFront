import type { PresupuestoResponse } from "../types";


import { formatearFecha, formatearFechaHora } from "@/utils/date.utils";


function formatearMonto(monto: number): string {
    return `$${monto.toFixed(2)}`;
}

interface BudgetSummaryProps {
    presupuesto: PresupuestoResponse;
}

export default function BudgetSummary({ presupuesto }: BudgetSummaryProps) {
    return (
        <div className="space-y-5">
            <div className="grid gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-2">
                <div>
                    <span className="block text-footer text-gray-500">Equipo</span>
                    <span className="mt-1 block text-main font-medium text-dark">
                        {presupuesto.equipoMarcaModelo}
                    </span>
                </div>
                <div>
                    <span className="block text-footer text-gray-500">Estado del presupuesto</span>
                    <span className="mt-1 block text-main font-medium text-dark">
                        {presupuesto.estadoPresupuesto.replaceAll("_", " ")}
                    </span>
                </div>
                <div>
                    <span className="block text-footer text-gray-500">Fecha límite de respuesta</span>
                    <span className="mt-1 block text-main text-dark">
                        {formatearFechaHora(presupuesto.fechaLimite)}
                    </span>
                </div>
                <div>
                    <span className="block text-footer text-gray-500">Fecha estimada de entrega</span>
                    <span className="mt-1 block text-main text-dark">
                        {formatearFecha(presupuesto.fechaEstimadaEntrega)}
                    </span>
                </div>
            </div>

            <div>
                <h3 className="mb-2 text-h3 text-dark">Detalle de costos</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full min-w-[420px] text-left text-main">
                        <thead className="bg-gray-50 text-table uppercase text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Concepto</th>
                                <th className="px-4 py-3 text-right">Cantidad</th>
                                <th className="px-4 py-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="px-4 py-3 text-dark">Mano de obra</td>
                                <td className="px-4 py-3 text-right">1</td>
                                <td className="px-4 py-3 text-right">{formatearMonto(presupuesto.costoManoObra)}</td>
                            </tr>
                            {presupuesto.detallesRepuesto.map((repuesto) => (
                                <tr key={repuesto.id}>
                                    <td className="px-4 py-3 text-dark">
                                        {repuesto.nombreRepuesto}
                                        <span className="block text-footer text-gray-500">
                                            {formatearMonto(repuesto.costoUnitario)} por unidad
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">{repuesto.cantidad}</td>
                                    <td className="px-4 py-3 text-right">
                                        {formatearMonto(repuesto.costoUnitario * repuesto.cantidad)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <dl className="ml-auto max-w-sm space-y-2 border-t border-gray-200 pt-4 text-main">
                <div className="flex justify-between gap-4">
                    <dt className="text-gray-600">Subtotal</dt>
                    <dd className="font-medium text-dark">{formatearMonto(presupuesto.subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                    <dt className="text-gray-600">IVA</dt>
                    <dd className="font-medium text-dark">{formatearMonto(presupuesto.valorIva)}</dd>
                </div>
                <div className="flex justify-between gap-4 text-lg">
                    <dt className="font-semibold text-dark">Total</dt>
                    <dd className="font-bold text-primary">{formatearMonto(presupuesto.totalPagar)}</dd>
                </div>
            </dl>

            {presupuesto.motivoRechazo && (
                <div className="rounded-lg bg-red-50 p-4 text-main text-red-700">
                    <span className="font-semibold">Motivo de rechazo: </span>
                    {presupuesto.motivoRechazo}
                </div>
            )}
        </div>
    );
}
