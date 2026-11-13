import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { isAxiosError } from 'axios';

import { loginSchema, type LoginFormData } from '../schemas/auth.schema';
import { authService } from '../api/auth.Service';
import { useAuthStore } from '@/store/authStore';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const loginStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const rutasPorRol: Record<string, string> = {
    ADMINISTRADOR: '/admin/home',
    ADMINISTRATIVO: '/administrativo/home',
    TECNICO: '/tecnico/home',
    CLIENTE: '/cliente/home',
  };

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { userName: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authService.login(data);
      
      loginStore(
        { 
          id: 0, 
          name: response.nombreUsuario, 
          role: response.rol,
          requiereCambioClave: response.requiereCambioClave
        },
        response.token
      );

      if (response.requiereCambioClave) {
        toast.info(response.mensaje);
        navigate('/configurar-credenciales', { replace: true });
        return;
      }

      toast.success(response.mensaje || `¡Bienvenido, ${response.nombreUsuario}!`);
      
      const destino = rutasPorRol[response.rol] || '/login';
      navigate(destino, { replace: true });

    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.mensaje) {
        toast.error(error.response.data.mensaje);
      } else {
        toast.error('No se pudo conectar con el servidor.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="mb-6">
        <label className="block text-label text-dark mb-1">Usuario</label>
        <input
          type="text"
          placeholder="Ingresa tu usuario"
          className="w-full border-b border-gray-300 py-2 text-main text-dark placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors bg-transparent"
          {...register('userName')}
        />
        {errors.userName && <span className="text-red-500 text-xs mt-1 block">{errors.userName.message}</span>}
      </div>

      <div className="mb-6">
        <label className="block text-label text-dark mb-1">Contraseña</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Ingresa tu contraseña"
            className="w-full border-b border-gray-300 py-2 pr-10 text-main text-dark placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors bg-transparent"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-primary hover:text-primary-hover p-1"
            tabIndex={-1}
          >
            {showPassword ? <FaRegEyeSlash className="w-4 h-4" /> : <FaRegEye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-6 py-2.5 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Iniciando...' : 'Iniciar sesión'}
      </button>
    </form>
  );
}