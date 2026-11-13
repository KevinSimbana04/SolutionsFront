import { LuLayoutDashboard, LuUsers, LuSettings, LuLogOut } from "react-icons/lu";
import { GrCubes } from "react-icons/gr";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore, type Rol } from "@/store/authStore";

interface NavItem {
    name: string;
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: Rol[];
    badge?: string | number;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const NAVIGATION_CONFIG: NavSection[] = [
    {
        title: "OPERACIÓN",
        items: [
            { name: "Panel general", to: "/admin/home", icon: LuLayoutDashboard, roles: ["ADMINISTRADOR"] },
            { name: "Usuarios", to: "/admin/user", icon: LuUsers, roles: ["ADMINISTRADOR"] },
            { name: "Inicio", to: "/administrativo/home", icon: LuLayoutDashboard, roles: ["ADMINISTRATIVO"] },
            { name: "Clientes", to: "/administrativo/customer", icon: LuUsers, roles: ["ADMINISTRATIVO"] },
            { name: "Equipos", to: "/administrativo/equipment", icon: GrCubes, roles: ["ADMINISTRATIVO"] },
            { name: "Inicio", to: "/tecnico/home", icon: LuLayoutDashboard, roles: ["TECNICO"] },
            { name: "Inicio", to: "/cliente/home", icon: LuLayoutDashboard, roles: ["CLIENTE"] },
        ],
    },
    {
        title: "ADMINISTRACIÓN",
        items: [
            { name: "Configuración", to: "/admin/setting", icon: LuSettings, roles: ["ADMINISTRADOR"] },
        ],
    },
];

export default function AsideBar() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-main transition-colors ${isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-gray-600 hover:text-dark hover:bg-surface"
        }`;

    const userRole = user?.role;
    const visibleSections = NAVIGATION_CONFIG.map((section) => ({
        ...section,
        items: section.items.filter((item) => userRole ? item.roles.includes(userRole) : false),
    })).filter((section) => section.items.length > 0);

    return (
        <aside className="sticky top-0 h-screen w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col justify-between p-4 select-none overflow-y-auto">
            <div>
                <div className="flex items-center gap-3 px-3 py-3 mb-6">
                    <img src="/logo-int2.ico" alt="INT-SOLUTION" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-dark text-lg tracking-wide">INT-SOLUTION</span>
                </div>
                <nav className="space-y-6">
                    {visibleSections.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider px-3 mb-2">
                                {section.title}
                            </h3>
                            <ul className="space-y-1">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <li key={item.to}>
                                            <NavLink to={item.to} className={navLinkClasses}>
                                                {({ isActive }) => (
                                                    <>
                                                        <div className="flex items-center gap-3">
                                                            <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-gray-400"}`} />
                                                            <span>{item.name}</span>
                                                        </div>
                                                        {item.badge !== undefined && (
                                                            <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded">
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </NavLink>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>
            </div>
            <div className="pt-4 border-t border-gray-200 flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-sm font-semibold text-dark leading-tight">
                            {user?.name || "Usuario"}
                        </span>
                        <span className="text-xs text-gray-400 leading-tight capitalize">
                            {user?.role ? user.role.toLowerCase() : "Sin rol"}
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    title="Cerrar sesión"
                    className="text-gray-400 hover:text-red-600 hover:bg-surface p-2 rounded-lg transition-colors cursor-pointer"
                >
                    <LuLogOut className="w-5 h-5" />
                </button>
            </div>
        </aside>
    );
}