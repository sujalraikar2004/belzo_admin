import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { mockStore } from '../mock/mockStore';
import { Restaurant, MenuItem } from '../types';

export const RestaurantDetailView: React.FC = () => {
  const { routeParams, navigateTo, addToast, openConfirm } = useUIStore();
  const restaurantId = routeParams.restaurantId || 'RES-104';

  const [restaurant, setRestaurant] = useState<Restaurant | undefined>(
    mockStore.getRestaurantById(restaurantId)
  );
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'DOCUMENTS' | 'MENU' | 'BANK'>('PROFILE');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    return mockStore.subscribe(() => {
      const updated = mockStore.getRestaurantById(restaurantId);
      setRestaurant(updated);
      if (updated) {
        setMenuItems(mockStore.getMenuItems().filter((m) => m.restaurantId === updated.id));
      }
    });
  }, [restaurantId]);

  useEffect(() => {
    if (restaurant) {
      setMenuItems(mockStore.getMenuItems().filter((m) => m.restaurantId === restaurant.id));
    }
  }, [restaurant]);

  if (!restaurant) {
    return (
      <div className="p-8 text-center">
        <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Restaurant Not Found</h2>
        <button
          onClick={() => navigateTo('restaurants')}
          className="mt-4 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  const handleApprove = () => {
    openConfirm({
      title: 'Approve Restaurant Onboarding',
      message: `Approve ${restaurant.name} (${restaurant.outletName}) to start accepting orders immediately?`,
      impact: 'Outlet will be published on customer app; notifications sent to partner.',
      confirmText: 'Approve & Activate',
      onConfirm: () => {
        mockStore.approveRestaurant(restaurant.id);
        addToast({
          type: 'SUCCESS',
          title: 'Restaurant Approved',
          message: `${restaurant.name} is now ACTIVE on Belzo marketplace.`,
        });
      },
    });
  };

  const handleReject = () => {
    const reason = prompt('Specify rejection / revision reason for partner:', 'FSSAI document expired or blur signature');
    if (!reason) return;
    mockStore.rejectRestaurant(restaurant.id, reason);
    addToast({
      type: 'WARNING',
      title: 'Application Rejected',
      message: `Partner notified with reason: "${reason}".`,
    });
  };

  const handleTogglePause = () => {
    mockStore.toggleRestaurantPause(restaurant.id);
    addToast({
      type: restaurant.status === 'PAUSED' ? 'SUCCESS' : 'WARNING',
      title: restaurant.status === 'PAUSED' ? 'Outlet Resumed' : 'Outlet Paused',
      message: `${restaurant.name} kitchen status updated.`,
    });
  };

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Breadcrumb Header */}
      <div className="py-space-md mb-space-md flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
          <button onClick={() => navigateTo('restaurants')} className="hover:text-primary transition-colors">
            Restaurants
          </button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="font-tabular-mono text-on-surface font-semibold">{restaurant.outletCode}</span>
        </div>

        {/* Hero Card */}
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container-high/60 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-16 h-16 rounded-2xl object-cover bg-surface-container-high shadow-sm"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                  {restaurant.name}
                </h1>
                {restaurant.isVerified && (
                  <span className="material-symbols-outlined text-tertiary text-[20px]" title="FSSAI Verified">
                    verified
                  </span>
                )}
                <span
                  className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold uppercase ${
                    restaurant.status === 'ONLINE'
                      ? 'bg-tertiary-container/15 text-tertiary'
                      : restaurant.status === 'BUSY'
                      ? 'bg-secondary-fixed text-on-secondary-fixed'
                      : restaurant.status === 'PAUSED'
                      ? 'bg-error-container text-on-error-container'
                      : 'bg-primary-fixed text-primary'
                  }`}
                >
                  {restaurant.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-on-surface-variant font-body-sm text-body-sm mt-0.5">
                {restaurant.outletName} • {restaurant.address} • {restaurant.city}
              </p>
              <div className="flex items-center gap-3 font-label-sm text-label-sm text-on-surface-variant mt-1">
                <span>Rating: <strong className="text-amber-500 font-bold">{restaurant.rating} ★</strong></span>
                <span>•</span>
                <span>Commission: <strong>{restaurant.commissionRate}%</strong></span>
                <span>•</span>
                <span>Prep: <strong>{restaurant.avgPrepTimeMinutes} mins</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {restaurant.status === 'PENDING_AUDIT' ? (
              <>
                <button
                  onClick={handleApprove}
                  className="h-9 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container shadow-sm"
                >
                  Approve Application
                </button>
                <button
                  onClick={handleReject}
                  className="h-9 px-3.5 rounded-lg bg-error-container text-on-error-container font-label-md text-label-md font-semibold hover:bg-error/20"
                >
                  Reject with Reason
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleTogglePause}
                  className={`h-9 px-3.5 rounded-lg font-label-md text-label-md font-semibold transition-colors ${
                    restaurant.status === 'PAUSED'
                      ? 'bg-tertiary text-on-tertiary'
                      : 'bg-surface-container-high text-primary hover:bg-error-container hover:text-on-error-container'
                  }`}
                >
                  {restaurant.status === 'PAUSED' ? 'Resume Kitchen' : 'Emergency Pause Kitchen'}
                </button>
                <button
                  onClick={() => addToast({ type: 'INFO', title: 'Editing Outlet', message: 'Modify details in settings.' })}
                  className="h-9 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md"
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container-high mb-space-md">
        {[
          { id: 'PROFILE', label: 'Overview & Performance', icon: 'dashboard' },
          { id: 'DOCUMENTS', label: `Documents & FSSAI (${restaurant.documents.length})`, icon: 'verified' },
          { id: 'MENU', label: `Menu Items (${menuItems.length})`, icon: 'restaurant_menu' },
          { id: 'BANK', label: 'Bank & Settlement Mandate', icon: 'account_balance' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-3 font-label-md text-label-md font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'PROFILE' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 space-y-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Today's Sales</span>
            <div className="font-headline-lg font-bold text-on-surface font-tabular-mono">₹{restaurant.gmvToday.toLocaleString('en-IN')}</div>
            <p className="text-body-sm text-on-surface-variant font-medium">{restaurant.ordersToday} completed orders</p>
          </div>
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 space-y-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Lifetime Volume</span>
            <div className="font-headline-lg font-bold text-on-surface font-tabular-mono">₹{restaurant.totalGmv.toLocaleString('en-IN')}</div>
            <p className="text-body-sm text-on-surface-variant font-medium">{restaurant.totalOrders} lifetime orders</p>
          </div>
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 space-y-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Hygiene Audit</span>
            <div className="flex items-center gap-1 text-headline-md font-bold text-tertiary">
              <span className="material-symbols-outlined text-[20px]">shield</span> FSSAI Grade {restaurant.fssaiGrade}
            </div>
            <p className="text-body-sm text-on-surface-variant">Lic: {restaurant.fssaiNumber} (Exp: {restaurant.fssaiExpiry})</p>
          </div>
        </div>
      )}

      {activeTab === 'DOCUMENTS' && (
        <div className="space-y-space-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {restaurant.documents.map((doc) => (
              <div key={doc.id} className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm font-bold text-on-surface">
                      {doc.type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${
                        doc.status === 'VERIFIED'
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                          : doc.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-error-container text-on-error-container'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                  <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">{doc.title}</h4>
                  <p className="font-tabular-mono text-body-sm text-on-surface-variant mt-1">Doc #: {doc.documentNumber}</p>
                  {doc.expiryDate && <p className="text-label-sm text-on-surface-variant">Expires: {doc.expiryDate}</p>}
                  {doc.rejectionReason && <p className="text-label-sm text-error mt-1">Reason: {doc.rejectionReason}</p>}
                </div>
                <div className="pt-4 flex items-center justify-between border-t border-surface-container-high mt-3">
                  <span className="text-primary font-semibold text-body-sm cursor-pointer hover:underline">
                    View Scanned File
                  </span>
                  {doc.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        doc.status = 'VERIFIED';
                        addToast({ type: 'SUCCESS', title: 'Document Verified', message: `${doc.title} marked valid.` });
                      }}
                      className="px-2.5 py-1 rounded bg-primary text-on-primary text-label-sm font-semibold"
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'MENU' && (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high/60 p-space-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Menu Items Catalog</h3>
            <button
              onClick={() => navigateTo('categories-and-menus')}
              className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold"
            >
              Manage Catalog
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {menuItems.map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${item.isVeg ? 'bg-tertiary' : 'bg-primary'}`} />
                  <div>
                    <h4 className="font-body-md text-body-md font-semibold text-on-surface">{item.name}</h4>
                    <span className="text-on-surface-variant text-label-sm">Prep: {item.prepTimeMinutes} mins • {item.spiceLevel}</span>
                  </div>
                </div>
                <span className="font-tabular-mono font-bold text-on-surface text-body-md">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'BANK' && (
        <div className="max-w-md bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high/60 p-space-lg space-y-3">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Escrow Bank Mandate</h3>
          <div className="space-y-2 text-body-sm">
            <div className="flex justify-between py-1 border-b border-surface-container-high">
              <span className="text-on-surface-variant">Beneficiary:</span>
              <span className="font-semibold text-on-surface">{restaurant.bankAccount.beneficiaryName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-container-high">
              <span className="text-on-surface-variant">Account Number:</span>
              <span className="font-tabular-mono font-semibold text-on-surface">{restaurant.bankAccount.accountNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-container-high">
              <span className="text-on-surface-variant">IFSC Code:</span>
              <span className="font-tabular-mono font-semibold text-on-surface">{restaurant.bankAccount.ifsc}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-container-high">
              <span className="text-on-surface-variant">Bank Name:</span>
              <span className="font-semibold text-on-surface">{restaurant.bankAccount.bankName}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
