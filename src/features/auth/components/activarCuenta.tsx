import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { GoCheckCircleFill } from "react-icons/go";
import { LuLoaderCircle } from "react-icons/lu";
import { authService } from '../api/auth.Service';
import { VscError } from "react-icons/vsc";

export default function ActivarCuenta() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const hasFetched = useRef(false);

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
        token ? 'loading' : 'error'
    );
    const [message, setMessage] = useState(
        token
            ? 'Verificando tu enlace de activación...'
            : 'Enlace inválido. No se encontró el token de activación en la URL.'
    );

    useEffect(() => {
        if (!token) {
            return;
        }

        if (hasFetched.current) return;
        hasFetched.current = true;

        const activar = async () => {
            try {
                const res = await authService.activarCuenta({ token });
                setStatus('success');
                setMessage(res.mensaje || 'Cuenta activada exitosamente. Ya puedes iniciar sesión.');
            } catch (error) {
                setStatus('error');
                if (isAxiosError<{ mensaje?: string }>(error) && error.response?.data?.mensaje) {
                    setMessage(error.response.data.mensaje);
                } else {
                    setMessage('Ocurrió un error al intentar activar la cuenta. Es posible que el enlace haya expirado.');
                }
            }
        };

        activar();
    }, [token]);

    return (
        <div className="text-center py-8">
            {status === 'loading' && (
                <div className="flex flex-col items-center justify-center space-y-4">
                    <LuLoaderCircle className="w-12 h-12 text-primary animate-spin" />
                    <h2 className="text-xl font-bold text-dark">Activando cuenta...</h2>
                    <p className="text-gray-500">{message}</p>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center justify-center space-y-4">
                    <GoCheckCircleFill  className="w-16 h-16 text-green-500" />
                    <h2 className="text-2xl font-bold text-dark">¡Cuenta Activada!</h2>
                    <p className="text-gray-600">{message}</p>
                    
                    <Link
                        to="/login"
                        className="mt-6 inline-block w-full py-2.5 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
                    >
                        Ir a Iniciar Sesión
                    </Link>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center justify-center space-y-4">
                    <VscError className="w-16 h-16 text-red-500" />
                    <h2 className="text-2xl font-bold text-dark">Error de Activación</h2>
                    <p className="text-gray-600">{message}</p>
                    
                    <Link
                        to="/login"
                        className="mt-6 inline-block w-full py-2.5 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
                    >
                        Volver al Inicio
                    </Link>
                </div>
            )}
        </div>
    );
}