import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LuPlus, LuTrash2, LuX } from "react-icons/lu";
import { toast } from "react-toastify";

import { diagnosticoService } from "@/features/diagnosis/api/diagnosis.service";
import type { DiagnosticoResponse } from "@/features/diagnosis/types";
import { presupuestoService } from "../api/budget.service";
import {
    crearPresupuestoSchema,
    type CrearPresupuestoFormData,
    type CrearPresupuestoFormInput,
} from "../schema/budget.schema";

import { getErrorMessage } from "@/utils/error.utils"
import ModalShell from "@/components/ui/ModalShell";

interface BudgetCreateModalProps {
    ordenId: number;
    codigoOrden: string;
    onClose: () => void;
    onCreated: () => void;
}

const inputClassName =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function BudgetCreateModal({
    ordenId,
    codigoOrden,
    onClose,
    onCreated,
}: BudgetCreateModalProps) {
    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CrearPresupuestoFormInput, undefined, CrearPresupuestoFormData>({
        resolver: zodResolver(crearPresupuestoSchema),
        defaultValues: {
            costoManoObra: "",
            repuestos: [],
        },
    });
    const { fields, append, remove } = useFieldArray({ control, name: "repuestos" });
    const [diagnostico, setDiagnostico] = useState<DiagnosticoResponse | null>(null);
    const [isLoadingDiagnostico, setIsLoadingDiagnostico] = useState(true);
    const [diagnosticoError, setDiagnosticoError] = useState(false);
    const [diagnosticoReloadKey, setDiagnosticoReloadKey] = useState(0);

    useEffect(() => {
        let isCurrent = true;

        const cargarDiagnostico = async () => {
            try {
                const data = await diagnosticoService.obtenerDiagnostico(ordenId);
                if (!isCurrent) return;

                setDiagnostico(data);
                setDiagnosticoError(false);
                const repuestosSugeridos = data.repuestosRequeridos
                    ?.split(/[\n,;]+/)
                    .map((repuesto) => repuesto.trim())
                    .filter(Boolean) ?? [];
                reset({
                    costoManoObra: data.valorManoObra == null
                        ? ""
                        : String(data.valorManoObra),
                    repuestos: repuestosSugeridos.length > 0
                        && repuestosSugeridos.every((repuesto) => repuesto.length <= 120)
                        ? repuestosSugeridos.map((nombreRepuesto) => ({
                            nombreRepuesto,
                            cantidad: "",
                            costoUnitario: "",
                        }))
                        : [],
                });
            } catch (error) {
                if (isCurrent) {
                    setDiagnosticoError(true);
                    toast.error(getErrorMessage(error, "No se pudo cargar el diagnóstico técnico."));
                }
            } finally {
                if (isCurrent) setIsLoadingDiagnostico(false);
            }
        };

        void cargarDiagnostico();
        return () => {
            isCurrent = false;
        };
    }, [diagnosticoReloadKey, ordenId, reset]);

    const emitir = async (data: CrearPresupuestoFormData) => {
        if (!diagnostico || isLoadingDiagnostico || diagnosticoError) return;
        try {
            await presupuestoService.emitirPresupuesto(ordenId, data);
            toast.success(`Presupuesto de la orden ${codigoOrden} enviado al cliente.`);
            onCreated();
        } catch (error) {
            toast.error(getErrorMessage(error, "No se pudo emitir el presupuesto."));
        }
    };

    return (

        <ModalShell
            title="Registrar avance de reparación"
            subtitle={`Orden ${codigoOrden}`}
            onClose={() => {
                if (!isSubmitting) onClose();
            }}
        >
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h2 id="crear-presupuesto-title" className="text-h2 text-dark">
                            Emitir presupuesto
                        </h2>
                        <p className="mt-1 text-footer text-gray-500">Orden {codigoOrden}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Cerrar formulario de presupuesto"
                        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-dark disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <LuX className="h-5 w-5" />
                    </button>
                </div>

                {isLoadingDiagnostico ? (
                    <p className="py-8 text-center text-main text-gray-500">
                        Cargando el diagnóstico técnico...
                    </p>
                ) : diagnosticoError || !diagnostico ? (
                    <div className="py-5 text-center">
                        <p className="mb-4 text-main text-red-600">
                            No se pudo cargar el diagnóstico. Es necesario consultarlo antes de emitir el presupuesto.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setIsLoadingDiagnostico(true);
                                setDiagnosticoError(false);
                                setDiagnosticoReloadKey((key) => key + 1);
                            }}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-main font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : (
                <form onSubmit={handleSubmit(emitir)} className="space-y-6">
                    <section className="space-y-3 rounded-lg bg-sky-50 p-4 text-main text-sky-950">
                        <div>
                            <h3 className="font-semibold">Referencia del diagnóstico técnico</h3>
                            <p className="mt-1 whitespace-pre-wrap">{diagnostico.causaProbableTecnico}</p>
                        </div>
                        <p>
                            <span className="font-medium">Pruebas realizadas: </span>
                            {diagnostico.pruebasRealizadas}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <p>
                                <span className="font-medium">Mano de obra sugerida: </span>
                                {diagnostico.valorManoObra == null
                                    ? "No indicada"
                                    : `$${Number(diagnostico.valorManoObra).toFixed(2)}`}
                            </p>
                            <p>
                                <span className="font-medium">Tiempo estimado: </span>
                                {diagnostico.tiempoEstimado == null
                                    ? "No indicado"
                                    : `${diagnostico.tiempoEstimado} días`}
                            </p>
                        </div>
                        <p className="whitespace-pre-wrap">
                            <span className="font-medium">Repuestos recomendados: </span>
                            {diagnostico.repuestosRequeridos || "No se recomendaron repuestos."}
                        </p>
                    </section>

                    <div>
                        <label htmlFor="costoManoObra" className="mb-1 block text-main font-medium text-dark">
                            Costo de mano de obra definido por administración
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">
                                $
                            </span>
                            <input
                                id="costoManoObra"
                                type="number"
                                min="0"
                                step="0.01"
                                {...register("costoManoObra")}
                                className={`${inputClassName} pl-7`}
                            />
                        </div>
                        {errors.costoManoObra?.message && (
                            <p className="mt-1 text-footer text-red-600">{errors.costoManoObra.message}</p>
                        )}
                    </div>

                    <section>
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h3 className="text-h3 text-dark">Detalle comercial de repuestos</h3>
                                <p className="text-footer text-gray-500">
                                    Revisa la recomendación técnica y define cantidad y precio unitario.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => append({ nombreRepuesto: "", cantidad: "", costoUnitario: "" })}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-main font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <LuPlus className="h-4 w-4" />
                                Agregar repuesto
                            </button>
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid gap-3 rounded-lg border border-gray-200 p-4 sm:grid-cols-[minmax(0,1fr)_110px_150px_auto]">
                                    <div>
                                        <label htmlFor={`repuesto-${index}-nombre`} className="mb-1 block text-footer font-medium text-gray-600">
                                            Nombre
                                        </label>
                                        <input
                                            id={`repuesto-${index}-nombre`}
                                            {...register(`repuestos.${index}.nombreRepuesto`)}
                                            maxLength={120}
                                            className={inputClassName}
                                        />
                                        {errors.repuestos?.[index]?.nombreRepuesto?.message && (
                                            <p className="mt-1 text-footer text-red-600">
                                                {errors.repuestos[index]?.nombreRepuesto?.message}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor={`repuesto-${index}-cantidad`} className="mb-1 block text-footer font-medium text-gray-600">
                                            Cantidad
                                        </label>
                                        <input
                                            id={`repuesto-${index}-cantidad`}
                                            type="number"
                                            min="1"
                                            step="1"
                                            {...register(`repuestos.${index}.cantidad`)}
                                            className={inputClassName}
                                        />
                                        {errors.repuestos?.[index]?.cantidad?.message && (
                                            <p className="mt-1 text-footer text-red-600">
                                                {errors.repuestos[index]?.cantidad?.message}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor={`repuesto-${index}-costo`} className="mb-1 block text-footer font-medium text-gray-600">
                                            Costo unitario
                                        </label>
                                        <input
                                            id={`repuesto-${index}-costo`}
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            {...register(`repuestos.${index}.costoUnitario`)}
                                            className={inputClassName}
                                        />
                                        {errors.repuestos?.[index]?.costoUnitario?.message && (
                                            <p className="mt-1 text-footer text-red-600">
                                                {errors.repuestos[index]?.costoUnitario?.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-start sm:pt-7">
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            aria-label={`Eliminar repuesto ${index + 1}`}
                                            className="rounded-md p-2 text-red-600 hover:bg-red-50"
                                        >
                                            <LuTrash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <p className="text-footer text-gray-500">
                        El subtotal, el IVA y el total serán calculados por el servidor.
                    </p>

                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-main font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !diagnostico || isLoadingDiagnostico}
                            className="rounded-lg bg-primary px-4 py-2 text-main font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? "Enviando..." : "Enviar presupuesto"}
                        </button>
                    </div>
                </form>
                )}
        </ModalShell>
    );
}
