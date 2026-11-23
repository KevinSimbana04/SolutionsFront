import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import type { ChangeEvent } from "react";
import { toast } from "react-toastify";

import { clienteService } from "@/features/customer/api/customer.service";
import type { ClienteResponse } from "@/features/customer/types";
import { empleadoService } from "@/features/employee/api/employee.service";
import type { TecnicoDisponible } from "@/features/employee/types";
import { equipoService } from "@/features/equipment/api/equipment.service";
import type { EquipoResponse } from "@/features/equipment/types";

import { ordenService } from "../api/order.service";
import {
    crearOrdenSchema,
    type CrearOrdenFormData,
    type CrearOrdenFormInput,
} from "../schema/order.schema";


import { getErrorMessage } from "@/utils/error.utils"

interface OrdenFormProps {
    onCreated?: () => void;
}

const valoresIniciales: CrearOrdenFormInput = {
    clienteId: "",
    equipoId: "",
    tecnicoId: "",
    fechaEstimadaEntrega: "",
};

const inputClassName =
    "w-full rounded-md border px-3 py-2 text-main focus:outline-none focus:ring-1";

function getInputClassName(hasError: boolean): string {
    return `${inputClassName} ${hasError
        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:border-primary focus:ring-primary"}`;
}

function getTodayLocalDate(): string {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}

export default function OrdenForm({ onCreated }: OrdenFormProps) {
    const [clientes, setClientes] = useState<ClienteResponse[]>([]);
    const [tecnicos, setTecnicos] = useState<TecnicoDisponible[]>([]);
    const [equipos, setEquipos] = useState<EquipoResponse[]>([]);
    const [clientesCargando, setClientesCargando] = useState(true);
    const [tecnicosCargando, setTecnicosCargando] = useState(true);
    const [equiposCargando, setEquiposCargando] = useState(false);
    const [clientesError, setClientesError] = useState(false);
    const [tecnicosError, setTecnicosError] = useState(false);
    const [equiposError, setEquiposError] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CrearOrdenFormInput, undefined, CrearOrdenFormData>({
        resolver: zodResolver(crearOrdenSchema),
        defaultValues: valoresIniciales,
    });

    const clienteIdSeleccionado = useWatch({ control, name: "clienteId" });
    const clienteField = register("clienteId");

    const handleClienteChange = (event: ChangeEvent<HTMLSelectElement>) => {
        void clienteField.onChange(event);
        setValue("equipoId", "");
        setEquipos([]);
        setEquiposError(false);
        setEquiposCargando(Boolean(event.target.value));
    };

    useEffect(() => {
        let isCurrent = true;

        const cargarClientes = async () => {
            setClientesCargando(true);
            setClientesError(false);
            try {
                const data = await clienteService.listarClientes();
                if (isCurrent) {
                    setClientes(data.filter((cliente) => cliente.estadoCuenta));
                }
            } catch (error) {
                if (isCurrent) {
                    setClientesError(true);
                    toast.error(getErrorMessage(error, "No se pudieron cargar los clientes."));
                }
            } finally {
                if (isCurrent) setClientesCargando(false);
            }
        };

        const cargarTecnicos = async () => {
            setTecnicosCargando(true);
            setTecnicosError(false);
            try {
                const data = await empleadoService.listarTecnicos();
                if (isCurrent) setTecnicos(data);
            } catch (error) {
                if (isCurrent) {
                    setTecnicosError(true);
                    toast.error(getErrorMessage(error, "No se pudieron cargar los técnicos."));
                }
            } finally {
                if (isCurrent) setTecnicosCargando(false);
            }
        };

        void cargarClientes();
        void cargarTecnicos();

        return () => {
            isCurrent = false;
        };
    }, []);

    useEffect(() => {
        let isCurrent = true;

        if (!clienteIdSeleccionado) {
            return () => {
                isCurrent = false;
            };
        }

        const cargarEquipos = async () => {
            setEquiposCargando(true);
            try {
                const data = await equipoService.listarEquipos(Number(clienteIdSeleccionado));
                if (isCurrent) setEquipos(data);
            } catch (error) {
                if (isCurrent) {
                    setEquiposError(true);
                    toast.error(getErrorMessage(error, "No se pudieron cargar los equipos del cliente."));
                }
            } finally {
                if (isCurrent) setEquiposCargando(false);
            }
        };

        void cargarEquipos();
        return () => {
            isCurrent = false;
        };
    }, [clienteIdSeleccionado, setValue]);

    const onSubmit = async (data: CrearOrdenFormData) => {
        try {
            const response = await ordenService.crearOrden(data);
            toast.success(`Orden ${response.codigo} creada correctamente.`);
            reset(valoresIniciales);
            setEquipos([]);
            setEquiposCargando(false);
            setEquiposError(false);
            onCreated?.();
        } catch (error) {
            toast.error(getErrorMessage(error, "No se pudo crear la orden."));
        }
    };

    const opcionesCargando = clientesCargando || tecnicosCargando;
    const opcionesConError = clientesError || tecnicosError;

    return (
        <section className="w-full overflow-hidden rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-h1 text-dark">Crear orden de trabajo</h1>
            <p className="mb-6 mt-1 text-footer text-gray-500">
                Selecciona el cliente, su equipo, el técnico responsable y la fecha estimada de entrega.
            </p>

            {opcionesConError && (
                <p className="mb-5 rounded-md bg-red-50 px-4 py-3 text-main text-red-700" role="alert">
                    No se pudieron cargar todas las opciones requeridas. Verifica los permisos y vuelve a intentarlo.
                </p>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <section aria-labelledby="orden-asignacion-title" className="mb-5">
                    <h2 id="orden-asignacion-title" className="mb-3 text-h3 text-primary">
                        Asignación de la orden
                    </h2>
                    <div className="grid gap-x-6 sm:grid-cols-2">
                        <div className="mb-4">
                            <label htmlFor="orden-cliente" className="mb-1 block text-label text-dark">
                                Cliente
                            </label>
                            <select
                                id="orden-cliente"
                                aria-invalid={Boolean(errors.clienteId)}
                                className={getInputClassName(Boolean(errors.clienteId))}
                                disabled={clientesCargando || clientesError || isSubmitting}
                                {...clienteField}
                                onChange={handleClienteChange}
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
                        </div>

                        <div className="mb-4">
                            <label htmlFor="orden-equipo" className="mb-1 block text-label text-dark">
                                Equipo
                            </label>
                            <select
                                id="orden-equipo"
                                aria-invalid={Boolean(errors.equipoId)}
                                className={getInputClassName(Boolean(errors.equipoId))}
                                disabled={
                                    !clienteIdSeleccionado
                                    || equiposCargando
                                    || equiposError
                                    || isSubmitting
                                }
                                {...register("equipoId")}
                            >
                                <option value="">
                                    {!clienteIdSeleccionado
                                        ? "Selecciona primero un cliente"
                                        : equiposCargando
                                            ? "Cargando equipos..."
                                            : equiposError
                                                ? "No se pudieron cargar los equipos"
                                                : "Selecciona un equipo"}
                                </option>
                                {equipos.map((equipo) => (
                                    <option key={equipo.equipoId} value={equipo.equipoId}>
                                        {equipo.tipoEquipo} - {equipo.marca} {equipo.modelo} ({equipo.numeroSerie})
                                    </option>
                                ))}
                            </select>
                            {errors.equipoId && (
                                <span className="mt-1 block text-xs text-red-600" role="alert">
                                    {errors.equipoId.message}
                                </span>
                            )}
                            {equiposError && (
                                <span className="mt-1 block text-xs text-red-600" role="alert">
                                    No se pudieron cargar los equipos de este cliente.
                                </span>
                            )}
                            {!equiposCargando && clienteIdSeleccionado && !equiposError && equipos.length === 0 && (
                                <span className="mt-1 block text-xs text-gray-500">
                                    Este cliente no tiene equipos registrados.
                                </span>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="orden-tecnico" className="mb-1 block text-label text-dark">
                                Técnico asignado
                            </label>
                            <select
                                id="orden-tecnico"
                                aria-invalid={Boolean(errors.tecnicoId)}
                                className={getInputClassName(Boolean(errors.tecnicoId))}
                                disabled={tecnicosCargando || tecnicosError || isSubmitting}
                                {...register("tecnicoId")}
                            >
                                <option value="">
                                    {tecnicosCargando ? "Cargando técnicos..." : "Selecciona un técnico"}
                                </option>
                                {tecnicos.map((tecnico) => (
                                    <option key={tecnico.empleadoId} value={tecnico.empleadoId}>
                                        {tecnico.nombres} {tecnico.apellidos}
                                    </option>
                                ))}
                            </select>
                            {errors.tecnicoId && (
                                <span className="mt-1 block text-xs text-red-600" role="alert">
                                    {errors.tecnicoId.message}
                                </span>
                            )}
                            {!tecnicosCargando && !tecnicosError && tecnicos.length === 0 && (
                                <span className="mt-1 block text-xs text-gray-500">
                                    No hay técnicos activos disponibles.
                                </span>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="orden-fecha-estimada" className="mb-1 block text-label text-dark">
                                Fecha estimada de entrega
                            </label>
                            <input
                                id="orden-fecha-estimada"
                                type="date"
                                min={getTodayLocalDate()}
                                aria-invalid={Boolean(errors.fechaEstimadaEntrega)}
                                className={getInputClassName(Boolean(errors.fechaEstimadaEntrega))}
                                disabled={isSubmitting}
                                {...register("fechaEstimadaEntrega")}
                            />
                            {errors.fechaEstimadaEntrega && (
                                <span className="mt-1 block text-xs text-red-600" role="alert">
                                    {errors.fechaEstimadaEntrega.message}
                                </span>
                            )}
                        </div>
                    </div>
                </section>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() => reset(valoresIniciales)}
                        disabled={isSubmitting || opcionesCargando}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-main font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                        Limpiar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || opcionesCargando || opcionesConError}
                        className="w-full rounded-lg bg-primary px-4 py-2.5 text-main font-medium text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
                    >
                        {isSubmitting ? "Creando orden..." : "Crear orden"}
                    </button>
                </div>
            </form>
        </section>
    );
}