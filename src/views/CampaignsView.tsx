import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { mockStore } from '../mock/mockStore';
import { Campaign } from '../types';

export const CampaignsView: React.FC = () => {
  const { navigateTo, addToast } = useUIStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockStore.getCampaigns());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'NEW_USERS' | 'INACTIVE_30D' | 'HIGH_SPENDERS'>('ALL');
  const [discountPercent, setDiscountPercent] = useState('30');
  const [budgetTotal, setBudgetTotal] = useState('500000');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);

  useEffect(() => {
    return mockStore.subscribe(() => {
      setCampaigns([...mockStore.getCampaigns()]);
    });
  }, []);

  const filteredCampaigns = campaigns.filter((c) => {
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.tagline.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    return true;
  });

  const toggleCampaignStatus = (campaign: Campaign) => {
    mockStore.toggleCampaign(campaign.id);
    addToast({
      type: 'INFO',
      title: 'Campaign Status Updated',
      message: `${campaign.name} is now ${campaign.status === 'ACTIVE' ? 'Paused' : 'Active'}.`,
    });
  };

  const handleCreate = () => {
    if (!name.trim()) {
      addToast({ type: 'ERROR', title: 'Name Required', message: 'Campaign name is required.' });
      return;
    }
    mockStore.createCampaign({
      name,
      tagline: tagline || 'Special Event on Belzo',
      bannerUrl,
      targetAudience,
      discountPercent: parseFloat(discountPercent) || 20,
      budgetTotal: parseFloat(budgetTotal) || 100000,
      startDate,
      endDate,
      status: 'ACTIVE',
    });

    addToast({
      type: 'SUCCESS',
      title: 'Campaign Activated',
      message: `${name} has been published with live banner injection.`,
    });
    setIsModalOpen(false);
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
            <span onClick={() => navigateTo('coupons-and-promotions')} className="hover:text-on-surface cursor-pointer">
              Growth
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">Campaigns & Banners</span>
          </nav>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Marketing Campaigns & Banners
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
              {campaigns.length} Campaigns
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Deploy in-app carousel banners, set demographic audience targeting, track marketing budget burn, and optimize conversion.
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={() => setIsModalOpen(true)}
            type="button"
            className="px-space-md py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-md text-label-md font-semibold flex items-center gap-space-xs shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Launch Campaign
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs mb-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search campaigns..."
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
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
        {filteredCampaigns.map((camp) => {
          const budgetPercent = Math.min(100, Math.round((camp.budgetSpent / camp.budgetTotal) * 100));

          return (
            <div
              key={camp.id}
              className="rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 w-full overflow-hidden bg-surface-container-low">
                  <img
                    src={camp.bannerUrl}
                    alt={camp.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
                    <span className="px-2 py-0.5 rounded bg-primary text-white text-[10px] font-bold w-fit mb-1">
                      {camp.discountPercent}% DISCOUNT OFFER
                    </span>
                    <h3 className="text-white font-bold text-lg leading-tight">{camp.name}</h3>
                    <p className="text-white/80 text-[12px]">{camp.tagline}</p>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-sm ${
                        camp.status === 'ACTIVE'
                          ? 'bg-emerald-500 text-white'
                          : camp.status === 'PAUSED'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-500 text-white'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>
                </div>

                <div className="p-space-md space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-on-surface-variant font-medium">Audience Target:</span>
                    <span className="font-semibold text-on-surface px-2 py-0.5 rounded bg-surface-container-low border border-surface-container-high/60 text-[12px]">
                      {camp.targetAudience.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Budget Burn Tracker */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-on-surface-variant">
                        Spent: ₹{camp.budgetSpent.toLocaleString('en-IN')}
                      </span>
                      <span className="text-on-surface font-bold">
                        Budget: ₹{camp.budgetTotal.toLocaleString('en-IN')} ({budgetPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          budgetPercent > 90 ? 'bg-rose-500' : 'bg-primary'
                        }`}
                        style={{ width: `${budgetPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-mono pt-1">
                    <span>From: {camp.startDate}</span>
                    <span>To: {camp.endDate}</span>
                  </div>
                </div>
              </div>

              <div className="p-space-md pt-0 border-t border-surface-container-high/60 mt-2 flex items-center justify-between">
                <span className="text-mono text-[11px] text-on-surface-variant font-mono">{camp.id}</span>
                <button
                  type="button"
                  onClick={() => toggleCampaignStatus(camp)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    camp.status === 'ACTIVE'
                      ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  {camp.status === 'ACTIVE' ? 'Pause Campaign' : 'Resume Campaign'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Launch Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-space-lg space-y-space-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-space-sm">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Deploy Marketing Campaign</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-space-sm">
              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. IPL Cricket Feast 2026"
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Sub-headline / Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Flat ₹150 OFF on Match Days + Free Delivery"
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Audience Cohort
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                  >
                    <option value="ALL">All Registered Users</option>
                    <option value="NEW_USERS">First-time Installers</option>
                    <option value="INACTIVE_30D">Churned (Inactive 30D+)</option>
                    <option value="HIGH_SPENDERS">VIP High Spenders</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Total Budget Allocation (₹ INR)
                </label>
                <input
                  type="number"
                  value={budgetTotal}
                  onChange={(e) => setBudgetTotal(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Banner Creative Image URL
                </label>
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                />
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
                onClick={() => setIsModalOpen(false)}
                className="px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface font-semibold text-sm hover:bg-surface-container-highest"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 shadow-sm"
              >
                Launch Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
