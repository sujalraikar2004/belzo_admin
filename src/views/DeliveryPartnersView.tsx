import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { mockStore } from '../mock/mockStore';
import { exportToCSV } from '../services/api';
import { DeliveryPartner } from '../types';

export const DeliveryPartnersView: React.FC = () => {
  const { navigateTo, addToast, setDispatchActionModalOpen } = useUIStore();
  const [couriers, setCouriers] = useState<DeliveryPartner[]>(mockStore.getDeliveryPartners());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [vehicleFilter, setVehicleFilter] = useState('ALL');
  const [kycFilter, setKycFilter] = useState('ALL');

  useEffect(() => {
    return mockStore.subscribe(() => {
      setCouriers([...mockStore.getDeliveryPartners()]);
    });
  }, []);

  const filteredCouriers = couriers.filter((c) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.vehicleNumber.toLowerCase().includes(q) ||
        c.cluster.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (statusFilter !== 'ALL' && c.dutyStatus !== statusFilter) return false;
    if (zoneFilter !== 'ALL' && !c.cluster.toLowerCase().includes(zoneFilter.toLowerCase())) return false;
    if (vehicleFilter !== 'ALL') {
      if (vehicleFilter === 'EV' && !c.isElectric) return false;
      if (vehicleFilter === 'PETROL' && c.isElectric) return false;
    }
    if (kycFilter !== 'ALL' && c.kycStatus !== kycFilter) return false;

    return true;
  });

  const handleExport = () => {
    const rows = filteredCouriers.map((c) => ({
      RiderCode: c.code,
      Name: c.name,
      Phone: c.phone,
      Vehicle: c.vehicleModel,
      VehicleNumber: c.vehicleNumber,
      BatteryOrFuel: `${c.batteryOrFuelPercent}%`,
      DutyStatus: c.dutyStatus,
      Rating: c.rating,
      CompletedToday: c.completedDeliveriesToday,
      ShiftHours: c.shiftHoursToday,
      EarningsToday: `₹${c.earningsToday}`,
      KYC: c.kycStatus,
    }));
    exportToCSV('Belzo_Delivery_Fleet', rows);
    addToast({
      type: 'SUCCESS',
      title: 'Fleet Report Exported',
      message: `${rows.length} courier partner logs saved to CSV.`,
    });
  };

  const handleVerifyKyc = (c: DeliveryPartner) => {
    mockStore.verifyPartnerKyc(c.id);
    addToast({
      type: 'SUCCESS',
      title: 'Courier KYC Approved',
      message: `${c.name} has been verified and marked ready for duty.`,
    });
  };

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Top Context & Action Strip */}
      <div className="pt-space-md pb-space-lg flex flex-col xl:flex-row xl:items-center xl:justify-between gap-space-md">
        <div className="flex flex-col space-y-space-2xs">
          <nav className="flex items-center gap-space-2xs text-on-surface-variant font-label-sm text-label-sm">
            <span onClick={() => navigateTo('live-operations')} className="hover:text-on-surface cursor-pointer">
              Operations
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">Delivery Partners</span>
          </nav>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Delivery Partner Fleet Hub
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-tertiary-container/15 text-tertiary font-label-sm text-label-sm font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" /> 4,890 Active
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Live fleet telemetry, onboarding verifications, shift performance, and courier allocations across active cities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="flex items-center bg-surface-container-low px-3 py-1.5 rounded-lg text-on-surface font-label-md text-label-md border border-surface-container-high/40">
            <span className="material-symbols-outlined text-primary text-[18px] mr-1.5">share_location</span>
            <span>Bengaluru Central &amp; South</span>
            <span className="material-symbols-outlined text-[16px] ml-1 text-on-surface-variant">expand_more</span>
          </div>

          <button
            onClick={handleExport}
            className="h-9 px-3.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm hover:bg-surface-container-low transition-all flex items-center gap-1.5 border border-surface-container-high/60"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">download</span>
            <span>Export Shift Report</span>
          </button>

          <button
            onClick={() => setDispatchActionModalOpen(true)}
            className="h-9 px-3.5 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-container-highest transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-primary text-[18px]">campaign</span>
            <span>Broadcast Fleet Alert</span>
          </button>

          <button
            onClick={() => {
              addToast({
                type: 'INFO',
                title: 'Courier Registration',
                message: 'Dispatch agent terminal opened for onboarding walk-in drivers.',
              });
            }}
            className="h-9 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary-container transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Onboard New Courier</span>
          </button>
        </div>
      </div>

      {/* KPI Fleet Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-lg">
        {/* Card 1 */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden border border-surface-container-high/60">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Total Active Couriers
              </span>
              <span className="font-headline-xl text-headline-xl font-bold text-on-surface mt-1 font-tabular-mono">
                4,890
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">two_wheeler</span>
            </div>
          </div>
          <div className="mt-space-sm pt-space-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
              <span className="text-tertiary font-bold flex items-center">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>+12%
              </span>
              <span>vs last week</span>
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              <span className="font-semibold text-on-surface">3,620</span> moving • <span className="font-semibold text-on-surface">1,270</span> idle
            </div>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-primary h-full rounded-full" style={{ width: '74%' }} />
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden border border-surface-container-high/60">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Fleet SLA &amp; Punctuality
              </span>
              <span className="font-headline-xl text-headline-xl font-bold text-on-surface mt-1 font-tabular-mono">
                98.2%
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[22px]">timer</span>
            </div>
          </div>
          <div className="mt-space-sm pt-space-xs flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-semibold">
              Optimal
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Avg: <strong className="text-on-surface font-tabular-mono">28.4m</strong> (Target 30m)
            </span>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-tertiary h-full rounded-full" style={{ width: '98%' }} />
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden border border-surface-container-high/60">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Avg Hourly Earnings
              </span>
              <span className="font-headline-xl text-headline-xl font-bold text-on-surface mt-1 font-tabular-mono">
                ₹185<span className="text-headline-sm font-normal text-on-surface-variant">/hr</span>
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[22px]">currency_rupee</span>
            </div>
          </div>
          <div className="mt-space-sm pt-space-xs flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Surge/Incentive pool</span>
            <span className="font-tabular-mono text-secondary font-bold">₹4.8L deployed</span>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-secondary-container h-full rounded-full" style={{ width: '62%' }} />
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden border border-surface-container-high/60">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Pending Verifications
              </span>
              <span className="font-headline-xl text-headline-xl font-bold text-on-surface mt-1 font-tabular-mono">
                42 <span className="text-headline-sm font-normal text-on-surface-variant">Riders</span>
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-error-container/60 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[22px]">pending_actions</span>
            </div>
          </div>
          <div className="mt-space-sm pt-space-xs flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
              Amber Alert
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">DL &amp; BG checks pending</span>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-primary-container h-full rounded-full" style={{ width: '35%' }} />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md mb-space-md flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm border border-surface-container-high/60">
        <div className="relative flex-1 min-w-[280px]">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Courier Name, Phone, Vehicle Number, or Rider ID..."
            className="w-full h-10 pl-9 pr-10 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest transition-all border border-surface-container-high/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-space-xs">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm font-medium focus:outline-none cursor-pointer border border-surface-container-high/40"
            >
              <option value="ALL">Status: All Statuses</option>
              <option value="AVAILABLE">Available (Idle)</option>
              <option value="DELIVERING">Delivering Order</option>
              <option value="EN_ROUTE_TO_STORE">En Route to Store</option>
              <option value="OFFLINE">Offline / Onboarding</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm font-medium focus:outline-none cursor-pointer border border-surface-container-high/40"
            >
              <option value="ALL">Zone: All Clusters</option>
              <option value="Koramangala">Koramangala</option>
              <option value="Indiranagar">Indiranagar</option>
              <option value="HSR">HSR Layout</option>
              <option value="Whitefield">Whitefield</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm font-medium focus:outline-none cursor-pointer border border-surface-container-high/40"
            >
              <option value="ALL">Vehicle: All Types</option>
              <option value="EV">Electric Vehicles (EV)</option>
              <option value="PETROL">Petrol Two-Wheelers</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm font-medium focus:outline-none cursor-pointer border border-surface-container-high/40"
            >
              <option value="ALL">KYC: All States</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending Audit</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setZoneFilter('ALL');
              setVehicleFilter('ALL');
              setKycFilter('ALL');
            }}
            className="h-9 w-9 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-colors"
            title="Reset Filters"
          >
            <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
          </button>
        </div>
      </div>

      {/* Primary Fleet Data Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col mb-space-lg border border-surface-container-high/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/60 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider h-10 select-none">
                <th className="py-2.5 px-4 w-12 text-center" />
                <th className="py-2.5 px-4 font-semibold">Courier / ID</th>
                <th className="py-2.5 px-4 font-semibold">Contact &amp; Cluster</th>
                <th className="py-2.5 px-4 font-semibold">Vehicle &amp; Telemetry</th>
                <th className="py-2.5 px-4 font-semibold">Duty Status</th>
                <th className="py-2.5 px-4 font-semibold text-center">Shift Metrics</th>
                <th className="py-2.5 px-4 font-semibold">Rating</th>
                <th className="py-2.5 px-4 font-semibold">Earnings</th>
                <th className="py-2.5 px-4 font-semibold">KYC</th>
                <th className="py-2.5 px-4 font-semibold text-right pr-6">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/40 text-on-surface font-body-sm text-body-sm">
              {filteredCouriers.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigateTo('delivery-partners/detail', { partnerId: c.id })}
                  className="hover:bg-surface-container-low/40 transition-colors group cursor-pointer"
                >
                  <td onClick={(e) => e.stopPropagation()} className="py-3 px-4 text-center">
                    <input type="checkbox" className="w-4 h-4 rounded text-primary accent-primary cursor-pointer" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-space-sm">
                      <div className="relative">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-surface-container-high"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-surface-container-lowest ${
                            c.dutyStatus === 'AVAILABLE'
                              ? 'bg-tertiary'
                              : c.dutyStatus === 'DELIVERING'
                              ? 'bg-secondary'
                              : 'bg-on-surface-variant'
                          }`}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline-sm text-headline-sm font-semibold text-on-surface leading-snug group-hover:text-primary transition-colors">
                          {c.name}
                        </span>
                        <div className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant font-mono">
                          <span>{c.code}</span>
                          <span>•</span>
                          <span>Since 2023</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-tabular-mono text-on-surface">{c.phone}</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{c.cluster}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 font-medium text-on-surface">
                        <span className="material-symbols-outlined text-[16px] text-tertiary">
                          {c.isElectric ? 'electric_moped' : 'two_wheeler'}
                        </span>
                        <span>{c.vehicleModel}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">{c.vehicleNumber}</span>
                        <span className="text-tertiary text-[11px] font-bold font-mono">
                          {c.batteryOrFuelPercent}% {c.isElectric ? 'bat' : 'fuel'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold ${
                        c.dutyStatus === 'DELIVERING'
                          ? 'bg-secondary/10 text-secondary'
                          : c.dutyStatus === 'AVAILABLE'
                          ? 'bg-tertiary/10 text-tertiary'
                          : c.dutyStatus === 'EN_ROUTE_TO_STORE'
                          ? 'bg-primary-fixed text-primary'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {c.dutyStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-tabular-mono font-bold text-on-surface">{c.completedDeliveriesToday} completed</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {c.shiftHoursToday} hrs • {c.acceptanceRate}% accept
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span className="font-tabular-mono font-bold text-on-surface">{c.rating}</span>
                      <span className="text-on-surface-variant text-[11px]">({c.ratingCount})</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface font-tabular-mono">
                      ₹{c.earningsToday}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                        c.kycStatus === 'VERIFIED'
                          ? 'bg-tertiary/10 text-tertiary'
                          : 'bg-error-container text-on-error-container animate-pulse'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {c.kycStatus === 'VERIFIED' ? 'check_circle' : 'warning'}
                      </span>
                      {c.kycStatus}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()} className="py-3 px-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-1">
                      {c.kycStatus === 'PENDING' ? (
                        <button
                          onClick={() => handleVerifyKyc(c)}
                          className="h-7 px-2.5 rounded bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-colors"
                        >
                          Verify DL
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => navigateTo('live-operations', { partnerId: c.id })}
                            className="w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
                            title="Live Track"
                          >
                            <span className="material-symbols-outlined text-[18px]">location_searching</span>
                          </button>
                          <button
                            onClick={() => addToast({ type: 'INFO', title: 'Calling Partner', message: `Bridging audio to ${c.phone}` })}
                            className="w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
                            title="Call Courier"
                          >
                            <span className="material-symbols-outlined text-[18px]">call</span>
                          </button>
                          <button
                            onClick={() => navigateTo('delivery-partners/detail', { partnerId: c.id })}
                            className="w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
                            title="View Dossier"
                          >
                            <span className="material-symbols-outlined text-[18px]">badge</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Density & Surge Operations Footer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col justify-between border border-surface-container-high/60">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Bengaluru Real-Time Zone Dispatch Density
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping" /> Live GPS Relay
            </span>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl space-y-2">
            <div className="flex items-center justify-between text-body-sm">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> High Surge: Koramangala (1.4x)</span>
              <span className="font-tabular-mono font-bold text-primary">84 orders waiting</span>
            </div>
            <div className="flex items-center justify-between text-body-sm">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-tertiary" /> Adequate Fleet: Indiranagar</span>
              <span className="font-tabular-mono font-bold text-tertiary">42 idle couriers</span>
            </div>
            <div className="flex items-center justify-between text-body-sm">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-secondary" /> Order Backlog: HSR Layout</span>
              <span className="font-tabular-mono font-bold text-secondary">3.8 mins wait SLA</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col justify-between border border-surface-container-high/60">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Priority Dispatch Operations</h3>
              <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">
                Rain Alert
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
              Monsoon showers detected in South BLR. Monsoon incentive buffer (+₹25/order) is ready for zone trigger.
            </p>
            <div className="p-3 rounded-lg bg-surface-container-low space-y-2 mb-space-sm">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-on-surface">Fleet Rainy Gear Compliance</span>
                <span className="font-tabular-mono text-tertiary font-bold">91.4%</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                <div className="bg-tertiary h-full rounded-full" style={{ width: '91%' }} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                addToast({
                  type: 'SUCCESS',
                  title: '₹25 Rain Surge Triggered',
                  message: 'Applied to Koramangala & Indiranagar zones.',
                });
              }}
              className="w-full h-9 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <span>Activate ₹25 Surge in Central BLR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
