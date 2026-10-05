import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { mockStore } from '../mock/mockStore';
import { exportToCSV } from '../services/api';
import { AuditLog } from '../types';

export const AuditLogsView: React.FC = () => {
  const { navigateTo, addToast } = useUIStore();
  const [logs, setLogs] = useState<AuditLog[]>(mockStore.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    return mockStore.subscribe(() => {
      setLogs([...mockStore.getAuditLogs()]);
    });
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        l.id.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.adminName.toLowerCase().includes(q) ||
        l.entityId.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (entityFilter !== 'ALL' && l.entity !== entityFilter) return false;
    return true;
  });

  const handleExport = () => {
    const rows = filteredLogs.map((l) => ({
      LogID: l.id,
      Timestamp: l.timestamp,
      Operator: l.adminName,
      Email: l.adminEmail,
      Action: l.action,
      Entity: l.entity,
      TargetID: l.entityId,
      Result: l.result,
      Metadata: JSON.stringify(l.metadata),
    }));
    exportToCSV('Belzo_Audit_Logs', rows);
    addToast({
      type: 'SUCCESS',
      title: 'Audit Logs Exported',
      message: `${rows.length} immutable events downloaded to CSV.`,
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
            <span className="text-primary font-semibold">Audit Logs</span>
          </nav>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Immutable Platform Event & Audit Trail
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
              Append-Only Ledger
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Cryptographically sealed timeline of all administrative interventions, order overrides, refund authorizations, and security modifications.
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={handleExport}
            type="button"
            className="px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-label-md text-label-md font-semibold flex items-center gap-space-xs shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Audit Trail (CSV)
          </button>
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
            placeholder="Search by Action, Operator, Entity ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-space-sm">
          <span className="text-on-surface-variant font-label-sm text-label-sm font-semibold">Entity Type:</span>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-label-md text-label-md focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Entities</option>
            <option value="Order">Order</option>
            <option value="Restaurant">Restaurant</option>
            <option value="DeliveryPartner">Delivery Partner</option>
            <option value="Customer">Customer</option>
            <option value="Catalog">Catalog</option>
            <option value="Coupon">Coupon</option>
            <option value="Refund">Refund</option>
            <option value="Settlement">Settlement</option>
            <option value="SupportTicket">Support Ticket</option>
            <option value="Settings">Settings</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-container-low/40">
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Log ID & Time
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Operator Admin
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Action Executed
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Target Entity
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant text-center">
                  Result
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant text-right">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/60 font-body-md text-body-md">
              {filteredLogs.map((log) => {
                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-surface-container-low/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-on-surface text-sm block">{log.id}</span>
                      <span className="text-[11px] text-on-surface-variant font-mono">{log.timestamp}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-on-surface block text-sm">{log.adminName}</span>
                      <span className="text-[11px] text-on-surface-variant font-mono">{log.adminEmail}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-primary text-xs">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-on-surface font-medium block text-sm">{log.entity}</span>
                      <span className="text-[11px] text-on-surface-variant font-mono">{log.entityId}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.result === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.result === 'WARNING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.result}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant hover:text-on-surface">
                        info
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface-container-lowest h-full shadow-2xl flex flex-col border-l border-surface-container-high p-space-lg space-y-space-md overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-space-sm">
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Audit Event Inspector</h3>
                <span className="text-[12px] font-mono text-on-surface-variant">{selectedLog.id}</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-on-surface-variant text-xs block">Action</span>
                <span className="font-mono font-bold text-primary">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-on-surface-variant text-xs block">Actor Operator</span>
                <span className="font-semibold text-on-surface">{selectedLog.adminName}</span>
                <span className="font-mono text-xs text-on-surface-variant block">{selectedLog.adminEmail}</span>
              </div>
              <div>
                <span className="text-on-surface-variant text-xs block">Target Entity & ID</span>
                <span className="font-medium text-on-surface">
                  {selectedLog.entity} — <code className="font-mono text-xs">{selectedLog.entityId}</code>
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant text-xs block">Execution Timestamp</span>
                <span className="font-mono text-on-surface">{selectedLog.timestamp}</span>
              </div>
              <div>
                <span className="text-on-surface-variant text-xs block mb-1">Payload Metadata</span>
                <pre className="p-3 rounded-lg bg-surface-container-low border border-surface-container-high font-mono text-xs overflow-x-auto text-on-surface">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
