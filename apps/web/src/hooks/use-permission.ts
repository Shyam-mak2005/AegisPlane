import { useAppStore } from '@/store/app-store';

export const usePermission = (permission: string) => {
  const user = useAppStore((state) => state.user);
  if (user?.isPlatformAdmin) {
    return true;
  }
  return user?.permissions.includes(permission) ?? false;
};