import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { mockStore } from '../mock/mockStore';
import { AdminMap, MapPoint } from '../components/maps/AdminMap';
import { Order } from '../types';

export const LiveOperationsView: React.FC = () => {
  const { navigateTo, addToast, openConfirm } = useUIStore();
  const [orders, setOrders] = useState<Order[]>(mockStore.getOrders());
  const [selectedOrderId, setSelectedOrderId] = useState<string>('ORD-10294');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAutoSyncing, setIsAutoSyncing] = useState<boolean>(true);

  useEffect(() => {
    return mockStore.subscribe(() => {
      setOrders([...mockStore.getOrders()]);
    });
  }, []);

  // Filter orders
  const activeOrders = orders.filter((o) => {
    if (filterStatus === 'DELAYED') return o.hasSlaBreach || (o.delayMinutes && o.delayMinutes > 5);
    if (filterStatus === 'PREPARING') return o.status === 'PREPARING';
    if (filterStatus === 'READY_FOR_PICKUP') return o.status === 'READY_FOR_PICKUP';
    if (filterStatus === 'IN_TRANSIT') return o.status === 'OUT_FOR_DELIVERY';
    if (filterStatus === 'ESCALATION') return o.isPriority || o.hasSlaBreach;
    return o.status !== 'DELIVERED' && o.status !== 'COMPLETED' && o.status !== 'REFUNDED';
  }).filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.restaurantName.toLowerCase().includes(q) ||
      (o.deliveryPartnerName && o.deliveryPartnerName.toLowerCase().includes(q))
    );
  });

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || activeOrders[0] || orders[0];

  // Map markers for selected order
  const restaurantPoint: MapPoint | undefined = selectedOrder?.deliveryCoordinates ? {
    lat: selectedOrder.deliveryCoordinates.restaurantLat,
    lng: selectedOrder.deliveryCoordinates.restaurantLng,
    title: selectedOrder.restaurantName,
    subtitle: selectedOrder.restaurantOutlet,
    type: 'RESTAURANT',
  } : undefined;

  const courierPoint: MapPoint | undefined = selectedOrder?.courierLocation ? {
    lat: selectedOrder.courierLocation.lat,
    lng: selectedOrder.courierLocation.lng,
    title: selectedOrder.deliveryPartnerName || 'Courier',
    subtitle: selectedOrder.deliveryPartnerVehicle || 'Courier Vehicle',
    type: 'DELIVERY_PARTNER',
    speedKmH: selectedOrder.courierLocation.speedKmH,
  } : undefined;

  const customerPoint: MapPoint | undefined = selectedOrder?.deliveryCoordinates ? {
    lat: selectedOrder.deliveryCoordinates.customerLat,
    lng: selectedOrder.deliveryCoordinates.customerLng,
    title: selectedOrder.customerName,
    subtitle: selectedOrder.customerAddress,
    type: 'CUSTOMER',
  } : undefined;

  const otherFleetPoints: MapPoint[] = mockStore.getDeliveryPartners()
    .filter((p) => p.dutyStatus === 'AVAILABLE')
    .slice(0, 3)
    .map((p) => ({
      lat: p.lat,
      lng: p.lng,
      title: p.name,
      subtitle: `${p.vehicleModel} • Available`,
      type: 'DELIVERY_PARTNER',
    }));

  const handleReassign = () => {
    const availableCouriers = mockStore.getDeliveryPartners().filter((p) => p.dutyStatus === 'AVAILABLE');
    if (availableCouriers.length === 0) {
      addToast({ type: 'WARNING', title: 'No Idle Couriers', message: 'All drivers currently engaged.' });
      return;
    }
    const newCourier = availableCouriers[0];
    openConfirm({
      title: 'Confirm Courier Reassignment',
      message: `Reassign Order #${selectedOrder.id} from ${selectedOrder.deliveryPartnerName || 'current partner'} to ${newCourier.name} (${newCourier.vehicleModel})?`,
      impact: 'Prior partner will be released back to available pool; new partner will receive push notification.',
      confirmText: 'Reassign Courier',
      isDestructive: false,
      onConfirm: () => {
        mockStore.reassignDeliveryPartner(selectedOrder.id, newCourier.id);
        addToast({
          type: 'SUCCESS',
          title: 'Courier Reassigned Successfully',
          message: `${newCourier.name} dispatched to ${selectedOrder.restaurantName}.`,
        });
      },
    });
  };

  const handleGrantApologyCredit = () => {
    mockStore.addCustomerWalletCredit(selectedOrder.customerId, 100, `Apology delay voucher for Order ${selectedOrder.id}`);
    addToast({
      type: 'SUCCESS',
      title: '₹100 Wallet Credit Attached',
      message: `Credit transferred directly to ${selectedOrder.customerName}'s Belzo Cash balance.`,
    });
  };

  const handleEmergencyCancel = () => {
    openConfirm({
      title: 'Emergency Order Cancellation & Refund',
      message: `Are you sure you want to cancel Order #${selectedOrder.id} and issue full immediate refund?`,
      impact: 'Kitchen will be instructed to halt prep; customer will be refunded ₹' + selectedOrder.totalAmount + '; audit trail logged.',
      confirmText: 'Emergency Cancel & Refund',
      isDestructive: true,
      onConfirm: () => {
        mockStore.cancelOrder(selectedOrder.id, 'Mission Control Emergency Intervention');
        addToast({
          type: 'WARNING',
          title: 'Order Cancelled & Refunded',
          message: `Order #${selectedOrder.id} cancelled. Refund credited.`,
        });
      },
    });
  };

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Top Command Telemetry & Operations Bar */}
      <section className="w-full bg-surface-container-lowest shadow-sm py-space-sm px-space-md flex flex-col gap-space-sm border-b border-surface-container-high/60">
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-1.5 rounded-lg border border-surface-container-high/40">
              <span className="material-symbols-outlined text-primary text-[20px]">near_me</span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                  Active Logistics Cluster
                </span>
                <div className="flex items-center gap-1 cursor-pointer">
                  <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    Bengaluru Central &amp; South Zone
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">expand_more</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-space-xs bg-surface-container-low px-space-md py-1.5 rounded-lg border border-surface-container-high/40">
              <div className="relative flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
                <span className="absolute w-4 h-4 rounded-full bg-tertiary/30 animate-ping" />
              </div>
              <span className="font-label-md text-label-md text-on-surface font-semibold">Live Fleet Mesh Synced</span>
              <span className="text-on-surface-variant font-tabular-mono text-body-sm font-medium">(10s Pulse Active)</span>
            </div>
          </div>

          <div className="flex items-center gap-space-sm">
            <div className="flex items-center bg-surface-container-low rounded-lg p-1 border border-surface-container-high/40">
              <button
                onClick={() => setIsAutoSyncing(true)}
                className={`px-space-sm py-1 rounded font-label-md text-label-md transition-all ${
                  isAutoSyncing
                    ? 'bg-surface-container-lowest shadow-sm text-on-surface font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] text-tertiary mr-1 align-middle">autorenew</span>
                Auto (10s)
              </button>
              <button
                onClick={() => setIsAutoSyncing(false)}
                className={`px-space-sm py-1 rounded font-label-md text-label-md transition-all ${
                  !isAutoSyncing
                    ? 'bg-surface-container-lowest shadow-sm text-on-surface font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Pause
              </button>
            </div>

            <button
              onClick={() => navigateTo('platform-settings')}
              className="h-9 px-space-md rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md font-semibold flex items-center gap-1.5 transition-colors border border-surface-container-high/60"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Geofence Thresholds</span>
            </button>

            <button
              onClick={handleEmergencyCancel}
              className="h-9 px-space-md rounded-lg bg-error-container hover:bg-error/20 text-on-error-container font-label-md text-label-md font-bold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span>Emergency Pause Zone</span>
            </button>
          </div>
        </div>

        {/* Filter Chips with Tabular Density Counters */}
        <div className="flex items-center gap-space-xs overflow-x-auto pb-1 pt-1 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Active', count: 1248 },
            { id: 'WAITING', label: 'Waiting for Restaurant', count: 142 },
            { id: 'PREPARING', label: 'Preparing', count: 310 },
            { id: 'READY_FOR_PICKUP', label: 'Ready for Pickup', count: 89 },
            { id: 'IN_TRANSIT', label: 'Assigned / In-Transit', count: 680 },
            { id: 'DELAYED', label: 'Delayed (>35m)', count: 27, isError: true },
            { id: 'ESCALATION', label: 'Critical Escalation', count: 6, isCritical: true },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilterStatus(chip.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap transition-all shadow-xs ${
                filterStatus === chip.id
                  ? 'bg-on-surface text-inverse-on-surface font-bold shadow-sm'
                  : chip.isCritical
                  ? 'bg-primary-container text-on-primary-container'
                  : chip.isError
                  ? 'bg-error-container text-on-error-container'
                  : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {chip.isCritical && (
                <span className="material-symbols-outlined text-[16px] animate-bounce">priority_high</span>
              )}
              {chip.isError && <span className="flex h-2 w-2 rounded-full bg-error" />}
              <span>{chip.label}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-surface-container-lowest/20 font-tabular-mono text-body-sm font-bold">
                {chip.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Tri-Pane Workspace */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-space-md pt-space-md">
        {/* LEFT PANEL: Real-Time Order Stream (Cols 3) */}
        <div className="xl:col-span-3 flex flex-col gap-space-sm h-[380px] xl:h-[calc(100vh-175px)]">
          <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col gap-space-xs border border-surface-container-high/60">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 text-on-surface-variant text-[18px]">
                filter_list
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Order ID, Client, Courier..."
                className="w-full h-8 pl-8 pr-3 bg-surface-container-low rounded-lg text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest transition-colors"
              />
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                QUEUE SORT: SEVERITY
              </span>
              <span className="font-label-sm text-label-sm text-primary font-bold cursor-pointer hover:underline">
                Batch Route (4)
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-space-sm pr-1">
            {activeOrders.map((order) => {
              const isSelected = order.id === selectedOrder?.id;
              const isDelayed = order.hasSlaBreach || (order.delayMinutes && order.delayMinutes > 5);

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`p-space-md rounded-xl shadow-sm cursor-pointer relative overflow-hidden transition-all border ${
                    isSelected
                      ? 'bg-surface-container-lowest shadow-md border-primary ring-1 ring-primary'
                      : 'bg-surface-container-lowest border-surface-container-high/60 hover:shadow-md'
                  } ${isDelayed ? 'bg-gradient-to-r from-error/5 via-transparent to-transparent' : ''}`}
                >
                  {isDelayed && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error" />}

                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                          {order.id}
                        </span>
                        {isDelayed && (
                          <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold uppercase tracking-wider">
                            DELAYED +{order.delayMinutes || 8}m
                          </span>
                        )}
                        {!isDelayed && (
                          <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                        {order.restaurantName} → {order.customerName}
                      </span>
                    </div>
                    <span className={`font-tabular-mono text-body-sm font-extrabold ${isDelayed ? 'text-error' : 'text-secondary'}`}>
                      {order.orderAgeMinutes}m active
                    </span>
                  </div>

                  {order.deliveryPartnerName && (
                    <div className="mt-space-sm bg-surface-container-low p-2 rounded-lg flex items-center justify-between text-on-surface">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                          <span className="material-symbols-outlined text-[16px]">two_wheeler</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md font-bold text-on-surface">
                            {order.deliveryPartnerName}
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {isDelayed ? 'Stuck at 100ft Rd Traffic' : 'In transit • On track'}
                          </span>
                        </div>
                      </div>
                      {isDelayed && (
                        <span className="material-symbols-outlined text-error text-[18px]">traffic</span>
                      )}
                    </div>
                  )}

                  <div className="mt-space-sm flex items-center gap-space-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrderId(order.id);
                        handleReassign();
                      }}
                      className="flex-1 py-1 rounded bg-primary text-on-primary font-label-sm text-label-sm font-bold hover:bg-primary-container transition-colors shadow-xs"
                    >
                      Reassign Courier
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToast({ type: 'INFO', title: 'Connecting Call', message: `Bridging to ${order.deliveryPartnerPhone || order.customerPhone}` });
                      }}
                      className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[16px]">call</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER AREA: Tactical Map & Spatial Telemetry (Cols 5) */}
        <div className="xl:col-span-5 flex flex-col gap-space-sm h-[440px] xl:h-[calc(100vh-175px)]">
          <div className="relative w-full flex-1 rounded-2xl overflow-hidden shadow-md bg-surface-container-high border border-surface-container-high/60 flex flex-col">
            <AdminMap
              center={restaurantPoint ? [restaurantPoint.lat, restaurantPoint.lng] : [12.9716, 77.6412]}
              restaurant={restaurantPoint}
              courier={courierPoint}
              customer={customerPoint}
              otherCouriers={otherFleetPoints}
              height="100%"
              className="flex-1"
            />

            {/* Live Tactical Telemetry HUD */}
            <div className="absolute bottom-2 left-2 right-2 bg-surface-container-lowest/95 backdrop-blur-md p-space-sm rounded-xl shadow-lg border border-surface-container-high/60 z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm divide-x divide-surface-container-high">
                <div className="flex flex-col px-space-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                    Active Fleet Mesh
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-headline-md text-headline-md font-extrabold text-on-surface font-tabular-mono">
                      4,890
                    </span>
                    <span className="font-label-sm text-label-sm text-tertiary font-bold">Online</span>
                  </div>
                </div>

                <div className="flex flex-col px-space-xs pl-space-md">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                    On-Time SLA
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-headline-md text-headline-md font-extrabold text-on-surface font-tabular-mono">
                      94.2%
                    </span>
                    <span className="font-label-sm text-label-sm text-error font-semibold">-1.4% peak</span>
                  </div>
                </div>

                <div className="flex flex-col px-space-xs pl-space-md">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                    Avg Trip Distance
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-headline-md text-headline-md font-extrabold text-on-surface font-tabular-mono">
                      3.8 km
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">18.4m transit</span>
                  </div>
                </div>

                <div className="flex flex-col px-space-xs pl-space-md">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                    Weather &amp; Rain Surge
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="material-symbols-outlined text-amber-500 text-[18px]">sunny</span>
                    <span className="font-label-md text-label-md font-bold text-on-surface">Clear (No Surge)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Precision Order Escalation Drawer (Cols 4) */}
        <div className="xl:col-span-4 flex flex-col gap-space-sm h-auto xl:h-[calc(100vh-175px)] overflow-y-auto pr-1">
          {selectedOrder && (
            <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm flex flex-col gap-space-md border border-surface-container-high/60">
              {/* Order Header & Urgency Badge */}
              <div className="flex items-start justify-between pb-space-xs">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => navigateTo('order-detail', { orderId: selectedOrder.id })}
                      className="font-headline-md text-headline-md font-bold text-on-surface hover:text-primary cursor-pointer transition-colors"
                    >
                      Order #{selectedOrder.id}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">
                      {selectedOrder.hasSlaBreach ? 'ESCALATION' : 'LIVE'}
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Priority Delivery • Placed {selectedOrder.createdAt}
                  </span>
                </div>
                <button
                  onClick={() => navigateTo('order-detail', { orderId: selectedOrder.id })}
                  title="Open Full Details Page"
                  className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                </button>
              </div>

              {/* Alert Notification Card */}
              {selectedOrder.hasSlaBreach && (
                <div className="bg-error-container/40 p-space-sm rounded-xl flex items-start gap-space-sm border border-error-container">
                  <span className="material-symbols-outlined text-error text-[20px] mt-0.5">
                    warning
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-bold text-on-error-container">
                      Critical Transit Delay Detected
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Rider stationary for &gt;7 mins near 100 Feet Road bottleneck. Customer has viewed tracking screen 4 times in 3 minutes.
                    </span>
                  </div>
                </div>
              )}

              {/* Stakeholders Grid */}
              <div className="space-y-space-sm">
                {/* Customer Profile */}
                <div className="bg-surface-container-low p-space-sm rounded-xl flex items-center justify-between border border-surface-container-high/40">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface font-bold">
                      {selectedOrder.customerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-bold text-on-surface">
                        {selectedOrder.customerName} (Customer)
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {selectedOrder.customerPhone} • {selectedOrder.customerAddress}
                      </span>
                      <span className="font-label-sm text-label-sm text-tertiary font-medium">
                        Belzo {selectedOrder.customerTier} Member
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => addToast({ type: 'INFO', title: 'Connecting Customer', message: `Calling ${selectedOrder.customerPhone}` })}
                    className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">phone</span>
                  </button>
                </div>

                {/* Restaurant Profile */}
                <div className="bg-surface-container-low p-space-sm rounded-xl flex items-center justify-between border border-surface-container-high/40">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-[20px]">storefront</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-bold text-on-surface">
                        {selectedOrder.restaurantName}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {selectedOrder.restaurantOutlet} • Lead: Suresh
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Food Dispatched at 20:04 IST
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => addToast({ type: 'INFO', title: 'Connecting Restaurant', message: `Calling ${selectedOrder.restaurantPhone}` })}
                    className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
                  </button>
                </div>

                {/* Delivery Partner Profile */}
                {selectedOrder.deliveryPartnerName && (
                  <div className="bg-surface-container-low p-space-sm rounded-xl flex items-center justify-between border border-surface-container-high/40">
                    <div className="flex items-center gap-space-sm">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold">
                          {selectedOrder.deliveryPartnerName.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-error border-2 border-surface-container-low" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-label-md text-label-md font-bold text-on-surface">
                            {selectedOrder.deliveryPartnerName} (Courier)
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm font-semibold">
                            {selectedOrder.deliveryPartnerRating || 4.8}★
                          </span>
                        </div>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          {selectedOrder.deliveryPartnerPhone} • {selectedOrder.deliveryPartnerVehicle}
                        </span>
                        <div className="flex items-center gap-space-sm font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                          <span className="flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px] text-tertiary">battery_charging_full</span> 84%
                          </span>
                          <span>• GPS Signal: Strong</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => addToast({ type: 'INFO', title: 'Connecting Courier', message: `Calling ${selectedOrder.deliveryPartnerPhone}` })}
                      className="p-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">call</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Fulfillment Lifecycle Timeline */}
              <div className="flex flex-col gap-space-xs pt-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                  Fulfillment Lifecycle
                </span>
                <div className="relative pl-6 space-y-3.5 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high">
                  {selectedOrder.timeline.map((step, idx) => (
                    <div key={idx} className="relative flex items-center justify-between font-body-sm text-body-sm">
                      <span
                        className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-surface-container-lowest ${
                          step.active ? 'bg-error animate-pulse' : step.completed ? 'bg-tertiary' : 'bg-surface-container-high'
                        }`}
                      />
                      <span className={step.active ? 'text-error font-bold' : 'text-on-surface font-semibold'}>
                        {step.label}
                      </span>
                      <span className="font-tabular-mono text-on-surface-variant font-medium">
                        {step.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mission Control Interventions */}
              <div className="flex flex-col gap-space-xs pt-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                  Mission Control Interventions
                </span>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={handleReassign}
                    className="w-full py-2 px-space-md rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold flex items-center justify-between hover:bg-primary-container transition-all shadow-sm active:scale-95"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">swap_horizontal_circle</span>
                      <span>Reassign to Nearest Idle Courier</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-on-primary/20 text-on-primary font-label-sm text-label-sm">
                      3 Available
                    </span>
                  </button>

                  <button
                    onClick={handleGrantApologyCredit}
                    className="w-full py-2 px-space-md rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center justify-between transition-colors border border-surface-container-high/40"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">loyalty</span>
                      <span>Grant Customer Apology Credit</span>
                    </div>
                    <span className="font-tabular-mono text-tertiary font-bold">₹100 Wallet Pass</span>
                  </button>

                  <button
                    onClick={() => addToast({ type: 'INFO', title: 'Bridge Call Initiated', message: 'Connecting Admin, Rider Rohit V., and Client Aarav K.' })}
                    className="w-full py-2 px-space-md rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center gap-2 transition-colors border border-surface-container-high/40"
                  >
                    <span className="material-symbols-outlined text-secondary text-[18px]">support_agent</span>
                    <span>Open 3-Way Bridge Call (Admin • Rider • Client)</span>
                  </button>

                  <button
                    onClick={handleEmergencyCancel}
                    className="w-full py-2 px-space-md rounded-xl bg-error-container hover:bg-error/20 text-on-error-container font-label-md text-label-md font-bold flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-error text-[18px]">cancel</span>
                      <span>Emergency Cancel &amp; Full Refund</span>
                    </div>
                    <span className="text-error font-tabular-mono text-label-sm">Instant UPI</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
