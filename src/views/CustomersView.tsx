import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { mockStore } from '../mock/mockStore';
import { exportToCSV } from '../services/api';
import { Customer } from '../types';

export const CustomersView: React.FC = () => {
  const { navigateTo, addToast, openConfirm } = useUIStore();
  const [customers, setCustomers] = useState<Customer[]>(mockStore.getCustomers());
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Customer Detail Drawer / Modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [creditAmount, setCreditAmount] = useState('100');
  const [creditReason, setCreditReason] = useState('Apology credit for delivery delay');
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  useEffect(() => {
    return mockStore.subscribe(() => {
      setCustomers([...mockStore.getCustomers()]);
    });
  }, []);

  const filteredCustomers = customers.filter((c) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.id.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (tierFilter !== 'ALL' && c.tier !== tierFilter) return false;
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    return true;
  });

  const handleExport = () => {
    const rows = filteredCustomers.map((c) => ({
      ID: c.id,
      Name: c.name,
      Email: c.email,
      Phone: c.phone,
      Tier: c.tier,
      TotalOrders: c.totalOrders,
      TotalSpend: `₹${c.totalSpend}`,
      AOV: `₹${c.aov}`,
      WalletBalance: `₹${c.walletBalance}`,
      Status: c.status,
      JoinedDate: c.joinedDate,
    }));
    exportToCSV('Belzo_Customers_Registry', rows);
    addToast({
      type: 'SUCCESS',
      title: 'Customer Registry Exported',
      message: `${rows.length} customer records saved to CSV.`,
    });
  };

  const handleSuspendToggle = (customer: Customer) => {
    if (customer.status === 'ACTIVE') {
      openConfirm({
        title: `Suspend Account for ${customer.name}?`,
        message: 'This will prevent the user from placing new orders and freeze active wallet balance.',
        impact: 'Order checkout will be disabled immediately across mobile & web apps.',
        isDestructive: true,
        confirmText: 'Suspend Customer',
        onConfirm: () => {
          mockStore.suspendCustomer(customer.id, 'Administrative policy review');
          addToast({
            type: 'WARNING',
            title: 'Customer Suspended',
            message: `${customer.name} has been suspended.`,
          });
          if (selectedCustomer?.id === customer.id) {
            setSelectedCustomer({ ...customer, status: 'SUSPENDED' });
          }
        },
      });
    } else {
      mockStore.reactivateCustomer(customer.id);
      addToast({
        type: 'SUCCESS',
        title: 'Customer Reactivated',
        message: `${customer.name}'s account is now active.`,
      });
      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer({ ...customer, status: 'ACTIVE' });
      }
    }
  };

  const handleApplyWalletCredit = () => {
    if (!selectedCustomer) return;
    const amt = parseFloat(creditAmount);
    if (isNaN(amt) || amt <= 0) {
      addToast({
        type: 'ERROR',
        title: 'Invalid Amount',
        message: 'Please specify a valid rupee amount.',
      });
      return;
    }

    mockStore.addCustomerWalletCredit(selectedCustomer.id, amt, creditReason);
    addToast({
      type: 'SUCCESS',
      title: 'Wallet Credit Dispatched',
      message: `₹${amt} credited to ${selectedCustomer.name}'s Belzo Wallet.`,
    });
    setIsCreditModalOpen(false);
    setSelectedCustomer({
      ...selectedCustomer,
      walletBalance: selectedCustomer.walletBalance + amt,
    });
  };

  // Metrics
  const totalCustomersCount = customers.length;
  const vipCount = customers.filter((c) => c.tier === 'VIP' || c.tier === 'GOLD').length;
  const totalSpendSum = customers.reduce((acc, c) => acc + c.totalSpend, 0);
  const avgAov = Math.round(totalSpendSum / Math.max(1, customers.reduce((acc, c) => acc + c.totalOrders, 0)));

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Top Context Header */}
      <div className="pt-space-md pb-space-lg flex flex-col xl:flex-row xl:items-center xl:justify-between gap-space-md">
        <div className="flex flex-col space-y-space-2xs">
          <nav className="flex items-center gap-space-2xs text-on-surface-variant font-label-sm text-label-sm">
            <span onClick={() => navigateTo('dashboard')} className="hover:text-on-surface cursor-pointer">
              Overview
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">Customers</span>
          </nav>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Customer Intelligence & User Directory
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
              128,400 Total Users
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Monitor customer spend tiers, lifetime value, loyalty wallets, order history, and handle account governance.
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={handleExport}
            type="button"
            className="px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-label-md text-label-md font-semibold flex items-center gap-space-xs shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Users (CSV)
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase font-semibold">Total Registered</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-primary">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md font-bold text-on-surface">{totalCustomersCount}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">(Sample Set)</span>
          </div>
          <span className="text-[12px] text-tertiary font-medium mt-1">↑ +14.2% month-on-month growth</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase font-semibold">Gold & VIP Tiers</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-amber-600">
              <span className="material-symbols-outlined text-[18px]">military_tech</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md font-bold text-on-surface">{vipCount}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">high-frequency</span>
          </div>
          <span className="text-[12px] text-on-surface-variant mt-1">Accounts with 10+ orders</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase font-semibold">Sample GMV Contribution</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-primary">
              <span className="material-symbols-outlined text-[18px]">currency_rupee</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md font-bold text-on-surface">₹{totalSpendSum.toLocaleString('en-IN')}</span>
          </div>
          <span className="text-[12px] text-tertiary font-medium mt-1">Direct platform spend</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase font-semibold">Avg Basket Size (AOV)</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-emerald-600">
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md font-bold text-on-surface">₹{avgAov}</span>
          </div>
          <span className="text-[12px] text-emerald-600 font-medium mt-1">↑ +8% vs Bangalore avg</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs mb-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by customer name, phone, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-on-surface-variant font-label-sm text-label-sm font-semibold">Tier:</span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-label-md text-label-md focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Tiers</option>
              <option value="VIP">VIP</option>
              <option value="GOLD">Gold</option>
              <option value="SILVER">Silver</option>
              <option value="REGULAR">Regular</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-on-surface-variant font-label-sm text-label-sm font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-label-md text-label-md focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          {(searchQuery || tierFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setTierFilter('ALL');
                setStatusFilter('ALL');
              }}
              type="button"
              className="px-2.5 py-1.5 text-primary text-[12px] font-semibold hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Customer Registry Table */}
      <div className="rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-container-low/40">
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Customer
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Contact
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Tier
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant text-right">
                  Orders
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant text-right">
                  Total Spend
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant text-right">
                  Wallet Balance
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Status
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/60 font-body-md text-body-md">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[36px] mb-2 opacity-50 block">person_off</span>
                    No customers found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const tierBadgeColor =
                    c.tier === 'VIP'
                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                      : c.tier === 'GOLD'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : c.tier === 'SILVER'
                      ? 'bg-slate-100 text-slate-800 border-slate-200'
                      : 'bg-surface-container-high text-on-surface-variant';

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className="hover:bg-surface-container-low/60 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-on-surface block leading-snug">{c.name}</span>
                            <span className="text-[12px] text-on-surface-variant font-mono">{c.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-on-surface block font-mono text-[13px]">{c.phone}</span>
                        <span className="text-[12px] text-on-surface-variant block">{c.email}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${tierBadgeColor}`}>
                          {c.tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-on-surface">{c.totalOrders}</span>
                        <span className="text-[11px] text-on-surface-variant block">orders</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-on-surface">₹{c.totalSpend.toLocaleString('en-IN')}</span>
                        <span className="text-[11px] text-on-surface-variant block">AOV: ₹{c.aov}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-primary">₹{c.walletBalance}</span>
                        <span className="text-[11px] text-on-surface-variant block">Available</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            c.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedCustomer(c);
                              setIsCreditModalOpen(true);
                            }}
                            type="button"
                            title="Add Wallet Compensation"
                            className="p-1.5 rounded-lg text-primary hover:bg-primary-fixed/30 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                          </button>
                          <button
                            onClick={() => handleSuspendToggle(c)}
                            type="button"
                            title={c.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              c.status === 'ACTIVE'
                                ? 'text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {c.status === 'ACTIVE' ? 'block' : 'check_circle'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer / Side Sheet */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
          <div className="w-full max-w-lg bg-surface-container-lowest h-full shadow-2xl flex flex-col border-l border-surface-container-high overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-space-lg border-b border-surface-container-high flex items-center justify-between bg-surface-container-low/40">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center text-lg shadow-sm">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    {selectedCustomer.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-on-surface-variant font-mono text-[12px]">{selectedCustomer.id}</span>
                    <span className="px-2 py-0.2 rounded-full bg-primary-fixed text-primary text-[10px] font-bold">
                      {selectedCustomer.tier} TIER
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-space-lg space-y-space-lg flex-1">
              {/* Financial Snapshot */}
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/60">
                  <span className="text-[11px] font-semibold text-on-surface-variant uppercase block">Total Spend</span>
                  <span className="text-xl font-bold text-on-surface mt-1 block">
                    ₹{selectedCustomer.totalSpend.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-tertiary">Across {selectedCustomer.totalOrders} completed orders</span>
                </div>
                <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/60">
                  <span className="text-[11px] font-semibold text-on-surface-variant uppercase block">Belzo Wallet</span>
                  <span className="text-xl font-bold text-primary mt-1 block">₹{selectedCustomer.walletBalance}</span>
                  <button
                    onClick={() => setIsCreditModalOpen(true)}
                    type="button"
                    className="text-[11px] text-primary font-semibold hover:underline mt-1 block"
                  >
                    + Add Compensation Credit
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-space-md rounded-xl bg-surface-container-low/60 border border-surface-container-high/60 space-y-3">
                <h4 className="font-label-md text-label-md font-bold text-on-surface">Contact & Account Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-on-surface-variant text-[12px] block">Mobile Phone</span>
                    <span className="font-mono text-on-surface font-medium">{selectedCustomer.phone}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant text-[12px] block">Email</span>
                    <span className="text-on-surface truncate block">{selectedCustomer.email}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant text-[12px] block">Joined Date</span>
                    <span className="text-on-surface">{selectedCustomer.joinedDate}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant text-[12px] block">Last Active</span>
                    <span className="text-on-surface">{selectedCustomer.lastOrderDate}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Addresses */}
              <div className="space-y-space-xs">
                <h4 className="font-label-md text-label-md font-bold text-on-surface">Saved Delivery Addresses</h4>
                {selectedCustomer.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-space-sm rounded-lg bg-surface-container-low border border-surface-container-high/40 flex items-start gap-3"
                  >
                    <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">
                      {addr.type === 'HOME' ? 'home' : addr.type === 'WORK' ? 'work' : 'pin_drop'}
                    </span>
                    <div className="flex-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface">{addr.type}</span>
                        {addr.isDefault && (
                          <span className="px-1.5 py-0.2 rounded bg-tertiary-container/30 text-tertiary text-[10px] font-bold">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-on-surface-variant text-[12px] mt-0.5">{addr.addressLine}</p>
                      {addr.landmark && (
                        <p className="text-on-surface-variant text-[11px] italic">Near: {addr.landmark}</p>
                      )}
                      <p className="text-on-surface-variant font-mono text-[11px] mt-0.5">
                        {addr.city} - {addr.pincode}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Operational Controls */}
              <div className="pt-space-md border-t border-surface-container-high space-y-space-sm">
                <h4 className="font-label-md text-label-md font-bold text-on-surface">Governance & Controls</h4>
                <div className="flex items-center gap-space-sm">
                  <button
                    onClick={() => handleSuspendToggle(selectedCustomer)}
                    type="button"
                    className={`flex-1 py-2.5 rounded-lg font-semibold font-label-md text-label-md transition-colors ${
                      selectedCustomer.status === 'ACTIVE'
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    {selectedCustomer.status === 'ACTIVE' ? 'Suspend Customer Account' : 'Reactivate Account'}
                  </button>
                  <button
                    onClick={() => {
                      navigateTo('tickets-and-issues');
                      setSelectedCustomer(null);
                    }}
                    type="button"
                    className="px-4 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-semibold font-label-md text-label-md hover:bg-surface-container-highest transition-colors"
                  >
                    Open Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credit Modal */}
      {isCreditModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-space-lg space-y-space-md">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-space-sm">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-primary-fixed text-primary">
                  <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                </span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Issue Wallet Credit</h3>
                  <span className="text-[12px] text-on-surface-variant">To: {selectedCustomer.name}</span>
                </div>
              </div>
              <button
                onClick={() => setIsCreditModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-space-sm">
              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Credit Amount (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-on-surface-variant font-bold">₹</span>
                  <input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-headline-sm text-headline-sm font-bold focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {['50', '100', '200', '500'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCreditAmount(preset)}
                      className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container-high text-[12px] font-semibold text-on-surface border border-surface-container-high/60"
                    >
                      +₹{preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Reason / Notes for Audit Trail
                </label>
                <textarea
                  rows={3}
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  className="w-full p-3 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                  placeholder="e.g. Apology for food delay over 45 minutes"
                />
              </div>
            </div>

            <div className="pt-space-sm border-t border-surface-container-high flex justify-end gap-space-sm">
              <button
                type="button"
                onClick={() => setIsCreditModalOpen(false)}
                className="px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface font-semibold text-sm hover:bg-surface-container-highest"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyWalletCredit}
                className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 shadow-sm"
              >
                Credit ₹{creditAmount} Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
