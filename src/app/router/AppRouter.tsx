import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './protectedRoute';
import UsePageTitle from './usePageTitle';

//Paginas Publicas
import DashboardLayout from '@/components/layout/dashboardLayout';
import Login from '@/pages/Auth/login';
import ActivarCuentaPage from '@/pages/Auth/activarCuenta';
import ConfigurarCredencialesPage from '@/pages/Auth/configurarCredenciales';


//Paginas de Administrador
import AdminUser from '@/pages/Admin/adminUser';
import AdminSetting from '@/pages/Admin/adminSetting';

//Paginas de Administrativo
import AdminisHome from '@/pages/Adminis/adminisHome';
import AdminisEquipmentPage from '@/pages/Adminis/adminisEquipment';
import AdminisCustomerPage from '@/pages/Adminis/admnisCustomer';

//Paginas de Técnico
import TechnicalHome from '@/pages/Technical/technicalHome';

//Paginas de Cliente
import CustomerHome from '@/pages/Customer/customerHome';

interface PageWrapperProps {
  title: string;
  children: React.ReactNode;
}

function PageWrapper({ title, children }: PageWrapperProps) {
  UsePageTitle(title);
  return <>{children}</>;
}
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PageWrapper title="Iniciar Sesión"><Login /></PageWrapper>} />
        <Route path="/unauthorized" element={<PageWrapper title="No Autorizado"><div className="p-10 text-red-500">No autorizado</div></PageWrapper>} />
        <Route path="/activar-cuenta" element={<PageWrapper title="Activar Cuenta"><ActivarCuentaPage /></PageWrapper>} />
        <Route path="/configurar-credenciales" element={<PageWrapper title="Configurar Credenciales"><ConfigurarCredencialesPage /></PageWrapper>} />

        {/* Módulo Administrador */}
        <Route element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} />}>
          <Route element={<DashboardLayout />}>
             <Route path="/admin/home" element={<PageWrapper title="Panel Principal Administrador"><div>Panel Principal Administrador</div></PageWrapper>} />
             <Route path="/admin/user" element={<PageWrapper title="Usuarios"><AdminUser /></PageWrapper>} />
             <Route path="/admin/setting" element={<PageWrapper title="Configuración"><AdminSetting/></PageWrapper>} />
          </Route>
        </Route>

        {/* Módulo Administrativo */}
        <Route element={<ProtectedRoute allowedRoles={['ADMINISTRATIVO']} />}>
          <Route element={<DashboardLayout />}>
             <Route path="/administrativo/home" element={<PageWrapper title="Panel Principal Administrativo"><AdminisHome /></PageWrapper>} />
             <Route path="/administrativo/customer" element={<PageWrapper title="Clientes"><AdminisCustomerPage/></PageWrapper>} />
             <Route path="/administrativo/equipment" element={<PageWrapper title="Equipos"><AdminisEquipmentPage/></PageWrapper>} />
          </Route>
        </Route>
        
        {/* Módulo Técnico */}
        <Route element={<ProtectedRoute allowedRoles={['TECNICO']} />}>
          <Route element={<DashboardLayout />}>
             <Route path="/tecnico/home" element={<PageWrapper title="Panel Principal Técnico"><TechnicalHome /></PageWrapper>} />
          </Route>
        </Route>
        {/* Módulo Cliente */} 
        <Route element={<ProtectedRoute allowedRoles={['CLIENTE']} />}>
          <Route element={<DashboardLayout />}>
             <Route path="/cliente/home" element={<PageWrapper title="Panel Principal Cliente"><CustomerHome /></PageWrapper>} />
          </Route>
        </Route> 

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}