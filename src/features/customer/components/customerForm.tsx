import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { clienteService } from "../api/customer.service";
import { clienteSchema, type ClienteFormData } from "../schema/customer.schema";

const datosCliente = [
    { name: "identificacion", label: "Identificación", type: "text", placeholder: "Número de identificación del cliente" },
    { name: "nombres", label: "Nombres", type: "text", placeholder: "Nombres del cliente" },
    { name: "apellidos", label: "Apellidos", type: "text", placeholder: "Apellidos del cliente" },
] as const;

const datosContacto = [
    { name: "telefono", label: "Teléfono", type: "tel", placeholder: "Número de teléfono" },
    { name: "correo", label: "Correo electrónico", type: "email", placeholder: "Correo electrónico del cliente" },
    { name: "direccion", label: "Dirección", type: "text", placeholder: "Dirección completa del cliente" },
] as const;

interface ClienteFormProps {
    onCreated?: () => void;
}

export default function ClienteForm({ onCreated }: ClienteFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ClienteFormData>({
        resolver: zodResolver(clienteSchema),
        defaultValues: {
            identificacion: "",
            nombres: "",
            apellidos: "",
            telefono: "",
            correo: "",
            direccion: "",
        },
    });

    const onSubmit = async (data: ClienteFormData) => {
        try {
            const response = await clienteService.crearCliente(data);
            toast.success(response.mensaje || "Cliente creado correctamente.");
            reset();
            onCreated?.();
           
        } catch (error) {
            if (axios.isAxiosError<{ mensaje?: string }>(error) && error.response?.data?.mensaje) {
                toast.error(error.response.data.mensaje);
            } else {
                toast.error("No se pudo crear el cliente. Inténtalo de nuevo.");
            }
        }
    };

    return (
        <section className="w-full overflow-hidden rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-h1 text-dark">Registrar cliente</h1>
            <p className="mb-6 mt-1 text-footer text-gray-500">
                Completa los datos para crear una cuenta de cliente.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <section aria-labelledby="cliente-datos-title" className="mb-5">
                    <h2 id="cliente-datos-title" className="mb-3 text-h3 text-primary">Identificación del cliente</h2>
                    <div className="grid gap-x-6 sm:grid-cols-2 xl:grid-cols-3">
                        {datosCliente.map(({ name, label, type, placeholder }) => (
                            <div className="mb-4" key={name}>
                                <label htmlFor={`cliente-${name}`} className="mb-1 block text-label text-dark">
                                    {label}
                                </label>
                                <input
                                    id={`cliente-${name}`}
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

                <section aria-labelledby="cliente-contacto-title" className="mb-5">
                    <h2 id="cliente-contacto-title" className="mb-3 text-h3 text-primary">Contacto y domicilio</h2>
                    <div className="grid gap-x-6 sm:grid-cols-2 xl:grid-cols-3">
                        {datosContacto.map(({ name, label, type, placeholder }) => (
                            <div className="mb-4" key={name}>
                                <label htmlFor={`cliente-${name}`} className="mb-1 block text-label text-dark">
                                    {label}
                                </label>
                                <input
                                    id={`cliente-${name}`}
                                    type={type}
                                    autoComplete={name === "correo" ? "email" : "off"}
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
                        {isSubmitting ? "Guardando..." : "Crear cliente"}
                    </button>
                </div>
            </form>
        </section>
    );
}