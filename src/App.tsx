/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { NotificationCenterModal } from './components/layout/NotificationCenterModal';
import { ConfirmationModal } from './components/layout/ConfirmationModal';
import { ToastContainer } from './components/layout/ToastContainer';
import { DispatchActionModal } from './components/layout/DispatchActionModal';
import { AdminProfileModal } from './components/layout/AdminProfileModal';

// Views
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { LiveOperationsView } from './views/LiveOperationsView';
import { OrdersView } from './views/OrdersView';
import { OrderDetailView } from './views/OrderDetailView';
import { RestaurantsView } from './views/RestaurantsView';
import { RestaurantDetailView } from './views/RestaurantDetailView';
import { DeliveryPartnersView } from './views/DeliveryPartnersView';
import { CustomersView } from './views/CustomersView';
import { CategoriesAndMenusView } from './views/CategoriesAndMenusView';
import { AddOnsView } from './views/AddOnsView';
import { CouponsAndPromotionsView } from './views/CouponsAndPromotionsView';
import { CampaignsView } from './views/CampaignsView';
import { PaymentsView } from './views/PaymentsView';
import { RefundsView } from './views/RefundsView';
import { SettlementsView } from './views/SettlementsView';
import { AnalyticsHubView } from './views/AnalyticsHubView';
import { TicketsAndIssuesView } from './views/TicketsAndIssuesView';
import { ReviewsView } from './views/ReviewsView';
import { AdminUsersView } from './views/AdminUsersView';
import { RolesAndPermissionsView } from './views/RolesAndPermissionsView';
import { PlatformSettingsView } from './views/PlatformSettingsView';
import { AuditLogsView } from './views/AuditLogsView';

export default function App() {
  const { isAuthenticated, hasPermission } = useAuthStore();
  const { currentRoute, isSidebarCollapsed, setGlobalSearchOpen } = useUIStore();

  // Keyboard shortcut listener: Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setGlobalSearchOpen]);

  // If not authenticated, render login portal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface-container-low text-on-surface">
        <AuthView />
        <ToastContainer />
      </div>
    );
  }

  // Render view corresponding to currentRoute
  const renderView = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardView />;
      case 'live-operations':
        return <LiveOperationsView />;
      case 'orders':
        return <OrdersView />;
      case 'order-detail':
        return <OrderDetailView />;
      case 'restaurants':
        return <RestaurantsView />;
      case 'restaurant-detail':
        return <RestaurantDetailView />;
      case 'delivery-partners':
        return <DeliveryPartnersView />;
      case 'customers':
        return <CustomersView />;
      case 'categories-and-menus':
        return <CategoriesAndMenusView />;
      case 'add-ons':
        return <AddOnsView />;
      case 'coupons-and-promotions':
        return <CouponsAndPromotionsView />;
      case 'campaigns':
        return <CampaignsView />;
      case 'payments':
        return <PaymentsView />;
      case 'refunds':
        return <RefundsView />;
      case 'settlements':
        return <SettlementsView />;
      case 'analytics-hub':
        return <AnalyticsHubView />;
      case 'tickets-and-issues':
        return <TicketsAndIssuesView />;
      case 'reviews':
        return <ReviewsView />;
      case 'admin-users':
        return <AdminUsersView />;
      case 'roles-and-permissions':
        return <RolesAndPermissionsView />;
      case 'platform-settings':
        return <PlatformSettingsView />;
      case 'audit-logs':
        return <AuditLogsView />;
      case 'auth':
        return <AuthView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface flex flex-col font-sans antialiased selection:bg-primary-fixed selection:text-primary">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          isSidebarCollapsed ? 'lg:pl-18' : 'lg:pl-64'
        }`}
      >
        {/* Top Sticky Header */}
        <Header />

        {/* View Page Container */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 py-2 sm:py-4 max-w-[1600px] w-full mx-auto">
          {renderView()}
        </main>
      </div>

      {/* Modals & Portals */}
      <GlobalSearchModal />
      <NotificationCenterModal />
      <ConfirmationModal />
      <ToastContainer />
      <DispatchActionModal />
      <AdminProfileModal />
    </div>
  );
}
