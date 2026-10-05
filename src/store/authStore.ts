import { create } from 'zustand';
import { AdminRole, AdminUser, Permission } from '../types';
import { mockStore, DEFAULT_ROLE_PERMISSIONS } from '../mock/mockStore';

interface AuthState {
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  requires2FA: boolean;
  pendingEmail?: string;
  hasPermission: (permission: Permission) => boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; requires2FA?: boolean; message?: string }>;
  verify2FA: (code: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: AdminRole) => void;
  updateProfile: (updates: Partial<AdminUser>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const admins = mockStore.getAdmins();
  const defaultAdmin = admins[0] || {
    id: 'ADM-001',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@belzo.com',
    role: 'SUPER_ADMIN' as AdminRole,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHpoqScQ-pwBjp8_XM9kKRsj3sdn5vV2HE76HprjIYOsevYqc1U_8H_vejIrm8XVCopBZWSIe9soEIO2Z89XTvcYGXMeaB_DH0-ntOsZsHj3DRgwUaTLi5RyIs6aI3VkXIJIETFv58hZ0nherVrjpSiiDzEobwOFe5g7sJtq52A5jO2VSLVku-DxEzzXiy3_8os90hMtbYWzRDguFk6Lk2wo6GF-gN9XLYGXHsrnsDd3xVKIjDQ4oP',
    status: 'ACTIVE' as const,
    lastLogin: '2026-10-02 00:58 IST',
    department: 'Executive Operations',
  };

  return {
    currentUser: defaultAdmin,
    isAuthenticated: true,
    requires2FA: false,

    hasPermission: (permission: Permission) => {
      const user = get().currentUser;
      if (!user) return false;
      if (user.role === 'SUPER_ADMIN') return true;
      const rolePerms = mockStore.getRolePermissions();
      const perms = rolePerms[user.role] || DEFAULT_ROLE_PERMISSIONS[user.role] || [];
      return perms.includes(permission);
    },

    login: async (email: string, _pass: string) => {
      await new Promise((r) => setTimeout(r, 400));
      const user = mockStore.getAdmins().find((a) => a.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return { success: false, message: 'Invalid administrative credentials.' };
      }
      set({ requires2FA: true, pendingEmail: email });
      return { success: true, requires2FA: true };
    },

    verify2FA: async (code: string) => {
      await new Promise((r) => setTimeout(r, 400));
      if (code.length === 6 || code === '123456') {
        const email = get().pendingEmail || 'rahul.sharma@belzo.com';
        const user = mockStore.getAdmins().find((a) => a.email.toLowerCase() === email.toLowerCase()) || defaultAdmin;
        set({
          currentUser: user,
          isAuthenticated: true,
          requires2FA: false,
          pendingEmail: undefined,
        });
        mockStore.recordAudit('ADMIN_LOGIN_SUCCESS', 'Auth', user.id, 'SUCCESS', { email });
        return true;
      }
      return false;
    },

    logout: () => {
      const user = get().currentUser;
      if (user) {
        mockStore.recordAudit('ADMIN_LOGOUT', 'Auth', user.id, 'SUCCESS');
      }
      set({ currentUser: null, isAuthenticated: false, requires2FA: false });
    },

    switchRole: (role: AdminRole) => {
      const curr = get().currentUser;
      if (!curr) return;
      const updated = { ...curr, role };
      set({ currentUser: updated });
      mockStore.recordAudit('ROLE_SIMULATION_SWITCH', 'Auth', curr.id, 'SUCCESS', { newRole: role });
    },

    updateProfile: (updates: Partial<AdminUser>) => {
      const curr = get().currentUser;
      if (!curr) return;
      const updated = { ...curr, ...updates };
      set({ currentUser: updated });
      mockStore.recordAudit('ADMIN_PROFILE_UPDATED', 'AdminUser', curr.id, 'SUCCESS', updates);
    },
  };
});
