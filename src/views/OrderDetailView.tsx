import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { mockStore } from '../mock/mockStore';
import { AdminMap, MapPoint } from '../components/maps/AdminMap';
import { Order } from '../types';

export const OrderDetailView: React.FC = () => {
  const { routeParams, navigateTo, addToast, openConfirm } = useUIStore();
  const orderId = routeParams.orderId || 'ORD-10293';

  const [order, setOrder] = useState<Order | undefined>(mockStore.getOrderById(orderId));
  const [internalNote, setInternalNote] = useState('');
  const [noteSuccess, setNoteSuccess] = useState(false);

  useEffect(() => {
    return mockStore.subscribe(() => {
      setOrder(mockStore.getOrderById(orderId));
    });
  }, [orderId]);

  if (!order) {
    return (
      <div className="p-8 text-center">
        <span className="material-symbols-outlined text-[48px] text-error mb-2">receipt_long</span>
        <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Order Not Found</h2>
        <p className="text-on-surface-variant text-body-md mt-1">Order #{orderId} does not exist in the platform registry.</p>
        <button
          onClick={() => navigateTo('orders')}
          className="mt-4 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold"
        >
          Return to Orders Book
        </button>
      </div>
    );
  }

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNote.trim()) return;
    mockStore.addOrderNote(order.id, internalNote.trim());
    setInternalNote('');
    setNoteSuccess(true);
    setTimeout(() => setNoteSuccess(false), 3000);
    addToast({
      type: 'SUCCESS',
      title: 'Operations Note Recorded',
      message: 'Attached to order audit ledger.',
    });
  };

  const handleIssueRefund = () => {
    openConfirm({
      title: 'Issue Customer Refund',
      message: `Process full refund of ₹${order.totalAmount} for Order #${order.id}?`,
      impact: 'Razorpay UPI engine will reverse charges and credit customer bank account.',
      confirmText: 'Process Immediate Refund',
      isDestructive: true,
      onConfirm: () => {
        mockStore.processRefund('REF-NEW', 'APPROVE');
        mockStore.updateOrderStatus(order.id, 'REFUNDED', 'Full refund processed by Admin');
        addToast({
          type: 'SUCCESS',
          title: 'Refund Executed',
          message: `₹${order.totalAmount} refunded to original payment method.`,
        });
      },
    });
  };

  const handleReassign = () => {
    const availableCouriers = mockStore.getDeliveryPartners().filter((p) => p.dutyStatus === 'AVAILABLE');
    if (availableCouriers.length === 0) {
      addToast({ type: 'WARNING', title: 'No Couriers Available', message: 'All drivers currently engaged.' });
      return;
    }
    const partner = availableCouriers[0];
    openConfirm({
      title: 'Reassign Courier Partner',
      message: `Reassign Order #${order.id} from ${order.deliveryPartnerName || 'unassigned'} to ${partner.name} (${partner.vehicleModel})?`,
      impact: 'New partner will receive instant pickup routing directions.',
      confirmText: 'Reassign Partner',
      onConfirm: () => {
        mockStore.reassignDeliveryPartner(order.id, partner.id);
        addToast({
          type: 'SUCCESS',
          title: 'Courier Reassigned Successfully',
          message: `${partner.name} is now en route to ${order.restaurantName}.`,
        });
      },
    });
  };

  // Map coordinates
  const restaurantPoint: MapPoint = {
    lat: order.deliveryCoordinates?.restaurantLat || 12.9345,
    lng: order.deliveryCoordinates?.restaurantLng || 77.6256,
    title: order.restaurantName,
    subtitle: order.restaurantOutlet,
    type: 'RESTAURANT',
  };

  const courierPoint: MapPoint | undefined = order.courierLocation ? {
    lat: order.courierLocation.lat,
    lng: order.courierLocation.lng,
    title: order.deliveryPartnerName || 'Courier Partner',
    subtitle: `${order.deliveryPartnerVehicle || 'Courier'} • ${order.courierLocation.speedKmH} km/h`,
    type: 'DELIVERY_PARTNER',
    speedKmH: order.courierLocation.speedKmH,
  } : undefined;

  const customerPoint: MapPoint = {
    lat: order.deliveryCoordinates?.customerLat || 12.9719,
    lng: order.deliveryCoordinates?.customerLng || 77.6412,
    title: order.customerName,
    subtitle: order.customerAddress,
    type: 'CUSTOMER',
  };

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Sticky Context Header */}
      <div className="py-space-md mb-space-lg flex flex-col gap-space-sm">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
            <button onClick={() => navigateTo('live-operations')} className="hover:text-primary transition-colors">
              Operations
            </button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <button onClick={() => navigateTo('orders')} className="hover:text-primary transition-colors">
              Orders
            </button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-tabular-mono text-tabular-mono text-on-surface font-semibold">
              #{order.id}
            </span>
          </div>

          <div className="flex items-center gap-space-sm font-label-sm text-label-sm">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px] text-tertiary">schedule</span>
              <span>Order Age: <strong>{order.orderAgeMinutes} mins</strong></span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-tabular-mono">
              <span className="h-2 w-2 rounded-full bg-tertiary" />
              <span>Cluster: {order.cluster}</span>
            </span>
          </div>
        </div>

        {/* Main Title & Operational Actions Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high/60">
          <div className="flex flex-col gap-space-2xs">
            <div className="flex flex-wrap items-center gap-space-sm">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Order #{order.id}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                </span>
                {order.status.replace(/_/g, ' ')}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  stars
                </span>
                High Priority • {order.customerTier} VIP
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">event</span>
              {order.createdAt} ({order.orderAgeMinutes} mins ago) via Mobile App v4.12 • Instant UPI
            </p>
          </div>

          {/* Action Group */}
          <div className="flex flex-wrap items-center gap-space-xs">
            <button
              onClick={() => addToast({ type: 'INFO', title: 'Connecting Customer', message: `Bridging to ${order.customerPhone}` })}
              type="button"
              className="h-9 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">call</span>
              <span>Customer</span>
            </button>
            <button
              onClick={() => addToast({ type: 'INFO', title: 'Connecting Courier', message: `Bridging to ${order.deliveryPartnerPhone || 'courier'}` })}
              type="button"
              className="h-9 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">two_wheeler</span>
              <span>Courier Partner</span>
            </button>
            <button
              onClick={handleReassign}
              type="button"
              className="h-9 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
              <span>Reassign</span>
            </button>
            <button
              onClick={handleIssueRefund}
              type="button"
              className="h-9 px-3 rounded-lg bg-error-container text-on-error-container hover:bg-error hover:text-on-error font-label-md text-label-md flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">drive_document_outline</span>
              <span>Issue Refund</span>
            </button>
          </div>
        </div>
      </div>

      {/* SLA Pulse Bar & Milestone Pipeline */}
      <div className="mb-space-lg bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high/60 flex flex-col gap-space-md">
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center justify-between font-label-sm text-label-sm">
            <div className="flex items-center gap-space-xs font-semibold text-on-surface">
              <span className="material-symbols-outlined text-[18px] text-tertiary">verified</span>
              <span>Fulfillment SLA Tracking</span>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-tabular-mono font-bold">
                Within Target • +6m Buffer
              </span>
            </div>
            <div className="text-on-surface-variant font-tabular-mono">
              Elapsed: <span className="font-bold text-on-surface">{order.orderAgeMinutes} mins</span> / Target:{' '}
              <span className="font-medium text-on-surface">34 mins</span> (ETA: {order.etaMinutes ? `${order.etaMinutes} mins left` : '14:42 IST'})
            </div>
          </div>
          <div className="h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden flex">
            <div className="h-full bg-tertiary-container transition-all" style={{ width: '82.3%' }} />
            <div className="h-full bg-secondary-fixed-dim animate-pulse" style={{ width: '17.7%' }} />
          </div>
        </div>

        {/* Stepper Lifecycle */}
        <div className="relative pt-space-xs pb-space-2xs overflow-x-auto">
          <div className="min-w-[860px] grid grid-cols-8 gap-2 relative">
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-surface-container-high -z-0" />
            <div className="absolute top-4 left-6 h-0.5 bg-tertiary-container -z-0" style={{ width: '80%' }} />

            {[
              { label: 'Order Placed', time: '14:18 IST', icon: 'check', done: true },
              { label: 'Accepted', time: '14:20 IST', icon: 'restaurant', done: true },
              { label: 'In Kitchen', time: '14:24 IST', icon: 'skillet', done: true },
              { label: 'KDS Ready', time: '14:32 IST', icon: 'takeout_dining', done: true },
              { label: 'Courier Assigned', time: 'Amit K. (14:28)', icon: 'person_pin_circle', done: true },
              { label: 'Picked Up', time: '14:35 IST', icon: 'local_mall', done: true },
              { label: 'Out for Delivery', time: 'ETA 6 mins', icon: 'two_wheeler', done: true, active: true },
              { label: 'Delivered', time: 'Pending', icon: 'home', done: false },
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center relative z-10">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${
                    step.active
                      ? 'bg-secondary text-on-secondary ring-4 ring-secondary-fixed animate-bounce'
                      : step.done
                      ? 'bg-tertiary-container text-on-tertiary'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{step.icon}</span>
                </div>
                <span
                  className={`font-label-sm text-label-sm mt-2 leading-tight ${
                    step.active ? 'font-bold text-secondary' : 'font-semibold text-on-surface'
                  }`}
                >
                  {step.label}
                </span>
                <span className="font-tabular-mono text-[11px] text-on-surface-variant">{step.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
        {/* Left Column: Map, Items, Financials */}
        <div className="xl:col-span-8 flex flex-col gap-space-lg">
          {/* Live Fleet Telemetry Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-md border border-surface-container-high/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="h-3 w-3 rounded-full bg-secondary animate-ping" />
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  Live Fleet Telemetry &amp; Geo-Tracking
                </span>
              </div>
              <div className="flex items-center gap-space-sm text-body-sm font-tabular-mono">
                <span className="px-2 py-0.5 rounded bg-surface-container-low text-on-surface font-semibold">
                  Ping: 4s ago
                </span>
                <span className="text-tertiary flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">battery_charging_full</span>
                  68%
                </span>
                <span className="text-secondary flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">speed</span>
                  24 km/h
                </span>
              </div>
            </div>

            {/* Embedded AdminMap */}
            <div className="relative w-full rounded-xl overflow-hidden shadow-sm">
              <AdminMap
                center={[restaurantPoint.lat, restaurantPoint.lng]}
                restaurant={restaurantPoint}
                courier={courierPoint}
                customer={customerPoint}
                height="280px"
              />
              <div className="absolute top-3 left-12 bg-surface-container-lowest/95 backdrop-blur-md p-3 rounded-lg shadow-md max-w-xs flex flex-col gap-1 border border-surface-container-high/60 z-10">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                  Transit Vector
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">1.4 km Remaining</span>
                  <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold">
                    ETA 6 min
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Current corridor: 12th Main Indiranagar heading North
                </p>
              </div>
            </div>
          </div>

          {/* Kitchen Items & Instructions Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-md border border-surface-container-high/60">
            <div className="flex items-center justify-between pb-space-xs">
              <div className="flex items-center gap-space-sm">
                <span className="h-9 w-9 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
                </span>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Kitchen Items &amp; Instructions</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Merchant: {order.restaurantName} • FSSAI Lic #11219334000412
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                Packed &amp; Verified ({order.items.length} Items)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                    <th className="py-2.5 px-3 rounded-l-lg">Item Particulars</th>
                    <th className="py-2.5 px-3">Prep Specs / Add-ons</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y-0 font-body-sm text-body-sm">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full flex-shrink-0 ${
                              item.isVeg ? 'bg-tertiary' : 'bg-primary'
                            }`}
                            title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                          />
                          <span className="font-semibold text-on-surface">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {item.specialInstructions ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-medium">
                            Special: {item.specialInstructions}
                          </span>
                        ) : (
                          <span className="text-on-surface-variant font-label-sm text-label-sm">Standard recipe</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-tabular-mono font-semibold">{item.quantity}</td>
                      <td className="py-3 px-3 text-right font-tabular-mono text-on-surface-variant">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-tabular-mono font-bold text-on-surface">₹{item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low mt-space-2xs">
              <span className="font-label-md text-label-md text-on-surface-variant">
                Items Subtotal ({order.items.length} lines)
              </span>
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface font-tabular-mono">
                ₹{order.itemsSubtotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Financial Audit & Settlement Split */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-md border border-surface-container-high/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="h-9 w-9 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                </span>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Financial Audit &amp; Settlement Split
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Payment Provider: {order.paymentProvider} • Auto-Captured
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                CAPTURED • SUCCESS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
              <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-2.5 border border-surface-container-high/40">
                <h3 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider mb-1">
                  Customer Invoice Ledger
                </h3>
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                  <span>Item Subtotal</span>
                  <span className="font-tabular-mono font-medium text-on-surface">₹{order.itemsSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                  <span>Restaurant Packaging &amp; Eco Charges</span>
                  <span className="font-tabular-mono font-medium text-on-surface">₹{order.packagingCharges.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                  <span>Delivery Fee</span>
                  <span className="font-tabular-mono font-medium text-on-surface">₹{order.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                  <span>Platform Weather / Surge Protection</span>
                  <span className="font-tabular-mono text-tertiary font-medium">₹0.00 (Waived)</span>
                </div>
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                  <span>GST &amp; Taxes (CGST 2.5% + SGST 2.5%)</span>
                  <span className="font-tabular-mono font-medium text-on-surface">₹{order.gstAmount.toFixed(2)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between font-body-sm text-body-sm text-primary font-semibold">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">sell</span> {order.promoCode || 'PROMO'}
                    </span>
                    <span className="font-tabular-mono">-₹{order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="h-px bg-surface-container-high my-1" />
                <div className="flex justify-between items-baseline pt-1">
                  <div>
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Total Paid</span>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Txn: {order.paymentId}</p>
                  </div>
                  <span className="font-headline-lg text-headline-lg font-bold text-primary font-tabular-mono">
                    ₹{order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between gap-space-md border border-surface-container-high/40">
                <div>
                  <h3 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider mb-2">
                    Automated Payout Matrix
                  </h3>
                  <div className="space-y-2.5 font-body-sm text-body-sm">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-lowest">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-tertiary">store</span>
                        <div>
                          <div className="font-semibold text-on-surface">Merchant Net Gross</div>
                          <div className="text-[11px] text-on-surface-variant">{order.restaurantName} • T+1 Settlement</div>
                        </div>
                      </div>
                      <span className="font-tabular-mono font-bold text-on-surface">₹{order.merchantNetPayout.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-lowest">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">hub</span>
                        <div>
                          <div className="font-semibold text-on-surface">Belzo Take Rate (18%)</div>
                          <div className="text-[11px] text-on-surface-variant">Platform commission retained</div>
                        </div>
                      </div>
                      <span className="font-tabular-mono font-bold text-primary">₹{order.platformCommission.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-lowest">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-secondary">two_wheeler</span>
                        <div>
                          <div className="font-semibold text-on-surface">Rider Delivery Earnings</div>
                          <div className="text-[11px] text-on-surface-variant">Base + EV Peak Boost</div>
                        </div>
                      </div>
                      <span className="font-tabular-mono font-bold text-secondary">₹{order.riderEarnings.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-container-highest/60 flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Payment Method Verified:</span>
                  <span className="font-label-md text-label-md text-on-surface font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-secondary">account_balance</span>
                    PhonePe UPI / Auto-Approved
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dossiers & Internal Audit */}
        <div className="xl:col-span-4 flex flex-col gap-space-lg">
          {/* Customer Dossier */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm border border-surface-container-high/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="relative">
                  <div className="h-11 w-11 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-base">
                    {order.customerName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-on-primary text-[10px] font-bold">
                    ★
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{order.customerName}</h3>
                  <span className="font-label-sm text-label-sm text-primary font-semibold">
                    Belzo {order.customerTier} • Priority Profile
                  </span>
                </div>
              </div>
              <button
                onClick={() => addToast({ type: 'INFO', title: 'Connecting Customer', message: `Calling ${order.customerPhone}` })}
                className="h-8 px-2.5 rounded bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">call</span>
                Call
              </button>
            </div>

            <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1.5 text-body-sm border border-surface-container-high/40">
              <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                <span>Phone Contact:</span>
                <span className="font-tabular-mono text-on-surface font-semibold">{order.customerPhone}</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                <span>Customer ID:</span>
                <span className="text-on-surface truncate font-mono">{order.customerId}</span>
              </div>
              <div className="h-px bg-surface-container-high my-1" />
              <div className="flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary flex-shrink-0 mt-0.5">location_on</span>
                <div className="text-on-surface leading-tight text-[13px]">{order.customerAddress}</div>
              </div>
              <div className="mt-1 p-2 rounded bg-surface-container text-on-surface-variant text-[12px] flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-primary flex-shrink-0">quickreply</span>
                <span><strong>Note to Courier:</strong> "Leave at door, ring doorbell once"</span>
              </div>
            </div>
          </div>

          {/* Delivery Partner Dossier */}
          {order.deliveryPartnerName && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm border border-surface-container-high/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <div className="relative">
                    <div className="h-11 w-11 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold">
                      {order.deliveryPartnerName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-tertiary ring-2 ring-surface" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">{order.deliveryPartnerName}</h3>
                      <span className="px-1.5 py-0.5 rounded bg-surface-container text-[11px] font-bold text-on-surface">
                        {order.deliveryPartnerRating || 4.85} ★
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-tertiary font-semibold">
                      1,420 Deliveries completed
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                  Active
                </span>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-2 text-body-sm border border-surface-container-high/40">
                <div className="grid grid-cols-2 gap-2 text-label-sm">
                  <div className="p-2 rounded bg-surface-container">
                    <div className="text-on-surface-variant">Assigned Vehicle</div>
                    <div className="font-bold text-on-surface truncate">{order.deliveryPartnerVehicle}</div>
                  </div>
                  <div className="p-2 rounded bg-surface-container">
                    <div className="text-on-surface-variant">SLA Adherence</div>
                    <div className="font-bold text-tertiary">98.4% On-Time</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => addToast({ type: 'INFO', title: 'Audio Call Started', message: `Bridging to ${order.deliveryPartnerPhone}` })}
                    className="flex-1 h-8 rounded bg-secondary text-on-secondary font-label-md text-label-md flex items-center justify-center gap-1.5 hover:bg-secondary-container transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    Live Audio Call
                  </button>
                  <button
                    onClick={() => addToast({ type: 'SUCCESS', title: 'GPS Ping Sent', message: 'Vehicle telemetry updated.' })}
                    className="h-8 px-3 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-secondary">my_location</span>
                    Ping GPS
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Restaurant Partner Dossier */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm border border-surface-container-high/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="h-11 w-11 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">storefront</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{order.restaurantName}</h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{order.restaurantOutlet} • 4.8 ★</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                Kitchen Online
              </span>
            </div>
            <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1.5 text-body-sm border border-surface-container-high/40">
              <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                <span>Branch Contact:</span>
                <span className="text-on-surface font-semibold">{order.restaurantPhone}</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                <span>Actual Prep Time:</span>
                <span className="font-tabular-mono font-bold text-tertiary">12 mins (Target: 15 mins)</span>
              </div>
            </div>
          </div>

          {/* Internal Audit Log & Operations Note Ledger */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm border border-surface-container-high/60">
            <div className="flex items-center justify-between pb-space-2xs">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">history_edu</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Internal Audit Log</h3>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Real-time Stream</span>
            </div>

            <div className="space-y-3 pl-2 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high">
              <div className="relative pl-5">
                <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-secondary" />
                <div className="flex items-baseline justify-between font-label-sm text-label-sm">
                  <span className="font-bold text-on-surface">Courier Picked Up</span>
                  <span className="font-tabular-mono text-on-surface-variant text-[11px]">14:36 IST</span>
                </div>
                <p className="font-body-sm text-[12px] text-on-surface-variant">
                  System: Partner Amit Kumar verified QR pickup code at dispatch counter.
                </p>
              </div>

              <div className="relative pl-5">
                <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-tertiary" />
                <div className="flex items-baseline justify-between font-label-sm text-label-sm">
                  <span className="font-bold text-on-surface">Kitchen Handover Ready</span>
                  <span className="font-tabular-mono text-on-surface-variant text-[11px]">14:32 IST</span>
                </div>
                <p className="font-body-sm text-[12px] text-on-surface-variant">
                  KDS marked items bagged with seal tag #7729.
                </p>
              </div>

              {order.notes?.map((n, i) => (
                <div key={i} className="relative pl-5">
                  <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex items-baseline justify-between font-label-sm text-label-sm">
                    <span className="font-bold text-on-surface">Admin Operations Note</span>
                    <span className="font-tabular-mono text-on-surface-variant text-[11px]">Recorded</span>
                  </div>
                  <p className="font-body-sm text-[12px] text-on-surface-variant">{n}</p>
                </div>
              ))}
            </div>

            {/* Note Post Form */}
            <form onSubmit={handlePostNote} className="mt-space-xs pt-space-xs flex flex-col gap-2">
              <div className="relative">
                <input
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Type internal operations note..."
                  className="w-full h-9 pl-3 pr-20 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all border border-surface-container-high/40"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-2.5 rounded bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-colors flex items-center gap-1 shadow-xs"
                >
                  Post
                </button>
              </div>
              {noteSuccess && (
                <div className="text-[11px] font-label-sm text-tertiary font-medium">
                  Note recorded to immutable audit trail.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
