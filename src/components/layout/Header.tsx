import React, { useState, useRef, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { AdminRole } from '../../types';

export const Header: React.FC = () => {
  const {
    setGlobalSearchOpen,
    setNotificationCenterOpen,
    setProfileModalOpen,
    setDispatchActionModalOpen,
    setMobileMenuOpen,
    navigateTo,
  } = useUIStore();

  const { currentUser, switchRole, logout } = useAuthStore();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rolesList: { role: AdminRole; label: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin (Full Access)' },
    { role: 'OPERATIONS_ADMIN', label: 'Operations Admin' },
    { role: 'FINANCE_ADMIN', label: 'Finance Admin' },
    { role: 'SUPPORT_ADMIN', label: 'Support Admin' },
    { role: 'RESTAURANT_ADMIN', label: 'Restaurant Admin' },
    { role: 'ANALYST', label: 'Data Analyst' },
  ];

  return (
    <header className="sticky top-0 z-30 w-full h-14 sm:h-16 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_4px_rgba(0,0,0,0.05)] border-b border-surface-container-high/60 flex items-center justify-between px-3 sm:px-6 transition-all">
      {/* Left: Mobile Hamburger + Global Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 pr-2">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          type="button"
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors flex-shrink-0"
          title="Open Navigation"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Global Search Pill */}
        <div
          onClick={() => setGlobalSearchOpen(true)}
          className="relative flex items-center cursor-pointer group max-w-sm w-full"
        >
          <span className="material-symbols-outlined absolute left-2.5 sm:left-3 text-on-surface-variant text-[18px] group-hover:text-primary transition-colors flex-shrink-0">
            search
          </span>
          <input
            readOnly
            className="h-9 pl-8 sm:pl-9 pr-12 w-full rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none cursor-pointer group-hover:bg-surface-container transition-all truncate text-xs sm:text-sm"
            placeholder="Search orders, stores, fleet..."
            type="text"
          />
          <span className="hidden sm:inline-block absolute right-2 px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono text-[11px] font-semibold shadow-2xs">
            Ctrl+K
          </span>
        </div>

        {/* System Health Badge (Visible on large displays) */}
        <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low border border-surface-container-high/40 text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-on-surface font-medium">99.98% Healthy</span>
          <span className="text-on-surface-variant">•</span>
          <span className="text-on-surface-variant">Bengaluru &amp; Pune</span>
        </div>
      </div>

      {/* Right: Actions, Notifications, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Dispatch Action Trigger */}
        <button
          onClick={() => setDispatchActionModalOpen(true)}
          type="button"
          className="h-9 px-2 sm:px-3 rounded-lg bg-primary text-on-primary font-semibold text-xs sm:text-sm flex items-center gap-1.5 hover:bg-primary-container transition-all active:scale-95 shadow-xs flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
          <span className="hidden sm:inline">Dispatch Action</span>
        </button>

        {/* Support Direct Link */}
        <button
          onClick={() => navigateTo('tickets-and-issues')}
          type="button"
          title="Operations Support Desk"
          className="h-9 w-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">headset_mic</span>
        </button>

        {/* Notification Bell with Badge */}
        <button
          onClick={() => setNotificationCenterOpen(true)}
          type="button"
          title="Notification Center (4 Unread)"
          className="relative h-9 w-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-on-primary font-bold text-[10px] flex items-center justify-center">
            4
          </span>
        </button>

        <div className="h-6 w-px bg-surface-container-high mx-0.5 sm:mx-1 flex-shrink-0" />

        {/* User Profile Pill & Dropdown */}
        <div className="relative flex-shrink-0" ref={profileMenuRef}>
          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 cursor-pointer group select-none p-1 rounded-lg hover:bg-surface-container-low transition-colors"
          >
            <div className="relative flex-shrink-0">
              <img
                alt={currentUser?.name || 'Admin'}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-surface-container-high"
                src={currentUser?.avatar}
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="hidden md:flex flex-col text-left max-w-[120px] lg:max-w-[140px] truncate leading-tight">
              <span className="text-xs font-bold text-on-surface truncate">
                {currentUser?.name || 'Rahul Sharma'}
              </span>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold truncate mt-0.5">
                {currentUser?.role.replace(/_/g, ' ')}
              </span>
            </div>

            <span className="material-symbols-outlined text-on-surface-variant text-[18px] group-hover:text-on-surface transition-colors flex-shrink-0">
              expand_more
            </span>
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-surface-container-lowest shadow-2xl border border-surface-container-high p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 bg-surface-container-low rounded-lg mb-2">
                <p className="font-bold text-sm text-on-surface truncate">
                  {currentUser?.name}
                </p>
                <p className="text-on-surface-variant text-xs truncate">
                  {currentUser?.email}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-primary-fixed text-primary text-[10px] font-bold">
                    {currentUser?.role}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">● Session Active</span>
                </div>
              </div>

              {/* RBAC Role Switcher */}
              <div className="px-2 py-1.5 border-b border-surface-container-high">
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase mb-1">
                  Test Role Permission Matrix
                </label>
                <select
                  value={currentUser?.role}
                  onChange={(e) => {
                    switchRole(e.target.value as AdminRole);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full h-8 pl-2 pr-6 rounded bg-surface-container text-on-surface text-xs font-semibold focus:outline-none cursor-pointer border border-surface-container-high"
                >
                  {rolesList.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="py-1 space-y-0.5 text-xs font-medium">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setProfileModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                  <span>Admin Profile &amp; Security</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigateTo('platform-settings');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">tune</span>
                  <span>Platform Settings</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigateTo('audit-logs');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">history</span>
                  <span>Operational Audit Logs</span>
                </button>
              </div>

              <div className="border-t border-surface-container-high pt-1">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-left font-semibold text-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
