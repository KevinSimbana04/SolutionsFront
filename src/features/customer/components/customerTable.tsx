import axios from "axios";
import { useEffect, useState, type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LuEye, LuPencil, LuUserX, LuX } from "react-icons/lu";
import { toast } from "react-toastify";
import { clienteService } from "../api/customer.service";
import { clienteSchema, type ClienteFormData } from "../schema/customer.schema";
import type { ClienteResponse } from "../types";

interface ClienteTableProps {
    refreshKey?: number;
}

type ModalState =
    | { type: "view"; cliente: ClienteResponse }
    | { type: "edit"; cliente: ClienteResponse }
    | { type: "deactivate"; cliente: ClienteResponse }
    | null;

const camposEditables = [
    { name: "identificacion", label: "Identificación", type: "text" },
    { name: "nombres", label: "Nombres", type: "text" },
    { name: "apellidos", label: "Apellidos", type: "text" },
    { name: "telefono", label: "Teléfono", type: "tel" },
    { name: "correo", label: "Correo electrónico", type: "email" },
    { name: "direccion", label: "Dirección", type: "text" },
] as const;

const camposPersonales = camposEditables.filter(({ name }) =>
    name === "identificacion" || name === "nombres" || name === "apellidos",
);
const camposContacto = camposEditables.filter(({ name }) =>
    name === "telefono" || name === "correo" || name === "direccion",
);
const seccionesCampos = [
    { title: "Datos personales", fields: camposPersonales },
    { title: "Contacto y permisos", fields: camposContacto },
];

function getErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError<{ mensaje?: string }>(error) && error.response?.data?.mensaje) {
        return error.response.data.mensaje;
    }
    return fallback;
}

export default function ClienteTable({ refreshKey = 0 }: ClienteTableProps) {
    const [clientes, setClientes] = useState<ClienteResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [buscar, setBuscar] = useState("");
    const [modal, setModal] = useState<ModalState>(null);
    const [motivo, setMotivo] = useState("");
    const [isDeactivating, setIsDeactivating] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ClienteFormData>({
        resolver: zodResolver(clienteSchema),
    });

    useEffect(() => {
        let isCurrent = true;

        const cargarClientes = async () => {
            setIsLoading(true);
            setLoadError(false);
            try {
                const data = await clienteService.listarClientes(buscar);
                if (isCurrent) setClientes(data);
            } catch (error) {
                if (isCurrent) {
                    setLoadError(true);
                    toast.error(getErrorMessage(error, "No se pudieron cargar los clientes."));
                }
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        };

        void cargarClientes();
        return () => {
            isCurrent = false;
        };
    }, [buscar, refreshKey]);

    const buscarClientes = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setBuscar(searchInput.trim());
    };

    const abrirVista = async (cliente: ClienteResponse) => {
        try {
            const detalle = await clienteService.obtenerClientePorId(cliente.clienteId);
            setModal({ type: "view", cliente: detalle });
        } catch (error) {
            toast.error(getErrorMessage(error, "No se pudieron cargar los datos del cliente."));
        }
    };

    const abrirEdicion = (cliente: ClienteResponse) => {
        if (!cliente.estadoCuenta) return;

        reset({
            identificacion: cliente.identificacion,
            nombres: cliente.nombres,
            apellidos: cliente.apellidos,
            telefono: cliente.telefono,
            correo: cliente.correo,
            direccion: cliente.direccion,
        });
        setModal({ type: "edit", cliente });
    };

    const guardarCambios = async (data: ClienteFormData) => {
        if (modal?.type !== "edit") return;
        if (!modal.cliente.estadoCuenta) {
            toast.error("No se puede editar una cuenta inactiva.");
            return;
        }

        try {
            const response = await clienteService.actualizarCliente(modal.cliente.clienteId, data);
            setClientes((actuales) =>
                actuales.flatMap((cliente) => {
                    if (cliente.clienteId !== response.clienteId) return [cliente];

                    const filtro = buscar.toLowerCase();
                    const coincide =
                        !buscar ||
                        response.identificacion.includes(buscar) ||
                        response.nombres.toLowerCase().includes(filtro) ||
                        response.apellidos.toLowerCase().includes(filtro);

                    return coincide ? [response] : [];
                }),
            );
            toast.success(response.mensaje || "Cliente actualizado correctamente.");
            setModal(null);
        } catch (error) {
            toast.error(getErrorMessage(error, "No se pudo actualizar el cliente."));
        }
    };

    const desactivarCliente = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (modal?.type !== "deactivate") return;
        if (!motivo.trim()) {
            toast.error("Escribe el motivo para desactivar la cuenta.");
            return;
        }

        setIsDeactivating(true);
        try {
            const response = await clienteService.desactivarCliente(
                modal.cliente.clienteId,
                motivo.trim(),
            );
            toast.success(response.mensaje || "Cuenta desactivada correctamente.");
            setClientes((actuales) =>
                actuales.map((cliente) =>
                    cliente.clienteId === modal.cliente.clienteId
                        ? { ...cliente, estadoCuenta: false, motivo: motivo.trim() }
                        : cliente,
                ),
            );
            setModal(null);
            setMotivo("");
        } catch (error) {
            toast.error(getErrorMessage(error, "No se pudo desactivar el cliente."));
        } finally {
            setIsDeactivating(false);
        }
    };

    const cerrarModal = () => {
        setModal(null);
        setMotivo("");
    };

    return (
        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-5">
                <div>
                    <h2 className="text-h2 text-dark">Clientes registrados</h2>
                    <p className="mt-1 text-footer text-gray-500">
                        Consulta y administra las cuentas de cliente.
                    </p>
                </div>
            </div>

            <form onSubmit={buscarClientes} className="flex flex-wrap gap-3 border-b border-gray-100 px-6 py-4">
                <label htmlFor="buscar-cliente" className="sr-only">Buscar por nombre o identificación</label>
                <input
                    id="buscar-cliente"
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Buscar por nombre o identificación"
                    className="min-w-[220px] max-w-xl flex-1 rounded-md border border-gray-300 px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                    type="submit"
                    className="rounded-lg border border-gray-300 px-4 py-2 text-main text-gray-700 hover:bg-gray-50"
                >
                    Buscar
                </button>
            </form>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                    <thead className="bg-gray-50 text-table uppercase text-gray-500">
                        <tr>
                            <th className="px-6 py-3">Nombre y apellido</th>
                            <th className="px-6 py-3">Usuario</th>
                            <th className="px-6 py-3">Estado de cuenta</th>
                            <th className="px-6 py-3 text-right">Opciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-main">
                        {isLoading ? (
                            <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">Cargando clientes...</td></tr>
                        ) : loadError ? (
                            <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">No se pudo cargar la lista. Usa «Actualizar» para intentarlo de nuevo.</td></tr>
                        ) : clientes.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">No se encontraron clientes.</td></tr>
                        ) : (
                            clientes.map((cliente) => (
                                <tr key={cliente.clienteId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-dark">
                                        {cliente.nombres} {cliente.apellidos}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{cliente.nombreUsuario}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                            cliente.estadoCuenta ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                        }`}>
                                            {cliente.estadoCuenta ? "Activa" : "Inactiva"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => void abrirVista(cliente)}
                                                title="Ver cliente"
                                                aria-label={`Ver a ${cliente.nombres} ${cliente.apellidos}`}
                                                className="rounded-md p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                            >
                                                <LuEye className="h-4 w-4" />
                                            </button>
                                            {cliente.estadoCuenta && (
                                                <button
                                                    type="button"
                                                    onClick={() => abrirEdicion(cliente)}
                                                    title="Editar cliente"
                                                    aria-label={`Editar a ${cliente.nombres} ${cliente.apellidos}`}
                                                    className="rounded-md p-2 text-gray-600 hover:bg-amber-50 hover:text-amber-700"
                                                >
                                                    <LuPencil className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMotivo("");
                                                    setModal({ type: "deactivate", cliente });
                                                }}
                                                title={cliente.estadoCuenta ? "Desactivar cliente" : "Cuenta inactiva"}
                                                aria-label={`Desactivar a ${cliente.nombres} ${cliente.apellidos}`}
                                                disabled={!cliente.estadoCuenta}
                                                className="rounded-md p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <LuUserX className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cliente-modal-title"
                        className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl"
                    >
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <div>
                                <h3 id="cliente-modal-title" className="text-h2 text-dark">
                                    {modal.type === "view" ? "Datos del cliente" : modal.type === "edit" ? "Editar cliente" : "Desactivar cuenta"}
                                </h3>
                                {modal.type === "view" && (
                                    <p className="mt-1 text-footer text-secondary">Consulta la información y el estado de la cuenta.</p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={cerrarModal}
                                aria-label="Cerrar"
                                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-dark"
                            >
                                <LuX className="h-5 w-5" />
                            </button>
                        </div>

                        {modal.type === "view" && (
                            !modal.cliente.estadoCuenta ? (
                                <div className="px-6 py-5">
                                    <section className="rounded-xl bg-slate-50 px-5 py-4">
                                        <h4 className="mb-3 text-h3 text-secondary">Cuenta inactiva</h4>
                                        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                                            {[
                                                ["Nombre", modal.cliente.nombres],
                                                ["Apellido", modal.cliente.apellidos],
                                                ["Usuario", modal.cliente.nombreUsuario],
                                                ["Motivo", modal.cliente.motivo],
                                            ].map(([label, value]) => (
                                                <div key={label}>
                                                    <dt className="text-label text-secondary">{label}</dt>
                                                    <dd className="mt-1 break-words text-main text-dark">{value || "No disponible"}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </section>
                                </div>
                            ) : (
                            <div className="space-y-5 px-6 py-5">
                                <section className="rounded-xl bg-slate-50 px-5 py-4">
                                    <h4 className="mb-3 text-h3 text-secondary">Datos personales</h4>
                                    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                                        {[
                                            ["Nombre", modal.cliente.nombres],
                                            ["Apellido", modal.cliente.apellidos],
                                            ["Identificación", modal.cliente.identificacion],
                                        ].map(([label, value]) => (
                                            <div key={label}>
                                                <dt className="text-label text-secondary">{label}</dt>
                                                <dd className="mt-1 break-words text-main text-dark">{value || "No disponible"}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </section>
                                <section className="rounded-xl bg-slate-50 px-5 py-4">
                                    <h4 className="mb-3 text-h3 text-secondary">Contacto</h4>
                                    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                                        {[
                                            ["Teléfono", modal.cliente.telefono],
                                            ["Correo electrónico", modal.cliente.correo],
                                            ["Dirección", modal.cliente.direccion],
                                        ].map(([label, value]) => (
                                            <div key={label}>
                                                <dt className="text-label text-secondary">{label}</dt>
                                                <dd className="mt-1 break-words text-main text-dark">{value || "No disponible"}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </section>
                                <section className="rounded-xl bg-slate-50 px-5 py-4">
                                    <h4 className="mb-3 text-h3 text-secondary">Cuenta</h4>
                                    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                                        {[
                                            ["Usuario", modal.cliente.nombreUsuario],
                                            ["Rol", modal.cliente.rol],
                                            ["Cuenta bloqueada", modal.cliente.bloqueado ? "Sí" : "No"],
                                            ["Fecha de registro", modal.cliente.fechaCreacion ? new Date(modal.cliente.fechaCreacion).toLocaleDateString() : "No disponible"],
                                        ].map(([label, value]) => (
                                            <div key={label}>
                                                <dt className="text-label text-secondary">{label}</dt>
                                                <dd className="mt-1 break-words text-main text-dark">{value || "No disponible"}</dd>
                                            </div>
                                        ))}
                                        <div>
                                            <dt className="text-label text-secondary">Estado</dt>
                                            <dd className="mt-1">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                    modal.cliente.estadoCuenta ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"
                                                }`}>
                                                    {modal.cliente.estadoCuenta ? "Activa" : "Inactiva"}
                                                </span>
                                            </dd>
                                        </div>
                                    </dl>
                                </section>
                            </div>
                            )
                        )}

                        {modal.type === "edit" && (
                            <form onSubmit={handleSubmit(guardarCambios)} noValidate className="px-6 py-5">
                                {seccionesCampos.map(({ title, fields }) => (
                                    <section className="mb-5" key={title}>
                                        <h4 className="mb-3 text-sm font-semibold text-dark">{title}</h4>
                                        <div className="grid gap-x-5 sm:grid-cols-2">
                                            {fields.map(({ name, label, type }) => {
                                                return (
                                                    <div className="mb-4" key={name}>
                                                        <label htmlFor={`editar-cliente-${name}`} className="mb-1 block text-label text-dark">{label}</label>
                                                        <input
                                                            id={`editar-cliente-${name}`}
                                                            type={type}
                                                            aria-invalid={Boolean(errors[name])}
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                                            {...register(name)}
                                                        />
                                                        {errors[name] && (
                                                            <span className="mt-1 block text-xs text-red-600" role="alert">
                                                                {errors[name]?.message}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                ))}
                                <div className="mt-3 flex justify-end gap-3">
                                    <button type="button" onClick={cerrarModal} className="rounded-lg border border-gray-300 px-4 py-2 text-main text-gray-700 hover:bg-gray-50">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-main font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-400">
                                        {isSubmitting ? "Guardando..." : "Guardar cambios"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {modal.type === "deactivate" && (
                            <form onSubmit={desactivarCliente} className="px-6 py-5">
                                <p className="mb-4 text-main text-gray-600">
                                    Indica por qué se desactivará la cuenta de {modal.cliente.nombres} {modal.cliente.apellidos}.
                                </p>
                                <label htmlFor="motivo-desactivacion-cliente" className="mb-1 block text-label text-dark">
                                    Motivo
                                </label>
                                <textarea
                                    id="motivo-desactivacion-cliente"
                                    value={motivo}
                                    onChange={(event) => setMotivo(event.target.value)}
                                    rows={3}
                                    required
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <div className="mt-4 flex justify-end gap-3">
                                    <button type="button" onClick={cerrarModal} className="rounded-lg border border-gray-300 px-4 py-2 text-main text-gray-700 hover:bg-gray-50">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={isDeactivating} className="rounded-lg bg-red-600 px-4 py-2 text-main font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400">
                                        {isDeactivating ? "Desactivando..." : "Desactivar cuenta"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                </div>
            )}
        </section>
    );
}