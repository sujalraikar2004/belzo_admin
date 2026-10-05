import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { mockStore } from '../mock/mockStore';
import { exportToCSV } from '../services/api';
import { AdminUser, AdminRole } from '../types';

export const AdminUsersView: React.FC = () => {
  const { navigateTo, addToast, openConfirm } = useUIStore();
  const [admins, setAdmins] = useState<AdminUser[]>(mockStore.getAdmins());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Central Operations');
  const [role, setRole] = useState<AdminRole>('OPERATIONS_ADMIN');

  useEffect(() => {
    return mockStore.subscribe(() => {
      setAdmins([...mockStore.getAdmins()]);
    });
  }, []);

  const filteredAdmins = admins.filter((a) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (roleFilter !== 'ALL' && a.role !== roleFilter) return false;
    return true;
  });

  const handleToggleStatus = (admin: AdminUser) => {
    openConfirm({
      title: `${admin.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} Admin Account for ${admin.name}?`,
      message:
        admin.status === 'ACTIVE'
          ? 'Revoke all platform access immediately. Active sessions will be invalidated.'
          : 'Restore system access with existing role permissions.',
      isDestructive: admin.status === 'ACTIVE',
      confirmText: admin.status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account',
      onConfirm: () => {
        mockStore.toggleAdminStatus(admin.id);
        addToast({
          type: admin.status === 'ACTIVE' ? 'WARNING' : 'SUCCESS',
          title: 'Admin Status Updated',
          message: `${admin.name} is now ${admin.status === 'ACTIVE' ? 'Inactive' : 'Active'}.`,
        });
      },
    });
  };

  const handleRoleChange = (admin: AdminUser, newRole: AdminRole) => {
    mockStore.updateAdminRole(admin.id, newRole);
    addToast({
      type: 'SUCCESS',
      title: 'Role Updated',
      message: `${admin.name} reassigned to ${newRole.replace(/_/g, ' ')}.`,
    });
  };

  const handleCreate = () => {
    if (!name.trim() || !email.trim()) {
      addToast({ type: 'ERROR', title: 'Missing Fields', message: 'Name and email are required.' });
      return;
    }

    mockStore.createAdmin({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '+91 98450 00000',
      role,
      department,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      status: 'ACTIVE',
    });

    addToast({
      type: 'SUCCESS',
      title: 'Admin Created',
      message: `Administrator access provisioned for ${name}.`,
    });

    setIsCreateModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  const handleExport = () => {
    const rows = filteredAdmins.map((a) => ({
      ID: a.id,
      Name: a.name,
      Email: a.email,
      Phone: a.phone || '-',
      Role: a.role,
      Department: a.department,
      Status: a.status,
      LastLogin: a.lastLogin,
    }));
    exportToCSV('Belzo_Admin_Staff_Directory', rows);
    addToast({
      type: 'SUCCESS',
      title: 'Directory Exported',
      message: `${rows.length} administrator profiles saved to CSV.`,
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
            <span className="text-primary font-semibold">Admin Users</span>
          </nav>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Administrative Staff & Access Directory
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
              {admins.length} Staff Members
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Manage console access rights, internal operations personnel, finance leads, and dispatch commanders.
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={handleExport}
            type="button"
            className="px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-label-md text-label-md font-semibold flex items-center gap-space-xs shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Staff (CSV)
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            type="button"
            className="px-space-md py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-md text-label-md font-semibold flex items-center gap-space-xs shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add Admin User
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
            placeholder="Search by name, email, department, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-space-sm">
          <span className="text-on-surface-variant font-label-sm text-label-sm font-semibold">Role Tier:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-label-md text-label-md focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="OPERATIONS_ADMIN">Operations Admin</option>
            <option value="FINANCE_ADMIN">Finance Admin</option>
            <option value="SUPPORT_ADMIN">Support Admin</option>
            <option value="RESTAURANT_ADMIN">Restaurant Admin</option>
            <option value="ANALYST">Analyst</option>
          </select>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-container-low/40">
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Personnel
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Department
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Role
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Last Login
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
              {filteredAdmins.map((admin) => {
                return (
                  <tr key={admin.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={admin.avatar}
                          alt={admin.name}
                          className="w-10 h-10 rounded-full object-cover border border-surface-container-high"
                        />
                        <div>
                          <span className="font-semibold text-on-surface block leading-tight">{admin.name}</span>
                          <span className="text-[12px] text-on-surface-variant font-mono">{admin.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-on-surface block font-medium text-sm">{admin.department}</span>
                      <span className="text-[11px] text-on-surface-variant font-mono">{admin.phone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={admin.role}
                        onChange={(e) => handleRoleChange(admin, e.target.value as AdminRole)}
                        className="px-2.5 py-1 bg-surface-container-low border border-surface-container-high rounded text-xs font-bold text-on-surface"
                      >
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="OPERATIONS_ADMIN">Operations Admin</option>
                        <option value="FINANCE_ADMIN">Finance Admin</option>
                        <option value="SUPPORT_ADMIN">Support Admin</option>
                        <option value="RESTAURANT_ADMIN">Restaurant Admin</option>
                        <option value="ANALYST">Analyst</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[12px] text-on-surface-variant">
                      {admin.lastLogin}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          admin.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {admin.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(admin)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          admin.status === 'ACTIVE'
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {admin.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-space-lg space-y-space-md">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-space-sm">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Provision Admin Account</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-space-sm">
              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikramaditya Sen"
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Official Email (@belzo.com) *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. vikram.sen@belzo.com"
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Role Tier
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as AdminRole)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="OPERATIONS_ADMIN">Operations Admin</option>
                    <option value="FINANCE_ADMIN">Finance Admin</option>
                    <option value="SUPPORT_ADMIN">Support Admin</option>
                    <option value="RESTAURANT_ADMIN">Restaurant Admin</option>
                    <option value="ANALYST">Analyst</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Mobile Contact
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98450 11223"
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="pt-space-sm border-t border-surface-container-high flex justify-end gap-space-sm">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface font-semibold text-sm hover:bg-surface-container-highest"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 shadow-sm"
              >
                Create Staff Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
