import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Rol = 'ADMINISTRADOR' | 'ADMINISTRATIVO' | 'TECNICO' | 'CLIENTE';

export interface User {
  id: number;
  name: string;
  role: Rol;
  requiereCambioClave: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: !!token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'int-solutions-auth' }
  )
);