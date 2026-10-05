import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { mockStore } from '../mock/mockStore';
import { exportToCSV } from '../services/api';
import { Order } from '../types';

export const OrdersView: React.FC = () => {
  const { navigateTo, addToast, openConfirm } = useUIStore();
  const [orders, setOrders] = useState<Order[]>(mockStore.getOrders());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState('ALL');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedTicketSize, setSelectedTicketSize] = useState('ALL');
  const [datePreset, setDatePreset] = useState<'Today' | 'Yesterday' | 'Past7D'>('Today');

  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    return mockStore.subscribe(() => {
      setOrders([...mockStore.getOrders()]);
    });
  }, []);

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.restaurantName.toLowerCase().includes(q) ||
        (o.deliveryPartnerName && o.deliveryPartnerName.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (selectedStatus !== 'ALL') {
      if (selectedStatus === 'ACTIVE' && (o.status === 'DELIVERED' || o.status === 'COMPLETED' || o.status === 'REFUNDED')) return false;
      if (selectedStatus !== 'ACTIVE' && o.status !== selectedStatus) return false;
    }

    if (selectedPayment !== 'ALL') {
      if (selectedPayment === 'COD' && o.paymentMethod !== 'CASH_ON_DELIVERY') return false;
      if (selectedPayment === 'PAID' && o.paymentStatus !== 'PAID') return false;
      if (selectedPayment === 'REFUNDED' && o.paymentStatus !== 'REFUNDED') return false;
    }

    if (selectedZone !== 'ALL') {
      if (selectedZone === 'BLR' && o.city !== 'Bengaluru') return false;
      if (selectedZone === 'PUN' && o.city !== 'Pune') return false;
      if (selectedZone === 'BOM' && o.city !== 'Mumbai') return false;
      if (selectedZone === 'HYD' && o.city !== 'Hyderabad') return false;
    }

    if (selectedTicketSize !== 'ALL') {
      if (selectedTicketSize === 'UNDER_300' && o.totalAmount >= 300) return false;
      if (selectedTicketSize === '300_1000' && (o.totalAmount < 300 || o.totalAmount > 1000)) return false;
      if (selectedTicketSize === 'ABOVE_1000' && o.totalAmount <= 1000) return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowIds(new Set(paginatedOrders.map((o) => o.id)));
    } else {
      setSelectedRowIds(new Set());
    }
  };

  const toggleRow = (id: string) => {
    const next = new Set(selectedRowIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRowIds(next);
  };

  const handleExportCSV = () => {
    const rows = filteredOrders.map((o) => ({
      OrderID: o.id,
      Date: o.date,
      Time: o.createdAt,
      Customer: o.customerName,
      Phone: o.customerPhone,
      Restaurant: o.restaurantName,
      Courier: o.deliveryPartnerName || 'Unassigned',
      TotalAmount: o.totalAmount,
      PaymentMethod: o.paymentMethod,
      PaymentStatus: o.paymentStatus,
      OrderStatus: o.status,
    }));
    exportToCSV('Belzo_Orders_Export', rows);
    addToast({
      type: 'SUCCESS',
      title: 'Orders Exported Successfully',
      message: `${rows.length} order records written to CSV.`,
    });
    setIsBulkOpen(false);
  };

  const handleBatchHalt = () => {
    openConfirm({
      title: 'Emergency Zone Ingress Halt',
      message: 'Halt all incoming dispatches across selected orders and trigger auto-rerouting?',
      impact: 'Kitchen dispatch will pause on 3 cluster hubs.',
      confirmText: 'Execute Zone Halt',
      isDestructive: true,
      onConfirm: () => {
        addToast({
          type: 'WARNING',
          title: 'Cluster Ingress Halted',
          message: 'Emergency buffer active. Logistics control notified.',
        });
      },
    });
    setIsBulkOpen(false);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedPayment('ALL');
    setSelectedZone('ALL');
    setSelectedTicketSize('ALL');
    setDatePreset('Today');
    setCurrentPage(1);
    addToast({ type: 'INFO', title: 'Filters Reset', message: 'Showing complete order book.' });
  };

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Sub-header Breadcrumb & Operational Bar */}
      <div className="py-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider mb-1">
            <span>Operations</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-bold">Fulfillment &amp; Routing</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
            Orders Management
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Search, filter, inspect, and manage orders across all partner restaurants and delivery zones
          </p>
        </div>

        {/* Quick Status Action Bar */}
        <div className="flex items-center flex-wrap gap-space-xs self-start md:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md shadow-sm border border-surface-container-high/40">
            <span className="h-2 w-2 rounded-full bg-tertiary-container animate-pulse" />
            <span className="font-semibold">Live Stream Sync</span>
            <span className="text-on-surface-variant font-tabular-mono text-tabular-mono ml-1">0.4s</span>
          </div>

          <button
            onClick={() => {
              setOrders([...mockStore.getOrders()]);
              addToast({ type: 'SUCCESS', title: 'Orders Refreshed', message: 'Data synced with real-time stream.' });
            }}
            type="button"
            className="h-9 px-3 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors shadow-sm flex items-center gap-1.5 font-label-md text-label-md border border-surface-container-high/60 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">sync</span>
            <span>Refresh</span>
          </button>

          <div className="relative inline-block text-left">
            <button
              onClick={() => setIsBulkOpen(!isBulkOpen)}
              type="button"
              className="h-9 px-3.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors shadow-sm flex items-center gap-1.5 font-label-md text-label-md border border-surface-container-high/60"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span>Bulk Actions</span>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">keyboard_arrow_down</span>
            </button>
            {isBulkOpen && (
              <div className="absolute right-0 mt-1 w-56 rounded-xl bg-surface-container-lowest shadow-xl z-50 p-1.5 flex flex-col gap-1 border border-surface-container-high animate-in fade-in duration-150">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container-high font-body-sm text-body-sm text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-tertiary">csv</span>
                  <span>Export Filtered (CSV)</span>
                </button>
                <button
                  onClick={() => {
                    setIsBulkOpen(false);
                    addToast({ type: 'INFO', title: 'Batch Invoices Generated', message: 'Ready for print queue.' });
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface hover:bg-surface-container-high font-body-sm text-body-sm text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">print</span>
                  <span>Print Batch Tax Invoices</span>
                </button>
                <button
                  onClick={handleBatchHalt}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-error hover:bg-error-container/40 font-body-sm text-body-sm text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">broadcast_on_personal</span>
                  <span>Emergency Zone Halt</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              mockStore.createManualOrder({
                customerName: 'VIP Customer Service Override',
                itemsSubtotal: 820,
              });
              addToast({ type: 'SUCCESS', title: 'Override Order Placed', message: 'Pushed directly to KDS preparing state.' });
            }}
            type="button"
            className="h-9 px-3.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all shadow-md flex items-center gap-1.5 font-label-md text-label-md active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Manual Override Order</span>
          </button>
        </div>
      </div>

      {/* Operational KPI Pulse Trackers */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-space-sm mb-space-md">
        <div className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-surface-container-high/60">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Active Pipeline</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-headline-md text-headline-md font-bold text-on-surface font-tabular-mono">1,248</span>
            <span className="inline-flex items-center text-tertiary font-label-sm text-label-sm font-semibold bg-tertiary-fixed/30 px-1.5 py-0.5 rounded">↑ 8.4%</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-secondary-container h-full rounded-full" style={{ width: '68%' }} />
          </div>
        </div>

        <div className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-surface-container-high/60">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Preparing in Kitchen</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-headline-md text-headline-md font-bold text-primary-container font-tabular-mono">412</span>
            <span className="text-on-surface-variant font-label-sm text-label-sm">Avg 14m</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-primary-container h-full rounded-full" style={{ width: '44%' }} />
          </div>
        </div>

        <div className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-surface-container-high/60">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Out for Delivery</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-headline-md text-headline-md font-bold text-secondary font-tabular-mono">684</span>
            <span className="inline-flex items-center text-tertiary font-label-sm text-label-sm font-semibold bg-tertiary-fixed/30 px-1.5 py-0.5 rounded">98.2% SLA</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: '82%' }} />
          </div>
        </div>

        <div className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-surface-container-high/60">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Delivered Today</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-headline-md text-headline-md font-bold text-tertiary font-tabular-mono">11,840</span>
            <span className="text-on-surface-variant font-label-sm text-label-sm font-tabular-mono">₹92.4L GMV</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-tertiary-container h-full rounded-full" style={{ width: '91%' }} />
          </div>
        </div>

        <div className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-surface-container-high/60">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Scheduled Advance</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-headline-md text-headline-md font-bold text-on-surface font-tabular-mono">1,260</span>
            <span className="text-on-surface-variant font-label-sm text-label-sm">Next 6 hrs</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-outline h-full rounded-full" style={{ width: '35%' }} />
          </div>
        </div>

        <div className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-surface-container-high/60">
          <span className="font-label-sm text-label-sm text-error uppercase tracking-wider font-semibold">Exceptions / Breached</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-headline-md text-headline-md font-bold text-error font-tabular-mono">34</span>
            <span className="inline-flex items-center text-error font-label-sm text-label-sm font-semibold bg-error-container px-1.5 py-0.5 rounded">0.23%</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-error h-full rounded-full" style={{ width: '14%' }} />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar Console */}
      <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm mb-space-md flex flex-col gap-space-sm border border-surface-container-high/60">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-space-sm">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              manage_search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID (e.g. BG10293), Customer, Restaurant, or Phone..."
              className="w-full h-11 pl-11 pr-24 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest shadow-inner transition-all border border-surface-container-high/40"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-bold shadow-sm">
                ⌘K
              </kbd>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start lg:self-auto bg-surface-container-low p-1 rounded-xl border border-surface-container-high/40">
            <button
              onClick={() => setDatePreset('Today')}
              className={`h-9 px-3 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 ${
                datePreset === 'Today'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
              <span>Today: Oct 02, 2026</span>
            </button>
            <button
              onClick={() => setDatePreset('Yesterday')}
              className={`h-9 px-3 rounded-lg font-label-md text-label-md transition-all ${
                datePreset === 'Yesterday'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setDatePreset('Past7D')}
              className={`h-9 px-3 rounded-lg font-label-md text-label-md transition-all ${
                datePreset === 'Past7D'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Past 7D
            </button>
          </div>
        </div>

        {/* Faceted Filter Selectors */}
        <div className="flex flex-wrap items-center gap-space-xs pt-space-xs">
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none h-8 pl-3 pr-8 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium cursor-pointer transition-colors focus:outline-none border border-surface-container-high/40"
            >
              <option value="ALL">All Statuses ({orders.length})</option>
              <option value="PREPARING">Preparing (KDS)</option>
              <option value="READY_FOR_PICKUP">Ready for Pickup</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered Successfully</option>
              <option value="CUSTOMER_CANCELLED">Customer Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[16px]">
              expand_more
            </span>
          </div>

          <div className="relative">
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="appearance-none h-8 pl-3 pr-8 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium cursor-pointer transition-colors focus:outline-none border border-surface-container-high/40"
            >
              <option value="ALL">Payment: All</option>
              <option value="PAID">Paid (UPI / Cards)</option>
              <option value="COD">Cash on Delivery</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[16px]">
              expand_more
            </span>
          </div>

          <div className="relative">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="appearance-none h-8 pl-3 pr-8 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium cursor-pointer transition-colors focus:outline-none border border-surface-container-high/40"
            >
              <option value="ALL">All Zones (BLR, PUN, BOM, HYD)</option>
              <option value="BLR">BLR: Bengaluru Clusters</option>
              <option value="PUN">PUN: Pune Clusters</option>
              <option value="BOM">BOM: Mumbai West</option>
              <option value="HYD">HYD: Hyderabad HITEC</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[16px]">
              expand_more
            </span>
          </div>

          <div className="relative">
            <select
              value={selectedTicketSize}
              onChange={(e) => setSelectedTicketSize(e.target.value)}
              className="appearance-none h-8 pl-3 pr-8 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium cursor-pointer transition-colors focus:outline-none border border-surface-container-high/40"
            >
              <option value="ALL">Ticket Size: All</option>
              <option value="UNDER_300">Under ₹300</option>
              <option value="300_1000">₹300 - ₹1000</option>
              <option value="ABOVE_1000">Above ₹1000</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[16px]">
              expand_more
            </span>
          </div>

          <button
            onClick={resetFilters}
            className="h-8 px-2.5 rounded-lg text-primary hover:bg-primary/10 transition-colors font-label-md text-label-md font-semibold flex items-center gap-1 ml-auto"
          >
            <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* High-Density Data Table Card Canvas */}
      <div className="rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden mb-space-md border border-surface-container-high/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider select-none h-10">
                <th className="py-2.5 px-3.5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedOrders.length > 0 && selectedRowIds.size === paginatedOrders.length}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer accent-primary"
                  />
                </th>
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Customer Profile</th>
                <th className="py-2.5 px-3">Restaurant Partner</th>
                <th className="py-2.5 px-3">Delivery Partner</th>
                <th className="py-2.5 px-3">Items Ordered</th>
                <th className="py-2.5 px-3 text-right">Total Amount</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3.5 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/60 font-body-sm text-body-sm text-on-surface">
              {paginatedOrders.map((o) => {
                const isSelected = selectedRowIds.has(o.id);

                return (
                  <tr
                    key={o.id}
                    onClick={() => navigateTo('orders/detail', { orderId: o.id })}
                    className={`hover:bg-surface-container-low/70 transition-colors cursor-pointer group ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td
                      onClick={(e) => e.stopPropagation()}
                      className="py-3 px-3.5 text-center"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(o.id)}
                        className="w-4 h-4 rounded cursor-pointer accent-primary"
                      />
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-tabular-mono text-tabular-mono font-bold text-secondary group-hover:text-primary transition-colors">
                          {o.id}
                        </span>
                        {o.isPriority && (
                          <span className="material-symbols-outlined text-[14px] text-tertiary" title="Priority Route">
                            bolt
                          </span>
                        )}
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {o.city} • App
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-tabular-mono text-tabular-mono font-semibold">
                        {o.createdAt.split(' ')[1] || '14:28'}
                      </span>
                      <span className="block font-label-sm text-label-sm text-on-surface-variant">
                        {o.orderAgeMinutes}m ago
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-on-secondary-fixed text-[11px]">
                          {o.customerName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-on-surface">{o.customerName}</span>
                            <span className="text-amber-500 font-label-sm text-label-sm font-bold">★ 4.9</span>
                          </div>
                          <span className="font-tabular-mono text-tabular-mono text-on-surface-variant text-[11px] block">
                            {o.customerPhone}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{o.restaurantName}</span>
                        <div className="flex items-center gap-1 text-[11px] text-on-surface-variant font-label-sm">
                          <span>{o.restaurantOutlet}</span>
                          <span>•</span>
                          <span className="text-primary font-medium">{o.city}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px] text-secondary">two_wheeler</span>
                        </div>
                        <div>
                          <span className="font-medium text-on-surface">
                            {o.deliveryPartnerName || 'Auto-assigning...'}
                          </span>
                          <div className="flex items-center gap-1 text-[11px]">
                            {o.deliveryPartnerName ? (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-ping" />
                                <span className="text-secondary font-semibold">
                                  {o.etaMinutes ? `${o.etaMinutes}m ETA` : 'Active'}
                                </span>
                              </>
                            ) : (
                              <span className="text-primary font-semibold">Nearest fleet matching</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 max-w-[220px]">
                      <div className="group/tooltip relative">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-low font-label-sm text-label-sm font-medium text-on-surface truncate max-w-full">
                          <span className="font-bold text-primary">{o.items.length} items:</span>{' '}
                          {o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span className="font-tabular-mono text-tabular-mono font-bold text-on-surface text-[14px]">
                        ₹{o.totalAmount}
                      </span>
                      <span className="block text-[10px] text-on-surface-variant">
                        Fee: ₹{o.deliveryFee}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed/40 text-on-tertiary-fixed-variant font-label-sm text-label-sm font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-tertiary-container" />
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold ${
                          o.status === 'OUT_FOR_DELIVERY'
                            ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                            : o.status === 'READY_FOR_PICKUP'
                            ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                            : o.status === 'PREPARING'
                            ? 'bg-primary-fixed text-on-primary-fixed-variant'
                            : o.status === 'DELIVERED'
                            ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                            : 'bg-error-container text-on-error-container'
                        }`}
                      >
                        <span className="h-2 w-2 rounded-full bg-current" />
                        {o.status}
                      </span>
                    </td>
                    <td
                      onClick={(e) => e.stopPropagation()}
                      className="py-3 px-3.5 text-right whitespace-nowrap"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => navigateTo('orders/detail', { orderId: o.id })}
                          className="h-7 w-7 rounded-md hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                          title="View Order Details"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateTo('live-operations', { orderId: o.id })}
                          className="h-7 w-7 rounded-md hover:bg-surface-container-high flex items-center justify-center text-secondary transition-colors"
                          title="Live Route Map"
                        >
                          <span className="material-symbols-outlined text-[18px]">near_me</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Data Table Pagination Bar */}
        <div className="px-space-md py-3 bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-space-sm border-t border-surface-container-high/60">
          <div className="flex items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm">
            <span>
              Showing <strong className="text-on-surface font-tabular-mono">{(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredOrders.length)}</strong> of{' '}
              <strong className="text-on-surface font-tabular-mono">{filteredOrders.length}</strong> orders
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-lg bg-surface-container-low text-on-surface-variant disabled:opacity-40 flex items-center justify-center hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">first_page</span>
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-lg bg-surface-container-low text-on-surface-variant disabled:opacity-40 flex items-center justify-center hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`h-8 w-8 rounded-lg font-tabular-mono text-tabular-mono font-bold flex items-center justify-center transition-all ${
                    currentPage === i + 1
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container-high flex items-center justify-center transition-colors disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container-high flex items-center justify-center transition-colors disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[18px]">last_page</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
