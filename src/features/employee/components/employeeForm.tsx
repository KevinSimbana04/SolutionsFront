import { isAxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { empleadoService } from '../api/employee.service';
import { empleadoSchema, type EmpleadoFormData } from '../schema/employee.schema';

const datosPersonales = [
    { name: 'identificacion', label: 'Identificación', type: 'text', placeholder: 'Número de identificación del empleado' },
    { name: 'nombres', label: 'Nombres', type: 'text', placeholder: 'Nombres del empleado' },
    { name: 'apellidos', label: 'Apellidos', type: 'text', placeholder: 'Apellidos del empleado' },
] as const;

const datosContacto = [
    { name: 'telefono', label: 'Teléfono', type: 'tel', placeholder: 'Número de teléfono' },
    { name: 'correo', label: 'Correo electrónico', type: 'email', placeholder: 'Correo electrónico del empleado' },
    { name: 'direccion', label: 'Dirección', type: 'text', placeholder: 'Dirección completa del empleado' },
] as const;

interface EmpleadoFormProps {
    onCreated?: () => void;
}

export default function EmpleadoForm({ onCreated }: EmpleadoFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<EmpleadoFormData>({
        resolver: zodResolver(empleadoSchema),
        defaultValues: {
            identificacion: '', nombres: '', apellidos: '',
            telefono: '', correo: '', direccion: '', cargo: ''
        },
    });

    const onSubmit = async (data: EmpleadoFormData) => {
        try {
            const response = await empleadoService.crearEmpleado(data);
            toast.success(response.mensaje || 'Empleado creado correctamente.');
            reset();
            onCreated?.();
        } catch (error) {
            if (isAxiosError<{ mensaje?: string }>(error) && error.response?.data?.mensaje) {
                toast.error(error.response.data.mensaje);
            } else {
                toast.error('No se pudo crear el empleado. Inténtalo de nuevo.');
            }
        }
    };

    return (
        <section className="w-full overflow-hidden rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-h1 text-dark">Registrar empleado</h1>
            <p className="mb-6 mt-1 text-footer text-gray-500">
                Completa los datos para crear una cuenta de empleado.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <section aria-labelledby="empleado-personales-title" className="mb-5">
                    <h2 id="empleado-personales-title" className="mb-3 text-h3 text-primary">Datos personales</h2>
                    <div className="grid gap-x-6 sm:grid-cols-2 xl:grid-cols-3">
                        {datosPersonales.map(({ name, label, type, placeholder }) => (
                            <div className="mb-4" key={name}>
                                <label htmlFor={name} className="mb-1 block text-label text-dark">{label}</label>
                                <input
                                    id={name}
                                    type={type}
                                    autoComplete="off"
                                    placeholder={placeholder}
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
                        ))}
                    </div>
                </section>

                <section aria-labelledby="empleado-contacto-title" className="mb-5">
                    <h2 id="empleado-contacto-title" className="mb-3 text-h3 text-primary">Información de contacto</h2>
                    <div className="grid gap-x-6 sm:grid-cols-2 xl:grid-cols-3">
                        {datosContacto.map(({ name, label, type, placeholder }) => (
                            <div className="mb-4" key={name}>
                                <label htmlFor={name} className="mb-1 block text-label text-dark">{label}</label>
                                <input
                                    id={name}
                                    type={type}
                                    autoComplete={name === 'correo' ? 'email' : 'off'}
                                    placeholder={placeholder}
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
                        ))}
                    </div>
                </section>

                <section aria-labelledby="empleado-laboral-title" className="mb-5">
                    <h2 id="empleado-laboral-title" className="mb-3 text-h3 text-primary">Perfil laboral</h2>
                    <div className="grid gap-x-6 sm:grid-cols-2">
                        <div className="mb-4">
                            <label htmlFor="cargo" className="mb-1 block text-label text-dark">Cargo</label>
                            <input
                                id="cargo"
                                type="text"
                                autoComplete="off"
                                placeholder="Cargo que desempeña el empleado"
                                aria-invalid={Boolean(errors.cargo)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                {...register('cargo')}
                            />
                            {errors.cargo && <span className="mt-1 block text-xs text-red-600" role="alert">{errors.cargo.message}</span>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="rol" className="mb-1 block text-label text-dark">Rol</label>
                            <select
                                id="rol"
                                aria-invalid={Boolean(errors.rol)}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-main focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                {...register('rol')}
                            >
                                <option value="">Selecciona un rol</option>
                                <option value="ADMINISTRADOR">Administrador</option>
                                <option value="ADMINISTRATIVO">Administrativo</option>
                                <option value="TECNICO">Técnico</option>
                            </select>
                            {errors.rol && <span className="mt-1 block text-xs text-red-600" role="alert">{errors.rol.message}</span>}
                        </div>
                    </div>
                </section>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() => reset()}
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
                        {isSubmitting ? 'Guardando...' : 'Crear Empleado'}
                    </button>
                </div>
            </form>
        </section>
    );
}