import { isAxiosError } from 'axios';
import { useEffect, useState, type FormEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { LuEye, LuPencil, LuUserX, LuX } from 'react-icons/lu';
import { toast } from 'react-toastify';

import { empleadoService } from '../api/employee.service';
import { empleadoSchema, type EmpleadoFormData } from '../schema/employee.schema';
import type { EmpleadoResponse, EmpleadoRol } from '../types';

interface EmpleadoTableProps {
    refreshKey?: number;
}

type ModalState =
    | { type: 'view'; empleado: EmpleadoResponse }
    | { type: 'edit'; empleado: EmpleadoResponse }
    | { type: 'deactivate'; empleado: EmpleadoResponse }
    | null;

function getErrorMessage(error: unknown, fallback: string): string {
    if (isAxiosError<{ mensaje?: string }>(error) && error.response?.data?.mensaje) {
        return error.response.data.mensaje;
    }
    return fallback;
}

const camposEditables = [
    { name: 'identificacion', label: 'Identificación', type: 'text' },
    { name: 'nombres', label: 'Nombres', type: 'text' },
    { name: 'apellidos', label: 'Apellidos', type: 'text' },
    { name: 'telefono', label: 'Teléfono', type: 'tel' },
    { name: 'correo', label: 'Correo electrónico', type: 'email' },
    { name: 'direccion', label: 'Dirección', type: 'text' },
    { name: 'cargo', label: 'Cargo', type: 'text' },
] as const;

export default function EmpleadoTable({ refreshKey = 0 }: EmpleadoTableProps) {
    const [empleados, setEmpleados] = useState<EmpleadoResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    const [modal, setModal] = useState<ModalState>(null);
    const [motivo, setMotivo] = useState('');
    const [isDeactivating, setIsDeactivating] = useState(false);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EmpleadoFormData>({
        resolver: zodResolver(empleadoSchema),
    });

    useEffect(() => {
        let isCurrent = true;
        const cargarEmpleados = async () => {
            setIsLoading(true);
            setLoadError(false);
            try {
                const data = await empleadoService.listarEmpleados();
                if (isCurrent) setEmpleados(data);
            } catch (error) {
                if (isCurrent) {
                    setLoadError(true);
                    toast.error(getErrorMessage(error, 'No se pudieron cargar los empleados.'));
                }
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        };
        void cargarEmpleados();
        return () => { isCurrent = false; };
    }, [refreshKey]);

    const abrirEdicion = (empleado: EmpleadoResponse) => {
        reset({
            identificacion: empleado.identificacion,
            nombres: empleado.nombres,
            apellidos: empleado.apellidos,
            telefono: empleado.telefono,
            correo: empleado.correo,
            direccion: empleado.direccion,
            cargo: empleado.cargo,
            rol: empleado.rol,
        });
        setModal({ type: 'edit', empleado });
    };

    const guardarCambios = async (data: EmpleadoFormData) => {
        if (modal?.type !== 'edit') return;

        try {
            const response = await empleadoService.actualizarEmpleado(modal.empleado.empleadoId, {
                ...data,
                rol: data.rol as EmpleadoRol
            });
            setEmpleados((actuales) =>
                actuales.map((empleado) =>
                    empleado.empleadoId === response.empleadoId ? response : empleado,
                ),
            );
            toast.success(response.mensaje || 'Empleado actualizado correctamente.');
            setModal(null);
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo actualizar el empleado.'));
        }
    };

    const desactivarEmpleado = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (modal?.type !== 'deactivate') return;
        if (!motivo.trim()) return toast.error('Escribe el motivo.');
        
        setIsDeactivating(true);
        try {
            const response = await empleadoService.desactivarEmpleado(modal.empleado.empleadoId, motivo.trim());
            setEmpleados((actuales) =>
                actuales.map((empleado) =>
                    empleado.empleadoId === modal.empleado.empleadoId
                        ? { ...empleado, estadoCuenta: false }
                        : empleado,
                ),
            );
            toast.success(response.mensaje || 'Cuenta desactivada correctamente.');
            setModal(null);
            setMotivo('');
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo desactivar la cuenta.'));
        } finally {
            setIsDeactivating(false);
        }
    };

    return (
        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-5">
                <div>
                    <h2 className="text-h2 text-dark">Empleados registrados</h2>
                    <p className="mt-1 text-footer text-gray-500">Consulta y administra las cuentas de empleado.</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left">
                    <thead className="bg-gray-50 text-table uppercase text-gray-500">
                        <tr>
                            <th className="px-6 py-3">Nombre y apellido</th>
                            <th className="px-6 py-3">Identificación</th>
                            <th className="px-6 py-3">Estado de cuenta</th>
                            <th className="px-6 py-3 text-right">Opciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-main">
                        {isLoading ? (
                            <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">Cargando empleados...</td></tr>
                        ) : loadError ? (
                            <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">Error al cargar.</td></tr>
                        ) : empleados.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">No hay empleados registrados.</td></tr>
                        ) : (
                            empleados.map((empleado) => (
                                <tr key={empleado.empleadoId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-dark">{empleado.nombres} {empleado.apellidos}</td>
                                    <td className="px-6 py-4 text-gray-600">{empleado.identificacion}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${empleado.estadoCuenta ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {empleado.estadoCuenta ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setModal({ type: 'view', empleado })} className="rounded-md p-2 text-gray-600 hover:bg-blue-50 hover:text-primary"><LuEye className="h-4 w-4" /></button>
                                            <button onClick={() => abrirEdicion(empleado)} className="rounded-md p-2 text-gray-600 hover:bg-amber-50 hover:text-amber-700"><LuPencil className="h-4 w-4" /></button>
                                            <button onClick={() => { setMotivo(''); setModal({ type: 'deactivate', empleado }); }} disabled={!empleado.estadoCuenta} className="rounded-md p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"><LuUserX className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modales (manteniendo la misma estructura HTML pero resumida por brevedad visual) */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <section className="w-full max-w-2xl rounded-xl bg-white shadow-xl p-6">
                        <div className="flex justify-between border-b pb-4 mb-4">
                            <h3 className="text-h2 text-dark">
                                {modal.type === 'view' ? 'Datos del empleado' : modal.type === 'edit' ? 'Editar empleado' : 'Desactivar cuenta'}
                            </h3>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-md"><LuX className="h-5 w-5" /></button>
                        </div>
                        
                        {/* Lógica condicional de los modales original */}
                        {modal.type === 'view' && (
                            <dl className="grid gap-4 sm:grid-cols-2">
                                {[['Nombre', modal.empleado.nombres], ['Apellido', modal.empleado.apellidos], ['Cargo', modal.empleado.cargo], ['Estado', modal.empleado.estadoCuenta ? 'Activa' : 'Inactiva']].map(([l, v]) => (
                                    <div key={l}><dt className="text-label text-gray-500">{l}</dt><dd className="mt-1 text-main text-dark">{v}</dd></div>
                                ))}
                            </dl>
                        )}

                        {modal.type === 'edit' && (
                            <form onSubmit={handleSubmit(guardarCambios)} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {camposEditables.map(({ name, label, type }) => (
                                        <div key={name}>
                                            <label className="mb-1 block text-label text-dark">{label}</label>
                                            <input type={type} {...register(name)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                                            {errors[name] && <span className="text-xs text-red-600">{errors[name]?.message}</span>}
                                        </div>
                                    ))}
                                    <div>
                                        <label className="mb-1 block text-label text-dark">Rol</label>
                                        <select {...register('rol')} className="w-full rounded-md border border-gray-300 px-3 py-2 text-main">
                                            <option value="ADMINISTRATIVO">Administrativo</option>
                                            <option value="TECNICO">Técnico</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button type="button" onClick={() => setModal(null)} className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">Cancelar</button>
                                    <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-hover disabled:bg-gray-400">Guardar</button>
                                </div>
                            </form>
                        )}

                        {modal.type === 'deactivate' && (
                            <form onSubmit={desactivarEmpleado}>
                                <p className="mb-4 text-main text-gray-600">Vas a desactivar la cuenta de {modal.empleado.nombres}.</p>
                                <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3} required className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Motivo de desactivación" />
                                <div className="flex justify-end gap-3 mt-4">
                                    <button type="button" onClick={() => setModal(null)} className="rounded-lg border px-4 py-2 hover:bg-gray-50">Cancelar</button>
                                    <button type="submit" disabled={isDeactivating} className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700">Desactivar</button>
                                </div>
                            </form>
                        )}
                    </section>
                </div>
            )}
        </section>
    );
}