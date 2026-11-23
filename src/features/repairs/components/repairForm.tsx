import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";

import { presupuestoService } from "@/features/budgets/api/budget.service";
import type { RepuestoAprobado } from "@/features/budgets/types";

import { reparacionService } from "../api/repair.service";
import {
    registrarAvanceReparacionSchema,
    type RegistrarAvanceReparacionFormData,
    type RegistrarAvanceReparacionFormInput,
} from "../schema/repair.schema";

import { getErrorMessage } from "@/utils/error.utils"
interface RepairFormProps {
    ordenId: number;
    codigoOrden: string;
    onClose: () => void;
    onSaved: () => void;
}

const valoresIniciales: RegistrarAvanceReparacionFormInput = {
    estadoOperativo: "EN_REPARACION",
    bitacoraDeAcciones: "",
    motivoFallo: "",
    resultadoPrueba: "",
    historialPruebas: "",
    repuestosUtilizadosIds: [],
};

const inputClassName =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function RepairForm({
    ordenId,
    codigoOrden,
    onClose,
    onSaved,
}: RepairFormProps) {
    const [repuestos, setRepuestos] = useState<RepuestoAprobado[]>([]);
    const [repuestosCargando, setRepuestosCargando] = useState(true);
    const [repuestosError, setRepuestosError] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<
        RegistrarAvanceReparacionFormInput,
        undefined,
        RegistrarAvanceReparacionFormData
    >({
        resolver: zodResolver(registrarAvanceReparacionSchema),
        defaultValues: valoresIniciales,
    });

    const estadoOperativo = useWatch({ control, name: "estadoOperativo" });
    const resultadoPrueba = useWatch({ control, name: "resultadoPrueba" });
    const mostrarMotivoFallo = estadoOperativo === "EN_ESPERA_REPUESTOS"
        || (estadoOperativo === "EN_PRUEBAS" && resultadoPrueba === "PRUEBAS_FALLIDAS");
    const mostrarHistorialPruebas = estadoOperativo === "EN_PRUEBAS"
        && resultadoPrueba === "PRUEBAS_SATISFACTORIAS";

    useEffect(() => {
        let isCurrent = true;

        const cargarRepuestos = async () => {
            setRepuestosCargando(true);
            setRepuestosError(false);
            try {
                const data = await presupuestoService.listarRepuestosAprobados(ordenId);
                if (isCurrent) setRepuestos(data);
            } catch (error) {
                if (isCurrent) {
                    setRepuestosError(true);
                    toast.error(getErrorMessage(error, "No se pudieron cargar los repuestos aprobados."));
                }
            } finally {
                if (isCurrent) setRepuestosCargando(false);
            }
        };

        void cargarRepuestos();
        return () => {
            isCurrent = false;
        };
    }, [ordenId]);

    const onSubmit = async (data: RegistrarAvanceReparacionFormData) => {
        try {
            await reparacionService.registrarAvance(ordenId, data);
            toast.success("Avance de reparación registrado correctamente.");
            onSaved();
        } catch (error) {
            toast.error(getErrorMessage(error, "No se pudo registrar el avance de reparación."));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="reparacion-modal-title"
                className="my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl sm:p-8"
            >
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h2 id="reparacion-modal-title" className="text-h2 text-dark">
                            Registrar avance de reparación
                        </h2>
                        <p className="mt-1 text-footer text-gray-500">
                            Orden {codigoOrden}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Cerrar formulario de reparación"
                        className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-dark disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="grid gap-x-6 sm:grid-cols-2">
                        <div className="mb-4">
                            <label htmlFor="reparacion-estado" className="mb-1 block text-label text-dark">
                                Acción de reparación
                            </label>
                            <select
                                id="reparacion-estado"
                                aria-invalid={Boolean(errors.estadoOperativo)}
                                className={inputClassName}
                                disabled={isSubmitting}
                                {...register("estadoOperativo")}
                            >
                                <option value="EN_REPARACION">Registrar reparación en curso</option>
                                <option value="EN_ESPERA_REPUESTOS">Pausar por espera de repuestos</option>
                                <option value="REPARACION_TERMINADA">Finalizar reparación y pasar a pruebas</option>
                                <option value="EN_PRUEBAS">Registrar pruebas de calidad</option>
                            </select>
                            {errors.estadoOperativo && (
                                <span className="mt-1 block text-xs text-red-600" role="alert">
                                    {errors.estadoOperativo.message}
                                </span>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="reparacion-bitacora" className="mb-1 block text-label text-dark">
                                Acciones realizadas
                            </label>
                            <textarea
                                id="reparacion-bitacora"
                                rows={3}
                                aria-invalid={Boolean(errors.bitacoraDeAcciones)}
                                className={inputClassName}
                                placeholder="Describe el trabajo realizado (mínimo 10 caracteres)"
                                disabled={isSubmitting}
                                {...register("bitacoraDeAcciones")}
                            />
                            {errors.bitacoraDeAcciones && (
                                <span className="mt-1 block text-xs text-red-600" role="alert">
                                    {errors.bitacoraDeAcciones.message}
                                </span>
                            )}
                        </div>
                    </div>

                    {mostrarMotivoFallo && (
                        <div className="mb-4">
                            <label htmlFor="reparacion-motivo" className="mb-1 block text-label text-dark">
                                {estadoOperativo === "EN_ESPERA_REPUESTOS"
                                    ? "Motivo de espera de repuestos"
                                    : "Motivo del fallo en las pruebas"}
                            </label>
                            <textarea
                                id="reparacion-motivo"
                                rows={3}
                                aria-invalid={Boolean(errors.motivoFallo)}
                                className={inputClassName}
                                placeholder="Explica el motivo (mínimo 10 caracteres)"
                                disabled={isSubmitting}
                                {...register("motivoFallo")}
                            />
                            {errors.motivoFallo && (
                                <span className="mt-1 block text-xs text-red-600" role="alert">
                                    {errors.motivoFallo.message}
                                </span>
                            )}
                        </div>
                    )}

                    {estadoOperativo === "EN_PRUEBAS" && (
                        <fieldset className="mb-4">
                            <legend className="mb-2 text-label text-dark">
                                ¿Las pruebas de calidad fueron satisfactorias?
                            </legend>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className="cursor-pointer">
                                    <input
                                        type="radio"
                                        value="PRUEBAS_SATISFACTORIAS"
                                        aria-invalid={Boolean(errors.resultadoPrueba)}
                                        disabled={isSubmitting}
                                        className="peer sr-only"
                                        {...register("resultadoPrueba")}
                                    />
                                    <span className="block rounded-lg border border-gray-300 p-3 text-main text-gray-700 transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-primary">
                                        Sí, fueron satisfactorias
                                    </span>
                                </label>
                                <label className="cursor-pointer">
                                    <input
                                        type="radio"
                                        value="PRUEBAS_FALLIDAS"
                                        aria-invalid={Boolean(errors.resultadoPrueba)}
                                        disabled={isSubmitting}
                                        className="peer sr-only"
                                        {...register("resultadoPrueba")}
                                    />
                                    <span className="block rounded-lg border border-gray-300 p-3 text-main text-gray-700 transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-primary">
                                        No, se encontraron fallas
                                    </span>
                                </label>
                            </div>
                            {errors.resultadoPrueba && (
                                <span className="mt-1 block text-xs text-red-600" role="alert">
                                    {errors.resultadoPrueba.message}
                                </span>
                            )}
                        </fieldset>
                    )}

                    {mostrarHistorialPruebas && (
                        <div className="mb-4">
                            <label htmlFor="reparacion-historial-pruebas" className="mb-1 block text-label text-dark">
                                Observaciones de las pruebas
                            </label>
                            <textarea
                                id="reparacion-historial-pruebas"
                                rows={3}
                                aria-invalid={Boolean(errors.historialPruebas)}
                                className={inputClassName}
                                placeholder="Describe los resultados y observaciones (mínimo 10 caracteres)"
                                disabled={isSubmitting}
                                {...register("historialPruebas")}
                            />
                            {errors.historialPruebas && (
                                <span className="mt-1 block text-xs text-red-600" role="alert">
                                    {errors.historialPruebas.message}
                                </span>
                            )}
                        </div>
                    )}

                    <div className="mb-5">
                        <h3 className="mb-1 text-label text-dark">Repuestos aprobados utilizados</h3>
                        <p className="mb-3 text-footer text-gray-500">
                            Selecciona solo los repuestos instalados durante esta reparación.
                        </p>
                        {repuestosCargando ? (
                            <p className="text-main text-gray-500">Cargando repuestos aprobados...</p>
                        ) : repuestosError ? (
                            <p className="text-main text-red-600" role="alert">
                                No se pudieron cargar los repuestos. Puedes registrar el avance sin seleccionarlos.
                            </p>
                        ) : repuestos.length === 0 ? (
                            <p className="text-main text-gray-500">
                                No hay repuestos aprobados para esta orden.
                            </p>
                        ) : (
                            <div className="max-h-44 space-y-2 overflow-y-auto rounded-md border border-gray-200 p-3">
                                {repuestos.map((repuesto) => (
                                    <label
                                        key={repuesto.id}
                                        htmlFor={`repuesto-utilizado-${repuesto.id}`}
                                        className="flex items-center justify-between gap-3 text-main"
                                    >
                                        <span className="flex items-center gap-2">
                                            <input
                                                id={`repuesto-utilizado-${repuesto.id}`}
                                                type="checkbox"
                                                value={repuesto.id}
                                                disabled={repuesto.utilizadoReparacion || isSubmitting}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                {...register("repuestosUtilizadosIds")}
                                            />
                                            <span>{repuesto.nombreRepuesto} (cant. {repuesto.cantidad})</span>
                                        </span>
                                        {repuesto.utilizadoReparacion && (
                                            <span className="text-footer text-gray-500">Ya utilizado</span>
                                        )}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-main font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-lg bg-primary px-4 py-2.5 text-main font-medium text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
                        >
                            {isSubmitting ? "Guardando..." : "Registrar avance"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
