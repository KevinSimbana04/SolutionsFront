import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";

import { ordenService } from "../api/order.service";
import type { OrdenResponse } from "../types";

import ModalShell from "@/components/ui/ModalShell";

import { getErrorMessage } from "@/utils/error.utils"


interface OrderCancelModalProps {
    orden: OrdenResponse;
    onClose: () => void;
    onCanceled: () => void;
}


export default function OrderCancelModal({
    orden,
    onClose,
    onCanceled,
}: OrderCancelModalProps) {
    const [motivo, setMotivo] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const cancelar = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const motivoFinal = motivo.trim();
        if (motivoFinal.length < 10) {
            toast.error("El motivo debe tener al menos 10 caracteres.");
            return;
        }

        setIsSubmitting(true);
        try {
            await ordenService.cancelarOrden(orden.ordenId, { motivo: motivoFinal });
            toast.success(`La orden ${orden.codigo} fue cancelada.`);
            onCanceled();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

return (
        <ModalShell
            title="Cancelar orden"
            subtitle={`${orden.codigo} · ${orden.equipoResumen}`}
            onClose={onClose}
            maxWidthClass="max-w-lg"
        >
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-main text-red-800">
                La cancelación cambiará el estado de la orden y registrará el motivo en su historial.
            </p>

            <form onSubmit={cancelar} className="space-y-4">
                <div>
                    <label htmlFor="motivo-cancelacion-orden" className="mb-1 block text-label text-dark">
                        Motivo de cancelación
                    </label>
                    <textarea
                        id="motivo-cancelacion-orden"
                        rows={3}
                        required
                        minLength={10}
                        value={motivo}
                        onChange={(event) => setMotivo(event.target.value)}
                        disabled={isSubmitting}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Indica por qué se cancela esta orden (mínimo 10 caracteres)"
                    />
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-main font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                        Volver
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg bg-red-600 px-4 py-2 text-main font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? "Cancelando..." : "Confirmar cancelación"}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}
