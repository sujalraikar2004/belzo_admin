import { useUIStore } from "../store/uiStore";
import { mockStore } from "../mock/mockStore";
import { PlatformSettings } from "../types";
import React, { useState, useEffect } from 'react';

export const PlatformSettingsView: React.FC = () => {
  const { navigateTo, addToast } = useUIStore();
  const [settings, setSettings] = useState<PlatformSettings>(mockStore.getSettings());
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'BUSINESS' | 'ORDERS' | 'DELIVERY' | 'SECURITY'>('GENERAL');

  useEffect(() => {
    return mockStore.subscribe(() => {
      setSettings({ ...mockStore.getSettings() });
    });
  }, []);

  const handleSave = () => {
    mockStore.updateSettings(settings);
    addToast({
      type: 'SUCCESS',
      title: 'Platform Settings Saved',
      message: 'Configuration variables have been propagated across the cluster.',
    });
  };

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Top Header */}
      <div className="pt-space-md pb-space-lg flex flex-col xl:flex-row xl:items-center xl:justify-between gap-space-md">
        <div className="flex flex-col space-y-space-2xs">
          <nav className="flex items-center gap-space-2xs text-on-surface-variant font-label-sm text-label-sm">
            <span onClick={() => navigateTo('dashboard')} className="hover:text-on-surface cursor-pointer">
              Overview
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">Platform Settings</span>
          </nav>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Global Platform Parameters & Economics
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
              v{settings.general.clusterVersion}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Configure system commission take-rates, rider incentive matrices, auto-dispatch SLAs, geofence radius, and platform security flags.
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={handleSave}
            type="button"
            className="px-space-lg py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-md text-label-md font-semibold flex items-center gap-space-xs shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Configuration
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-surface-container-high mb-space-lg overflow-x-auto">
        {[
          { id: 'GENERAL', label: 'General & Support', icon: 'settings' },
          { id: 'BUSINESS', label: 'Commission & Taxation', icon: 'payments' },
          { id: 'ORDERS', label: 'Order Dispatch & SLAs', icon: 'receipt_long' },
          { id: 'DELIVERY', label: 'Rider Payouts & Bonuses', icon: 'two_wheeler' },
          { id: 'SECURITY', label: 'Security & 2FA', icon: 'security' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 font-label-md text-label-md font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Form Cards */}
      <div className="rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs p-space-lg max-w-4xl space-y-space-lg">
        {activeTab === 'GENERAL' && (
          <div className="space-y-space-md">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Platform Identity & Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={settings.general.platformName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, platformName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.general.supportEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, supportEmail: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Hotline Phone
                </label>
                <input
                  type="text"
                  value={settings.general.supportPhone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, supportPhone: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Operational Cities (Comma separated)
                </label>
                <input
                  type="text"
                  value={settings.general.operationalCities.join(', ')}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: {
                        ...settings.general,
                        operationalCities: e.target.value.split(',').map((c) => c.trim()),
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-surface-container-high flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-on-surface block">Emergency Maintenance Mode</span>
                <span className="text-xs text-on-surface-variant">
                  Block customer app orders while keeping admin and restaurant portals active.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, maintenanceMode: !settings.general.maintenanceMode },
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.general.maintenanceMode ? 'bg-rose-600' : 'bg-surface-container-high'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.general.maintenanceMode ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'BUSINESS' && (
          <div className="space-y-space-md">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Take Rates & Taxes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Default Platform Commission Rate (%)
                </label>
                <input
                  type="number"
                  value={settings.business.defaultTakeRatePercent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      business: { ...settings.business, defaultTakeRatePercent: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Food GST Rate (%)
                </label>
                <input
                  type="number"
                  value={settings.business.gstPercent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      business: { ...settings.business, gstPercent: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  TCS Statutory Withholding (%)
                </label>
                <input
                  type="number"
                  value={settings.business.tcsPercent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      business: { ...settings.business, tcsPercent: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Packaging Charge Cap (₹)
                </label>
                <input
                  type="number"
                  value={settings.business.packagingChargeCap}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      business: { ...settings.business, packagingChargeCap: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ORDERS' && (
          <div className="space-y-space-md">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Order SLAs & Radius</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Max Delivery Distance (km)
                </label>
                <input
                  type="number"
                  value={settings.orders.maxDeliveryDistanceKm}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      orders: { ...settings.orders, maxDeliveryDistanceKm: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Target Kitchen Prep SLA (Minutes)
                </label>
                <input
                  type="number"
                  value={settings.orders.targetPrepTimeMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      orders: { ...settings.orders, targetPrepTimeMinutes: parseInt(e.target.value, 10) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Target Total Delivery SLA (Minutes)
                </label>
                <input
                  type="number"
                  value={settings.orders.targetDeliveryTimeMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      orders: { ...settings.orders, targetDeliveryTimeMinutes: parseInt(e.target.value, 10) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Auto-Cancel Timeout on No Response (Minutes)
                </label>
                <input
                  type="number"
                  value={settings.orders.autoCancelTimeoutMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      orders: { ...settings.orders, autoCancelTimeoutMinutes: parseInt(e.target.value, 10) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'DELIVERY' && (
          <div className="space-y-space-md">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Rider Incentives & Surge Payouts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Base Rider Payout (First 3 km) ₹
                </label>
                <input
                  type="number"
                  value={settings.delivery.baseDeliveryFee}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      delivery: { ...settings.delivery, baseDeliveryFee: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Per Km Bonus after 3 km ₹
                </label>
                <input
                  type="number"
                  value={settings.delivery.perKmFeeAfter3Km}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      delivery: { ...settings.delivery, perKmFeeAfter3Km: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Rain Surge Bonus per Order ₹
                </label>
                <input
                  type="number"
                  value={settings.delivery.rainSurgeBonusPerOrder}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      delivery: { ...settings.delivery, rainSurgeBonusPerOrder: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Green Fleet / EV Incentive per Order ₹
                </label>
                <input
                  type="number"
                  value={settings.delivery.evIncentivePerOrder}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      delivery: { ...settings.delivery, evIncentivePerOrder: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'SECURITY' && (
          <div className="space-y-space-md">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Security & Session Governance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-surface-container-high">
                <div>
                  <span className="font-bold text-sm text-on-surface block">Mandatory 2FA for Admin Staff</span>
                  <span className="text-xs text-on-surface-variant">Require 6-digit TOTP / Authenticator code on sign-in.</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, enforce2FA: !settings.security.enforce2FA },
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.security.enforce2FA ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      settings.security.enforce2FA ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-surface-container-high">
                <div>
                  <span className="font-bold text-sm text-on-surface block">Strict Role-Based Routing</span>
                  <span className="text-xs text-on-surface-variant">Prevent access to unauthorized views even via URL modification.</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        strictRoleBasedAccess: !settings.security.strictRoleBasedAccess,
                      },
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.security.strictRoleBasedAccess ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      settings.security.strictRoleBasedAccess ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
