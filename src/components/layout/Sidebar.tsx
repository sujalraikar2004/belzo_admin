import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC = () => {
  const {
    currentRoute,
    navigateTo,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileMenuOpen,
    setMobileMenuOpen,
  } = useUIStore();
  const { hasPermission } = useAuthStore();

  const navSections = [
    {
      title: 'Overview',
      items: [
        { path: 'dashboard', label: 'Dashboard', icon: 'dashboard', permission: 'dashboard.view' as const },
      ],
    },
    {
      title: 'Operations',
      items: [
        { path: 'live-operations', label: 'Live Operations', icon: 'radar', permission: 'orders.view' as const },
        { path: 'orders', label: 'Orders', icon: 'receipt_long', permission: 'orders.view' as const },
        { path: 'restaurants', label: 'Restaurants', icon: 'storefront', permission: 'restaurants.view' as const },
        { path: 'delivery-partners', label: 'Delivery Partners', icon: 'two_wheeler', permission: 'delivery.view' as const },
        { path: 'customers', label: 'Customers', icon: 'group', permission: 'customers.view' as const },
      ],
    },
    {
      title: 'Catalog',
      items: [
        { path: 'categories-and-menus', label: 'Categories & Menus', icon: 'restaurant_menu', permission: 'catalog.view' as const },
        { path: 'add-ons', label: 'Add-ons', icon: 'fastfood', permission: 'catalog.view' as const },
      ],
    },
    {
      title: 'Growth',
      items: [
        { path: 'coupons-and-promotions', label: 'Coupons & Promotions', icon: 'confirmation_number', permission: 'catalog.view' as const },
        { path: 'campaigns', label: 'Campaigns', icon: 'campaign', permission: 'catalog.view' as const },
      ],
    },
    {
      title: 'Finance',
      items: [
        { path: 'payments', label: 'Payments', icon: 'payments', permission: 'payments.view' as const },
        { path: 'refunds', label: 'Refunds', icon: 'currency_exchange', permission: 'refunds.view' as const },
        { path: 'settlements', label: 'Settlements', icon: 'account_balance', permission: 'settlements.view' as const },
      ],
    },
    {
      title: 'Analytics',
      items: [
        { path: 'analytics-hub', label: 'Analytics Hub', icon: 'insights', permission: 'analytics.view' as const },
      ],
    },
    {
      title: 'Support',
      items: [
        { path: 'tickets-and-issues', label: 'Tickets & Issues', icon: 'support_agent', permission: 'support.view' as const },
        { path: 'reviews', label: 'Reviews & Ratings', icon: 'star', permission: 'support.view' as const },
      ],
    },
    {
      title: 'Platform',
      items: [
        { path: 'admin-users', label: 'Admin Users', icon: 'manage_accounts', permission: 'admins.view' as const },
        { path: 'roles-and-permissions', label: 'Roles & Permissions', icon: 'verified_user', permission: 'roles.view' as const },
        { path: 'platform-settings', label: 'Platform Settings', icon: 'tune', permission: 'settings.view' as const },
        { path: 'audit-logs', label: 'Audit Logs', icon: 'history', permission: 'audit.view' as const },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed top-0 bottom-0 left-0 h-screen bg-surface-container-lowest shadow-[0_2px_12px_rgba(0,0,0,0.06)] z-50 flex flex-col justify-between overflow-y-auto transition-all duration-200 border-r border-surface-container-high/60 ${
          isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isSidebarCollapsed ? 'lg:w-18' : 'lg:w-64'}`}
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-14 sm:h-16 px-space-md flex items-center justify-between bg-surface-container-low/40 border-b border-surface-container-high/40 flex-shrink-0">
            <div
              onClick={() => {
                navigateTo('dashboard');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-space-sm cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0">
                B
              </div>
              {(!isSidebarCollapsed || isMobileMenuOpen) && (
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface leading-none">
                      Belzo
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-primary-fixed text-primary text-[10px] font-bold">
                      ADMIN
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant leading-tight mt-0.5">
                    Operations Hub
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle / Mobile Close Button */}
            <div className="flex items-center">
              {/* Mobile Close */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                type="button"
                className="lg:hidden p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded transition-colors"
                title="Close Menu"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              {/* Desktop Collapse */}
              <button
                onClick={toggleSidebar}
                type="button"
                title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                className="hidden lg:flex p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isSidebarCollapsed ? 'dock_to_right' : 'dock_to_left'}
                </span>
              </button>
            </div>
          </div>

          {/* Navigation List */}
          <nav className="px-space-sm py-space-sm space-y-space-md">
            {navSections.map((section) => {
              const visibleItems = section.items.filter((item) => hasPermission(item.permission));
              if (visibleItems.length === 0) return null;

              return (
                <div key={section.title} className="space-y-space-2xs">
                  {(!isSidebarCollapsed || isMobileMenuOpen) && (
                    <p className="px-space-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                      {section.title}
                    </p>
                  )}
                  {visibleItems.map((item) => {
                    const isActive = currentRoute === item.path || currentRoute.startsWith(`${item.path}/`);

                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigateTo(item.path);
                          setMobileMenuOpen(false);
                        }}
                        title={isSidebarCollapsed && !isMobileMenuOpen ? item.label : undefined}
                        className={`w-full flex items-center ${
                          isSidebarCollapsed && !isMobileMenuOpen ? 'justify-center px-0' : 'justify-start px-space-sm'
                        } gap-space-sm py-2 rounded-lg transition-colors font-body-md text-body-md ${
                          isActive
                            ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs'
                            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px] flex-shrink-0">
                          {item.icon}
                        </span>
                        {(!isSidebarCollapsed || isMobileMenuOpen) && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Cluster Telemetry Status Badge */}
        {(!isSidebarCollapsed || isMobileMenuOpen) ? (
          <div className="p-space-sm m-space-sm rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container-high/40 flex-shrink-0">
            <div className="flex items-center gap-space-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-label-sm text-label-sm text-on-surface font-medium">Cluster v4.8.2</span>
            </div>
            <span className="font-label-sm text-label-sm text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">PROD</span>
          </div>
        ) : (
          <div className="p-2 flex justify-center flex-shrink-0">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" title="Cluster v4.8.2 PROD" />
          </div>
        )}
      </aside>
    </>
  );
};
