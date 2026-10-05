import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { mockStore } from '../mock/mockStore';
import { exportToCSV } from '../services/api';
import { PaymentTransaction } from '../types';

export const PaymentsView: React.FC = () => {
  const { navigateTo, addToast } = useUIStore();
  const [payments, setPayments] = useState<PaymentTransaction[]>(mockStore.getPayments());
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    return mockStore.subscribe(() => {
      setPayments([...mockStore.getPayments()]);
    });
  }, []);

  const filteredPayments = payments.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        p.id.toLowerCase().includes(q) ||
        p.orderId.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.gatewayRef.toLowerCase().includes(q) ||
        p.provider.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (methodFilter !== 'ALL' && p.method !== methodFilter) return false;
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    return true;
  });

  const totalCaptured = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter((p) => p.status === 'REFUNDED')
    .reduce((sum, p) => sum + p.amount, 0);

  const upiCount = payments.filter((p) => p.method === 'UPI').length;

  const handleExport = () => {
    const rows = filteredPayments.map((p) => ({
      TxnID: p.id,
      OrderID: p.orderId,
      Customer: p.customerName,
      Amount: `₹${p.amount}`,
      Method: p.method,
      Provider: p.provider,
      Status: p.status,
      GatewayRef: p.gatewayRef,
      Date: p.date,
    }));
    exportToCSV('Belzo_Payment_Transactions', rows);
    addToast({
      type: 'SUCCESS',
      title: 'Ledger Exported',
      message: `${rows.length} payment records downloaded to CSV.`,
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
            <span className="text-primary font-semibold">Payments</span>
          </nav>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Payment Gateway & Transaction Ledger
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
              100% Reconciliation
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Live payment captures across UPI, cards, and net banking. Gateway reference matching and automated settlement tracking.
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={handleExport}
            type="button"
            className="px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-label-md text-label-md font-semibold flex items-center gap-space-xs shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Ledger (CSV)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase font-semibold">Total Captured GMV</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-emerald-600">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </span>
          </div>
          <div className="mt-2">
            <span className="font-headline-md text-headline-md font-bold text-on-surface">
              ₹{totalCaptured.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[12px] text-emerald-600 font-medium mt-1">Successfully settled payments</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase font-semibold">Refund Volume</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-rose-600">
              <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
            </span>
          </div>
          <div className="mt-2">
            <span className="font-headline-md text-headline-md font-bold text-on-surface">
              ₹{totalRefunded.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[12px] text-on-surface-variant mt-1">Returned to customer accounts</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase font-semibold">UPI Share</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-primary">
              <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md font-bold text-on-surface">
              {Math.round((upiCount / Math.max(1, payments.length)) * 100)}%
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">({upiCount} txns)</span>
          </div>
          <span className="text-[12px] text-tertiary font-medium mt-1">Dominant payment mode</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase font-semibold">Gateway Success Rate</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-primary">
              <span className="material-symbols-outlined text-[18px]">speed</span>
            </span>
          </div>
          <div className="mt-2">
            <span className="font-headline-md text-headline-md font-bold text-emerald-600">99.4%</span>
          </div>
          <span className="text-[12px] text-on-surface-variant mt-1">Razorpay + PhonePe combined</span>
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
            placeholder="Search by Txn ID, Order ID, Customer, or Gateway Ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-on-surface-variant font-label-sm text-label-sm font-semibold">Payment Mode:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-label-md text-label-md focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Cards</option>
              <option value="NET_BANKING">Net Banking</option>
              <option value="COD">Cash on Delivery</option>
              <option value="WALLET">Wallet</option>
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
              <option value="PAID">Paid</option>
              <option value="REFUNDED">Refunded</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-container-low/40">
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Transaction ID
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Order
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Customer
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant text-right">
                  Amount
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Payment Method
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Gateway Ref
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant text-center">
                  Status
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/60 font-body-md text-body-md">
              {filteredPayments.map((p) => {
                return (
                  <tr key={p.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-on-surface text-sm">{p.id}</span>
                      <span className="text-[11px] text-on-surface-variant block">{p.provider}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => navigateTo('order-detail', { orderId: p.orderId })}
                        type="button"
                        className="font-mono text-primary font-bold hover:underline"
                      >
                        {p.orderId}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-on-surface block text-sm">{p.customerName}</span>
                      <span className="text-[11px] text-on-surface-variant font-mono">{p.customerId}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-on-surface text-base">₹{p.amount}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface text-[12px] font-semibold">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[12px] text-on-surface-variant select-all">
                        {p.gatewayRef}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          p.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'REFUNDED'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant text-[12px]">
                      {p.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
