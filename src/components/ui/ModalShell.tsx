import { useEffect, type ReactNode } from "react";
import { LuX } from "react-icons/lu";

interface ModalShellProps {
    title: string;
    subtitle?: string;
    onClose: () => void;
    children: ReactNode;
    maxWidthClass?: string;
}

export default function ModalShell({
    title,
    subtitle,
    onClose,
    children,
    maxWidthClass = "max-w-3xl",
}: ModalShellProps) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"
        >
            <section
                role="dialog"
                aria-modal="true"
                onClick={(event) => event.stopPropagation()}
                className={`my-auto max-h-[90vh] w-full ${maxWidthClass} overflow-y-auto rounded-xl bg-white p-6 shadow-xl sm:p-8`}
            >
                <div className="mb-6 flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                        <h2 className="text-h2 text-dark">{title}</h2>
                        {subtitle && (
                            <p className="mt-1 text-footer text-gray-500">{subtitle}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar ventana"
                        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-dark"
                    >
                        <LuX className="h-5 w-5" />
                    </button>
                </div>
                {children}
            </section>
        </div>
    );
}