import { create } from 'zustand';

export interface ToastItem {
  id: string;
  type: 'SUCCESS' | 'ERROR' | 'INFO' | 'WARNING';
  title: string;
  message?: string;
  duration?: number;
}

export interface ConfirmDialogOptions {
  isOpen: boolean;
  title: string;
  message: string;
  impact?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

interface UIState {
  currentRoute: string;
  routeParams: Record<string, string>;
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  isGlobalSearchOpen: boolean;
  isNotificationCenterOpen: boolean;
  isProfileModalOpen: boolean;
  isDispatchActionModalOpen: boolean;
  activeCluster: string;
  toasts: ToastItem[];
  confirmDialog: ConfirmDialogOptions;

  // Actions
  navigateTo: (route: string, params?: Record<string, string>) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setGlobalSearchOpen: (open: boolean) => void;
  setNotificationCenterOpen: (open: boolean) => void;
  setProfileModalOpen: (open: boolean) => void;
  setDispatchActionModalOpen: (open: boolean) => void;
  setActiveCluster: (cluster: string) => void;
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  openConfirm: (options: Omit<ConfirmDialogOptions, 'isOpen'>) => void;
  closeConfirm: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentRoute: 'dashboard',
  routeParams: {},
  isSidebarCollapsed: false,
  isMobileMenuOpen: false,
  isGlobalSearchOpen: false,
  isNotificationCenterOpen: false,
  isProfileModalOpen: false,
  isDispatchActionModalOpen: false,
  activeCluster: 'Bengaluru Central & South Zone',
  toasts: [],
  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  },

  navigateTo: (route: string, params: Record<string, string> = {}) => {
    set({ currentRoute: route, routeParams: params, isMobileMenuOpen: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

  setGlobalSearchOpen: (open) => set({ isGlobalSearchOpen: open }),

  setNotificationCenterOpen: (open) => set({ isNotificationCenterOpen: open }),

  setProfileModalOpen: (open) => set({ isProfileModalOpen: open }),

  setDispatchActionModalOpen: (open) => set({ isDispatchActionModalOpen: open }),

  setActiveCluster: (cluster) => set({ activeCluster: cluster }),

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    const duration = toast.duration || 4000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  openConfirm: (options) =>
    set({
      confirmDialog: {
        ...options,
        isOpen: true,
      },
    }),

  closeConfirm: () =>
    set((state) => ({
      confirmDialog: {
        ...state.confirmDialog,
        isOpen: false,
      },
    })),
}));
