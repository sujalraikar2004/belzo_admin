import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { mockStore } from '../mock/mockStore';
import { SupportTicket, TicketStatus, TicketPriority } from '../types';

export const TicketsAndIssuesView: React.FC = () => {
  const { navigateTo, addToast, openConfirm } = useUIStore();
  const [tickets, setTickets] = useState<SupportTicket[]>(mockStore.getTickets());
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(tickets[0] || null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Reply state
  const [replyMessage, setReplyMessage] = useState('');
  const [compensationAmount, setCompensationAmount] = useState('');
  const [shouldResolve, setShouldResolve] = useState(false);

  useEffect(() => {
    return mockStore.subscribe(() => {
      const updated = mockStore.getTickets();
      setTickets([...updated]);
      if (selectedTicket) {
        const found = updated.find((t) => t.id === selectedTicket.id);
        if (found) setSelectedTicket(found);
      }
    });
  }, [selectedTicket]);

  const filteredTickets = tickets.filter((t) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        t.id.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        (t.orderId && t.orderId.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    return true;
  });

  const handleSendReply = () => {
    if (!selectedTicket) return;
    if (!replyMessage.trim()) {
      addToast({
        type: 'ERROR',
        title: 'Reply Message Empty',
        message: 'Please write a message to respond to the ticket.',
      });
      return;
    }

    const credit = compensationAmount ? parseFloat(compensationAmount) : undefined;
    mockStore.addTicketReply(selectedTicket.id, replyMessage.trim(), shouldResolve, credit);

    addToast({
      type: 'SUCCESS',
      title: shouldResolve ? 'Ticket Resolved' : 'Reply Sent',
      message: credit
        ? `Message sent with ₹${credit} compensation credited to customer.`
        : `Message posted to incident thread #${selectedTicket.id}.`,
    });

    setReplyMessage('');
    setCompensationAmount('');
    setShouldResolve(false);
  };

  const handleUpdateStatus = (ticket: SupportTicket, newStatus: TicketStatus) => {
    mockStore.updateTicketStatus(ticket.id, newStatus);
    addToast({
      type: 'INFO',
      title: 'Ticket Status Updated',
      message: `Ticket ${ticket.id} status changed to ${newStatus}.`,
    });
  };

  const handleUpdatePriority = (ticket: SupportTicket, newPriority: TicketPriority) => {
    mockStore.updateTicketPriority(ticket.id, newPriority);
    addToast({
      type: 'WARNING',
      title: 'Priority Escalated',
      message: `Ticket ${ticket.id} priority changed to ${newPriority}.`,
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
            <span className="text-primary font-semibold">Tickets & Issues</span>
          </nav>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Operations Escalation & Support Desk
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-label-sm text-label-sm font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
              {tickets.filter((t) => t.isCriticalSla && t.status !== 'RESOLVED').length} Critical SLA Risks
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Live incident remediation console. Resolve food delays, delivery discrepancies, missing items, and dispute escalations in real time.
          </p>
        </div>
      </div>

      {/* Dual Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md min-h-[650px]">
        {/* Left Column: Tickets Queue */}
        <div className="lg:col-span-5 flex flex-col rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs overflow-hidden">
          {/* Filters Bar */}
          <div className="p-space-md border-b border-surface-container-high bg-surface-container-low/40 space-y-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search ticket #, customer, order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-2 py-1 bg-surface-container-lowest border border-surface-container-high rounded text-xs font-semibold text-on-surface focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="flex-1 px-2 py-1 bg-surface-container-lowest border border-surface-container-high rounded text-xs font-semibold text-on-surface focus:outline-none"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">Urgent Only 🔥</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium</option>
              </select>
            </div>
          </div>

          {/* Ticket Stream List */}
          <div className="divide-y divide-surface-container-high/60 overflow-y-auto max-h-[620px] flex-1">
            {filteredTickets.map((ticket) => {
              const isSelected = selectedTicket?.id === ticket.id;

              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-space-md cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary-fixed/20 border-l-4 border-primary'
                      : 'hover:bg-surface-container-low/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-on-surface">{ticket.id}</span>
                    <span
                      className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                        ticket.priority === 'URGENT'
                          ? 'bg-rose-100 text-rose-800'
                          : ticket.priority === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </div>

                  <h4 className="font-bold text-on-surface text-sm mt-1 leading-snug line-clamp-1">
                    {ticket.subject}
                  </h4>
                  <p className="text-on-surface-variant text-[12px] line-clamp-1 mt-0.5">{ticket.description}</p>

                  <div className="flex items-center justify-between mt-2 pt-1 text-[11px] text-on-surface-variant">
                    <span className="font-medium text-on-surface">{ticket.customerName}</span>
                    {ticket.slaBreachCountdownMinutes > 0 ? (
                      <span className="text-rose-600 font-bold font-mono">
                        ⏱ {ticket.slaBreachCountdownMinutes}m SLA left
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold">Resolved</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Incident Details & Thread */}
        <div className="lg:col-span-7 flex flex-col rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Ticket Top Dossier */}
              <div className="p-space-md border-b border-surface-container-high bg-surface-container-low/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-on-surface">{selectedTicket.id}</span>
                    {selectedTicket.orderId && (
                      <button
                        onClick={() => navigateTo('order-detail', { orderId: selectedTicket.orderId! })}
                        type="button"
                        className="font-mono text-xs text-primary font-bold hover:underline"
                      >
                        Ref: {selectedTicket.orderId}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTicket.priority}
                      onChange={(e) => handleUpdatePriority(selectedTicket, e.target.value as any)}
                      className="px-2 py-1 bg-surface-container-lowest border border-surface-container-high rounded text-xs font-bold text-on-surface"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent 🔥</option>
                    </select>

                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateStatus(selectedTicket, e.target.value as any)}
                      className="px-2 py-1 bg-surface-container-lowest border border-surface-container-high rounded text-xs font-bold text-on-surface"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="WAITING">Waiting</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>
                </div>

                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-2">
                  {selectedTicket.subject}
                </h3>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-surface-container-high/60 text-xs">
                  <div>
                    <span className="text-on-surface-variant block">Customer</span>
                    <span className="font-bold text-on-surface">{selectedTicket.customerName}</span>
                    <span className="text-[11px] text-on-surface-variant font-mono block">{selectedTicket.customerPhone}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">Category</span>
                    <span className="font-bold text-on-surface">{selectedTicket.category.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">Assigned Lead</span>
                    <span className="font-bold text-on-surface">
                      {selectedTicket.assignedAdminName || 'Rahul Sharma'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Incident Thread Stream */}
              <div className="p-space-md space-y-3 overflow-y-auto max-h-[380px] flex-1 bg-surface-container-low/20">
                {selectedTicket.incidentThread.map((msg) => {
                  const isAgent = msg.senderType === 'AGENT';
                  const isSystem = msg.senderType === 'SYSTEM';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isSystem
                          ? 'items-center'
                          : isAgent
                          ? 'items-end'
                          : 'items-start'
                      }`}
                    >
                      {isSystem ? (
                        <div className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-mono">
                          {msg.message} ({msg.timestamp})
                        </div>
                      ) : (
                        <div
                          className={`max-w-[85%] rounded-xl p-3 shadow-xs ${
                            isAgent
                              ? 'bg-primary text-on-primary rounded-br-none'
                              : 'bg-surface-container-lowest text-on-surface border border-surface-container-high rounded-bl-none'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 text-[11px] opacity-80 mb-1">
                            <span className="font-bold">{msg.senderName}</span>
                            <span className="font-mono">{msg.timestamp}</span>
                          </div>
                          <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
                          {msg.actionTag && (
                            <div className="mt-2 pt-1 border-t border-white/20 text-[11px] font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">verified</span>
                              {msg.actionTag}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action & Response Box */}
              <div className="p-space-md border-t border-surface-container-high bg-surface-container-low/40 space-y-2">
                <textarea
                  rows={2}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type official response to customer or dispatch instructions..."
                  className="w-full p-2.5 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
                />

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-surface-container-lowest px-2 py-1 rounded border border-surface-container-high">
                      <span className="text-xs text-on-surface-variant font-bold">₹</span>
                      <input
                        type="number"
                        placeholder="Compensation ₹"
                        value={compensationAmount}
                        onChange={(e) => setCompensationAmount(e.target.value)}
                        className="w-24 text-xs font-bold text-on-surface focus:outline-none"
                      />
                    </div>

                    <label className="flex items-center gap-1.5 text-xs text-on-surface font-semibold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={shouldResolve}
                        onChange={(e) => setShouldResolve(e.target.checked)}
                        className="rounded text-primary focus:ring-0"
                      />
                      Resolve & Close Ticket
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendReply}
                    className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary/90 text-sm font-semibold flex items-center gap-1 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    Send Response
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-24 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] opacity-40 block mb-2">support_agent</span>
              Select a ticket from the left stream to inspect thread and send resolution.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
