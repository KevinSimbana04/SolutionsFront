import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { parametrosService } from "../api/parametro.service";
import { parametrosSchema, type ParametrosFormData } from "../schema/parametro.schema";
import type { ParametroGeneral } from "../types";

const valoresIniciales: ParametrosFormData = {
    iva: 15,
    tiempoGarantia: 2,
    tiempoMaximoEntrega: 5,
    tiempoLimiteDiagnostico: 3,
    tiempoLimitePresupuesto: 3,
};

function getErrorMessage(error: unknown, fallback: string): string {
    if (isAxiosError<{ mensaje?: string }>(error) && error.response?.data?.mensaje) {
        return error.response.data.mensaje;
    }
    return fallback;
}

const inputClassName =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function ParametrosForm() {
    const [isLoading, setIsLoading] = useState(true);
    const [reloadCount, setReloadCount] = useState(0);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ParametrosFormData>({
        resolver: zodResolver(parametrosSchema),
        defaultValues: valoresIniciales,
    });

    useEffect(() => {
        let isCurrent = true;
        const cargarParametros = async () => {
            setIsLoading(true);
            try {
                const parametros = await parametrosService.obtenerParametros();
                if (isCurrent) {
                    reset({
                        iva: parametros.iva,
                        tiempoGarantia: parametros.tiempoGarantia,
                        tiempoMaximoEntrega: parametros.tiempoMaximoEntrega,
                        tiempoLimiteDiagnostico: parametros.tiempoLimiteDiagnostico,
                        tiempoLimitePresupuesto: parametros.tiempoLimitePresupuesto,
                    });
                }
            } catch (error) {
                if (isCurrent) toast.error(getErrorMessage(error, "No se pudieron cargar los parámetros."));
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        };
        void cargarParametros();
        return () => { isCurrent = false; };
    }, [reloadCount, reset]);

    const onSubmit = async (data: ParametrosFormData) => {
        try {
            const response: ParametroGeneral = await parametrosService.actualizarParametros(data);
            reset(response); // Actualiza los campos con lo que responde el servidor
            toast.success(response.mensaje || "Parámetros actualizados correctamente.");
        } catch (error) {
            toast.error(getErrorMessage(error, "No se pudieron guardar los parámetros."));
        }
    };

    return (
        <section className="w-full overflow-hidden rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-h1 text-dark mb-1">Parámetros del Sistema</h1>
            <p className="text-footer text-gray-500 mb-6">Valores globales para los cálculos y plazos operativos.</p>

            {isLoading ? (
                <div className="py-8 text-center text-gray-500">Cargando parámetros...</div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="grid gap-5 md:grid-cols-2">
                        {/* IVA */}
                        <div>
                            <label htmlFor="iva" className="block text-label font-medium text-dark mb-1">IVA (%)</label>
                            <input
                                id="iva"
                                type="number"
                                aria-invalid={Boolean(errors.iva)}
                                className={inputClassName}
                                {...register("iva", { valueAsNumber: true })}
                            />
                            {errors.iva && <span className="mt-1 block text-xs text-red-600">{errors.iva.message}</span>}
                        </div>

                        {/* Tiempo Garantía */}
                        <div>
                            <label htmlFor="tiempoGarantia" className="block text-label font-medium text-dark mb-1">Garantía (Meses)</label>
                            <input
                                id="tiempoGarantia"
                                type="number"
                                aria-invalid={Boolean(errors.tiempoGarantia)}
                                className={inputClassName}
                                {...register("tiempoGarantia", { valueAsNumber: true })}
                            />
                            {errors.tiempoGarantia && <span className="mt-1 block text-xs text-red-600">{errors.tiempoGarantia.message}</span>}
                        </div>

                        {/* Tiempo Máximo Entrega */}
                        <div>
                            <label htmlFor="tiempoMaximoEntrega" className="block text-label font-medium text-dark mb-1">Max. Entrega (Días)</label>
                            <input
                                id="tiempoMaximoEntrega"
                                type="number"
                                aria-invalid={Boolean(errors.tiempoMaximoEntrega)}
                                className={inputClassName}
                                {...register("tiempoMaximoEntrega", { valueAsNumber: true })}
                            />
                            {errors.tiempoMaximoEntrega && <span className="mt-1 block text-xs text-red-600">{errors.tiempoMaximoEntrega.message}</span>}
                        </div>

                        {/* Límite Diagnóstico */}
                        <div>
                            <label htmlFor="tiempoLimiteDiagnostico" className="block text-label font-medium text-dark mb-1">Límite Diagnóstico (Días)</label>
                            <input
                                id="tiempoLimiteDiagnostico"
                                type="number"
                                aria-invalid={Boolean(errors.tiempoLimiteDiagnostico)}
                                className={inputClassName}
                                {...register("tiempoLimiteDiagnostico", { valueAsNumber: true })}
                            />
                            {errors.tiempoLimiteDiagnostico && <span className="mt-1 block text-xs text-red-600">{errors.tiempoLimiteDiagnostico.message}</span>}
                        </div>

                        {/* Límite Presupuesto */}
                        <div>
                            <label htmlFor="tiempoLimitePresupuesto" className="block text-label font-medium text-dark mb-1">Límite Presupuesto (Días)</label>
                            <input
                                id="tiempoLimitePresupuesto"
                                type="number"
                                aria-invalid={Boolean(errors.tiempoLimitePresupuesto)}
                                className={inputClassName}
                                {...register("tiempoLimitePresupuesto", { valueAsNumber: true })}
                            />
                            {errors.tiempoLimitePresupuesto && <span className="mt-1 block text-xs text-red-600">{errors.tiempoLimitePresupuesto.message}</span>}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setReloadCount((c) => c + 1)}
                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-main text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Restaurar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-primary px-5 py-2.5 text-main font-medium text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                            {isSubmitting ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
}