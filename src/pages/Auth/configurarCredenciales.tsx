import ActualizarContraseniaForm from '@/features/auth/components/updatePasswordForm';

export default function ConfigurarCredencialesPage() {
    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-accent p-4 font-sans sm:p-8">
            <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-10">
                <div className="mb-6 flex flex-col items-center text-center">
                    <div className="flex items-center gap-2">
                        <img src="/logo-int2.ico" alt="Logo de INT-SOLUTIONS" className="h-10 w-10 object-contain" />
                        <span className="font-bold text-dark text-lg tracking-tight leading-tight">INT-SOLUTIONS</span>
                    </div>
                    <span className="mt-1 text-secondary text-xs font-normal leading-tight">
                        Soluciones Inteligentes en Tecnología
                    </span>
                </div>
                <ActualizarContraseniaForm />
            </section>
        </main>
    );
}