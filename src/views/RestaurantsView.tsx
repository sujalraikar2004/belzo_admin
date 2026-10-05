import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { mockStore } from '../mock/mockStore';
import { exportToCSV } from '../services/api';
import { Restaurant, RestaurantStatus } from '../types';

export const RestaurantsView: React.FC = () => {
  const { navigateTo, addToast, openConfirm } = useUIStore();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockStore.getRestaurants());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [cuisineFilter, setCuisineFilter] = useState('ALL');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Add Restaurant Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newOutlet, setNewOutlet] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newPhone, setNewPhone] = useState('+91 ');
  const [newCuisine, setNewCuisine] = useState('North Indian, Mughlai');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [newCommission, setNewCommission] = useState('18.0');

  // Batch Commission Modal
  const [isBatchCommissionOpen, setIsBatchCommissionOpen] = useState(false);
  const [batchRate, setBatchRate] = useState('17.5');

  useEffect(() => {
    return mockStore.subscribe(() => {
      setRestaurants([...mockStore.getRestaurants()]);
    });
  }, []);

  const filteredRestaurants = restaurants.filter((r) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        r.name.toLowerCase().includes(q) ||
        r.outletName.toLowerCase().includes(q) ||
        r.outletCode.toLowerCase().includes(q) ||
        r.ownerName.toLowerCase().includes(q) ||
        r.fssaiNumber.includes(q);
      if (!match) return false;
    }

    if (filterStatus !== 'ALL') {
      if (filterStatus === 'ONLINE' && r.status !== 'ONLINE') return false;
      if (filterStatus === 'BUSY' && r.status !== 'BUSY') return false;
      if (filterStatus === 'PAUSED' && r.status !== 'PAUSED') return false;
      if (filterStatus === 'PENDING_AUDIT' && r.status !== 'PENDING_AUDIT') return false;
    }

    if (zoneFilter !== 'ALL' && !r.zone.toLowerCase().includes(zoneFilter.toLowerCase())) {
      return false;
    }

    if (cuisineFilter !== 'ALL' && !r.cuisine.some((c) => c.toLowerCase().includes(cuisineFilter.toLowerCase()))) {
      return false;
    }

    return true;
  });

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredRestaurants.map((r) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleExport = () => {
    const rows = filteredRestaurants.map((r) => ({
      OutletID: r.outletCode,
      Name: r.name,
      Outlet: r.outletName,
      Owner: r.ownerName,
      Phone: r.ownerPhone,
      City: r.city,
      Status: r.status,
      Rating: r.rating,
      CommissionRate: `${r.commissionRate}%`,
      OrdersToday: r.ordersToday,
      GMVToday: r.gmvToday,
      FSSAI: r.fssaiNumber,
    }));
    exportToCSV('Belzo_Restaurants_Directory', rows);
    addToast({
      type: 'SUCCESS',
      title: 'Merchant Directory Exported',
      message: `${rows.length} restaurant outlets written to CSV.`,
    });
  };

  const handleAddRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    const cuisines = newCuisine.split(',').map((c) => c.trim()).filter(Boolean);
    const created = mockStore.addRestaurant({
      name: newName,
      outletName: newOutlet || 'Main Hub',
      outletCode: '',
      ownerName: newOwner,
      ownerPhone: newPhone,
      ownerEmail: `${newName.toLowerCase().replace(/\s+/g, '')}@partner.belzo.com`,
      address: `${newOutlet}, ${newCity}`,
      zone: `${newCity} Central`,
      city: newCity,
      lat: 12.9716,
      lng: 77.5946,
      cuisine: cuisines,
      status: 'PENDING_AUDIT',
      isVerified: false,
      rating: 0,
      ratingCount: 0,
      avgPrepTimeMinutes: 15,
      commissionRate: Number(newCommission) || 18,
      ordersToday: 0,
      gmvToday: 0,
      totalOrders: 0,
      totalGmv: 0,
      fssaiNumber: `11226${Date.now().toString().slice(-7)}`,
      fssaiExpiry: '2028-12-31',
      fssaiGrade: 'PENDING',
      operatingHours: '11:00 AM - 11:00 PM',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80',
      bankAccount: {
        accountNumber: '9200200192831',
        ifsc: 'HDFC0001042',
        bankName: 'HDFC Bank',
        beneficiaryName: `${newName} Foods LLP`,
      },
      documents: [
        {
          id: `DOC-${Date.now()}`,
          type: 'FSSAI',
          title: 'Food Safety License',
          documentNumber: '112268899001',
          fileUrl: '#doc',
          status: 'PENDING',
        },
      ],
      onboardingDate: new Date().toISOString().split('T')[0],
      cancellationRate: 0,
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewOutlet('');
    setNewOwner('');
    addToast({
      type: 'SUCCESS',
      title: 'Restaurant Branch Registered',
      message: `${created.name} added to pending verification queue.`,
    });
  };

  const handleApplyBatchCommission = () => {
    const rate = Number(batchRate);
    selectedIds.forEach((id) => {
      mockStore.updateRestaurant(id, { commissionRate: rate });
    });
    addToast({
      type: 'SUCCESS',
      title: 'Batch Commission Updated',
      message: `Set commission to ${rate}% across ${selectedIds.size} outlets.`,
    });
    setIsBatchCommissionOpen(false);
  };

  const handleTogglePause = (r: Restaurant) => {
    mockStore.toggleRestaurantPause(r.id);
    addToast({
      type: r.status === 'PAUSED' ? 'SUCCESS' : 'WARNING',
      title: r.status === 'PAUSED' ? 'Restaurant Resumed' : 'Restaurant Kitchen Paused',
      message: `${r.name} (${r.outletName}) is now ${r.status === 'PAUSED' ? 'ONLINE' : 'PAUSED'}.`,
    });
  };

  const handleApprove = (r: Restaurant) => {
    mockStore.approveRestaurant(r.id);
    addToast({
      type: 'SUCCESS',
      title: 'Restaurant Application Approved',
      message: `${r.name} is now ACTIVE and can accept customer orders.`,
    });
  };

  return (
    <div className="flex flex-col w-full pb-space-2xl">
      {/* Top Operational Context Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md py-space-lg">
        <div className="space-y-space-2xs">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
            <span onClick={() => navigateTo('live-operations')} className="hover:text-on-surface cursor-pointer">
              Operations
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">Restaurants</span>
            <span className="text-on-surface-variant/40 mx-space-2xs">/</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-tabular-mono text-label-sm font-semibold tracking-wide">
              REGION: BLR-CENTRAL-01
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight leading-none mt-1">
            Restaurant Partners Directory
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Merchant lifecycle orchestration, real-time kitchen status, hygiene audits, tiered commissions, and rapid dispatch compliance across regional clusters.
          </p>
        </div>

        {/* Primary Action Controls */}
        <div className="flex flex-wrap items-center gap-space-xs sm:gap-space-sm">
          <button
            onClick={handleExport}
            className="h-9 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md flex items-center gap-1.5 shadow-sm hover:bg-surface-container-low transition-colors border border-surface-container-high/60"
          >
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">ios_share</span>
            <span>Export Merchant Data</span>
          </button>
          <button
            disabled={selectedIds.size === 0}
            onClick={() => setIsBatchCommissionOpen(true)}
            className="h-9 px-3 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-1.5 hover:bg-surface-container-highest transition-colors disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[16px]">percent</span>
            <span>Batch Commission ({selectedIds.size})</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-9 px-3.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1.5 shadow-sm hover:bg-primary-container transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Add Restaurant Branch</span>
          </button>
        </div>
      </div>

      {/* Operational Telemetry / KPI Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-lg">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between border border-surface-container-high/60">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
              Total Active Merchants
            </span>
            <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-tertiary animate-pulse" /> +4.2% MoM
            </span>
          </div>
          <div className="my-space-xs flex items-baseline gap-space-sm">
            <span className="font-headline-xl text-headline-xl text-on-surface font-extrabold tracking-tight font-tabular-mono">
              3,412
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">registered outlets</span>
          </div>
          <div className="flex items-center gap-space-sm pt-space-xs text-on-surface-variant font-body-sm text-body-sm bg-surface-container-low/50 px-2 py-1.5 rounded-lg">
            <span className="flex items-center gap-1 text-tertiary font-medium">
              <span className="h-2 w-2 rounded-full bg-tertiary" /> 3,184 Online
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-on-surface-variant">
              <span className="h-2 w-2 rounded-full bg-secondary" /> 128 Busy
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" /> 100 Paused
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between border border-surface-container-high/60">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
              Average Food Prep Time
            </span>
            <span className="material-symbols-outlined text-[20px] text-tertiary">timer</span>
          </div>
          <div className="my-space-xs flex items-baseline justify-between">
            <div>
              <span className="font-headline-xl text-headline-xl text-on-surface font-extrabold tracking-tight font-tabular-mono">
                14.2
              </span>
              <span className="font-headline-md text-headline-md text-on-surface ml-1">mins</span>
            </div>
            <svg className="w-24 h-8 text-tertiary" fill="none" viewBox="0 0 100 30">
              <path d="M0 24 L20 18 L40 22 L60 12 L80 15 L100 8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
              <path d="M0 24 L20 18 L40 22 L60 12 L80 15 L100 8 V30 H0 Z" fill="currentColor" fillOpacity="0.1" />
            </svg>
          </div>
          <div className="flex items-center justify-between pt-space-xs text-body-sm font-body-sm">
            <span className="text-on-surface-variant">Target SLA &lt; 15 mins</span>
            <span className="font-label-md text-label-md text-tertiary font-bold bg-tertiary/10 px-2 py-0.5 rounded">
              94.8% SLA Hit
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between border border-surface-container-high/60">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
              Merchant GMV (Today)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
              Live Feed
            </span>
          </div>
          <div className="my-space-xs flex items-baseline gap-space-sm">
            <span className="font-headline-xl text-headline-xl text-on-surface font-extrabold tracking-tight font-tabular-mono">
              ₹38.45L
            </span>
            <span className="text-tertiary font-label-md text-label-md font-semibold flex items-center">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> 18.2%
            </span>
          </div>
          <div className="flex items-center justify-between pt-space-xs text-on-surface-variant font-body-sm text-body-sm">
            <span>Avg Ticket Value: <strong className="text-on-surface font-medium font-tabular-mono">₹412</strong></span>
            <span>9,340 Completed</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between border border-surface-container-high/60">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
              Pending Verification
            </span>
            <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold animate-pulse">
              Action Required
            </span>
          </div>
          <div className="my-space-xs flex items-baseline gap-space-sm">
            <span className="font-headline-xl text-headline-xl text-primary font-extrabold tracking-tight font-tabular-mono">
              18
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface-variant font-medium">Outlets Pending</span>
          </div>
          <div className="flex items-center justify-between pt-space-xs text-on-surface-variant font-body-sm text-body-sm">
            <span className="truncate">FSSAI License &amp; GST Audits</span>
            <button
              onClick={() => setFilterStatus('PENDING_AUDIT')}
              className="text-primary font-label-sm text-label-sm font-bold hover:underline flex items-center"
            >
              Review Queue →
            </button>
          </div>
        </div>
      </div>

      {/* Operational Filter & Control Bar */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-md space-y-space-md border border-surface-container-high/60">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Restaurant Name, Outlet ID, Owner Name, or FSSAI number..."
              className="w-full h-10 pl-10 pr-24 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant/60 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner border border-surface-container-high/40"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-on-surface-variant bg-surface-container rounded shadow-sm">
                ESC to clear
              </kbd>
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: 'ALL', label: 'All Partners', count: 3412 },
              { id: 'ONLINE', label: 'Online', count: 3184, dot: 'bg-tertiary' },
              { id: 'BUSY', label: 'High Load', count: 128, dot: 'bg-secondary' },
              { id: 'PAUSED', label: 'Paused', count: 100, dot: 'bg-primary' },
              { id: 'PENDING_AUDIT', label: 'Pending Audit', count: 18, dot: 'bg-error' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setFilterStatus(chip.id)}
                className={`h-9 px-3 rounded-lg font-label-md text-label-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  filterStatus === chip.id
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface'
                }`}
              >
                {chip.dot && <span className={`h-2 w-2 rounded-full ${chip.dot}`} />}
                <span>{chip.label}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[11px] font-tabular-mono font-bold">
                  {chip.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-space-sm pt-space-xs">
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold mb-1">
              Cuisine Speciality
            </label>
            <select
              value={cuisineFilter}
              onChange={(e) => setCuisineFilter(e.target.value)}
              className="w-full h-8 pl-2.5 pr-7 rounded bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none cursor-pointer border border-surface-container-high/40"
            >
              <option value="ALL">All Cuisines</option>
              <option value="North Indian">North Indian &amp; Tandoor</option>
              <option value="South Indian">South Indian Authentic</option>
              <option value="Biryani">Biryani &amp; Mughlai</option>
              <option value="Burgers">Gourmet Burgers</option>
              <option value="Italian">Continental &amp; Italian</option>
              <option value="Desserts">Desserts &amp; Bakery</option>
            </select>
          </div>

          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold mb-1">
              Operational Zone
            </label>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="w-full h-8 pl-2.5 pr-7 rounded bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none cursor-pointer border border-surface-container-high/40"
            >
              <option value="ALL">All Clusters</option>
              <option value="Koramangala">Koramangala</option>
              <option value="Indiranagar">Indiranagar</option>
              <option value="HSR">HSR Layout</option>
              <option value="Whitefield">Whitefield</option>
              <option value="Jayanagar">Jayanagar</option>
              <option value="Bandra">Mumbai - Bandra West</option>
            </select>
          </div>

          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold mb-1">
              Commission Tier
            </label>
            <select className="w-full h-8 pl-2.5 pr-7 rounded bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none cursor-pointer border border-surface-container-high/40">
              <option>All Tiers</option>
              <option>Standard Tier (18.0%)</option>
              <option>Enterprise Anchor (15.0%)</option>
              <option>Cloud Kitchen Hub (22.0%)</option>
            </select>
          </div>

          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold mb-1">
              Hygiene &amp; Rating
            </label>
            <select className="w-full h-8 pl-2.5 pr-7 rounded bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none cursor-pointer border border-surface-container-high/40">
              <option>4.0★ &amp; Above (Good/Elite)</option>
              <option>4.5★ &amp; Above (Super Partner)</option>
              <option>Under 4.0★ (Quality Watch)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('ALL');
                setCuisineFilter('ALL');
                setZoneFilter('ALL');
              }}
              className="w-full h-8 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">filter_alt_off</span>
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Dense Enterprise Data Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-surface-container-high/60">
        {/* Batch selection strip */}
        <div className="bg-surface-container-low px-space-md py-2 flex items-center justify-between border-b border-surface-container-high/40">
          <div className="flex items-center gap-space-sm text-on-surface font-body-sm text-body-sm">
            <input
              type="checkbox"
              id="selectAllCheckbox"
              checked={filteredRestaurants.length > 0 && selectedIds.size === filteredRestaurants.length}
              onChange={(e) => toggleSelectAll(e.target.checked)}
              className="h-4 w-4 rounded-sm accent-primary cursor-pointer"
            />
            <label htmlFor="selectAllCheckbox" className="font-medium cursor-pointer">
              Select All ({filteredRestaurants.length} Outlets)
            </label>
            <span className="text-on-surface-variant/40">|</span>
            <span className="text-on-surface-variant font-label-sm text-label-sm">
              Cluster Latency: <strong className="text-tertiary">22ms</strong>
            </span>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-space-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold mr-1">
                Batch ({selectedIds.size} Selected):
              </span>
              <button
                onClick={() => setIsBatchCommissionOpen(true)}
                className="h-7 px-2.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium transition-colors"
              >
                Adjust Commission
              </button>
              <button
                onClick={() => {
                  selectedIds.forEach((id) => mockStore.toggleRestaurantPause(id));
                  addToast({ type: 'WARNING', title: 'Batch Status Updated', message: 'Toggled pause state.' });
                }}
                className="h-7 px-2.5 rounded bg-error-container text-on-error-container font-label-sm text-label-sm font-bold hover:bg-error/20 transition-colors"
              >
                Bulk Kitchen Pause/Resume
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/70 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider h-9">
                <th className="py-2 px-3 w-10 text-center" />
                <th className="py-2 px-3 min-w-[240px]">Restaurant &amp; Outlet</th>
                <th className="py-2 px-3 min-w-[190px]">Owner / POC Details</th>
                <th className="py-2 px-3 min-w-[180px]">Cuisine &amp; Tags</th>
                <th className="py-2 px-3 min-w-[140px]">Live Kitchen Status</th>
                <th className="py-2 px-3 min-w-[140px] text-right">Orders &amp; GMV Today</th>
                <th className="py-2 px-3 min-w-[130px] text-right">Prep Time &amp; SLA</th>
                <th className="py-2 px-3 min-w-[130px]">Rating &amp; Hygiene</th>
                <th className="py-2 px-3 min-w-[90px] text-center">Commission</th>
                <th className="py-2 px-3 min-w-[160px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/40 text-on-surface font-body-sm text-body-sm">
              {filteredRestaurants.map((r) => {
                const isSelected = selectedIds.has(r.id);

                return (
                  <tr
                    key={r.id}
                    onClick={() => navigateTo('restaurants/detail', { restaurantId: r.id })}
                    className={`hover:bg-surface-container-low/40 transition-colors group cursor-pointer ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td onClick={(e) => e.stopPropagation()} className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(r.id)}
                        className="h-4 w-4 rounded-sm accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-space-sm">
                        <img
                          src={r.image}
                          alt={r.name}
                          className="w-10 h-10 rounded-lg object-cover bg-surface-container-high shadow-sm shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-headline-sm text-headline-sm text-on-surface font-bold truncate group-hover:text-primary transition-colors">
                              {r.name}
                            </span>
                            {r.isVerified && (
                              <span className="material-symbols-outlined text-tertiary text-[16px]" title="Verified">
                                verified
                              </span>
                            )}
                            {r.isEnterprise && (
                              <span className="px-1.5 py-0.2 rounded bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                                ENTERPRISE
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
                            <span className="font-tabular-mono font-medium text-primary">{r.outletCode}</span>
                            <span>•</span>
                            <span className="truncate">{r.outletName}, {r.city}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-on-surface">{r.ownerName}</span>
                        <span className="font-tabular-mono text-on-surface-variant text-[11px]">{r.ownerPhone}</span>
                        <span className="text-on-surface-variant/70 text-[11px] truncate">{r.ownerEmail}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {r.cuisine.map((c) => (
                          <span key={c} className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface text-[11px] font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      {r.status === 'ONLINE' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-container/15 text-tertiary font-label-sm text-label-sm font-bold">
                          <span className="h-2 w-2 rounded-full bg-tertiary-container animate-pulse" />
                          ONLINE
                        </span>
                      )}
                      {r.status === 'BUSY' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 font-label-sm text-label-sm font-bold">
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                          HIGH LOAD / BUSY
                        </span>
                      )}
                      {r.status === 'PAUSED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          PAUSED (Kitchen Peak)
                        </span>
                      )}
                      {r.status === 'PENDING_AUDIT' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold">
                          <span className="h-2 w-2 rounded-full bg-secondary" />
                          PENDING AUDIT
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex flex-col">
                        <span className="font-tabular-mono font-bold text-on-surface">{r.ordersToday} orders</span>
                        <span className="font-tabular-mono text-tertiary font-medium text-label-sm">
                          ₹{r.gmvToday.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex flex-col">
                        <span className="font-tabular-mono font-semibold text-on-surface">{r.avgPrepTimeMinutes}m avg</span>
                        <span className="font-label-sm text-label-sm text-tertiary font-medium">98.2% on-time</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 font-semibold text-on-surface">
                          <span className="material-symbols-outlined text-[16px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                          <span className="font-tabular-mono">{r.rating || '--'}</span>
                          <span className="text-on-surface-variant font-label-sm text-label-sm font-normal">
                            ({r.ratingCount})
                          </span>
                        </div>
                        <span className="font-label-sm text-label-sm text-tertiary font-semibold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[13px]">shield</span> FSSAI Grade {r.fssaiGrade}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-tabular-mono font-bold px-2 py-0.5 rounded bg-surface-container text-on-surface">
                        {r.commissionRate}%
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()} className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.status === 'PENDING_AUDIT' ? (
                          <>
                            <button
                              onClick={() => handleApprove(r)}
                              className="h-7 px-2.5 rounded bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => navigateTo('restaurants/detail', { restaurantId: r.id })}
                              className="h-7 px-2 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm hover:bg-surface-container-highest transition-colors"
                            >
                              Docs
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => navigateTo('restaurants/detail', { restaurantId: r.id })}
                              className="h-7 px-2 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm hover:bg-surface-container-highest transition-colors"
                            >
                              Profile
                            </button>
                            <button
                              onClick={() => handleTogglePause(r)}
                              className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${
                                r.status === 'PAUSED'
                                  ? 'bg-tertiary text-on-tertiary'
                                  : 'bg-surface-container-low text-primary hover:bg-error-container hover:text-on-error-container'
                              }`}
                              title={r.status === 'PAUSED' ? 'Resume Kitchen' : 'Emergency Pause'}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {r.status === 'PAUSED' ? 'play_arrow' : 'pause_circle'}
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="bg-surface-container-low px-space-md py-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-sm border-t border-surface-container-high/60">
          <div className="flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
            <span>
              Showing <strong className="text-on-surface font-medium">1 - {filteredRestaurants.length}</strong> of{' '}
              <strong className="text-on-surface font-medium">3,412</strong> restaurant branches
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button disabled className="h-8 w-8 rounded-lg bg-surface-container-lowest text-on-surface-variant disabled:opacity-40 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="h-8 w-8 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-sm">
              1
            </button>
            <button className="h-8 w-8 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md">
              2
            </button>
            <button className="h-8 w-8 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md">
              3
            </button>
            <span className="px-1 text-on-surface-variant">...</span>
            <button className="h-8 w-8 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md">
              342
            </button>
            <button className="h-8 w-8 rounded-lg bg-surface-container-lowest text-on-surface flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operational Diagnostics & Cluster Health Mini-Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md mt-space-lg">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-space-xs border border-surface-container-high/60">
          <div className="flex items-center justify-between">
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Kitchen Dispatch Telemetry</span>
            <span className="h-2 w-2 rounded-full bg-tertiary" />
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Real-time Kitchen Display Systems (KDS) latency averages 1.4 seconds. Merchant acceptance rate stands at 98.4% across 14 hub zones.
          </p>
          <div className="pt-2 flex items-center justify-between text-label-sm font-label-sm">
            <span className="text-on-surface font-medium">Re-dispatch Triggers: <strong>3 outlets</strong></span>
            <button onClick={() => navigateTo('live-operations')} className="text-primary font-bold hover:underline">
              View SLA Thresholds →
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-space-xs border border-surface-container-high/60">
          <div className="flex items-center justify-between">
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Commission Payout Health</span>
            <span className="material-symbols-outlined text-secondary text-[20px]">account_balance_wallet</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            T+1 daily automated settlement cycle completed for 3,310 outlets. 12 payouts held due to bank IFSC reconciliation.
          </p>
          <div className="pt-2 flex items-center justify-between text-label-sm font-label-sm">
            <span className="text-on-surface font-medium">Settled: <strong>₹32.8L Today</strong></span>
            <button onClick={() => navigateTo('settlements')} className="text-secondary font-bold hover:underline">
              Open Ledger →
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-space-xs border border-surface-container-high/60">
          <div className="flex items-center justify-between">
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">FSSAI Hygiene Audits</span>
            <span className="material-symbols-outlined text-tertiary text-[20px]">verified</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            99.1% compliance with active food safety norms. 4 outlets undergoing physical kitchen inspection in Whitefield.
          </p>
          <div className="pt-2 flex items-center justify-between text-label-sm font-label-sm">
            <span className="text-on-surface font-medium">Expiring &lt; 30d: <strong>14 licenses</strong></span>
            <button onClick={() => setFilterStatus('PENDING_AUDIT')} className="text-tertiary font-bold hover:underline">
              Compliance Portal →
            </button>
          </div>
        </div>
      </div>

      {/* Add Restaurant Branch Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-space-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Onboard Restaurant Outlet
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddRestaurant} className="space-y-3">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold mb-1">
                  Brand Name *
                </label>
                <input
                  required
                  placeholder="e.g. Punjabi Rasoi"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none border border-surface-container-high/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold mb-1">
                    Outlet / Area *
                  </label>
                  <input
                    required
                    placeholder="e.g. HSR Sector 2"
                    value={newOutlet}
                    onChange={(e) => setNewOutlet(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none border border-surface-container-high/40"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold mb-1">
                    City *
                  </label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none border border-surface-container-high/40"
                  >
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Pune">Pune</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold mb-1">
                    Owner / POC Name *
                  </label>
                  <input
                    required
                    placeholder="e.g. Harpreet Singh"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none border border-surface-container-high/40"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold mb-1">
                    POC Phone *
                  </label>
                  <input
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none border border-surface-container-high/40 font-tabular-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold mb-1">
                    Cuisine Tags (Comma separated)
                  </label>
                  <input
                    value={newCuisine}
                    onChange={(e) => setNewCuisine(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none border border-surface-container-high/40"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold mb-1">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newCommission}
                    onChange={(e) => setNewCommission(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none border border-surface-container-high/40 font-tabular-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-surface-container-high">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-9 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container shadow-sm"
                >
                  Submit for FSSAI Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Commission Modal */}
      {isBatchCommissionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-space-lg flex flex-col gap-4">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Batch Commission Update
            </h3>
            <p className="text-body-sm text-on-surface-variant">
              Apply a new take rate across {selectedIds.size} selected merchant outlets.
            </p>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold mb-1">
                New Platform Commission (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={batchRate}
                onChange={(e) => setBatchRate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none border border-surface-container-high/40 font-tabular-mono"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-high">
              <button
                type="button"
                onClick={() => setIsBatchCommissionOpen(false)}
                className="h-9 px-3 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBatchCommission}
                className="h-9 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container shadow-sm"
              >
                Apply to {selectedIds.size} Outlets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
