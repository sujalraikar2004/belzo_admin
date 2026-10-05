import { useUIStore } from "../store/uiStore";
import { mockStore } from "../mock/mockStore";
import React, { useState, useEffect } from 'react';
import { AdminRole, Permission } from '../types';

export const RolesAndPermissionsView: React.FC = () => {
  const { navigateTo, addToast } = useUIStore();
  const [roleMatrix, setRoleMatrix] = useState<Record<AdminRole, Permission[]>>(
    mockStore.getRolePermissions()
  );

  useEffect(() => {
    return mockStore.subscribe(() => {
      setRoleMatrix({ ...mockStore.getRolePermissions() });
    });
  }, []);

  const roles: { role: AdminRole; label: string; desc: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full root access across all modules and governance settings.' },
    { role: 'OPERATIONS_ADMIN', label: 'Operations Admin', desc: 'Live fleet dispatch, restaurant onboarding, orders control.' },
    { role: 'FINANCE_ADMIN', label: 'Finance Admin', desc: 'Settlements, payment gateways, refund authorisations, ledger export.' },
    { role: 'SUPPORT_ADMIN', label: 'Support Admin', desc: 'Ticket remediation, customer complaints, compensation credits.' },
    { role: 'RESTAURANT_ADMIN', label: 'Restaurant Admin', desc: 'Catalog dishes, menu availability, outlet configuration.' },
    { role: 'ANALYST', label: 'Analyst', desc: 'Read-only telemetry, aggregate metrics, cohort analysis.' },
  ];

  const permissionGroups: { title: string; perms: { id: Permission; label: string }[] }[] = [
    {
      title: 'Executive & Dashboard',
      perms: [{ id: 'dashboard.view', label: 'View Dashboard & Core KPIs' }],
    },
    {
      title: 'Orders & Live Logistics',
      perms: [
        { id: 'orders.view', label: 'Inspect Order Pipeline' },
        { id: 'orders.create', label: 'Create Manual / Phone Orders' },
        { id: 'orders.update', label: 'Modify Status & Dispatch Notes' },
        { id: 'orders.cancel', label: 'Emergency Cancel Orders' },
      ],
    },
    {
      title: 'Restaurant Partners',
      perms: [
        { id: 'restaurants.view', label: 'View Merchant Directory' },
        { id: 'restaurants.create', label: 'Onboard New Outlets' },
        { id: 'restaurants.update', label: 'Edit Outlets & Commission' },
        { id: 'restaurants.approve', label: 'Approve KYC & FSSAI Licenses' },
        { id: 'restaurants.suspend', label: 'Suspend Delinquent Outlets' },
      ],
    },
    {
      title: 'Delivery Fleet',
      perms: [
        { id: 'delivery.view', label: 'View Fleet & Courier Telemetry' },
        { id: 'delivery.update', label: 'Update Duty & Shift Status' },
        { id: 'delivery.assign', label: 'Manually Reassign Delivery Orders' },
      ],
    },
    {
      title: 'Customer Directory',
      perms: [
        { id: 'customers.view', label: 'View Customer Profiles' },
        { id: 'customers.update', label: 'Manage Accounts & Wallets' },
        { id: 'customers.suspend', label: 'Freeze Customer Accounts' },
      ],
    },
    {
      title: 'Food Catalog & Menus',
      perms: [
        { id: 'catalog.view', label: 'Browse Menus & Categories' },
        { id: 'catalog.create', label: 'Add New Food Items' },
        { id: 'catalog.update', label: 'Edit Pricing & Stock Status' },
        { id: 'catalog.delete', label: 'Remove Dishes from Catalog' },
      ],
    },
    {
      title: 'Payments, Refunds & Settlements',
      perms: [
        { id: 'payments.view', label: 'Audit Payment Transactions' },
        { id: 'refunds.view', label: 'View Refund Claims' },
        { id: 'refunds.process', label: 'Approve & Issue Customer Refunds' },
        { id: 'settlements.view', label: 'Inspect Settlement Ledgers' },
        { id: 'settlements.process', label: 'Dispatch Merchant & Fleet Payouts' },
      ],
    },
    {
      title: 'Customer Support & Issues',
      perms: [
        { id: 'support.view', label: 'Access Support Tickets Desk' },
        { id: 'support.manage', label: 'Reply, Resolve & Credit Compensations' },
      ],
    },
    {
      title: 'Platform Administration & Security',
      perms: [
        { id: 'admins.view', label: 'View Admin Staff Directory' },
        { id: 'admins.manage', label: 'Add & Manage Admin Accounts' },
        { id: 'roles.view', label: 'Inspect RBAC Permission Matrix' },
        { id: 'roles.manage', label: 'Modify Role Permissions Matrix' },
        { id: 'settings.view', label: 'View Platform Configuration' },
        { id: 'settings.manage', label: 'Change Global Commission & Security' },
        { id: 'audit.view', label: 'Access Immutable Audit Trail' },
      ],
    },
  ];

  const handleToggle = (role: AdminRole, perm: Permission) => {
    if (role === 'SUPER_ADMIN') {
      addToast({
        type: 'WARNING',
        title: 'Super Admin Immutable',
        message: 'Super Admin root permissions cannot be revoked.',
      });
      return;
    }

    const currentList = roleMatrix[role] || [];
    const hasPerm = currentList.includes(perm);
    mockStore.updateRolePermission(role, perm, !hasPerm);

    addToast({
      type: 'INFO',
      title: 'Permission Updated',
      message: `${perm} ${!hasPerm ? 'granted to' : 'revoked from'} ${role}.`,
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
            <span className="text-primary font-semibold">Roles & Permissions</span>
          </nav>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Role-Based Access Control (RBAC) Matrix
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
              6 Roles Configured
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Fine-grained capability configuration across 25+ permission keys. Live security enforcement across all admin modules.
          </p>
        </div>
      </div>

      {/* Role Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md mb-space-lg">
        {roles.map((r) => {
          const permCount = roleMatrix[r.role]?.length || 0;

          return (
            <div
              key={r.role}
              className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-on-surface">{r.label}</span>
                  <span className="px-2 py-0.5 rounded bg-primary-fixed/40 text-primary text-[11px] font-bold">
                    {permCount} Perms
                  </span>
                </div>
                <p className="text-[12px] text-on-surface-variant mt-1">{r.desc}</p>
              </div>
              <span className="text-[11px] font-mono text-on-surface-variant mt-3 block">KEY: {r.role}</span>
            </div>
          );
        })}
      </div>

      {/* Permission Matrix Table */}
      <div className="rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-container-low/40">
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant w-1/3">
                  Permission Capability
                </th>
                {roles.map((r) => (
                  <th
                    key={r.role}
                    className="py-3 px-3 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant text-center"
                  >
                    {r.label.replace(' Admin', '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/60 font-body-md text-body-md">
              {permissionGroups.map((group) => (
                <React.Fragment key={group.title}>
                  <tr className="bg-surface-container-low/60 border-t border-b border-surface-container-high">
                    <td
                      colSpan={roles.length + 1}
                      className="py-2 px-4 font-bold text-xs uppercase tracking-wider text-primary"
                    >
                      {group.title}
                    </td>
                  </tr>

                  {group.perms.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-2.5 px-4">
                        <span className="font-medium text-on-surface block text-sm">{p.label}</span>
                        <span className="text-[11px] text-on-surface-variant font-mono">{p.id}</span>
                      </td>

                      {roles.map((r) => {
                        const hasPerm = (roleMatrix[r.role] || []).includes(p.id);

                        return (
                          <td key={r.role} className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggle(r.role, p.id)}
                              className={`w-6 h-6 rounded flex items-center justify-center transition-colors mx-auto ${
                                hasPerm
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-surface-container-high text-transparent hover:text-on-surface-variant hover:bg-surface-container-highest'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">check</span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
