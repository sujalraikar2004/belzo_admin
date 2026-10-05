import React, { useState } from 'react';
import { useUIStore } from '../../store/uiStore';

interface NotificationAlert {
  id: string;
  type: 'ORDER' | 'APPROVAL' | 'PAYMENT' | 'REFUND' | 'SUPPORT';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  targetRoute?: string;
  targetParams?: Record<string, string>;
}

export const NotificationCenterModal: React.FC = () => {
  const { isNotificationCenterOpen, setNotificationCenterOpen, navigateTo } = useUIStore();

  const [alerts, setAlerts] = useState<NotificationAlert[]>([
    {
      id: 'N-1',
      type: 'SUPPORT',
      title: 'Critical SLA Breach: #TCK-9402',
      message: 'Order #BG10294 exceeded promised delivery window (+18m). Instant dispatch intervention required.',
      time: '2m ago',
      isRead: false,
      targetRoute: 'tickets-and-issues',
      targetParams: { ticketId: 'TCK-9402' },
    },
    {
      id: 'N-2',
      type: 'APPROVAL',
      title: 'New Merchant Onboarding Application',
      message: 'Wok Express (#RES-933) submitted FSSAI license & GST registration for Marathahalli outlet review.',
      time: '14m ago',
      isRead: false,
      targetRoute: 'restaurants/detail',
      targetParams: { restaurantId: 'RES-933' },
    },
    {
      id: 'N-3',
      type: 'REFUND',
      title: 'Refund Approved: ₹450 for Order #BG10211',
      message: 'Customer Tanvi Nair cancellation refund confirmed & escrow release completed by Finance desk.',
      time: '35m ago',
      isRead: false,
      targetRoute: 'refunds',
    },
    {
      id: 'N-4',
      type: 'ORDER',
      title: 'High Surge Volume: Bengaluru Central',
      message: 'Koramangala 4th Block active order run rate surged +18.4%. 42 couriers currently auto-dispatched.',
      time: '45m ago',
      isRead: false,
      targetRoute: 'live-operations',
    },
  ]);

  if (!isNotificationCenterOpen) return null;

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  const handleAlertClick = (alert: NotificationAlert) => {
    setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, isRead: true } : a)));
    setNotificationCenterOpen(false);
    if (alert.targetRoute) {
      navigateTo(alert.targetRoute, alert.targetParams);
    }
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-6 bg-transparent">
      {/* Click outside backdrop */}
      <div
        onClick={() => setNotificationCenterOpen(false)}
        className="fixed inset-0 bg-transparent"
      />

      <div className="relative w-96 rounded-2xl bg-surface-container-lowest shadow-2xl border border-surface-container-high p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-150 z-10">
        <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-tabular-mono text-label-sm font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] font-label-sm text-primary font-semibold hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => handleAlertClick(alert)}
              className={`p-3 rounded-xl cursor-pointer transition-all text-left flex gap-3 ${
                alert.isRead
                  ? 'bg-surface-container-low/40 opacity-75 hover:opacity-100 hover:bg-surface-container-low'
                  : 'bg-surface-container-low shadow-sm hover:bg-surface-container'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  alert.type === 'SUPPORT'
                    ? 'bg-error-container text-error'
                    : alert.type === 'APPROVAL'
                    ? 'bg-primary-fixed text-primary'
                    : alert.type === 'REFUND'
                    ? 'bg-secondary-fixed text-secondary'
                    : 'bg-tertiary-fixed text-tertiary'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {alert.type === 'SUPPORT'
                    ? 'warning'
                    : alert.type === 'APPROVAL'
                    ? 'storefront'
                    : alert.type === 'REFUND'
                    ? 'currency_exchange'
                    : 'electric_bolt'}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-headline-sm text-label-md font-bold text-on-surface truncate">
                    {alert.title}
                  </span>
                  <span className="font-tabular-mono text-[10px] text-on-surface-variant flex-shrink-0">
                    {alert.time}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-0.5 leading-snug">
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
