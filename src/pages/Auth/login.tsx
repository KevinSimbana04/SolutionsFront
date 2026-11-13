import { LoginForm } from '@/features/auth/components/loginForm';

export default function Login() {
  return (
    <div className="min-h-screen w-full flex bg-white font-sans select-none">
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 md:p-16">
        

        <div className="flex items-center gap-3">

          <img src="/logo-int2.ico" alt="INT-SOLUTIONS" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <span className="font-bold text-dark text-lg tracking-tight leading-tight">INT-SOLUTIONS</span>
            <span className="text-secondary text-xs font-normal leading-tight">Soluciones Inteligentes en Tecnología</span>
          </div>
        </div>

        <div className="max-w-sm w-full mx-auto my-auto py-8">
          <h1 className="text-h1 text-dark text-center">Iniciar sesión</h1>
          <p className="text-footer text-gray-500 text-center mt-1 mb-8">
            Ingresa tus datos para continuar en tu cuenta.
          </p>
          <LoginForm />
        </div>

        <div className="hidden lg:block h-6" />
      </div>
      <div className="hidden lg:flex lg:w-1/2 bg-primary" />
    </div>
  );
}