import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { mockStore } from '../mock/mockStore';
import { exportToCSV } from '../services/api';
import { RefundRequest } from '../types';

export const RefundsView: React.FC = () => {
  const { navigateTo, addToast, openConfirm } = useUIStore();
  const [refunds, setRefunds] = useState<RefundRequest[]>(mockStore.getRefunds());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    return mockStore.subscribe(() => {
      setRefunds([...mockStore.getRefunds()]);
    });
  }, []);

  const filteredRefunds = refunds.filter((r) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        r.id.toLowerCase().includes(q) ||
        r.orderId.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerPhone.includes(q) ||
        r.reason.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  const handleProcessRefund = (refund: RefundRequest, action: 'APPROVE' | 'REJECT') => {
    openConfirm({
      title: `${action === 'APPROVE' ? 'Approve' : 'Reject'} Refund of ₹${refund.amount}?`,
      message:
        action === 'APPROVE'
          ? `This will immediately issue ₹${refund.amount} back to the customer's ${refund.refundMethod === 'WALLET_CREDIT' ? 'Belzo Wallet' : 'Original Payment Source'} and update order ${refund.orderId}.`
          : `This will mark claim ${refund.id} as rejected and notify the customer.`,
      impact:
        action === 'APPROVE'
          ? 'Accounting and financial reconciliation will adjust merchant payout and platform fee deductions.'
          : 'Customer support SLA might escalate if customer appeals.',
      isDestructive: action === 'REJECT',
      confirmText: action === 'APPROVE' ? 'Authorize Refund' : 'Reject Claim',
      onConfirm: () => {
        mockStore.processRefund(refund.id, action);
        addToast({
          type: action === 'APPROVE' ? 'SUCCESS' : 'WARNING',
          title: action === 'APPROVE' ? 'Refund Processed' : 'Refund Claim Rejected',
          message: `Claim ${refund.id} for Order ${refund.orderId} updated.`,
        });
      },
    });
  };

  const handleExport = () => {
    const rows = filteredRefunds.map((r) => ({
      ClaimID: r.id,
      OrderID: r.orderId,
      Customer: r.customerName,
      Phone: r.customerPhone,
      Amount: `₹${r.amount}`,
      Reason: r.reason,
      Method: r.refundMethod,
      Status: r.status,
      ApprovedBy: r.approvedBy || '-',
      Date: r.createdAt,
    }));
    exportToCSV('Belzo_Refund_Claims', rows);
    addToast({
      type: 'SUCCESS',
      title: 'Refund Claims Exported',
      message: `${rows.length} refund claim records saved to CSV.`,
    });
  };

  const pendingSum = refunds
    .filter((r) => r.status === 'PENDING')
    .reduce((sum, r) => sum + r.amount, 0);

  const completedSum = refunds
    .filter((r) => r.status === 'COMPLETED')
    .reduce((sum, r) => sum + r.amount, 0);

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
            <span onClick={() => navigateTo('payments')} className="hover:text-on-surface cursor-pointer">
              Finance
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">Refunds & Reversals</span>
          </nav>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Refunds & Reversals Management
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
              {refunds.filter((r) => r.status === 'PENDING').length} Pending Claims
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Authorize customer order refund claims, missing dish compensation, food quality complaints, and rider cancellations.
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={handleExport}
            type="button"
            className="px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-label-md text-label-md font-semibold flex items-center gap-space-xs shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Refunds (CSV)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md mb-space-lg">
        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase font-semibold">Pending Authorization</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md font-bold text-on-surface">
              ₹{pendingSum.toLocaleString('en-IN')}
            </span>
            <span className="text-[12px] text-on-surface-variant font-medium">
              ({refunds.filter((r) => r.status === 'PENDING').length} claims)
            </span>
          </div>
          <span className="text-[12px] text-amber-700 font-medium mt-1">Awaiting operational review</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase font-semibold">Total Processed (30D)</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </span>
          </div>
          <div className="mt-2">
            <span className="font-headline-md text-headline-md font-bold text-on-surface">
              ₹{completedSum.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[12px] text-emerald-700 font-medium mt-1">Directly credited to users</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase font-semibold">Platform Refund Rate</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-primary">
              <span className="material-symbols-outlined text-[18px]">percent</span>
            </span>
          </div>
          <div className="mt-2">
            <span className="font-headline-md text-headline-md font-bold text-on-surface">0.42%</span>
          </div>
          <span className="text-[12px] text-emerald-600 font-medium mt-1">Well below 1.5% target SLA</span>
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
            placeholder="Search by Claim ID, Order ID, Customer, or Reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-space-sm">
          <span className="text-on-surface-variant font-label-sm text-label-sm font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-label-md text-label-md focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending Review</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Claims Table */}
      <div className="rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-container-low/40">
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Claim ID
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Order ID
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Customer
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant text-right">
                  Refund Amount
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Reason & Disputed Item
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Destination
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant text-center">
                  Status
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/60 font-body-md text-body-md">
              {filteredRefunds.map((refund) => {
                return (
                  <tr key={refund.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-on-surface text-sm">{refund.id}</span>
                      <span className="text-[11px] text-on-surface-variant block">{refund.createdAt}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => navigateTo('order-detail', { orderId: refund.orderId })}
                        type="button"
                        className="font-mono text-primary font-bold hover:underline"
                      >
                        {refund.orderId}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-on-surface block text-sm">{refund.customerName}</span>
                      <span className="text-[11px] text-on-surface-variant font-mono">{refund.customerPhone}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-lg text-primary">₹{refund.amount}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-sm font-medium text-on-surface">{refund.reason}</p>
                      {refund.approvedBy && (
                        <span className="text-[11px] text-on-surface-variant block mt-0.5">
                          Audit: {refund.approvedBy}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface text-[11px] font-semibold">
                        {refund.refundMethod === 'WALLET_CREDIT' ? 'Belzo Wallet' : 'Original Payment'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          refund.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : refund.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {refund.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {refund.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleProcessRefund(refund, 'APPROVE')}
                            type="button"
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleProcessRefund(refund, 'REJECT')}
                            type="button"
                            className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-[11px]"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[12px] text-on-surface-variant font-medium">Reconciled</span>
                      )}
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
