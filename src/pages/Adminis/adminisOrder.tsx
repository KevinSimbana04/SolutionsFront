import { useState } from "react";
import { LuPlus } from "react-icons/lu";
import ModalShell from "@/components/ui/ModalShell";
import OrderForm from "@/features/orders/components/orderForm";
import OrderTable from "@/features/orders/components/orderTable";

export default function AdminisOrderPage() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-h1 text-dark">Gestión de órdenes</h1>
                    <p className="mt-1 text-footer text-gray-500">
                        Registra ingresos, administra presupuestos y haz seguimiento del taller.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-main font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
                >
                    <LuPlus className="h-4 w-4" />
                    Nueva orden
                </button>
            </div>

            <OrderTable refreshKey={refreshKey} />

            {showCreateModal && (
                <ModalShell
                    title="Registrar nueva orden de trabajo"
                    subtitle="Asigna cliente, equipo y técnico disponible."
                    onClose={() => setShowCreateModal(false)}
                >
                    <OrderForm
                        onCreated={() => {
                            setShowCreateModal(false);
                            setRefreshKey((key) => key + 1);
                        }}
                    />
                </ModalShell>
            )}
        </div>
    );
}