import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { mockStore } from '../mock/mockStore';
import { exportToCSV } from '../services/api';
import { Coupon } from '../types';

export const CouponsAndPromotionsView: React.FC = () => {
  const { navigateTo, addToast, openConfirm } = useUIStore();
  const [coupons, setCoupons] = useState<Coupon[]>(mockStore.getCoupons());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FLAT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('20');
  const [maxDiscount, setMaxDiscount] = useState('100');
  const [minOrderValue, setMinOrderValue] = useState('299');
  const [usageLimit, setUsageLimit] = useState('5000');
  const [perUserLimit, setPerUserLimit] = useState('1');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );

  useEffect(() => {
    return mockStore.subscribe(() => {
      setCoupons([...mockStore.getCoupons()]);
    });
  }, []);

  const filteredCoupons = coupons.filter((c) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!c.code.toLowerCase().includes(q) && !c.title.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    return true;
  });

  const handleToggleStatus = (coupon: Coupon) => {
    mockStore.toggleCoupon(coupon.id);
    addToast({
      type: 'INFO',
      title: 'Coupon Status Changed',
      message: `Coupon ${coupon.code} is now ${coupon.status === 'ACTIVE' ? 'Paused' : 'Active'}.`,
    });
  };

  const handleDelete = (coupon: Coupon) => {
    openConfirm({
      title: `Delete Coupon ${coupon.code}?`,
      message: 'This promo code will be revoked immediately and cannot be claimed at checkout.',
      impact: 'Ongoing checkout sessions applying this coupon will fail validation.',
      isDestructive: true,
      confirmText: 'Revoke Promo Code',
      onConfirm: () => {
        mockStore.deleteCoupon(coupon.id);
        addToast({
          type: 'WARNING',
          title: 'Coupon Revoked',
          message: `Promo code ${coupon.code} deleted.`,
        });
      },
    });
  };

  const handleCreateCoupon = () => {
    if (!code.trim()) {
      addToast({ type: 'ERROR', title: 'Code Required', message: 'Promo code cannot be empty.' });
      return;
    }
    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      addToast({ type: 'ERROR', title: 'Invalid Value', message: 'Enter a valid discount number.' });
      return;
    }

    mockStore.createCoupon({
      code: code.trim().toUpperCase(),
      title: title || `${code.trim().toUpperCase()} Promo`,
      description: description || 'Special limited time promotional discount on Belzo',
      discountType,
      discountValue: val,
      maxDiscount: parseFloat(maxDiscount) || 100,
      minOrderValue: parseFloat(minOrderValue) || 199,
      applicableCities: ['Bengaluru', 'Pune'],
      usageLimit: parseInt(usageLimit, 10) || 1000,
      perUserLimit: parseInt(perUserLimit, 10) || 1,
      startDate,
      endDate,
      status: 'ACTIVE',
    });

    addToast({
      type: 'SUCCESS',
      title: 'Promo Code Published',
      message: `Coupon code ${code.toUpperCase()} is now live.`,
    });
    setIsCreateModalOpen(false);
    setCode('');
    setTitle('');
  };

  const handleExport = () => {
    const rows = filteredCoupons.map((c) => ({
      Code: c.code,
      Title: c.title,
      Type: c.discountType,
      Value: c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`,
      MaxCap: `₹${c.maxDiscount}`,
      MinOrder: `₹${c.minOrderValue}`,
      Usage: `${c.usedCount}/${c.usageLimit}`,
      Status: c.status,
      ValidUntil: c.endDate,
    }));
    exportToCSV('Belzo_Coupons_Directory', rows);
    addToast({ type: 'SUCCESS', title: 'Coupons Exported', message: `${rows.length} coupons saved to CSV.` });
  };

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Header */}
      <div className="pt-space-md pb-space-lg flex flex-col xl:flex-row xl:items-center xl:justify-between gap-space-md">
        <div className="flex flex-col space-y-space-2xs">
          <nav className="flex items-center gap-space-2xs text-on-surface-variant font-label-sm text-label-sm">
            <span onClick={() => navigateTo('dashboard')} className="hover:text-on-surface cursor-pointer">
              Overview
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">Coupons & Promotions</span>
          </nav>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Promotional Codes & Discounts Engine
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
              {coupons.length} Active Vouchers
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Create acquisition coupons, manage percentage/flat bill discounts, configure budget caps, and monitor redemption rates.
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={handleExport}
            type="button"
            className="px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-label-md text-label-md font-semibold flex items-center gap-space-xs shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            type="button"
            className="px-space-md py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-md text-label-md font-semibold flex items-center gap-space-xs shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Create Coupon
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs mb-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search promo code or campaign title..."
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
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-container-low/40">
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Coupon Code
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Discount Value
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Eligibility Criteria
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Usage & Velocity
                </th>
                <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Validity Window
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
              {filteredCoupons.map((coupon) => {
                const percentUsed = Math.min(100, Math.round((coupon.usedCount / coupon.usageLimit) * 100));

                return (
                  <tr key={coupon.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-on-surface text-base px-2 py-0.5 rounded bg-primary-fixed/40 text-primary border border-primary-fixed">
                          {coupon.code}
                        </span>
                      </div>
                      <span className="text-[12px] font-semibold text-on-surface block mt-1">{coupon.title}</span>
                      <span className="text-[11px] text-on-surface-variant line-clamp-1">{coupon.description}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-lg text-primary">
                          {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                        </span>
                        <span className="text-[12px] text-on-surface-variant">OFF</span>
                      </div>
                      {coupon.discountType === 'PERCENTAGE' && (
                        <span className="text-[11px] text-on-surface-variant block">Max Cap: ₹{coupon.maxDiscount}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-on-surface block text-sm font-medium">Min Order: ₹{coupon.minOrderValue}</span>
                      <span className="text-[11px] text-on-surface-variant block">
                        Limit: {coupon.perUserLimit} use/user
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-36">
                        <div className="flex items-center justify-between text-[11px] font-mono text-on-surface mb-1">
                          <span>{coupon.usedCount.toLocaleString()} used</span>
                          <span>{coupon.usageLimit.toLocaleString()} cap</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percentUsed > 85 ? 'bg-rose-500' : 'bg-primary'
                            }`}
                            style={{ width: `${percentUsed}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[12px] text-on-surface-variant">
                      <span>{coupon.startDate}</span>
                      <span className="block text-on-surface font-medium">to {coupon.endDate}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          coupon.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : coupon.status === 'PAUSED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {coupon.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(coupon)}
                          title={coupon.status === 'ACTIVE' ? 'Pause Coupon' : 'Resume Coupon'}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {coupon.status === 'ACTIVE' ? 'pause_circle' : 'play_circle'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(coupon)}
                          title="Revoke Coupon"
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-space-lg space-y-space-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-space-sm">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Publish New Promo Code</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-space-sm">
              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Coupon Promo Code *
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. MONSOON50"
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-mono font-bold focus:outline-none focus:border-primary uppercase"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Public Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 50% Off Monsoon Special"
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Description / Terms
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Terms of use, valid restaurants..."
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-space-sm">
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Rupee (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-space-sm">
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Per User Limit
                  </label>
                  <input
                    type="number"
                    value={perUserLimit}
                    onChange={(e) => setPerUserLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                  />
                </div>
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
                onClick={handleCreateCoupon}
                className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 shadow-sm"
              >
                Publish Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
