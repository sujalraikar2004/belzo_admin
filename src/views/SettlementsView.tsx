import { useUIStore } from '../store/uiStore'
import { mockStore } from '../mock/mockStore'
import { exportToCSV } from '../services/api'
import React, { useState, useEffect } from 'react';
import { SettlementRecord } from '../types';

export const SettlementsView: React.FC = () => {
  const { navigateTo, addToast, openConfirm } = useUIStore();
  const [settlements, setSettlements] = useState<SettlementRecord[]>(mockStore.getSettlements());
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'RESTAURANT' | 'DELIVERY_PARTNER'>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    return mockStore.subscribe(() => {
      setSettlements([...mockStore.getSettlements()]);
    });
  }, []);

  const filteredSettlements = settlements.filter((s) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        s.id.toLowerCase().includes(q) ||
        s.entityName.toLowerCase().includes(q) ||
        s.entityId.toLowerCase().includes(q) ||
        (s.utrRef && s.utrRef.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (typeFilter !== 'ALL' && s.entityType !== typeFilter) return false;
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    return true;
  });

  const handleMarkPaid = (record: SettlementRecord) => {
    openConfirm({
      title: `Process Settlement Payout of ₹${record.netPayout.toLocaleString('en-IN')}?`,
      message: `Initiate automated NEFT/IMPS payout transfer to ${record.entityName} (${record.bankAccount}).`,
      impact: 'UTR reference will be generated and settlement marked completed.',
      confirmText: 'Dispatch Payout',
      onConfirm: () => {
        mockStore.markSettlementPaid(record.id);
        addToast({
          type: 'SUCCESS',
          title: 'Payout Dispatched',
          message: `Settlement ${record.id} for ${record.entityName} settled.`,
        });
      },
    });
  };

  const handleExport = () => {
    const rows = filteredSettlements.map((s) => ({
      SettlementID: s.id,
      Type: s.entityType,
      Beneficiary: s.entityName,
      Period: s.cyclePeriod,
      GrossSales: `₹${s.grossSales}`,
      CommissionDeductions: `₹${s.commissionOrDeductions}`,
      TaxTCSGST: `₹${s.taxTcsGst}`,
      Adjustments: `₹${s.adjustments}`,
      NetPayout: `₹${s.netPayout}`,
      Status: s.status,
      PayoutDate: s.payoutDate,
      Bank: s.bankAccount,
      UTR: s.utrRef || '-',
    }));
    exportToCSV('BiteGo_Settlements_Ledger', rows);
    addToast({
      type: 'SUCCESS',
      title: 'Settlement Ledger Exported',
      message: `${rows.length} payout records saved to CSV.`,
    });
  };

  const totalPayoutPending = settlements
    .filter((s) => s.status === 'PENDING')
    .reduce((sum, s) => sum + s.netPayout, 0);

  const totalPayoutSettled = settlements
    .filter((s) => s.status === 'SETTLED')
    .reduce((sum, s) => sum + s.netPayout, 0);

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
            <span className="text-primary font-semibold">Settlements & Payouts</span>
          </nav>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Merchant & Courier Settlement Ledger
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
              T+1 Cycle
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Automated payout generation for restaurant partners and delivery fleet. Handles commission cuts, GST/TCS withholding, and bank UTR audits.
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={handleExport}
            type="button"
            className="px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-label-md text-label-md font-semibold flex items-center gap-space-xs shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Payouts (CSV)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md mb-space-lg">
        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase font-semibold">Pending Net Payouts</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
            </span>
          </div>
          <div className="mt-2">
            <span className="font-headline-md text-headline-md font-bold text-on-surface">
              ₹{totalPayoutPending.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[12px] text-amber-700 font-medium mt-1">Scheduled for next batch release</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase font-semibold">Settled & Transferred (MTD)</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
            </span>
          </div>
          <div className="mt-2">
            <span className="font-headline-md text-headline-md font-bold text-on-surface">
              ₹{totalPayoutSettled.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[12px] text-emerald-700 font-medium mt-1">Direct bank transfers completed</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase font-semibold">Average Take Rate</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-primary">
              <span className="material-symbols-outlined text-[18px]">pie_chart</span>
            </span>
          </div>
          <div className="mt-2">
            <span className="font-headline-md text-headline-md font-bold text-primary">18.4%</span>
          </div>
          <span className="text-[12px] text-on-surface-variant mt-1">Blended platform commission</span>
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
            placeholder="Search by ID, Beneficiary name, or UTR number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-on-surface-variant font-label-sm text-label-sm font-semibold">Beneficiary Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-label-md text-label-md focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Partners</option>
              <option value="RESTAURANT">Restaurants</option>
              <option value="DELIVERY_PARTNER">Delivery Couriers</option>
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
              <option value="PENDING">Pending</option>
              <option value="SETTLED">Settled</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-container-low/40">
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Settlement ID
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Beneficiary Partner
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Cycle Period
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant text-right">
                  Gross Sales
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant text-right">
                  Commission / Fees
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant text-right">
                  Net Payout
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Bank Account / UTR
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
              {filteredSettlements.map((record) => {
                return (
                  <tr key={record.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-on-surface text-sm">
                      {record.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-surface-container-high text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px]">
                            {record.entityType === 'RESTAURANT' ? 'storefront' : 'two_wheeler'}
                          </span>
                        </span>
                        <div>
                          <span className="font-semibold text-on-surface block text-sm">{record.entityName}</span>
                          <span className="text-[11px] text-on-surface-variant font-mono">{record.entityId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-on-surface-variant">
                      {record.cyclePeriod}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-on-surface">
                      ₹{record.grossSales.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right text-rose-600 font-medium">
                      -₹{record.commissionOrDeductions.toLocaleString('en-IN')}
                      <span className="text-[11px] text-on-surface-variant block">TCS: ₹{record.taxTcsGst}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-base text-emerald-600">
                        ₹{record.netPayout.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[12px] text-on-surface block">{record.bankAccount}</span>
                      {record.utrRef && (
                        <span className="text-[11px] font-mono text-on-surface-variant select-all block">
                          UTR: {record.utrRef}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          record.status === 'SETTLED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : record.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {record.status === 'PENDING' ? (
                        <button
                          onClick={() => handleMarkPaid(record)}
                          type="button"
                          className="px-3 py-1 rounded-lg bg-primary text-on-primary hover:bg-primary/90 text-xs font-semibold shadow-xs"
                        >
                          Dispatch Payout
                        </button>
                      ) : (
                        <span className="text-[12px] text-on-surface-variant font-medium">Settled {record.payoutDate.split(' ')[0]}</span>
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
