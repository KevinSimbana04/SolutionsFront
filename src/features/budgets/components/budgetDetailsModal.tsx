import { useEffect, useState } from "react";
import { LuX } from "react-icons/lu";
import { toast } from "react-toastify";

import { presupuestoService } from "../api/budget.service";
import type { PresupuestoResponse } from "../types";
import BudgetSummary from "./budgetSummary";

import { getErrorMessage } from "@/utils/error.utils"
import ModalShell from "@/components/ui/ModalShell";

interface BudgetDetailsModalProps {
    ordenId: number;
    codigoOrden: string;
    onClose: () => void;
}


export default function BudgetDetailsModal({
    ordenId,
    codigoOrden,
    onClose,
}: BudgetDetailsModalProps) {
    const [presupuesto, setPresupuesto] = useState<PresupuestoResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let isCurrent = true;

        const cargarPresupuesto = async () => {
            setIsLoading(true);
            setLoadError(false);
            try {
                const data = await presupuestoService.consultarPresupuesto(ordenId);
                if (isCurrent) setPresupuesto(data);
            } catch (error) {
                if (isCurrent) {
                    setLoadError(true);
                    toast.error(getErrorMessage(error));
                }
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        };

        void cargarPresupuesto();
        return () => {
            isCurrent = false;
        };
    }, [ordenId, reloadKey]);

return (
        <ModalShell
            title="Presupuesto"
            subtitle={`Orden ${codigoOrden}`}
            onClose={onClose}
        >
            {isLoading ? (
                <p className="py-10 text-center text-main text-gray-500">Cargando presupuesto...</p>
            ) : loadError || !presupuesto ? (
                <div className="py-8 text-center">
                    <p className="mb-4 text-main text-gray-600">
                        No se pudo cargar el presupuesto de esta orden.
                    </p>
                    <button
                        type="button"
                        onClick={() => setReloadKey((key) => key + 1)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-main font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Reintentar
                    </button>
                </div>
            ) : (
                <BudgetSummary presupuesto={presupuesto} />
            )}
        </ModalShell>
    );
}