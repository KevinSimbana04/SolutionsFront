import { useEffect, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { LuEye, LuX } from "react-icons/lu";
import { toast } from "react-toastify";

import { equipoService } from "../api/equipment.service";
import type { EquipoResponse } from "../types";

interface EquipoTableProps {
    refreshKey?: number;
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (isAxiosError<{ mensaje?: string }>(error) && error.response?.data?.mensaje) {
        return error.response.data.mensaje;
    }
    return fallback;
}

function normalizarBusqueda(valor: string): string {
    return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

export default function EquipoTable({ refreshKey = 0 }: EquipoTableProps) {
    const [equipos, setEquipos] = useState<EquipoResponse[]>([]);
    const [busquedaCliente, setBusquedaCliente] = useState("");
    const [filtroCliente, setFiltroCliente] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [selectedEquipo, setSelectedEquipo] = useState<EquipoResponse | null>(null);

    useEffect(() => {
        let isCurrent = true;
        const cargarEquipos = async () => {
            setIsLoading(true);
            setLoadError(false);
            try {
                const data = await equipoService.listarEquipos();
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
    }, [refreshKey]);

    const buscarEquiposPorCliente = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFiltroCliente(busquedaCliente.trim());
    };

    const equiposFiltrados = filtroCliente
        ? equipos.filter((equipo) =>
            normalizarBusqueda(`${equipo.nombreCliente} ${equipo.cedulaCliente}`)
                .includes(normalizarBusqueda(filtroCliente)),
        )
        : equipos;

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

            <form
                onSubmit={buscarEquiposPorCliente}
                className="flex flex-wrap gap-3 border-b border-gray-100 px-6 py-4"
            >
                <label htmlFor="buscar-equipo-cliente" className="sr-only">
                    Buscar equipos por nombre o identificación del cliente
                </label>
                <input
                    id="buscar-equipo-cliente"
                    type="search"
                    value={busquedaCliente}
                    onChange={(event) => setBusquedaCliente(event.target.value)}
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
                        ) : equiposFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                    {filtroCliente
                                        ? "No se encontraron equipos para ese cliente."
                                        : "No se encontraron equipos."}
                                </td>
                            </tr>
                        ) : (
                            equiposFiltrados.map((equipo) => (
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
                            <div>
                                <h3 id="equipo-modal-title" className="text-h2 text-dark">Detalle del equipo</h3>
                                <p className="mt-1 text-footer text-secondary">
                                    Consulta la información y el estado inicial del equipo.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedEquipo(null)}
                                aria-label="Cerrar"
                                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-dark cursor-pointer transition-colors"
                            >
                                <LuX className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-5 px-6 py-5">
                            <section className="rounded-xl bg-slate-50 px-5 py-4">
                                <h4 className="mb-3 text-h3 text-secondary">Cliente</h4>
                                <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                                    {[
                                        ["Nombre", selectedEquipo.nombreCliente],
                                        ["Identificación", selectedEquipo.cedulaCliente],
                                    ].map(([label, value]) => (
                                        <div key={label}>
                                            <dt className="text-label text-secondary">{label}</dt>
                                            <dd className="mt-1 break-words text-main text-dark">{value || "No disponible"}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>
                            <section className="rounded-xl bg-slate-50 px-5 py-4">
                                <h4 className="mb-3 text-h3 text-secondary">Datos del equipo</h4>
                                <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                                    {[
                                        ["Tipo de equipo", selectedEquipo.tipoEquipo.replaceAll("_", " ")],
                                        ["Marca", selectedEquipo.marca],
                                        ["Modelo", selectedEquipo.modelo],
                                        ["Número de serie", selectedEquipo.numeroSerie],
                                        ["Color", selectedEquipo.color],
                                        ["Accesorios", selectedEquipo.accesorios],
                                    ].map(([label, value]) => (
                                        <div key={label}>
                                            <dt className="text-label text-secondary">{label}</dt>
                                            <dd className="mt-1 whitespace-pre-wrap break-words text-main text-dark">{value || "No disponible"}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>
                            <section className="rounded-xl bg-slate-50 px-5 py-4">
                                <h4 className="mb-3 text-h3 text-secondary">Estado y recepción</h4>
                                <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                                    {[
                                        ["Estado físico inicial", selectedEquipo.estadoFisicoInicial],
                                        ["Falla reportada", selectedEquipo.fallaReportada],
                                        ["Observaciones", selectedEquipo.observaciones || "Sin observaciones"],
                                    ].map(([label, value]) => (
                                        <div key={label}>
                                            <dt className="text-label text-secondary">{label}</dt>
                                            <dd className="mt-1 whitespace-pre-wrap break-words text-main text-dark">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>
                            {selectedEquipo.fotografiaInicial && (
                                <section className="rounded-xl bg-slate-50 px-5 py-4">
                                    <h4 className="mb-3 text-h3 text-secondary">Fotografía inicial</h4>
                                    <div className="flex justify-center">
                                        <img
                                            src={selectedEquipo.fotografiaInicial}
                                            alt={`Estado inicial de ${selectedEquipo.tipoEquipo} ${selectedEquipo.marca} ${selectedEquipo.modelo}`}
                                            className="max-h-48 max-w-full rounded-lg border border-gray-200 bg-white object-contain"
                                        />
                                    </div>
                                </section>
                            )}
                        </div>
                    </section>
                </div>
            )}
        </section>
    );
}