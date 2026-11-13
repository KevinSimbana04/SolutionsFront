import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { LuEye, LuX } from "react-icons/lu";
import { toast } from "react-toastify";

import { equipoService } from "../api/equipment.service";
import type { EquipoResponse } from "../types";


import { clienteService } from "@/features/customer/api/customer.service";
import type { ClienteResponse } from "@/features/customer/types";

interface EquipoTableProps {
    refreshKey?: number;
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (isAxiosError<{ mensaje?: string }>(error) && error.response?.data?.mensaje) {
        return error.response.data.mensaje;
    }
    return fallback;
}

export default function EquipoTable({ refreshKey = 0 }: EquipoTableProps) {
    const [equipos, setEquipos] = useState<EquipoResponse[]>([]);
    const [clientes, setClientes] = useState<ClienteResponse[]>([]);
    const [clienteId, setClienteId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [selectedEquipo, setSelectedEquipo] = useState<EquipoResponse | null>(null);

    useEffect(() => {
        let isCurrent = true;
        const cargarClientes = async () => {
            try {
                const data = await clienteService.listarClientes();
                if (isCurrent) setClientes(data);
            } catch (error) {
                if (isCurrent) {
                    toast.error(getErrorMessage(error, "No se pudieron cargar los clientes para el filtro."));
                }
            }
        };
        void cargarClientes();
        return () => {
            isCurrent = false;
        };
    }, []);

    useEffect(() => {
        let isCurrent = true;
        const cargarEquipos = async () => {
            setIsLoading(true);
            setLoadError(false);
            try {
                const data = await equipoService.listarEquipos(
                    clienteId ? Number(clienteId) : undefined,
                );
                if (isCurrent) setEquipos(data);
            } catch (error) {
                if (isCurrent) {
                    setLoadError(true);
                    toast.error(getErrorMessage(error, "No se pudieron cargar los equipos."));
                }
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        };
        void cargarEquipos();
        return () => {
            isCurrent = false;
        };
    }, [clienteId, refreshKey]);

    return (
        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-5">
                <div>
                    <h2 className="text-h2 text-dark">Equipos registrados</h2>
                    <p className="mt-1 text-footer text-gray-500">
                        Consulta los equipos recibidos y sus datos iniciales.
                    </p>
                </div>
            </div>

            <div className="border-b border-gray-100 px-6 py-4">
                <label htmlFor="filtrar-equipos-cliente" className="mb-1 block text-label text-dark">
                    Filtrar por cliente
                </label>
                <select
                    id="filtrar-equipos-cliente"
                    value={clienteId}
                    onChange={(event) => setClienteId(event.target.value)}
                    className="w-full max-w-lg rounded-md border border-gray-300 bg-white px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="">Todos los clientes</option>
                    {clientes.map((cliente) => (
                        <option key={cliente.clienteId} value={cliente.clienteId.toString()}>
                            {cliente.nombres} {cliente.apellidos} - {cliente.identificacion}
                        </option>
                    ))}
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                    <thead className="bg-gray-50 text-table uppercase text-gray-500">
                        <tr>
                            <th className="px-6 py-3">Cliente</th>
                            <th className="px-6 py-3">Tipo</th>
                            <th className="px-6 py-3">Marca / modelo</th>
                            <th className="px-6 py-3">Número de serie</th>
                            <th className="px-6 py-3 text-right">Detalle</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-main">
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Cargando equipos...</td></tr>
                        ) : loadError ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">No se pudo cargar la lista. Usa "Actualizar" para intentarlo de nuevo.</td></tr>
                        ) : equipos.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">No se encontraron equipos.</td></tr>
                        ) : (
                            equipos.map((equipo) => (
                                <tr key={equipo.equipoId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-dark">{equipo.nombreCliente}</div>
                                        <div className="text-sm text-gray-500">{equipo.cedulaCliente}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{equipo.tipoEquipo.replaceAll("_", " ")}</td>
                                    <td className="px-6 py-4 text-gray-600">{equipo.marca} {equipo.modelo}</td>
                                    <td className="px-6 py-4 text-gray-600">{equipo.numeroSerie}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedEquipo(equipo)}
                                                title="Ver detalle del equipo"
                                                aria-label={`Ver detalle del equipo ${equipo.numeroSerie}`}
                                                className="rounded-md p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                                            >
                                                <LuEye className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedEquipo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="equipo-modal-title"
                        className="my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl"
                    >
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h3 id="equipo-modal-title" className="text-h2 text-dark">Detalle del equipo</h3>
                            <button
                                type="button"
                                onClick={() => setSelectedEquipo(null)}
                                aria-label="Cerrar"
                                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-dark cursor-pointer transition-colors"
                            >
                                <LuX className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
                            {[
                                ["Cliente", selectedEquipo.nombreCliente],
                                ["Identificación del cliente", selectedEquipo.cedulaCliente],
                                ["Tipo de equipo", selectedEquipo.tipoEquipo.replaceAll("_", " ")],
                                ["Marca", selectedEquipo.marca],
                                ["Modelo", selectedEquipo.modelo],
                                ["Número de serie", selectedEquipo.numeroSerie],
                                ["Color", selectedEquipo.color],
                                ["Accesorios", selectedEquipo.accesorios],
                                ["Estado físico inicial", selectedEquipo.estadoFisicoInicial],
                                ["Falla reportada", selectedEquipo.fallaReportada],
                                ["Observaciones", selectedEquipo.observaciones || "Sin observaciones"],
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <dt className="text-label text-gray-500">{label}</dt>
                                    <dd className="mt-1 whitespace-pre-wrap break-words text-main text-dark">{value}</dd>
                                </div>
                            ))}

                            {selectedEquipo.fotografiaInicial && (
                                <div className="sm:col-span-2">
                                    <dt className="text-label text-gray-500">Fotografía inicial</dt>
                                    <dd className="mt-2">
                                        <img
                                            src={selectedEquipo.fotografiaInicial}
                                            alt={`Estado inicial de ${selectedEquipo.tipoEquipo} ${selectedEquipo.marca} ${selectedEquipo.modelo}`}
                                            className="max-h-96 max-w-full rounded-lg border border-gray-200 object-contain"
                                        />
                                    </dd>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}
        </section>
    );
}