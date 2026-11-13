import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, type Rol } from '@/store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: Rol[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}