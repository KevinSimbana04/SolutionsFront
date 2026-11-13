import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";


import { equipoService } from "../api/equipment.service";
import { equipoSchema, tiposEquipo, type EquipoFormData } from "../schema/equipment.schema";
import type { EquipoRequest } from "../types";

import { clienteService } from "@/features/customer/api/customer.service";
import type { ClienteResponse } from "@/features/customer/types";

interface EquipoFormProps {
    onCreated?: () => void;
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (isAxiosError<{ mensaje?: string }>(error) && error.response?.data?.mensaje) {
        return error.response.data.mensaje;
    }
    return fallback;
}

const inputClassName =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function EquipoForm({ onCreated }: EquipoFormProps) {
    const [clientes, setClientes] = useState<ClienteResponse[]>([]);
    const [clientesCargando, setClientesCargando] = useState(true);
    const [fileInputKey, setFileInputKey] = useState(0);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<EquipoFormData>({
        resolver: zodResolver(equipoSchema),
        defaultValues: {
            clienteId: "",
            tipoEquipo: undefined,
            marca: "",
            modelo: "",
            numeroSerie: "",
            color: "",
            accesorios: "",
            estadoFisicoInicial: "",
            fotografiaInicial: "",
            fallaReportada: "",
            observaciones: "",
        },
    });

    useEffect(() => {
        let isCurrent = true;
        const cargarClientes = async () => {
            setClientesCargando(true);
            try {
                const data = await clienteService.listarClientes();
                if (isCurrent) setClientes(data);
            } catch (error) {
                if (isCurrent) {
                    toast.error(getErrorMessage(error, "No se pudieron cargar los clientes."));
                }
            } finally {
                if (isCurrent) setClientesCargando(false);
            }
        };
        void cargarClientes();
        return () => {
            isCurrent = false;
        };
    }, []);

    const onPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!["image/jpeg", "image/png"].includes(file.type)) {
            setError("fotografiaInicial", {
                type: "validate",
                message: "La fotografía debe estar en formato JPG o PNG",
            });
            event.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setValue("fotografiaInicial", reader.result, {
                    shouldDirty: true,
                    shouldValidate: true,
                });
            } else {
                setError("fotografiaInicial", {
                    type: "validate",
                    message: "No se pudo leer la fotografía. Inténtalo nuevamente.",
                });
            }
        };
        reader.onerror = () => {
            setError("fotografiaInicial", {
                type: "validate",
                message: "No se pudo leer la fotografía. Inténtalo nuevamente.",
            });
        };
        reader.readAsDataURL(file);
    };

    const onSubmit = async (data: EquipoFormData) => {
        const request: EquipoRequest = {
            ...data,
            clienteId: Number(data.clienteId),
        };
        try {
            const response = await equipoService.registrarEquipo(request);
            toast.success(response.mensaje || "Equipo registrado correctamente.");
            reset();
            setFileInputKey((key) => key + 1);
            onCreated?.();
        } catch (error) {
            toast.error(getErrorMessage(error, "No se pudo registrar el equipo."));
        }
    };

    return (
        <section className="w-full overflow-hidden rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-h1 text-dark">Registrar equipo</h1>
            <p className="mb-6 mt-1 text-footer text-gray-500">
                Completa la información del equipo recibido y su estado inicial.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="grid gap-x-6 sm:grid-cols-2">
                    <div className="mb-5">
                        <label htmlFor="equipo-cliente" className="mb-1 block text-label text-dark">
                            Cliente propietario
                        </label>
                        <select
                            id="equipo-cliente"
                            aria-invalid={Boolean(errors.clienteId)}
                            disabled={clientesCargando || clientes.length === 0}
                            className={`${inputClassName} bg-white disabled:bg-gray-100`}
                            {...register("clienteId")}
                        >
                            <option value="">
                                {clientesCargando ? "Cargando clientes..." : "Selecciona un cliente"}
                            </option>
                            {clientes.map((cliente) => (
                                <option key={cliente.clienteId} value={cliente.clienteId}>
                                    {cliente.nombres} {cliente.apellidos} - {cliente.identificacion}
                                </option>
                            ))}
                        </select>
                        {errors.clienteId && (
                            <span className="mt-1 block text-xs text-red-600" role="alert">
                                {errors.clienteId.message}
                            </span>
                        )}
                        {!clientesCargando && clientes.length === 0 && (
                            <span className="mt-1 block text-xs text-gray-500">
                                Registra un cliente antes de agregar un equipo.
                            </span>
                        )}
                    </div>

                    <div className="mb-5">
                        <label htmlFor="equipo-tipo" className="mb-1 block text-label text-dark">
                            Tipo de equipo
                        </label>
                        <select
                            id="equipo-tipo"
                            aria-invalid={Boolean(errors.tipoEquipo)}
                            className={`${inputClassName} bg-white`}
                            {...register("tipoEquipo")}
                        >
                            <option value="">Selecciona un tipo</option>
                            {tiposEquipo.map((tipo) => (
                                <option key={tipo} value={tipo}>
                                    {tipo.replaceAll("_", " ")}
                                </option>
                            ))}
                        </select>
                        {errors.tipoEquipo && (
                            <span className="mt-1 block text-xs text-red-600" role="alert">
                                {errors.tipoEquipo.message}
                            </span>
                        )}
                    </div>

                    {([ 
                        ["marca", "Marca"],
                        ["modelo", "Modelo"],
                        ["numeroSerie", "Número de serie"],
                        ["color", "Color"],
                    ] as const).map(([name, label]) => (
                        <div className="mb-5" key={name}>
                            <label htmlFor={`equipo-${name}`} className="mb-1 block text-label text-dark">
                                {label}
                            </label>
                            <input
                                id={`equipo-${name}`}
                                type="text"
                                aria-invalid={Boolean(errors[name])}
                                className={inputClassName}
                                {...register(name)}
                            />
                            {errors[name] && (
                                <span className="mt-1 block text-xs text-red-600" role="alert">
                                    {errors[name]?.message}
                                </span>
                            )}
                        </div>
                    ))}

                    <div className="mb-5">
                        <label htmlFor="equipo-accesorios" className="mb-1 block text-label text-dark">
                            Accesorios
                        </label>
                        <textarea
                            id="equipo-accesorios"
                            rows={3}
                            aria-invalid={Boolean(errors.accesorios)}
                            className={inputClassName}
                            {...register("accesorios")}
                        />
                        {errors.accesorios && (
                            <span className="mt-1 block text-xs text-red-600" role="alert">
                                {errors.accesorios.message}
                            </span>
                        )}
                    </div>

                    <div className="mb-5">
                        <label htmlFor="equipo-falla" className="mb-1 block text-label text-dark">
                            Falla reportada
                        </label>
                        <textarea
                            id="equipo-falla"
                            rows={3}
                            aria-invalid={Boolean(errors.fallaReportada)}
                            className={inputClassName}
                            {...register("fallaReportada")}
                        />
                        {errors.fallaReportada && (
                            <span className="mt-1 block text-xs text-red-600" role="alert">
                                {errors.fallaReportada.message}
                            </span>
                        )}
                    </div>

                    <div className="mb-5">
                        <label htmlFor="equipo-estado-fisico" className="mb-1 block text-label text-dark">
                            Estado físico inicial
                        </label>
                        <textarea
                            id="equipo-estado-fisico"
                            rows={3}
                            aria-invalid={Boolean(errors.estadoFisicoInicial)}
                            className={inputClassName}
                            {...register("estadoFisicoInicial")}
                        />
                        {errors.estadoFisicoInicial && (
                            <span className="mt-1 block text-xs text-red-600" role="alert">
                                {errors.estadoFisicoInicial.message}
                            </span>
                        )}
                    </div>

                    <div className="mb-5">
                        <label htmlFor="equipo-foto" className="mb-1 block text-label text-dark">
                            Fotografía inicial (JPG o PNG)
                        </label>
                        <input
                            key={fileInputKey}
                            id="equipo-foto"
                            type="file"
                            accept="image/jpeg,image/png"
                            aria-invalid={Boolean(errors.fotografiaInicial)}
                            className={`${inputClassName} file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1`}
                            onChange={onPhotoChange}
                        />
                        {errors.fotografiaInicial && (
                            <span className="mt-1 block text-xs text-red-600" role="alert">
                                {errors.fotografiaInicial.message}
                            </span>
                        )}
                    </div>

                    <div className="mb-5 sm:col-span-2">
                        <label htmlFor="equipo-observaciones" className="mb-1 block text-label text-dark">
                            Observaciones (opcional)
                        </label>
                        <textarea
                            id="equipo-observaciones"
                            rows={3}
                            className={inputClassName}
                            {...register("observaciones")}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || clientesCargando || clientes.length === 0}
                    className="mt-2 w-full rounded-lg bg-primary px-4 py-2.5 text-main font-medium text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
                >
                    {isSubmitting ? "Guardando..." : "Registrar equipo"}
                </button>
            </form>
        </section>
    );
}