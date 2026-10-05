import React, { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { orderService, notificationService } from '../../services/api';

export const DispatchActionModal: React.FC = () => {
  const { isDispatchActionModalOpen, setDispatchActionModalOpen, addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<'SURGE' | 'BROADCAST' | 'OVERRIDE_ORDER' | 'PAUSE_ZONE'>('SURGE');

  // Form states
  const [selectedCluster, setSelectedCluster] = useState('BLR-KORAMANGALA-S2');
  const [surgeAmount, setSurgeAmount] = useState('25');
  const [broadcastTitle, setBroadcastTitle] = useState('Monsoon Incentive Live');
  const [broadcastMessage, setBroadcastMessage] = useState('All couriers in Bengaluru Central receive +₹25 per completed drop for next 90 mins.');
  const [overrideCustomer, setOverrideCustomer] = useState('VIP Executive Guest');
  const [overrideAmount, setOverrideAmount] = useState('650');

  if (!isDispatchActionModalOpen) return null;

  const handleApplySurge = () => {
    addToast({
      type: 'SUCCESS',
      title: `₹${surgeAmount} Rain/Demand Surge Activated`,
      message: `Surge incentive applied across ${selectedCluster}. 42 active couriers notified via SMS & push.`,
    });
    setDispatchActionModalOpen(false);
  };

  const handleSendBroadcast = async () => {
    await notificationService.sendBroadcast({
      title: broadcastTitle,
      message: broadcastMessage,
      audience: 'DELIVERY_PARTNERS',
      platform: 'APP_PUSH',
      scheduledTime: 'Immediate',
      priority: 'URGENT',
    });
    addToast({
      type: 'SUCCESS',
      title: 'Dispatch Fleet Alert Broadcasted',
      message: 'Push alert sent to 4,890 active delivery partner apps.',
    });
    setDispatchActionModalOpen(false);
  };

  const handleCreateOverride = async () => {
    await orderService.createManualOrder({
      customerName: overrideCustomer,
      itemsSubtotal: Number(overrideAmount),
    });
    addToast({
      type: 'SUCCESS',
      title: 'Manual Override Order Injected',
      message: 'High priority order sent directly to KDS queue.',
    });
    setDispatchActionModalOpen(false);
  };

  const handleEmergencyZonePause = () => {
    addToast({
      type: 'WARNING',
      title: 'Cluster Ingress Halted',
      message: `New order placement temporarily restricted in ${selectedCluster} due to traffic backlog.`,
    });
    setDispatchActionModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-space-md border-b border-surface-container-high bg-surface-container-low/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">send</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Emergency Dispatch & Fleet Control
              </h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Tactical interventions across regional delivery meshes
              </p>
            </div>
          </div>
          <button
            onClick={() => setDispatchActionModalOpen(false)}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-2 bg-surface-container-low border-b border-surface-container-high">
          <button
            onClick={() => setActiveTab('SURGE')}
            className={`flex-1 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-all ${
              activeTab === 'SURGE'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Trigger Surge Bonus
          </button>
          <button
            onClick={() => setActiveTab('BROADCAST')}
            className={`flex-1 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-all ${
              activeTab === 'BROADCAST'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Fleet Alert
          </button>
          <button
            onClick={() => setActiveTab('OVERRIDE_ORDER')}
            className={`flex-1 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-all ${
              activeTab === 'OVERRIDE_ORDER'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Manual Override
          </button>
          <button
            onClick={() => setActiveTab('PAUSE_ZONE')}
            className={`flex-1 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-all ${
              activeTab === 'PAUSE_ZONE'
                ? 'bg-surface-container-lowest text-error shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Halt Cluster
          </button>
        </div>

        {/* Content Body */}
        <div className="p-space-lg space-y-4">
          {activeTab === 'SURGE' && (
            <div className="space-y-3">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase mb-1">
                  Target Dispatch Cluster
                </label>
                <select
                  value={selectedCluster}
                  onChange={(e) => setSelectedCluster(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none"
                >
                  <option value="BLR-KORAMANGALA-S2">BLR: Koramangala & Indiranagar Hub</option>
                  <option value="BLR-HSR-S1">BLR: HSR Layout & Bellandur</option>
                  <option value="PUN-BANER-W1">PUN: Baner & Aundh</option>
                  <option value="BOM-BANDRA-W1">BOM: Bandra & BKC Corridor</option>
                  <option value="HYD-HITEC-C1">HYD: Cyber Towers & Gachibowli</option>
                </select>
              </div>

              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase mb-1">
                  Surge Incentive Added Per Delivery
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['15', '25', '40', '60'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSurgeAmount(amt)}
                      className={`py-2 rounded-lg font-tabular-mono font-bold text-body-md border transition-all ${
                        surgeAmount === amt
                          ? 'bg-primary-fixed text-primary border-primary'
                          : 'bg-surface-container-low text-on-surface border-transparent hover:bg-surface-container'
                      }`}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-tertiary-fixed/30 border border-tertiary/20 text-body-sm text-tertiary font-medium">
                Surge auto-expires in 90 minutes. 4,890 active delivery partners will receive immediate in-app broadcast.
              </div>

              <button
                onClick={handleApplySurge}
                className="w-full h-10 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container shadow-sm transition-all"
              >
                Confirm & Deploy Surge Incentive
              </button>
            </div>
          )}

          {activeTab === 'BROADCAST' && (
            <div className="space-y-3">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase mb-1">
                  Broadcast Alert Title
                </label>
                <input
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase mb-1">
                  Message Copy
                </label>
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full p-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none resize-none"
                />
              </div>
              <button
                onClick={handleSendBroadcast}
                className="w-full h-10 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container shadow-sm transition-all"
              >
                Send High Priority Push Alert
              </button>
            </div>
          )}

          {activeTab === 'OVERRIDE_ORDER' && (
            <div className="space-y-3">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase mb-1">
                  Customer / VIP Name
                </label>
                <input
                  value={overrideCustomer}
                  onChange={(e) => setOverrideCustomer(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase mb-1">
                  Subtotal Value (₹)
                </label>
                <input
                  type="number"
                  value={overrideAmount}
                  onChange={(e) => setOverrideAmount(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none font-tabular-mono"
                />
              </div>
              <button
                onClick={handleCreateOverride}
                className="w-full h-10 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container shadow-sm transition-all"
              >
                Dispatch Manual Priority Order
              </button>
            </div>
          )}

          {activeTab === 'PAUSE_ZONE' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-error-container text-on-error-container text-body-sm">
                <strong>Emergency Action:</strong> Halting cluster stops new customer checkouts in this area while in-flight orders finish delivery.
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase mb-1">
                  Cluster to Halt
                </label>
                <select
                  value={selectedCluster}
                  onChange={(e) => setSelectedCluster(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none"
                >
                  <option value="BLR-KORAMANGALA-S2">BLR: Koramangala & Indiranagar Hub</option>
                  <option value="BLR-HSR-S1">BLR: HSR Layout & Bellandur</option>
                  <option value="BOM-BANDRA-W1">BOM: Bandra West</option>
                </select>
              </div>
              <button
                onClick={handleEmergencyZonePause}
                className="w-full h-10 rounded-lg bg-error text-on-error font-label-md text-label-md font-bold hover:bg-error/90 shadow-sm transition-all"
              >
                Confirm Emergency Ingress Halt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
