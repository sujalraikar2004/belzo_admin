import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { mockStore } from '../mock/mockStore';
import { AddOn } from '../types';

export const AddOnsView: React.FC = () => {
  const { navigateTo, addToast } = useUIStore();
  const [addOns, setAddOns] = useState<AddOn[]>(mockStore.getAddOns());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    return mockStore.subscribe(() => {
      setAddOns([...mockStore.getAddOns()]);
    });
  }, []);

  const categories = Array.from(new Set(addOns.map((a) => a.category)));

  const filteredAddOns = addOns.filter((a) => {
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (categoryFilter !== 'ALL' && a.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  const toggleAvailability = (addon: AddOn) => {
    const updated = addOns.map((a) =>
      a.id === addon.id ? { ...a, isAvailable: !a.isAvailable } : a
    );
    setAddOns(updated);
    addToast({
      type: 'INFO',
      title: addon.isAvailable ? 'Modifier Marked Unavailable' : 'Modifier Activated',
      message: `${addon.name} is now ${addon.isAvailable ? 'hidden' : 'available'} during checkout.`,
    });
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
            <span onClick={() => navigateTo('categories-and-menus')} className="hover:text-on-surface cursor-pointer">
              Catalog
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">Add-ons & Modifiers</span>
          </nav>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Add-ons, Sides & Customizations
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
              {addOns.length} Modifiers
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Configure extra accompaniments, dips, beverage pairings, extra toppings, and customize pricing rules across menus.
          </p>
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
            placeholder="Search add-on modifier by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-space-sm">
          <span className="text-on-surface-variant font-label-sm text-label-sm font-semibold">Group:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-label-md text-label-md focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Modifier Groups</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Addons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
        {filteredAddOns.map((addon) => (
          <div
            key={addon.id}
            className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center text-[8px] font-bold ${
                      addon.isVeg ? 'border-emerald-600 text-emerald-600' : 'border-rose-600 text-rose-600'
                    }`}
                  >
                    ●
                  </span>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{addon.name}</h3>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-surface-container-low text-on-surface-variant text-[11px] font-semibold border border-surface-container-high/60">
                  {addon.category}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-headline-md text-headline-md font-bold text-primary">₹{addon.price}</span>
                <span className="text-on-surface-variant text-[12px] font-medium">+ tax</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-surface-container-high/60 flex items-center justify-between">
              <span className="font-mono text-[11px] text-on-surface-variant">{addon.id}</span>
              <button
                type="button"
                onClick={() => toggleAvailability(addon)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                  addon.isAvailable
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                }`}
              >
                {addon.isAvailable ? 'AVAILABLE' : 'OFFLINE'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
