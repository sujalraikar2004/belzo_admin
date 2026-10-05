import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { mockStore } from '../mock/mockStore';
import { exportToCSV } from '../services/api';
import { Order, Restaurant } from '../types';

export const DashboardView: React.FC = () => {
  const { navigateTo, addToast } = useUIStore();
  const [selectedHub, setSelectedHub] = useState('All Hubs (4)');
  const [chartRange, setChartRange] = useState<'Today' | '7D' | '30D' | '90D'>('Today');

  const [orders, setOrders] = useState<Order[]>(mockStore.getOrders());
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockStore.getRestaurants());

  useEffect(() => {
    return mockStore.subscribe(() => {
      setOrders([...mockStore.getOrders()]);
      setRestaurants([...mockStore.getRestaurants()]);
    });
  }, []);

  // Filter based on selected hub
  const filteredOrders = orders.filter((o) => {
    if (selectedHub === 'Bengaluru') return o.city === 'Bengaluru';
    if (selectedHub === 'Pune') return o.city === 'Pune';
    if (selectedHub === 'Mumbai') return o.city === 'Mumbai';
    if (selectedHub === 'Hyderabad') return o.city === 'Hyderabad';
    return true;
  });

  const handleExportSnapshot = () => {
    const rows = [
      {
        Metric: 'Total Orders',
        Value: '184,920',
        Growth: '+12.4% vs lw',
      },
      {
        Metric: "Today's Orders",
        Value: '14,382',
        Growth: "+8.1% vs y'day",
      },
      {
        Metric: "Today's Revenue (GMV)",
        Value: '₹42,86,450',
        NetCommission: '₹8,57,290',
      },
      {
        Metric: 'Active Orders',
        Value: '1,248',
        InTransit: '1,117',
        KitchenPrep: '42',
        ReadyCounter: '89',
      },
      {
        Metric: 'Active Merchants',
        Value: '3,412',
        OnlinePercent: '94.2%',
      },
      {
        Metric: 'Active Fleet Riders',
        Value: '4,890',
        OnRuns: '3,620',
        Available: '1,270',
      },
    ];
    exportToCSV('Belzo_Operations_Snapshot', rows);
    addToast({
      type: 'SUCCESS',
      title: 'Snapshot Report Exported',
      message: 'CSV file generated and downloaded.',
    });
  };

  return (
    <div className="flex flex-col w-full pb-12">
      <div className="flex flex-col gap-space-lg py-space-md">
        {/* Executive Banner */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/60">
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center gap-space-xs">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold tracking-wide uppercase">
                Fleet &amp; Hub Telemetry
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-tertiary-container animate-ping" />
              <span className="font-tabular-mono text-body-sm text-tertiary font-medium">
                Synced 3s ago
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Executive Operations &amp; Performance Dashboard
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Real-time ecosystem metrics across Bengaluru, Pune, Mumbai &amp; Hyderabad hubs
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-xs">
            <div className="inline-flex rounded-lg bg-surface-container-low p-1 gap-1 border border-surface-container-high/40">
              {['All Hubs (4)', 'Bengaluru', 'Pune', 'Mumbai', 'Hyderabad'].map((hub) => (
                <button
                  key={hub}
                  onClick={() => setSelectedHub(hub)}
                  className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-all ${
                    selectedHub === hub
                      ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {hub}
                </button>
              ))}
            </div>
            <button
              onClick={handleExportSnapshot}
              type="button"
              className="h-9 px-3.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-colors border border-surface-container-high/60 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span>Snapshot Report</span>
            </button>
          </div>
        </div>

        {/* 8 Metric KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-space-sm">
          {/* Card 1 */}
          <div
            onClick={() => navigateTo('orders')}
            className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all cursor-pointer border border-surface-container-high/60"
          >
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Total Orders</span>
              <span className="material-symbols-outlined text-[18px] text-secondary">receipt_long</span>
            </div>
            <div className="my-space-xs">
              <div className="font-headline-md text-headline-md font-bold text-on-surface font-tabular-mono tracking-tight">
                184,920
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-tertiary text-[14px]">arrow_upward</span>
                <span className="font-label-sm text-label-sm text-tertiary font-bold">+12.4%</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">vs lw</span>
              </div>
            </div>
            <div className="w-full h-7 mt-1">
              <svg className="w-full h-full text-secondary" fill="none" viewBox="0 0 100 24">
                <path d="M0 18 Q 15 12, 30 15 T 60 7 T 85 11 L 100 3" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
                <path d="M0 18 Q 15 12, 30 15 T 60 7 T 85 11 L 100 3 V 24 H 0 Z" fill="currentColor" fillOpacity="0.08" />
              </svg>
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => navigateTo('orders')}
            className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all cursor-pointer border border-surface-container-high/60"
          >
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Today's Orders</span>
              <span className="material-symbols-outlined text-[18px] text-primary">electric_bolt</span>
            </div>
            <div className="my-space-xs">
              <div className="font-headline-md text-headline-md font-bold text-on-surface font-tabular-mono tracking-tight">
                14,382
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-tertiary text-[14px]">arrow_upward</span>
                <span className="font-label-sm text-label-sm text-tertiary font-bold">+8.1%</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">vs y'day</span>
              </div>
            </div>
            <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '78%' }} />
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => navigateTo('payments')}
            className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all cursor-pointer border border-surface-container-high/60"
          >
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Today's Revenue</span>
              <span className="material-symbols-outlined text-[18px] text-tertiary">currency_rupee</span>
            </div>
            <div className="my-space-xs">
              <div className="font-headline-md text-headline-md font-bold text-on-surface font-tabular-mono tracking-tight">
                ₹42.86L
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-tertiary text-[14px]">trending_up</span>
                <span className="font-label-sm text-label-sm text-tertiary font-bold">+15.2%</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Gross</span>
              </div>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-tabular-mono">
              Net Comms: ₹8.57L
            </span>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => navigateTo('live-operations')}
            className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all cursor-pointer border border-surface-container-high/60"
          >
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Active Orders</span>
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            </div>
            <div className="my-space-xs">
              <div className="font-headline-md text-headline-md font-bold text-on-surface font-tabular-mono tracking-tight">
                1,248
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-on-surface-variant">
                <span className="font-label-sm text-label-sm font-semibold text-secondary">1,117</span>
                <span className="font-label-sm text-label-sm">in transit</span>
              </div>
            </div>
            <div className="flex gap-0.5 text-label-sm text-on-surface-variant font-tabular-mono">
              <span className="text-primary font-bold">42</span> prep · <span className="text-on-surface font-bold">89</span> rdy
            </div>
          </div>

          {/* Card 5 */}
          <div
            onClick={() => navigateTo('restaurants')}
            className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all cursor-pointer border border-surface-container-high/60"
          >
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Active Stores</span>
              <span className="material-symbols-outlined text-[18px]">store</span>
            </div>
            <div className="my-space-xs">
              <div className="font-headline-md text-headline-md font-bold text-on-surface font-tabular-mono tracking-tight">
                3,412
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="font-label-sm text-label-sm text-tertiary font-bold">94.2%</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">online</span>
              </div>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">128 currently paused</span>
          </div>

          {/* Card 6 */}
          <div
            onClick={() => navigateTo('delivery-partners')}
            className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all cursor-pointer border border-surface-container-high/60"
          >
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Fleet Riders</span>
              <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
            </div>
            <div className="my-space-xs">
              <div className="font-headline-md text-headline-md font-bold text-on-surface font-tabular-mono tracking-tight">
                4,890
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="font-label-sm text-label-sm text-secondary font-bold">3,620</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">on runs</span>
              </div>
            </div>
            <span className="font-label-sm text-label-sm text-tertiary font-bold">1,270 available</span>
          </div>

          {/* Card 7 */}
          <div
            onClick={() => navigateTo('customers')}
            className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all cursor-pointer border border-surface-container-high/60"
          >
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Customers</span>
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
            <div className="my-space-xs">
              <div className="font-headline-md text-headline-md font-bold text-on-surface font-tabular-mono tracking-tight">
                1.28M
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="font-label-sm text-label-sm text-tertiary font-bold">+1,420</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">today</span>
              </div>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">78% repeat rate</span>
          </div>

          {/* Card 8 */}
          <div
            onClick={() => navigateTo('tickets-and-issues')}
            className="flex flex-col justify-between p-space-md rounded-xl bg-error-container/40 shadow-sm hover:shadow-md transition-all cursor-pointer border border-error-container"
          >
            <div className="flex items-center justify-between text-on-error-container">
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">Pending Issues</span>
              <span className="material-symbols-outlined text-[18px] text-error">warning</span>
            </div>
            <div className="my-space-xs">
              <div className="font-headline-md text-headline-md font-bold text-on-error-container font-tabular-mono tracking-tight">
                18
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="inline-flex px-1.5 py-0.5 rounded-full bg-error text-on-error font-label-sm text-label-sm font-bold animate-pulse">
                  Needs Attention
                </span>
              </div>
            </div>
            <span className="font-label-sm text-label-sm text-on-error-container/80">4 SLA threshold risks</span>
          </div>
        </div>

        {/* Charts & Funnel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Revenue & Commission Flow */}
          <div className="lg:col-span-8 flex flex-col p-space-lg bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
              <div className="flex flex-col">
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Revenue &amp; Commission Flow
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Real-time GMV split, marketplace take rate, and state GST collections
                </p>
              </div>
              <div className="flex items-center gap-space-sm">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    Gross Revenue
                  </span>
                  <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                    <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
                    Commission (Net)
                  </span>
                  <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                    <span className="h-2.5 w-2.5 rounded-full bg-surface-container-highest" />
                    Taxes
                  </span>
                </div>
                <div className="inline-flex rounded-lg bg-surface-container-low p-0.5 text-label-sm text-label-sm border border-surface-container-high/40">
                  {(['Today', '7D', '30D', '90D'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setChartRange(r)}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        chartRange === r
                          ? 'font-semibold bg-surface-container-lowest text-on-surface shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-space-md p-space-md rounded-lg bg-surface-container-low mb-space-md">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Gross Invoiced (GMV)</span>
                <span className="font-headline-md text-headline-md font-bold text-on-surface font-tabular-mono">
                  ₹42,86,450
                </span>
                <span className="font-label-sm text-label-sm text-tertiary font-medium">
                  +15.2% vs standard run-rate
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Platform Take (Net Comms)</span>
                <span className="font-headline-md text-headline-md font-bold text-secondary font-tabular-mono">
                  ₹8,57,290
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Effective take rate 20.0%
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Platform Tax (GST/TCS)</span>
                <span className="font-headline-md text-headline-md font-bold text-on-surface font-tabular-mono">
                  ₹2,14,320
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  5% GST &amp; 1% TCS remitted
                </span>
              </div>
            </div>

            {/* Stylized Bar Chart */}
            <div className="w-full h-64 relative flex flex-col justify-end">
              <div className="h-full w-full flex items-end justify-between gap-2 pt-6 pb-4">
                {[
                  { time: '08:00', height: '42%', inner: '65%', note: '₹2.8L' },
                  { time: '10:00', height: '58%', inner: '62%', note: '₹4.2L' },
                  { time: '12:00', height: '86%', inner: '70%', note: '₹6.4L peak' },
                  { time: '14:00', height: '95%', inner: '75%', note: '₹7.8L peak', isBold: true },
                  { time: '16:00', height: '64%', inner: '66%', note: '₹4.8L' },
                  { time: '18:00', height: '76%', inner: '68%', note: '₹5.9L' },
                  { time: '20:00', height: '100%', inner: '80%', note: '₹8.9L dinner', isHighlight: true, isBold: true },
                  { time: '22:00', height: '72%', inner: '65%', note: '₹5.2L' },
                  { time: '00:00', height: '34%', inner: '55%', note: '₹1.8L' },
                ].map((bar) => (
                  <div key={bar.time} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div
                      className="w-full max-w-[28px] bg-primary/20 hover:bg-primary/30 rounded-t flex flex-col justify-end transition-all relative cursor-pointer"
                      style={{ height: bar.height }}
                    >
                      <div
                        className="w-full bg-primary rounded-t transition-all"
                        style={{ height: bar.inner }}
                      />
                      <div
                        className={`absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] font-tabular-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm z-10 ${
                          bar.isHighlight ? 'bg-primary text-on-primary' : 'bg-on-surface text-surface'
                        }`}
                      >
                        {bar.note}
                      </div>
                    </div>
                    <span
                      className={`font-tabular-mono text-label-sm ${
                        bar.isBold ? 'text-on-surface font-bold' : 'text-on-surface-variant'
                      }`}
                    >
                      {bar.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Lifecycle Funnel */}
          <div className="lg:col-span-4 flex flex-col justify-between p-space-lg bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high/60">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    Order Lifecycle Funnel
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Live state-machine pipeline</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-tertiary-container/20 text-tertiary font-label-sm text-label-sm font-bold">
                  97.8% Healthy
                </span>
              </div>

              {/* Donut Funnel */}
              <div className="flex items-center justify-center py-space-sm relative">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-surface-container" />
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="314" strokeDashoffset="35" strokeLinecap="round" className="text-tertiary" />
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="314" strokeDashoffset="240" strokeLinecap="round" className="text-secondary" />
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="314" strokeDashoffset="290" strokeLinecap="round" className="text-primary" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Processed</span>
                  <span className="font-headline-md text-headline-md font-bold text-on-surface font-tabular-mono">14,382</span>
                  <span className="font-label-sm text-label-sm text-tertiary font-bold">91.1% Success</span>
                </div>
              </div>

              {/* Funnel Stages */}
              <div className="space-y-space-xs mt-space-md">
                <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-secondary" />
                    <span className="font-body-sm text-body-sm text-on-surface font-medium">1. Created &amp; Confirmed</span>
                  </div>
                  <span className="font-tabular-mono font-bold text-on-surface text-body-sm">140</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary-container" />
                    <span className="font-body-sm text-body-sm text-on-surface font-medium">2. Kitchen Preparing</span>
                  </div>
                  <span className="font-tabular-mono font-bold text-on-surface text-body-sm">310</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-tertiary-fixed-dim" />
                    <span className="font-body-sm text-body-sm text-on-surface font-medium">3. Order Ready at Counter</span>
                  </div>
                  <span className="font-tabular-mono font-bold text-on-surface text-body-sm">118</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-secondary-container" />
                    <span className="font-body-sm text-body-sm text-on-surface font-medium">4. Out for Delivery</span>
                  </div>
                  <span className="font-tabular-mono font-bold text-on-surface text-body-sm">680</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-tertiary" />
                    <span className="font-body-sm text-body-sm text-on-surface font-medium">5. Delivered Successfully</span>
                  </div>
                  <span className="font-tabular-mono font-bold text-tertiary text-body-sm">13,100</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-error" />
                    <span className="font-body-sm text-body-sm text-error font-medium">6. Cancelled / Failed</span>
                  </div>
                  <span className="font-tabular-mono font-bold text-error text-body-sm">34</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Restaurant Hubs and Fleet Health SLAs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Top Restaurant Hubs */}
          <div className="lg:col-span-8 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col border border-surface-container-high/60">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex flex-col">
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Top Restaurant Hubs</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Merchant GMV, operational ratings and cancellation telemetry</p>
              </div>
              <button
                onClick={() => navigateTo('restaurants')}
                className="h-8 px-3 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold hover:bg-surface-container-high transition-colors"
              >
                View All Merchants
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase">
                    <th className="py-2.5 px-3 rounded-l">Store Name &amp; Area</th>
                    <th className="py-2.5 px-3">Orders</th>
                    <th className="py-2.5 px-3">GMV</th>
                    <th className="py-2.5 px-3">Avg Rating</th>
                    <th className="py-2.5 px-3">Cancel Rate</th>
                    <th className="py-2.5 px-3 rounded-r text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y-0">
                  {restaurants.slice(0, 5).map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => navigateTo('restaurants/detail', { restaurantId: r.id })}
                      className="hover:bg-surface-container-low transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={r.image}
                            alt={r.name}
                            className="w-8 h-8 rounded-lg object-cover bg-surface-container-high"
                          />
                          <div className="flex flex-col">
                            <span className="font-body-md text-body-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                              {r.name}
                            </span>
                            <span className="font-label-sm text-label-sm text-on-surface-variant">
                              {r.address}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-tabular-mono text-body-md text-on-surface">
                        {r.ordersToday}
                      </td>
                      <td className="py-3 px-3 font-tabular-mono font-bold text-body-md text-on-surface">
                        ₹{(r.gmvToday).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 font-label-md text-label-md font-bold text-tertiary">
                          <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>{' '}
                          {r.rating}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-tabular-mono text-body-md text-tertiary font-medium">
                        {r.cancellationRate}%
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${
                            r.status === 'ONLINE'
                              ? 'bg-tertiary-container/15 text-tertiary'
                              : r.status === 'BUSY'
                              ? 'bg-secondary-fixed text-on-secondary-fixed'
                              : 'bg-error-container text-on-error-container'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fleet Health & SLAs */}
          <div className="lg:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between border border-surface-container-high/60">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Fleet Health &amp; SLAs</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Courier efficiency benchmark metrics</p>
                </div>
                <span className="material-symbols-outlined text-tertiary text-[20px]">speed</span>
              </div>

              <div className="grid grid-cols-2 gap-space-sm mb-space-md">
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Avg Delivery Time</span>
                  <div className="font-headline-md text-headline-md font-bold text-on-surface font-tabular-mono my-1">
                    28.4 <span className="text-body-sm font-normal text-on-surface-variant">mins</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-tertiary font-bold">▼ 2.1m faster vs SLA</span>
                </div>

                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Pickup Wait Time</span>
                  <div className="font-headline-md text-headline-md font-bold text-on-surface font-tabular-mono my-1">
                    7.2 <span className="text-body-sm font-normal text-on-surface-variant">mins</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-tertiary font-bold">Optimal kitchen ready</span>
                </div>

                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Acceptance Rate</span>
                  <div className="font-headline-md text-headline-md font-bold text-secondary font-tabular-mono my-1">
                    96.4%
                  </div>
                  <span className="font-label-sm text-label-sm text-tertiary font-bold">High driver match</span>
                </div>

                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Courier Drop Rate</span>
                  <div className="font-headline-md text-headline-md font-bold text-on-surface font-tabular-mono my-1">
                    1.2%
                  </div>
                  <span className="font-label-sm text-label-sm text-tertiary font-bold">Within 2.0% threshold</span>
                </div>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container-high flex flex-col gap-2">
              <div className="flex items-center justify-between text-on-surface">
                <span className="font-label-md text-label-md font-semibold">Active Fleet Distribution</span>
                <span className="font-tabular-mono text-label-sm font-bold">4,890 Total</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2.5 rounded-full overflow-hidden flex">
                <div className="bg-secondary h-full" style={{ width: '74%' }} title="En Route" />
                <div className="bg-tertiary-container h-full" style={{ width: '22%' }} title="Available" />
                <div className="bg-primary h-full" style={{ width: '4%' }} title="Off-duty" />
              </div>
              <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant pt-1">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-secondary" />En Route (74%)</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-tertiary-container" />Available (22%)</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />Off-duty (4%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Critical Orders & Live Platform Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Recent Orders Table */}
          <div className="lg:col-span-8 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col border border-surface-container-high/60">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex flex-col">
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Recent Critical Orders</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Live in-flight dispatches and customer delivery progress</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('orders')}
                  className="h-8 px-3 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Filter Status
                </button>
                <button
                  onClick={() => {
                    const rows = filteredOrders.map((o) => ({
                      OrderID: o.id,
                      Customer: o.customerName,
                      Restaurant: o.restaurantName,
                      Amount: o.totalAmount,
                      Status: o.status,
                      Payment: o.paymentMethod,
                    }));
                    exportToCSV('Belzo_Recent_Orders', rows);
                    addToast({ type: 'SUCCESS', title: 'Orders Exported', message: 'CSV downloaded successfully.' });
                  }}
                  className="h-8 px-3 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-colors shadow-xs"
                >
                  Export All
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase">
                    <th className="py-2.5 px-3 rounded-l">Order ID &amp; Customer</th>
                    <th className="py-2.5 px-3">Merchant</th>
                    <th className="py-2.5 px-3">Items Summary</th>
                    <th className="py-2.5 px-3">Total</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Rider &amp; ETA</th>
                    <th className="py-2.5 px-3 rounded-r text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y-0 font-body-sm text-body-sm">
                  {filteredOrders.slice(0, 5).map((o) => (
                    <tr
                      key={o.id}
                      onClick={() => navigateTo('orders/detail', { orderId: o.id })}
                      className="hover:bg-surface-container-low transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-tabular-mono font-bold text-secondary group-hover:text-primary transition-colors">
                            {o.id}
                          </span>
                          <span className="text-on-surface font-medium">{o.customerName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-on-surface">{o.restaurantName}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-on-surface-variant truncate max-w-[150px] block" title={o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}>
                          {o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-tabular-mono font-bold text-on-surface">
                        ₹{o.totalAmount}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${
                            o.status === 'OUT_FOR_DELIVERY'
                              ? 'bg-secondary-fixed text-on-secondary-fixed'
                              : o.status === 'READY_FOR_PICKUP'
                              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                              : o.status === 'PREPARING'
                              ? 'bg-primary-fixed text-on-primary-fixed'
                              : 'bg-surface-container-high text-on-surface'
                          }`}
                        >
                          <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col font-label-sm text-label-sm">
                          <span className="font-medium text-on-surface">
                            {o.deliveryPartnerName || 'Auto-matching'}
                          </span>
                          <span className="text-secondary font-bold font-tabular-mono">
                            {o.etaMinutes ? `${o.etaMinutes} mins left` : 'Optimal'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo('orders/detail', { orderId: o.id });
                          }}
                          className="h-7 px-2.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-label-sm font-semibold transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Platform Stream */}
          <div className="lg:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between border border-surface-container-high/60">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Live Platform Stream</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Real-time WebSocket event bus</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-container/15 text-tertiary font-label-sm text-label-sm font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-tertiary animate-ping" /> Live
                </span>
              </div>

              <div className="space-y-space-sm">
                <div
                  onClick={() => navigateTo('orders/detail', { orderId: 'ORD-10298' })}
                  className="flex gap-3 p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <div className="p-1.5 rounded-full bg-secondary/10 text-secondary h-fit">
                    <span className="material-symbols-outlined text-[16px]">restaurant</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-sm text-body-sm text-on-surface">
                      Order <span className="font-tabular-mono font-bold text-secondary">#BG10298</span> accepted by Spice Garden
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">1m ago · Koramangala Hub</span>
                  </div>
                </div>

                <div
                  onClick={() => navigateTo('delivery-partners/detail', { partnerId: 'DP-1108' })}
                  className="flex gap-3 p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <div className="p-1.5 rounded-full bg-tertiary/10 text-tertiary h-fit">
                    <span className="material-symbols-outlined text-[16px]">two_wheeler</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-sm text-body-sm text-on-surface">
                      Delivery partner <span className="font-semibold">Vikas</span> accepted assignment for <span className="font-tabular-mono font-bold text-secondary">#BG10292</span>
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">2m ago · Indiranagar Hub</span>
                  </div>
                </div>

                <div
                  onClick={() => navigateTo('orders/detail', { orderId: 'ORD-10290' })}
                  className="flex gap-3 p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <div className="p-1.5 rounded-full bg-primary/10 text-primary h-fit">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-sm text-body-sm text-on-surface">
                      Restaurant Tandoori House marked order <span className="font-tabular-mono font-bold text-secondary">#BG10290</span> Ready
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">3m ago · Dispatch Queue</span>
                  </div>
                </div>

                <div
                  onClick={() => navigateTo('refunds')}
                  className="flex gap-3 p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <div className="p-1.5 rounded-full bg-error/10 text-error h-fit">
                    <span className="material-symbols-outlined text-[16px]">currency_exchange</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-sm text-body-sm text-on-surface">
                      Refund <span className="font-tabular-mono font-bold text-error">₹450</span> approved for <span className="font-tabular-mono font-bold text-secondary">#BG10211</span> by Finance Admin
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">5m ago · Escrow Settled</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateTo('audit-logs')}
              type="button"
              className="w-full mt-space-md py-2 text-center rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors"
            >
              View Complete Audit Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
