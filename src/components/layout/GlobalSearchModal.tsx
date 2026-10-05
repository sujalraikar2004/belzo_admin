import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { mockStore } from '../../mock/mockStore';

export const GlobalSearchModal: React.FC = () => {
  const { isGlobalSearchOpen, setGlobalSearchOpen, navigateTo } = useUIStore();
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(!isGlobalSearchOpen);
      }
      if (e.key === 'Escape' && isGlobalSearchOpen) {
        setGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  const q = query.trim().toLowerCase();
  const orders = mockStore.getOrders().filter(
    (o) =>
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.restaurantName.toLowerCase().includes(q)
  ).slice(0, 3);

  const restaurants = mockStore.getRestaurants().filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.outletName.toLowerCase().includes(q) ||
      r.zone.toLowerCase().includes(q)
  ).slice(0, 3);

  const deliveryPartners = mockStore.getDeliveryPartners().filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.vehicleNumber.toLowerCase().includes(q)
  ).slice(0, 3);

  const customers = mockStore.getCustomers().filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q)
  ).slice(0, 3);

  const tickets = mockStore.getTickets().filter(
    (t) =>
      t.id.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q)
  ).slice(0, 3);

  const handleSelect = (route: string, params?: Record<string, string>) => {
    setGlobalSearchOpen(false);
    setQuery('');
    navigateTo(route, params);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-surface-container-high gap-3 bg-surface-container-low/40">
          <span className="material-symbols-outlined text-primary text-[22px]">search</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders (#BG...), restaurants, fleet riders, customers, tickets..."
            className="w-full bg-transparent text-on-surface placeholder:text-on-surface-variant font-body-md text-body-md focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[480px] overflow-y-auto p-3 space-y-4">
          {/* Orders Section */}
          {orders.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-label-sm text-on-surface-variant uppercase font-bold tracking-wider">
                Orders
              </div>
              <div className="space-y-1">
                {orders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => handleSelect('order-detail', { orderId: o.id })}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary text-[20px]">receipt_long</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-tabular-mono font-bold text-secondary group-hover:text-primary transition-colors">
                            {o.id}
                          </span>
                          <span className="text-on-surface font-semibold text-body-sm">{o.customerName}</span>
                          <span className="text-on-surface-variant text-[11px]">• {o.restaurantName}</span>
                        </div>
                        <span className="text-on-surface-variant font-label-sm text-label-sm">
                          Total: ₹{o.totalAmount} • {o.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant text-[16px] group-hover:translate-x-0.5 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Restaurants Section */}
          {restaurants.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-label-sm text-on-surface-variant uppercase font-bold tracking-wider">
                Restaurants
              </div>
              <div className="space-y-1">
                {restaurants.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect('restaurant-detail', { restaurantId: r.id })}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[20px]">storefront</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-on-surface text-body-sm">{r.name}</span>
                          <span className="font-tabular-mono text-[11px] text-primary">{r.outletCode}</span>
                          <span className="text-[11px] text-tertiary font-bold">{r.rating}★</span>
                        </div>
                        <span className="text-on-surface-variant font-label-sm text-label-sm">
                          {r.address} • {r.status}
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant text-[16px] group-hover:translate-x-0.5 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Partners Section */}
          {deliveryPartners.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-label-sm text-on-surface-variant uppercase font-bold tracking-wider">
                Delivery Partners
              </div>
              <div className="space-y-1">
                {deliveryPartners.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect('delivery-partners')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-tertiary text-[20px]">two_wheeler</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-on-surface text-body-sm">{p.name}</span>
                          <span className="font-tabular-mono text-[11px] text-on-surface-variant">{p.code}</span>
                          <span className="text-[11px] text-on-surface-variant font-mono">({p.vehicleNumber})</span>
                        </div>
                        <span className="text-on-surface-variant font-label-sm text-label-sm">
                          {p.dutyStatus.replace(/_/g, ' ')} • {p.cluster}
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant text-[16px] group-hover:translate-x-0.5 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customers Section */}
          {customers.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-label-sm text-on-surface-variant uppercase font-bold tracking-wider">
                Customers
              </div>
              <div className="space-y-1">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect('customers/detail', { customerId: c.id })}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-on-surface text-body-sm">{c.name}</span>
                          <span className="px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold">
                            {c.tier}
                          </span>
                        </div>
                        <span className="text-on-surface-variant font-label-sm text-label-sm">
                          {c.phone} • {c.email}
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant text-[16px] group-hover:translate-x-0.5 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tickets Section */}
          {tickets.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-label-sm text-on-surface-variant uppercase font-bold tracking-wider">
                Support Escalations
              </div>
              <div className="space-y-1">
                {tickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelect('tickets-and-issues', { ticketId: t.id })}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-error text-[20px]">warning</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-tabular-mono font-bold text-error">{t.id}</span>
                          <span className="font-bold text-on-surface text-body-sm truncate max-w-sm">{t.subject}</span>
                        </div>
                        <span className="text-on-surface-variant font-label-sm text-label-sm">
                          {t.priority} • {t.customerName}
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant text-[16px] group-hover:translate-x-0.5 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && orders.length === 0 && restaurants.length === 0 && deliveryPartners.length === 0 && customers.length === 0 && tickets.length === 0 && (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[36px] text-outline mb-2">search_off</span>
              <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">No operational records found</p>
              <p className="text-body-sm text-on-surface-variant mt-1">Try searching by order code (e.g. BG10294), partner name, or customer phone.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
