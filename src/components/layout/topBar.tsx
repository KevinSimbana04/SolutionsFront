import { useLocation } from "react-router-dom";
import { LuBell, LuChevronRight } from "react-icons/lu";
import { useAuthStore } from "@/store/authStore";

interface TopBarProps {
    category?: string;
    title?: string;
}

const ROUTE_CONFIG: Record<string, { category: string; title: string }> = {
    "/admin/home": { category: "Operación", title: "Panel general" },
    "/admin/user": { category: "Operación", title: "Usuarios" },
    "/admin/setting": { category: "Administración", title: "Configuración" },

    "/administrativo/home": { category: "Operación", title: "Panel general" },
    "/administrativo/customer": { category: "Operación", title: "Clientes" },
    "/administrativo/equipment": { category: "Operación", title: "Equipos" },

    "/admin/orders": { category: "Operación", title: "Órdenes de trabajo" },
    "/administrativo/order": { category: "Operación", title: "Órdenes de trabajo" },
    "/tecnico/home": { category: "Taller", title: "Bandeja de trabajo" },
     "/cliente/home": { category: "Mi cuenta", title: "Mis reparaciones" },
};

function formatSegment(segment: string): string {
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

export default function TopBar({ category, title }: TopBarProps) {
    const location = useLocation();
    const { user } = useAuthStore();

    const currentRoute = ROUTE_CONFIG[location.pathname];
    const segments = location.pathname.split("/").filter(Boolean);
    const fallbackCategory = segments[0] ? formatSegment(segments[0]) : "Inicio";
    const fallbackTitle = segments[1] ? formatSegment(segments[1]) : "Panel general";

    const displayCategory = category || currentRoute?.category || fallbackCategory;
    const displayTitle = title || currentRoute?.title || fallbackTitle;

    return (
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between select-none">
            <nav aria-label="Migas de pan" className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 font-normal">{displayCategory}</span>
                <LuChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-dark font-medium">{displayTitle}</span>
            </nav>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    title="Notificaciones"
                    className="relative p-2 text-gray-500 hover:text-dark hover:bg-surface rounded-full transition-colors cursor-pointer"
                >
                    <LuBell className="w-5 h-5 text-gray-500" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-white" />
                </button>
                <div className="h-6 w-px bg-gray-200 mx-1" />
                <div
                    title={user?.name || "Usuario"}
                    className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm cursor-default"
                >
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
            </div>
        </header>
    );
}