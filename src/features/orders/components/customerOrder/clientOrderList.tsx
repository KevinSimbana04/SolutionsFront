import { LuRefreshCw } from "react-icons/lu";

import { useClientOrders } from "../../hooks/useClientOrders";
import ClientOrderCard from "./ClientOrderCard";
import ClientOrderDetailModal from "./ClientOrderDetailModal";

export default function ClientOrderList() {
    const {
        ordenes,
        isLoading,
        loadError,
        ordenSeleccionada,
        detalle,
        detalleCargando,
        detalleError,
        verDetalle,
        cerrarDetalle,
        recargar,
    } = useClientOrders();

    return (
        <>
            <section className="overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-5">
                    <div>
                        <h1 className="text-h1 text-dark">Mis órdenes de trabajo</h1>
                        <p className="mt-1 text-footer text-gray-500">
                            Consulta el estado actual y revisa los presupuestos de tus reparaciones.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={recargar}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-main font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <LuRefreshCw className="h-4 w-4" />
                        Actualizar
                    </button>
                </div>

                {!isLoading && !loadError && ordenes.some((o) => o.estadoOrden === "PRESUPUESTO_ENVIADO") && (
                    <div className="mx-6 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
                        <p className="text-main font-medium">
                            Tienes un presupuesto esperando tu aprobación para iniciar la reparación.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                const pendiente = ordenes.find((o) => o.estadoOrden === "PRESUPUESTO_ENVIADO");
                                if (pendiente) void verDetalle(pendiente);
                            }}
                            className="rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-700"
                        >
                            Revisar ahora
                        </button>
                    </div>
                )}

                <div className="p-6">
                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {[1, 2].map((item) => (
                                <div key={item} className="h-52 animate-pulse rounded-xl border border-gray-200 bg-gray-50 p-5" />
                            ))}
                        </div>
                    ) : loadError ? (
                        <p className="py-10 text-center text-main text-gray-500">
                            No se pudo cargar la lista. Usa «Actualizar» para intentarlo de nuevo.
                        </p>
                    ) : ordenes.length === 0 ? (
                        <p className="py-10 text-center text-main text-gray-500">
                            Aún no tienes órdenes de reparación.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {ordenes.map((orden) => (
                                <ClientOrderCard
                                    key={orden.ordenId}
                                    orden={orden}
                                    onSelect={(seleccionada) => void verDetalle(seleccionada)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {ordenSeleccionada && (
                <ClientOrderDetailModal
                    orden={ordenSeleccionada}
                    detalle={detalle}
                    isLoading={detalleCargando}
                    loadError={detalleError}
                    onClose={cerrarDetalle}
                    onRetry={() => void verDetalle(ordenSeleccionada)}
                    onBudgetResponded={() => {
                        cerrarDetalle();
                        recargar();
                    }}
                />
            )}
        </>
    );
}