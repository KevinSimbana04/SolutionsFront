import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { isAxiosError } from 'axios';

import { actualizarContraseniaSchema, type ActualizarContraseniaFormData } from '../schemas/auth.schema';
import { authService } from '../api/auth.Service';
import { useAuthStore } from '@/store/authStore';

export default function ActualizarContraseniaForm() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ActualizarContraseniaFormData>({
        resolver: zodResolver(actualizarContraseniaSchema),
        defaultValues: {
            usuarioActual: user?.name || '',
            contraseniaActual: '',
            nuevaContrasenia: '',
            confirmarNuevaContrasenia: '',
        },
    });

    const onSubmit = async (data: ActualizarContraseniaFormData) => {
        try {
            const res = await authService.configurarCredenciales({
                usuarioActual: data.usuarioActual,
                contraseniaActual: data.contraseniaActual,
                nuevaContrasenia: data.nuevaContrasenia,
            });
            
            toast.success(res.mensaje || 'Credenciales actualizadas. Inicia sesión nuevamente.');
            logout();
            navigate('/login', { replace: true });
        } catch (error) {
            if (isAxiosError(error) && error.response?.data?.mensaje) {
                toast.error(error.response.data.mensaje);
            } else {
                toast.error('Ocurrió un error al actualizar las credenciales.');
            }
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Contraseña Temporal */}
                <div className="mb-6">
                    <label className="block text-label text-dark mb-1">Contraseña Temporal</label>
                    <div className="relative">
                        <input
                            type={showCurrent ? 'text' : 'password'}
                            className="w-full border-b border-gray-300 py-2 pr-10 text-main text-dark placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors bg-transparent"
                            {...register('contraseniaActual')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 text-primary hover:text-primary-hover p-1"
                            tabIndex={-1}
                        >
                            {showCurrent ? <FaRegEyeSlash className="w-4 h-4" /> : <FaRegEye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.contraseniaActual && <span className="text-red-500 text-xs mt-1 block">{errors.contraseniaActual.message}</span>}
                </div>

                {/* Nueva Contraseña */}
                <div className="mb-6">
                    <label className="block text-label text-dark mb-1">Nueva Contraseña</label>
                    <div className="relative">
                        <input
                            type={showNew ? 'text' : 'password'}
                            placeholder="Mínimo 8 caracteres"
                            className="w-full border-b border-gray-300 py-2 pr-10 text-main text-dark placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors bg-transparent"
                            {...register('nuevaContrasenia')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 text-primary hover:text-primary-hover p-1"
                            tabIndex={-1}
                        >
                            {showNew ? <FaRegEyeSlash className="w-4 h-4" /> : <FaRegEye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.nuevaContrasenia && <span className="text-red-500 text-xs mt-1 block">{errors.nuevaContrasenia.message}</span>}
                </div>

                {/* Confirmar Nueva Contraseña */}
                <div className="mb-6">
                    <label className="block text-label text-dark mb-1">Confirmar Nueva Contraseña</label>
                    <input
                        type={showNew ? 'text' : 'password'}
                        className="w-full border-b border-gray-300 py-2 text-main text-dark placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors bg-transparent"
                        {...register('confirmarNuevaContrasenia')}
                    />
                    {errors.confirmarNuevaContrasenia && <span className="text-red-500 text-xs mt-1 block">{errors.confirmarNuevaContrasenia.message}</span>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 py-2.5 px-4 bg-primary hover:bg-primary-hover disabled:bg-gray-400 text-white text-main font-medium rounded-lg transition-colors shadow-sm disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Actualizando...' : 'Actualizar Credenciales'}
                </button>
            </form>
        </div>
    );
}