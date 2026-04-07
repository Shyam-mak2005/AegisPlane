import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthSession, AuthUser } from '@/types/platform';

interface AppState {
  user: AuthUser | null;
  accessToken: string | null;
  currentTenantId: string | null;
  permissions: string[];
  featureFlags: string[];
  sidebarCollapsed: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  setCurrentTenant: (tenantId: string | null) => void;
  setFeatureFlags: (featureFlags: string[]) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(persist((set, get) => ({
  user: null,
  accessToken: null,
  currentTenantId: null,
  permissions: [],
  featureFlags: [],
  sidebarCollapsed: false,
  setSession: (session) => set({
    user: session.user,
    accessToken: session.accessToken,
    permissions: session.user.permissions,
    currentTenantId: get().currentTenantId ?? session.user.tenantId ?? null
  }),
  clearSession: () => set({
    user: null,
    accessToken: null,
    currentTenantId: null,
    permissions: [],
    featureFlags: []
  }),
  setCurrentTenant: (tenantId) => set({ currentTenantId: tenantId }),
  setFeatureFlags: (featureFlags) => set({ featureFlags }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
}), {
  name: 'aegisplane-session'
}));