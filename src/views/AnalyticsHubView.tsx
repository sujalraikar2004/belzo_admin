import React, { useState } from 'react';
import { useUIStore } from '../store/uiStore';
import { exportToCSV } from '../services/api';

export const AnalyticsHubView: React.FC = () => {
  const { navigateTo, addToast } = useUIStore();
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [timeRange, setTimeRange] = useState('7D');

  const hourlyData = [
    { hour: '08:00', orders: 120, gmv: 42000 },
    { hour: '10:00', orders: 280, gmv: 98000 },
    { hour: '12:00', orders: 890, gmv: 345000 },
    { hour: '13:00', orders: 1420, gmv: 590000 },
    { hour: '14:00', orders: 980, gmv: 380000 },
    { hour: '16:00', orders: 340, gmv: 125000 },
    { hour: '18:00', orders: 620, gmv: 240000 },
    { hour: '19:00', orders: 1290, gmv: 520000 },
    { hour: '20:00', orders: 1840, gmv: 780000 },
    { hour: '21:00', orders: 1650, gmv: 690000 },
    { hour: '22:00', orders: 910, gmv: 370000 },
    { hour: '23:00', orders: 410, gmv: 160000 },
  ];

  const maxOrders = Math.max(...hourlyData.map((d) => d.orders));

  const handleExport = () => {
    exportToCSV('Belzo_Hourly_Analytics', hourlyData);
    addToast({
      type: 'SUCCESS',
      title: 'Analytics Data Exported',
      message: 'Hourly telemetry logs downloaded to CSV.',
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
            <span className="text-primary font-semibold">Analytics Hub</span>
          </nav>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Ecosystem Analytics & Intelligence
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
              Real-time Aggregation
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Multi-city order volumes, GMV unit economics, delivery SLA breach analytics, hourly kitchen heatmaps, and retention cohorts.
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="flex items-center bg-surface-container-low border border-surface-container-high rounded-lg p-1">
            {['TODAY', '7D', '30D', 'YTD'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  timeRange === t ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            type="button"
            className="px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-label-md text-label-md font-semibold flex items-center gap-space-xs shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report (CSV)
          </button>
        </div>
      </div>

      {/* Top Level Macro Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
          <span className="font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">Gross Merchandise Value</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">₹43.8 Lakh</span>
          </div>
          <span className="text-[12px] text-emerald-600 font-medium mt-1">↑ +18.4% vs previous 7-day period</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
          <span className="font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">Order Volume (Delivered)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">11,280</span>
          </div>
          <span className="text-[12px] text-emerald-600 font-medium mt-1">98.1% fulfillment completion rate</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
          <span className="font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">Average Order Value (AOV)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">₹388</span>
          </div>
          <span className="text-[12px] text-tertiary font-medium mt-1">Basket size up by ₹24 in dinner slot</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
          <span className="font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">On-Time SLA Delivery</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg font-bold text-emerald-600">93.8%</span>
          </div>
          <span className="text-[12px] text-on-surface-variant mt-1">Avg 28.4 mins drop-off speed</span>
        </div>
      </div>

      {/* Hourly Orders Distribution Visualizer */}
      <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs mb-space-lg space-y-space-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Hourly Order Distribution & Peak Surge Waves
            </h3>
            <p className="text-[12px] text-on-surface-variant mt-0.5">
              Live orders volume plotted across 24-hour cycle showing lunch (12-2 PM) and dinner peaks (7-10 PM).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
              <span className="w-3 h-3 rounded bg-primary" /> Order Volume
            </span>
          </div>
        </div>

        <div className="pt-6 pb-2">
          <div className="flex items-end justify-between gap-2 h-56 border-b border-surface-container-high px-2">
            {hourlyData.map((slot) => {
              const heightPercent = Math.round((slot.orders / maxOrders) * 100);
              const isPeak = slot.orders > 1300;

              return (
                <div key={slot.hour} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[11px] font-mono font-bold text-on-surface opacity-0 group-hover:opacity-100 transition-opacity">
                    {slot.orders}
                  </span>
                  <div className="w-full flex justify-center">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 ${
                        isPeak ? 'bg-primary group-hover:bg-primary-container' : 'bg-primary-fixed group-hover:bg-primary'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-on-surface-variant mt-1">{slot.hour}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row - Cuisines & Geographic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
        {/* Top Cuisines & Demand */}
        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-space-md">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Top Cuisines by Volume</h3>
          <div className="space-y-3">
            {[
              { name: 'Biryani & Mughlai', percent: 38, count: '4,280 orders', color: 'bg-primary' },
              { name: 'North Indian & Curries', percent: 26, count: '2,930 orders', color: 'bg-amber-600' },
              { name: 'South Indian & Tiffin', percent: 18, count: '2,030 orders', color: 'bg-emerald-600' },
              { name: 'Pizza, Burgers & Fast Food', percent: 12, count: '1,350 orders', color: 'bg-purple-600' },
              { name: 'Desserts & Beverages', percent: 6, count: '690 orders', color: 'bg-blue-600' },
            ].map((cuisine) => (
              <div key={cuisine.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-on-surface">{cuisine.name}</span>
                  <span className="font-mono text-on-surface-variant text-[12px]">{cuisine.count} ({cuisine.percent}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className={`h-full rounded-full ${cuisine.color}`} style={{ width: `${cuisine.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* City Breakdown */}
        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-space-md">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Active Operating Hubs</h3>
          <div className="space-y-3">
            {[
              { city: 'Bengaluru (Koramangala, Indiranagar, HSR, Whitefield)', gmv: '₹31.2 Lakh', orders: '7,920', share: '71%' },
              { city: 'Pune (Kothrud, Baner, Viman Nagar, Hinjewadi)', gmv: '₹12.6 Lakh', orders: '3,360', share: '29%' },
              { city: 'Mumbai (Bandra, Andheri, Powai)', gmv: 'Pilot Phase', orders: '520', share: 'Expanding' },
              { city: 'Hyderabad (Hitec City, Gachibowli, Jubilee Hills)', gmv: 'Pre-launch', orders: '-', share: 'Coming Soon' },
            ].map((hub) => (
              <div
                key={hub.city}
                className="p-3 rounded-lg bg-surface-container-low border border-surface-container-high/60 flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-on-surface text-sm block">{hub.city}</span>
                  <span className="text-[12px] text-on-surface-variant font-mono">{hub.orders} active deliveries today</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-on-surface block text-sm">{hub.gmv}</span>
                  <span className="text-[11px] text-primary font-bold">{hub.share}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
