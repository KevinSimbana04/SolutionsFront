import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { clienteService } from "../api/customer.service";
import { clienteSchema, type ClienteFormData } from "../schema/customer.schema";

const camposTexto = [
    { name: "identificacion", label: "Identificación", type: "text" },
    { name: "nombres", label: "Nombres", type: "text" },
    { name: "apellidos", label: "Apellidos", type: "text" },
    { name: "telefono", label: "Teléfono", type: "tel" },
    { name: "correo", label: "Correo electrónico", type: "email" },
    { name: "direccion", label: "Dirección", type: "text" },
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
                <div className="grid gap-x-6 sm:grid-cols-2 xl:grid-cols-3">
                    {camposTexto.map(({ name, label, type }) => (
                        <div className="mb-5" key={name}>
                            <label htmlFor={`cliente-${name}`} className="mb-1 block text-label text-dark">
                                {label}
                            </label>
                            <input
                                id={`cliente-${name}`}
                                type={type}
                                autoComplete={name === "correo" ? "email" : "off"}
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

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 w-full rounded-lg bg-primary px-4 py-2.5 text-main font-medium text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
                >
                    {isSubmitting ? "Guardando..." : "Crear cliente"}
                </button>
            </form>
        </section>
    );
}