import { useEffect, useState, type KeyboardEvent } from "react";
import { isAxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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
    "w-full rounded-md border px-3 py-2 text-main focus:outline-none focus:ring-1";

const getInputClassName = (hasError: boolean) =>
    `${inputClassName} ${hasError
        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:border-primary focus:ring-primary"}`;

function normalizarTexto(valor: string): string {
    return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

export default function EquipoForm({ onCreated }: EquipoFormProps) {
    const [clientes, setClientes] = useState<ClienteResponse[]>([]);
    const [clientesCargando, setClientesCargando] = useState(true);
    const [clienteBusqueda, setClienteBusqueda] = useState("");
    const [listaClientesAbierta, setListaClientesAbierta] = useState(false);
    const [clienteActivoIndex, setClienteActivoIndex] = useState(0);
    const [fileInputKey, setFileInputKey] = useState(0);
    const [fotoNombre, setFotoNombre] = useState("");

    const {
        control,
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
    const clienteIdSeleccionado = useWatch({ control, name: "clienteId" });
    const clientesFiltrados = clienteBusqueda.trim()
        ? clientes.filter((cliente) => {
            const busqueda = normalizarTexto(clienteBusqueda.trim());
            const datosCliente = normalizarTexto(
                `${cliente.nombres} ${cliente.apellidos} ${cliente.identificacion}`,
            );
            return datosCliente.includes(busqueda);
        }).slice(0, 8)
        : [];
    const clienteSeleccionado = clientes.find(
        (cliente) => String(cliente.clienteId) === clienteIdSeleccionado,
    );
    const valorBusquedaCliente = clienteBusqueda || (
        clienteSeleccionado
            ? `${clienteSeleccionado.nombres} ${clienteSeleccionado.apellidos} - ${clienteSeleccionado.identificacion}`
            : ""
    );

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

    const procesarFotografia = (file?: File) => {
        if (!file) return;
        setFotoNombre("");

        if (!["image/jpeg", "image/png"].includes(file.type)) {
            setValue("fotografiaInicial", "", { shouldDirty: true });
            setError("fotografiaInicial", {
                type: "validate",
                message: "La fotografía debe estar en formato JPG o PNG",
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setValue("fotografiaInicial", reader.result, {
                    shouldDirty: true,
                    shouldValidate: true,
                });
                setFotoNombre(file.name);
            } else {
                setValue("fotografiaInicial", "", { shouldDirty: true });
                setError("fotografiaInicial", {
                    type: "validate",
                    message: "No se pudo leer la fotografía. Inténtalo nuevamente.",
                });
            }
        };
        reader.onerror = () => {
            setValue("fotografiaInicial", "", { shouldDirty: true });
            setError("fotografiaInicial", {
                type: "validate",
                message: "No se pudo leer la fotografía. Inténtalo nuevamente.",
            });
        };
        reader.readAsDataURL(file);
    };

    const onPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        procesarFotografia(event.target.files?.[0]);
    };

    const seleccionarCliente = (cliente: ClienteResponse) => {
        const etiqueta = `${cliente.nombres} ${cliente.apellidos} - ${cliente.identificacion}`;
        setClienteBusqueda(etiqueta);
        setValue("clienteId", String(cliente.clienteId), {
            shouldDirty: true,
            shouldValidate: true,
        });
        setListaClientesAbierta(false);
    };

    const manejarTeclasCliente = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape") {
            setListaClientesAbierta(false);
            return;
        }

        if (event.key === "ArrowDown" && clientesFiltrados.length > 0) {
            event.preventDefault();
            setClienteActivoIndex((index) =>
                listaClientesAbierta ? Math.min(index + 1, clientesFiltrados.length - 1) : 0,
            );
            setListaClientesAbierta(true);
        } else if (event.key === "ArrowUp" && clientesFiltrados.length > 0) {
            event.preventDefault();
            setClienteActivoIndex((index) =>
                listaClientesAbierta ? Math.max(index - 1, 0) : clientesFiltrados.length - 1,
            );
            setListaClientesAbierta(true);
        } else if (event.key === "Enter" && listaClientesAbierta && clientesFiltrados[clienteActivoIndex]) {
            event.preventDefault();
            seleccionarCliente(clientesFiltrados[clienteActivoIndex]);
        }
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
            setClienteBusqueda("");
            setListaClientesAbierta(false);
            setFileInputKey((key) => key + 1);
            setFotoNombre("");
            onCreated?.();
        } catch (error) {
            toast.error(getErrorMessage(error, "No se pudo registrar el equipo."));
        }
    };

    const cancelarFormulario = () => {
        reset();
        setClienteBusqueda("");
        setListaClientesAbierta(false);
        setClienteActivoIndex(0);
        setFileInputKey((key) => key + 1);
        setFotoNombre("");
    };

    return (
        <section className="w-full overflow-hidden rounded-xl bg-white p-4 shadow-sm sm:p-6">
            <h1 className="text-h1 text-dark">Registrar equipo</h1>
            <p className="mb-4 mt-1 text-footer text-gray-500">
                Completa la información del equipo recibido y su estado inicial.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <section aria-labelledby="equipo-section-title" className="mb-4 rounded-lg border border-gray-200 p-3 sm:p-4">
                    <h2 id="equipo-section-title" className="mb-3 text-h3 text-primary">Equipo</h2>
                    <div className="grid gap-x-6 sm:grid-cols-2">
                    <div className="mb-3">
                        <label htmlFor="equipo-cliente" className="mb-1 block text-label text-dark">
                            Cliente propietario
                        </label>
                        <input
                            type="hidden"
                            {...register("clienteId")}
                        />
                        <input
                            id="equipo-cliente"
                            type="search"
                            role="combobox"
                            aria-haspopup="listbox"
                            aria-autocomplete="list"
                            aria-controls="equipo-clientes-opciones"
                            aria-expanded={listaClientesAbierta && clientesFiltrados.length > 0}
                            aria-activedescendant={
                                listaClientesAbierta && clientesFiltrados[clienteActivoIndex]
                                    ? `equipo-cliente-opcion-${clientesFiltrados[clienteActivoIndex].clienteId}`
                                    : undefined
                            }
                            aria-invalid={Boolean(errors.clienteId)}
                            autoComplete="off"
                            value={valorBusquedaCliente}
                            onChange={(event) => {
                                setClienteBusqueda(event.target.value);
                                setValue("clienteId", "", {
                                    shouldDirty: true,
                                });
                                setClienteActivoIndex(0);
                                setListaClientesAbierta(true);
                            }}
                            onFocus={() => setListaClientesAbierta(clienteBusqueda.trim().length > 0)}
                            onBlur={() => setListaClientesAbierta(false)}
                            onKeyDown={manejarTeclasCliente}
                            disabled={clientesCargando || clientes.length === 0}
                            placeholder={clientesCargando ? "Cargando clientes..." : "Buscar por nombre o identificación"}
                            className={`${getInputClassName(Boolean(errors.clienteId))} bg-white disabled:bg-gray-100`}
                        />
                        {listaClientesAbierta && clientesFiltrados.length > 0 && (
                            <ul
                                id="equipo-clientes-opciones"
                                role="listbox"
                                className="relative z-10 mt-1 max-h-56 overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                            >
                                {clientesFiltrados.map((cliente, index) => (
                                    <li
                                        id={`equipo-cliente-opcion-${cliente.clienteId}`}
                                        key={cliente.clienteId}
                                        role="option"
                                        aria-selected={index === clienteActivoIndex}
                                        onMouseDown={(event) => event.preventDefault()}
                                        onMouseEnter={() => setClienteActivoIndex(index)}
                                        onClick={() => seleccionarCliente(cliente)}
                                        className={`cursor-pointer px-3 py-2 text-main hover:bg-blue-50 ${
                                            index === clienteActivoIndex ? "bg-blue-50" : ""
                                        }`}
                                    >
                                        <span className="block font-medium text-dark">
                                            {cliente.nombres} {cliente.apellidos}
                                        </span>
                                        <span className="block text-sm text-gray-500">
                                            Identificación: {cliente.identificacion}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {listaClientesAbierta && clienteBusqueda.trim() && clientesFiltrados.length === 0 && (
                            <p role="status" className="mt-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
                                No se encontraron clientes con ese nombre o identificación.
                            </p>
                        )}
                        {errors.clienteId && (
                            <span className="mt-1 block text-xs text-red-600" role="alert">
                                {errors.clienteId.message}
                            </span>
                        )}
                        {!clientesCargando && clientes.length === 0 && (
                            <span className="mt-1 block text-xs text-gray-500">
                                No hay clientes disponibles para asociar un equipo.
                            </span>
                        )}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="equipo-tipo" className="mb-1 block text-label text-dark">
                            Tipo de equipo
                        </label>
                        <select
                            id="equipo-tipo"
                            aria-invalid={Boolean(errors.tipoEquipo)}
                            className={`${getInputClassName(Boolean(errors.tipoEquipo))} bg-white`}
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
                        <div className="mb-3" key={name}>
                            <label htmlFor={`equipo-${name}`} className="mb-1 block text-label text-dark">
                                {label}
                            </label>
                            <input
                                id={`equipo-${name}`}
                                type="text"
                                aria-invalid={Boolean(errors[name])}
                                placeholder={
                                    name === "marca" ? "Marca del fabricante"
                                        : name === "modelo" ? "Modelo del equipo"
                                            : name === "numeroSerie" ? "Número de serie del equipo"
                                                : "Color del equipo"
                                }
                                className={getInputClassName(Boolean(errors[name]))}
                                {...register(name)}
                            />
                            {errors[name] && (
                                <span className="mt-1 block text-xs text-red-600" role="alert">
                                    {errors[name]?.message}
                                </span>
                            )}
                        </div>
                    ))}

                    </div>
                </section>

                <section aria-labelledby="estado-inicial-section-title" className="mb-4 rounded-lg border border-gray-200 p-3 sm:p-4">
                    <h2 id="estado-inicial-section-title" className="mb-3 text-h3 text-primary">Estado inicial</h2>
                    <div className="grid gap-x-6 sm:grid-cols-2">
                    <div className="mb-3">
                        <label htmlFor="equipo-accesorios" className="mb-1 block text-label text-dark">
                            Accesorios
                        </label>
                        <textarea
                            id="equipo-accesorios"
                            rows={2}
                            aria-invalid={Boolean(errors.accesorios)}
                            placeholder="Accesorios que acompañan al equipo"
                            className={getInputClassName(Boolean(errors.accesorios))}
                            {...register("accesorios")}
                        />
                        {errors.accesorios && (
                            <span className="mt-1 block text-xs text-red-600" role="alert">
                                {errors.accesorios.message}
                            </span>
                        )}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="equipo-falla" className="mb-1 block text-label text-dark">
                            Falla reportada
                        </label>
                        <textarea
                            id="equipo-falla"
                            rows={2}
                            aria-invalid={Boolean(errors.fallaReportada)}
                            placeholder="Describe el problema indicado por el cliente."
                            className={getInputClassName(Boolean(errors.fallaReportada))}
                            {...register("fallaReportada")}
                        />
                        {errors.fallaReportada && (
                            <span className="mt-1 block text-xs text-red-600" role="alert">
                                {errors.fallaReportada.message}
                            </span>
                        )}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="equipo-estado-fisico" className="mb-1 block text-label text-dark">
                            Estado físico inicial
                        </label>
                        <textarea
                            id="equipo-estado-fisico"
                            rows={2}
                            aria-invalid={Boolean(errors.estadoFisicoInicial)}
                            placeholder="Describe rayones, golpes o daños visibles."
                            className={getInputClassName(Boolean(errors.estadoFisicoInicial))}
                            {...register("estadoFisicoInicial")}
                        />
                        {errors.estadoFisicoInicial && (
                            <span className="mt-1 block text-xs text-red-600" role="alert">
                                {errors.estadoFisicoInicial.message}
                            </span>
                        )}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="equipo-foto" className="mb-1 block text-label text-dark">
                            Fotografía inicial
                        </label>
                        <label
                            htmlFor="equipo-foto"
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                                event.preventDefault();
                                procesarFotografia(event.dataTransfer.files[0]);
                            }}
                            className={`relative flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-blue-50/60 px-3 py-3 text-center transition-colors focus-within:ring-1 ${
                                errors.fotografiaInicial
                                    ? "border-red-500 focus-within:ring-red-500"
                                    : "border-primary/40 hover:border-primary focus-within:border-primary focus-within:ring-primary"
                            }`}
                        >
                            <input
                                key={fileInputKey}
                                id="equipo-foto"
                                type="file"
                                accept="image/jpeg,image/png"
                                aria-invalid={Boolean(errors.fotografiaInicial)}
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                onChange={onPhotoChange}
                            />
                            <span className="text-sm text-gray-700">
                                {fotoNombre || "Arrastra una fotografía aquí"}
                            </span>
                            <span className="mt-1 text-xs text-gray-500">JPG o PNG</span>
                            <span className="mt-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-primary">
                                Seleccionar fotografía
                            </span>
                            {!fotoNombre && <span className="mt-1 text-xs text-gray-500">No se ha seleccionado ningún archivo.</span>}
                        </label>
                        {errors.fotografiaInicial && (
                            <span className="mt-1 block text-xs text-red-600" role="alert">
                                {errors.fotografiaInicial.message}
                            </span>
                        )}
                    </div>

                    </div>
                </section>

                <section aria-labelledby="observaciones-section-title" className="mb-4 rounded-lg border border-gray-200 p-3 sm:p-4">
                    <h2 id="observaciones-section-title" className="mb-3 text-h3 text-primary">Observaciones</h2>
                    <label htmlFor="equipo-observaciones" className="mb-1 block text-label text-dark">
                        Observaciones (opcional)
                    </label>
                    <textarea
                        id="equipo-observaciones"
                        rows={2}
                        placeholder="Escribe aquí la información adicional que consideres importante."
                        className={getInputClassName(false)}
                        {...register("observaciones")}
                    />
                </section>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={cancelarFormulario}
                        disabled={isSubmitting}
                        className="mr-3 rounded-lg border border-gray-300 px-4 py-2.5 text-main font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || clientesCargando || clientes.length === 0}
                        className="w-full rounded-lg bg-primary px-4 py-2.5 text-main font-medium text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
                    >
                        {isSubmitting ? "Guardando..." : "Registrar equipo"}
                    </button>
                </div>
            </form>
        </section>
    );
}