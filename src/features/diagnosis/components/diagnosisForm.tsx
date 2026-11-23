import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";

import { diagnosticoService } from "../api/diagnosis.service";
import {
    diagnosticoSchema,
    type DiagnosticoFormData,
    type DiagnosticoFormInput,
} from "../schema/diagnosis.schema";
import type { DiagnosticoRequest } from "../types";

import { getErrorMessage } from "@/utils/error.utils"

import ModalShell from "@/components/ui/ModalShell";

interface DiagnosisFormProps {
    ordenId: number;
    codigoOrden: string;
    onClose: () => void;
    onSaved: () => void;
}

const valoresIniciales: DiagnosticoFormInput = {
    causaProbableTecnico: "",
    pruebasRealizadas: "",
    posibilidadesReparacion: "",
    repuestosRequeridos: "",
    valorManoObra: "",
    tiempoEstimado: "",
    justificacionInvalida: "",
    observacionesTecnico: "",
};

const inputClassName =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function DiagnosisForm({
    ordenId,
    codigoOrden,
    onClose,
    onSaved,
}: DiagnosisFormProps) {
    const {
        control,
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<DiagnosticoFormInput, undefined, DiagnosticoFormData>({
        resolver: zodResolver(diagnosticoSchema),
        defaultValues: valoresIniciales,
    });

    const posibilidadesReparacion = useWatch({
        control,
        name: "posibilidadesReparacion",
    });

    const onSubmit = async (data: DiagnosticoFormData) => {
        if (!data.posibilidadesReparacion) return;

        const request: DiagnosticoRequest = {
            causaProbableTecnico: data.causaProbableTecnico,
            pruebasRealizadas: data.pruebasRealizadas,
            posibilidadesReparacion: data.posibilidadesReparacion,
            observacionesTecnico: data.observacionesTecnico,
        };

        if (data.posibilidadesReparacion === "TIENE_REPARACION") {
            request.repuestosRequeridos = data.repuestosRequeridos;
            request.valorManoObra = data.valorManoObra;
            request.tiempoEstimado = data.tiempoEstimado;
        } else {
            request.justificacionInvalida = data.justificacionInvalida;
        }

        try {
            await diagnosticoService.emitirDiagnostico(ordenId, request);
            toast.success("Diagnóstico registrado correctamente.");
            onSaved();
        } catch (error) {
            toast.error(getErrorMessage(error, "No se pudo registrar el diagnóstico."));
        }
    };

    const tieneReparacion = posibilidadesReparacion === "TIENE_REPARACION";
    const sinReparacion = posibilidadesReparacion === "SIN_REPARACION";

return (
        <ModalShell
            title="Registrar diagnóstico técnico"
            subtitle={`Orden ${codigoOrden}`}
            onClose={() => {
                if (!isSubmitting) onClose();
            }}
        >
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="mb-4">
                        <label htmlFor="diagnostico-causa" className="mb-1 block text-label text-dark">
                            Falla técnica confirmada
                        </label>
                        <textarea
                            id="diagnostico-causa"
                            rows={3}
                            aria-invalid={Boolean(errors.causaProbableTecnico)}
                            className={inputClassName}
                            placeholder="Describe la causa probable confirmada (mínimo 10 caracteres)"
                            disabled={isSubmitting}
                            {...register("causaProbableTecnico")}
                        />
                        {errors.causaProbableTecnico && (
                            <span className="mt-1 block text-xs text-red-600" role="alert">
                                {errors.causaProbableTecnico.message}
                            </span>
                        )}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="diagnostico-pruebas" className="mb-1 block text-label text-dark">
                            Pruebas y mediciones realizadas
                        </label>
                        <textarea
                            id="diagnostico-pruebas"
                            rows={3}
                            aria-invalid={Boolean(errors.pruebasRealizadas)}
                            className={inputClassName}
                            placeholder="Detalla las pruebas y mediciones (mínimo 10 caracteres)"
                            disabled={isSubmitting}
                            {...register("pruebasRealizadas")}
                        />
                        {errors.pruebasRealizadas && (
                            <span className="mt-1 block text-xs text-red-600" role="alert">
                                {errors.pruebasRealizadas.message}
                            </span>
                        )}
                    </div>

                    <fieldset className="mb-5">
                        <legend className="mb-2 text-label text-dark">
                            ¿El equipo tiene reparación?
                        </legend>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="cursor-pointer">
                                <input
                                    type="radio"
                                    value="TIENE_REPARACION"
                                    aria-invalid={Boolean(errors.posibilidadesReparacion)}
                                    disabled={isSubmitting}
                                    className="peer sr-only"
                                    {...register("posibilidadesReparacion")}
                                />
                                <span className="block rounded-lg border border-gray-300 p-3 text-main text-gray-700 transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-primary">
                                    Sí, tiene reparación
                                </span>
                            </label>
                            <label className="cursor-pointer">
                                <input
                                    type="radio"
                                    value="SIN_REPARACION"
                                    aria-invalid={Boolean(errors.posibilidadesReparacion)}
                                    disabled={isSubmitting}
                                    className="peer sr-only"
                                    {...register("posibilidadesReparacion")}
                                />
                                <span className="block rounded-lg border border-gray-300 p-3 text-main text-gray-700 transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-primary">
                                    No tiene reparación
                                </span>
                            </label>
                        </div>
                        {errors.posibilidadesReparacion && (
                            <span className="mt-1 block text-xs text-red-600" role="alert">
                                {errors.posibilidadesReparacion.message}
                            </span>
                        )}
                    </fieldset>

                    {tieneReparacion && (
                        <section aria-labelledby="diagnostico-presupuesto-title" className="mb-5">
                            <h3 id="diagnostico-presupuesto-title" className="mb-3 text-h3 text-primary">
                                Estimación de reparación
                            </h3>
                            <div className="grid gap-x-6 sm:grid-cols-2">
                                <div className="mb-4">
                                    <label htmlFor="diagnostico-mano-obra" className="mb-1 block text-label text-dark">
                                        Valor estimado de mano de obra
                                    </label>
                                    <input
                                        id="diagnostico-mano-obra"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        aria-invalid={Boolean(errors.valorManoObra)}
                                        className={inputClassName}
                                        disabled={isSubmitting}
                                        {...register("valorManoObra")}
                                    />
                                    {errors.valorManoObra && (
                                        <span className="mt-1 block text-xs text-red-600" role="alert">
                                            {errors.valorManoObra.message}
                                        </span>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="diagnostico-tiempo" className="mb-1 block text-label text-dark">
                                        Tiempo estimado (días hábiles)
                                    </label>
                                    <input
                                        id="diagnostico-tiempo"
                                        type="number"
                                        min="1"
                                        max="30"
                                        step="1"
                                        aria-invalid={Boolean(errors.tiempoEstimado)}
                                        className={inputClassName}
                                        disabled={isSubmitting}
                                        {...register("tiempoEstimado")}
                                    />
                                    {errors.tiempoEstimado && (
                                        <span className="mt-1 block text-xs text-red-600" role="alert">
                                            {errors.tiempoEstimado.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="diagnostico-repuestos" className="mb-1 block text-label text-dark">
                                    Repuestos requeridos
                                </label>
                                <textarea
                                    id="diagnostico-repuestos"
                                    rows={2}
                                    className={inputClassName}
                                    disabled={isSubmitting}
                                    {...register("repuestosRequeridos")}
                                />
                            </div>
                        </section>
                    )}

                    {sinReparacion && (
                        <div className="mb-5">
                            <label htmlFor="diagnostico-justificacion" className="mb-1 block text-label text-dark">
                                Justificación técnica de inviabilidad
                            </label>
                            <textarea
                                id="diagnostico-justificacion"
                                rows={3}
                                aria-invalid={Boolean(errors.justificacionInvalida)}
                                className={inputClassName}
                                placeholder="Explica por qué el equipo no tiene reparación (mínimo 15 caracteres)"
                                disabled={isSubmitting}
                                {...register("justificacionInvalida")}
                            />
                            {errors.justificacionInvalida && (
                                <span className="mt-1 block text-xs text-red-600" role="alert">
                                    {errors.justificacionInvalida.message}
                                </span>
                            )}
                        </div>
                    )}

                    <div className="mb-5">
                        <label htmlFor="diagnostico-observaciones" className="mb-1 block text-label text-dark">
                            Observaciones (opcional)
                        </label>
                        <textarea
                            id="diagnostico-observaciones"
                            rows={2}
                            className={inputClassName}
                            disabled={isSubmitting}
                            {...register("observacionesTecnico")}
                        />
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
                            {isSubmitting ? "Guardando..." : "Emitir diagnóstico"}
                        </button>
                    </div>
                </form>
        </ModalShell>
    );
}
