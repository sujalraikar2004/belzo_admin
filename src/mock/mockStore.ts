import {
  AdminRole,
  Permission,
  Order,
  Restaurant,
  DeliveryPartner,
  Customer,
  MenuItem,
  MenuCategory,
  AddOn,
  Coupon,
  Campaign,
  PaymentTransaction,
  RefundRequest,
  SettlementRecord,
  SupportTicket,
  Review,
  NotificationBroadcast,
  AuditLog,
  PlatformSettings,
  OrderStatus,
  RestaurantStatus,
  DeliveryStatus,
  RefundStatus,
  TicketStatus,
  TicketPriority,
  AdminUser,
} from '../types';
import {
  INITIAL_ADMINS,
  INITIAL_CUSTOMERS,
  INITIAL_RESTAURANTS,
  INITIAL_DELIVERY_PARTNERS,
  INITIAL_ORDERS,
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_ADDONS,
  INITIAL_COUPONS,
  INITIAL_CAMPAIGNS,
  INITIAL_PAYMENTS,
  INITIAL_REFUNDS,
  INITIAL_SETTLEMENTS,
  INITIAL_TICKETS,
  INITIAL_REVIEWS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
} from './mockData';

// Role-to-Permissions Mapping
export const DEFAULT_ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN: [
    'dashboard.view',
    'orders.view', 'orders.create', 'orders.update', 'orders.cancel',
    'restaurants.view', 'restaurants.create', 'restaurants.update', 'restaurants.approve', 'restaurants.suspend',
    'delivery.view', 'delivery.update', 'delivery.assign',
    'customers.view', 'customers.update', 'customers.suspend',
    'catalog.view', 'catalog.create', 'catalog.update', 'catalog.delete',
    'payments.view', 'refunds.view', 'refunds.process',
    'settlements.view', 'settlements.process',
    'analytics.view', 'analytics.export',
    'support.view', 'support.manage',
    'notifications.view', 'notifications.create',
    'admins.view', 'admins.manage',
    'roles.view', 'roles.manage',
    'settings.view', 'settings.manage',
    'audit.view',
  ],
  OPERATIONS_ADMIN: [
    'dashboard.view',
    'orders.view', 'orders.create', 'orders.update', 'orders.cancel',
    'restaurants.view', 'restaurants.update', 'restaurants.approve', 'restaurants.suspend',
    'delivery.view', 'delivery.update', 'delivery.assign',
    'customers.view',
    'catalog.view', 'catalog.update',
    'support.view', 'support.manage',
    'notifications.view', 'notifications.create',
    'audit.view',
  ],
  FINANCE_ADMIN: [
    'dashboard.view',
    'orders.view',
    'payments.view',
    'refunds.view', 'refunds.process',
    'settlements.view', 'settlements.process',
    'analytics.view', 'analytics.export',
    'audit.view',
  ],
  SUPPORT_ADMIN: [
    'dashboard.view',
    'orders.view', 'orders.update',
    'customers.view', 'customers.update',
    'delivery.view',
    'support.view', 'support.manage',
    'refunds.view',
    'audit.view',
  ],
  RESTAURANT_ADMIN: [
    'dashboard.view',
    'orders.view',
    'restaurants.view', 'restaurants.update',
    'catalog.view', 'catalog.create', 'catalog.update', 'catalog.delete',
    'settlements.view',
    'audit.view',
  ],
  ANALYST: [
    'dashboard.view',
    'orders.view',
    'restaurants.view',
    'delivery.view',
    'customers.view',
    'analytics.view', 'analytics.export',
    'audit.view',
  ],
};

type StoreListener = () => void;

class MockStore {
  private orders: Order[] = [];
  private restaurants: Restaurant[] = [];
  private deliveryPartners: DeliveryPartner[] = [];
  private customers: Customer[] = [];
  private categories: MenuCategory[] = [];
  private menuItems: MenuItem[] = [];
  private addOns: AddOn[] = [];
  private coupons: Coupon[] = [];
  private campaigns: Campaign[] = [];
  private payments: PaymentTransaction[] = [];
  private refunds: RefundRequest[] = [];
  private settlements: SettlementRecord[] = [];
  private tickets: SupportTicket[] = [];
  private reviews: Review[] = [];
  private notifications: NotificationBroadcast[] = [];
  private auditLogs: AuditLog[] = [];
  private admins: AdminUser[] = [];
  private settings: PlatformSettings = INITIAL_SETTINGS;
  private rolePermissions: Record<AdminRole, Permission[]> = DEFAULT_ROLE_PERMISSIONS;

  private listeners: Set<StoreListener> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    try {
      const saved = localStorage.getItem('belzo_admin_store_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.orders = parsed.orders || INITIAL_ORDERS;
        this.restaurants = parsed.restaurants || INITIAL_RESTAURANTS;
        this.deliveryPartners = parsed.deliveryPartners || INITIAL_DELIVERY_PARTNERS;
        this.customers = parsed.customers || INITIAL_CUSTOMERS;
        this.categories = parsed.categories || INITIAL_CATEGORIES;
        this.menuItems = parsed.menuItems || INITIAL_MENU_ITEMS;
        this.addOns = parsed.addOns || INITIAL_ADDONS;
        this.coupons = parsed.coupons || INITIAL_COUPONS;
        this.campaigns = parsed.campaigns || INITIAL_CAMPAIGNS;
        this.payments = parsed.payments || INITIAL_PAYMENTS;
        this.refunds = parsed.refunds || INITIAL_REFUNDS;
        this.settlements = parsed.settlements || INITIAL_SETTLEMENTS;
        this.tickets = parsed.tickets || INITIAL_TICKETS;
        this.reviews = parsed.reviews || INITIAL_REVIEWS;
        this.notifications = parsed.notifications || INITIAL_NOTIFICATIONS;
        this.auditLogs = parsed.auditLogs || INITIAL_AUDIT_LOGS;
        this.admins = parsed.admins || INITIAL_ADMINS;
        this.settings = parsed.settings || INITIAL_SETTINGS;
        this.rolePermissions = parsed.rolePermissions || DEFAULT_ROLE_PERMISSIONS;
        return;
      }
    } catch {
      // Fallback
    }

    this.resetToDefaults();
  }

  public resetToDefaults() {
    this.orders = [...INITIAL_ORDERS];
    this.restaurants = [...INITIAL_RESTAURANTS];
    this.deliveryPartners = [...INITIAL_DELIVERY_PARTNERS];
    this.customers = [...INITIAL_CUSTOMERS];
    this.categories = [...INITIAL_CATEGORIES];
    this.menuItems = [...INITIAL_MENU_ITEMS];
    this.addOns = [...INITIAL_ADDONS];
    this.coupons = [...INITIAL_COUPONS];
    this.campaigns = [...INITIAL_CAMPAIGNS];
    this.payments = [...INITIAL_PAYMENTS];
    this.refunds = [...INITIAL_REFUNDS];
    this.settlements = [...INITIAL_SETTLEMENTS];
    this.tickets = [...INITIAL_TICKETS];
    this.reviews = [...INITIAL_REVIEWS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.admins = [...INITIAL_ADMINS];
    this.settings = { ...INITIAL_SETTINGS };
    this.rolePermissions = { ...DEFAULT_ROLE_PERMISSIONS };
    this.persist();
  }

  private persist() {
    try {
      const data = {
        orders: this.orders,
        restaurants: this.restaurants,
        deliveryPartners: this.deliveryPartners,
        customers: this.customers,
        categories: this.categories,
        menuItems: this.menuItems,
        addOns: this.addOns,
        coupons: this.coupons,
        campaigns: this.campaigns,
        payments: this.payments,
        refunds: this.refunds,
        settlements: this.settlements,
        tickets: this.tickets,
        reviews: this.reviews,
        notifications: this.notifications,
        auditLogs: this.auditLogs,
        admins: this.admins,
        settings: this.settings,
        rolePermissions: this.rolePermissions,
      };
      localStorage.setItem('belzo_admin_store_v1', JSON.stringify(data));
    } catch {
      // Ignore storage errors in restricted contexts
    }
    this.notify();
  }

  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public recordAudit(action: string, entity: string, entityId: string, result: 'SUCCESS' | 'FAILED' | 'WARNING', metadata: Record<string, any> = {}) {
    const newLog: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST',
      adminName: 'Rahul Sharma',
      adminEmail: 'rahul.sharma@belzo.com',
      action,
      entity,
      entityId,
      result,
      metadata,
    };
    this.auditLogs = [newLog, ...this.auditLogs];
    this.persist();
  }

  // ORDERS
  public getOrders(): Order[] {
    return this.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id || o.id.replace('#', '') === id.replace('#', ''));
  }

  public updateOrderStatus(id: string, newStatus: OrderStatus, note?: string): boolean {
    const idx = this.orders.findIndex((o) => o.id === id);
    if (idx === -1) return false;
    const order = this.orders[idx];
    order.status = newStatus;
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';

    const stageExists = order.timeline.find((t) => t.stage === newStatus);
    if (stageExists) {
      stageExists.completed = true;
      stageExists.timestamp = timeStr;
    } else {
      order.timeline.push({
        stage: newStatus,
        label: newStatus.replace(/_/g, ' '),
        timestamp: timeStr,
        completed: true,
        note,
      });
    }

    if (note) {
      order.notes = order.notes ? [...order.notes, note] : [note];
    }

    this.recordAudit('ORDER_STATUS_UPDATED', 'Order', order.id, 'SUCCESS', {
      previousStatus: order.status,
      newStatus,
      note,
    });
    this.persist();
    return true;
  }

  public cancelOrder(id: string, reason: string): boolean {
    const order = this.getOrderById(id);
    if (!order) return false;
    order.status = 'CUSTOMER_CANCELLED';
    order.timeline.push({
      stage: 'CUSTOMER_CANCELLED',
      label: `Cancelled: ${reason}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      completed: true,
    });

    this.recordAudit('ORDER_CANCELLED', 'Order', order.id, 'WARNING', { reason });
    this.persist();
    return true;
  }

  public reassignDeliveryPartner(orderId: string, newPartnerId: string): boolean {
    const order = this.getOrderById(orderId);
    const newPartner = this.deliveryPartners.find((p) => p.id === newPartnerId);
    if (!order || !newPartner) return false;

    // Release old partner
    if (order.deliveryPartnerId) {
      const oldPartner = this.deliveryPartners.find((p) => p.id === order.deliveryPartnerId);
      if (oldPartner) {
        oldPartner.dutyStatus = 'AVAILABLE';
        oldPartner.currentOrderId = undefined;
      }
    }

    // Assign new partner
    order.deliveryPartnerId = newPartner.id;
    order.deliveryPartnerName = newPartner.name;
    order.deliveryPartnerPhone = newPartner.phone;
    order.deliveryPartnerVehicle = `${newPartner.vehicleModel} (${newPartner.vehicleNumber})`;
    order.deliveryPartnerRating = newPartner.rating;
    newPartner.dutyStatus = 'DELIVERING';
    newPartner.currentOrderId = order.id;

    order.timeline.push({
      stage: 'DELIVERY_PARTNER_ASSIGNED',
      label: `Reassigned to ${newPartner.name}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      completed: true,
    });

    this.recordAudit('COURIER_REASSIGNED', 'Order', order.id, 'SUCCESS', {
      assignedCourier: newPartner.name,
      courierId: newPartner.id,
    });
    this.persist();
    return true;
  }

  public addOrderNote(orderId: string, note: string): boolean {
    const order = this.getOrderById(orderId);
    if (!order) return false;
    order.notes = order.notes ? [...order.notes, note] : [note];
    this.recordAudit('ORDER_NOTE_POSTED', 'Order', order.id, 'SUCCESS', { note });
    this.persist();
    return true;
  }

  public createManualOrder(orderData: Partial<Order>): Order {
    const newId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      id: newId,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toLocaleTimeString('en-IN') + ' IST',
      customerId: orderData.customerId || 'CUST-1001',
      customerName: orderData.customerName || 'Aarav Kulkarni',
      customerPhone: orderData.customerPhone || '+91 98450 12345',
      customerAddress: orderData.customerAddress || 'Indiranagar, Bengaluru',
      customerTier: 'GOLD',
      restaurantId: orderData.restaurantId || 'RES-104',
      restaurantName: orderData.restaurantName || 'Spice Garden',
      restaurantOutlet: 'Koramangala',
      restaurantPhone: '+91 98450 22194',
      items: orderData.items || [
        {
          id: 'ITM-N',
          menuItemId: 'MENU-1',
          name: 'Chef Tasting Special',
          quantity: 1,
          unitPrice: 350,
          totalPrice: 350,
          isVeg: true,
        },
      ],
      itemsSubtotal: orderData.itemsSubtotal || 350,
      packagingCharges: 25,
      deliveryFee: 40,
      surgeFee: 0,
      gstAmount: 17.5,
      discountAmount: 0,
      totalAmount: (orderData.itemsSubtotal || 350) + 25 + 40 + 17.5,
      paymentMethod: 'UPI',
      paymentProvider: 'Razorpay UPI',
      paymentId: `pay_${Date.now()}`,
      paymentStatus: 'PAID',
      status: 'PREPARING',
      orderAgeMinutes: 1,
      etaMinutes: 25,
      cluster: 'BLR-CENTRAL',
      city: 'Bengaluru',
      platformCommission: 63,
      merchantNetPayout: 287,
      riderEarnings: 50,
      timeline: [
        { stage: 'CREATED', label: 'Manual Order Created', timestamp: 'Just now', completed: true },
        { stage: 'PREPARING', label: 'Sent to Kitchen KDS', timestamp: 'Just now', completed: true, active: true },
      ],
      deliveryCoordinates: {
        restaurantLat: 12.9345,
        restaurantLng: 77.6256,
        customerLat: 12.9719,
        customerLng: 77.6412,
      },
    };

    this.orders = [newOrder, ...this.orders];
    this.recordAudit('MANUAL_ORDER_CREATED', 'Order', newOrder.id, 'SUCCESS', { total: newOrder.totalAmount });
    this.persist();
    return newOrder;
  }

  // RESTAURANTS
  public getRestaurants(): Restaurant[] {
    return this.restaurants;
  }

  public getRestaurantById(id: string): Restaurant | undefined {
    return this.restaurants.find((r) => r.id === id || r.outletCode === id);
  }

  public approveRestaurant(id: string): boolean {
    const restaurant = this.getRestaurantById(id);
    if (!restaurant) return false;
    restaurant.status = 'ONLINE';
    restaurant.isVerified = true;
    restaurant.fssaiGrade = 'A';
    restaurant.documents.forEach((d) => (d.status = 'VERIFIED'));

    this.recordAudit('RESTAURANT_APPROVED', 'Restaurant', restaurant.id, 'SUCCESS', {
      name: restaurant.name,
      outlet: restaurant.outletName,
    });
    this.persist();
    return true;
  }

  public rejectRestaurant(id: string, reason: string): boolean {
    const restaurant = this.getRestaurantById(id);
    if (!restaurant) return false;
    restaurant.status = 'SUSPENDED';
    restaurant.isVerified = false;
    restaurant.documents.forEach((d) => {
      d.status = 'REJECTED';
      d.rejectionReason = reason;
    });

    this.recordAudit('RESTAURANT_REJECTED', 'Restaurant', restaurant.id, 'WARNING', {
      reason,
      name: restaurant.name,
    });
    this.persist();
    return true;
  }

  public toggleRestaurantPause(id: string): boolean {
    const restaurant = this.getRestaurantById(id);
    if (!restaurant) return false;
    if (restaurant.status === 'PAUSED') {
      restaurant.status = 'ONLINE';
      this.recordAudit('RESTAURANT_RESUMED', 'Restaurant', restaurant.id, 'SUCCESS');
    } else {
      restaurant.status = 'PAUSED';
      this.recordAudit('RESTAURANT_PAUSED', 'Restaurant', restaurant.id, 'WARNING');
    }
    this.persist();
    return true;
  }

  public updateRestaurant(id: string, updates: Partial<Restaurant>): boolean {
    const idx = this.restaurants.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.restaurants[idx] = { ...this.restaurants[idx], ...updates };
    this.recordAudit('RESTAURANT_UPDATED', 'Restaurant', id, 'SUCCESS', updates);
    this.persist();
    return true;
  }

  public addRestaurant(restaurant: Omit<Restaurant, 'id'>): Restaurant {
    const newId = `RES-${Math.floor(100 + Math.random() * 900)}`;
    const fullRestaurant: Restaurant = {
      ...restaurant,
      id: newId,
      outletCode: `#${newId}`,
    };
    this.restaurants = [fullRestaurant, ...this.restaurants];
    this.recordAudit('RESTAURANT_CREATED', 'Restaurant', fullRestaurant.id, 'SUCCESS', {
      name: fullRestaurant.name,
    });
    this.persist();
    return fullRestaurant;
  }

  // CUSTOMERS
  public getCustomers(): Customer[] {
    return this.customers;
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.customers.find((c) => c.id === id);
  }

  public suspendCustomer(id: string, reason?: string): boolean {
    const customer = this.getCustomerById(id);
    if (!customer) return false;
    customer.status = 'SUSPENDED';
    this.recordAudit('CUSTOMER_SUSPENDED', 'Customer', customer.id, 'WARNING', { reason });
    this.persist();
    return true;
  }

  public reactivateCustomer(id: string): boolean {
    const customer = this.getCustomerById(id);
    if (!customer) return false;
    customer.status = 'ACTIVE';
    this.recordAudit('CUSTOMER_REACTIVATED', 'Customer', customer.id, 'SUCCESS');
    this.persist();
    return true;
  }

  public addCustomerWalletCredit(id: string, amount: number, note: string): boolean {
    const customer = this.getCustomerById(id);
    if (!customer) return false;
    customer.walletBalance += amount;
    this.recordAudit('CUSTOMER_CREDIT_ISSUED', 'Customer', customer.id, 'SUCCESS', {
      amount,
      note,
      newBalance: customer.walletBalance,
    });
    this.persist();
    return true;
  }

  // DELIVERY PARTNERS
  public getDeliveryPartners(): DeliveryPartner[] {
    return this.deliveryPartners;
  }

  public getDeliveryPartnerById(id: string): DeliveryPartner | undefined {
    return this.deliveryPartners.find((p) => p.id === id || p.code === id);
  }

  public updatePartnerDuty(id: string, status: DeliveryStatus): boolean {
    const partner = this.getDeliveryPartnerById(id);
    if (!partner) return false;
    partner.dutyStatus = status;
    this.recordAudit('COURIER_DUTY_CHANGED', 'DeliveryPartner', partner.id, 'SUCCESS', { status });
    this.persist();
    return true;
  }

  public verifyPartnerKyc(id: string): boolean {
    const partner = this.getDeliveryPartnerById(id);
    if (!partner) return false;
    partner.kycStatus = 'VERIFIED';
    partner.dutyStatus = 'AVAILABLE';
    partner.documents.verified = true;
    this.recordAudit('COURIER_KYC_VERIFIED', 'DeliveryPartner', partner.id, 'SUCCESS');
    this.persist();
    return true;
  }

  // CATALOG & MENU
  public getCategories(): MenuCategory[] {
    return this.categories;
  }

  public getMenuItems(): MenuItem[] {
    return this.menuItems;
  }

  public getAddOns(): AddOn[] {
    return this.addOns;
  }

  public createMenuItem(item: Omit<MenuItem, 'id'>): MenuItem {
    const newId = `MENU-${Date.now().toString().slice(-4)}`;
    const newItem: MenuItem = { ...item, id: newId };
    this.menuItems = [newItem, ...this.menuItems];
    this.recordAudit('MENU_ITEM_CREATED', 'Catalog', newItem.id, 'SUCCESS', { name: newItem.name });
    this.persist();
    return newItem;
  }

  public updateMenuItem(id: string, updates: Partial<MenuItem>): boolean {
    const idx = this.menuItems.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    this.menuItems[idx] = { ...this.menuItems[idx], ...updates };
    this.recordAudit('MENU_ITEM_UPDATED', 'Catalog', id, 'SUCCESS', updates);
    this.persist();
    return true;
  }

  public deleteMenuItem(id: string): boolean {
    const item = this.menuItems.find((m) => m.id === id);
    if (!item) return false;
    this.menuItems = this.menuItems.filter((m) => m.id !== id);
    this.recordAudit('MENU_ITEM_DELETED', 'Catalog', id, 'WARNING', { name: item.name });
    this.persist();
    return true;
  }

  // COUPONS & PROMOTIONS
  public getCoupons(): Coupon[] {
    return this.coupons;
  }

  public createCoupon(coupon: Omit<Coupon, 'id' | 'usedCount'>): Coupon {
    const newId = `CPN-${Date.now().toString().slice(-4)}`;
    const newCoupon: Coupon = { ...coupon, id: newId, usedCount: 0 };
    this.coupons = [newCoupon, ...this.coupons];
    this.recordAudit('COUPON_CREATED', 'Coupon', newCoupon.id, 'SUCCESS', { code: newCoupon.code });
    this.persist();
    return newCoupon;
  }

  public toggleCoupon(id: string): boolean {
    const coupon = this.coupons.find((c) => c.id === id);
    if (!coupon) return false;
    coupon.status = coupon.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    this.recordAudit('COUPON_STATUS_CHANGED', 'Coupon', id, 'SUCCESS', { status: coupon.status });
    this.persist();
    return true;
  }

  public deleteCoupon(id: string): boolean {
    const coupon = this.coupons.find((c) => c.id === id);
    if (!coupon) return false;
    this.coupons = this.coupons.filter((c) => c.id !== id);
    this.recordAudit('COUPON_DELETED', 'Coupon', id, 'WARNING', { code: coupon.code });
    this.persist();
    return true;
  }

  // CAMPAIGNS
  public getCampaigns(): Campaign[] {
    return this.campaigns;
  }

  public createCampaign(campaign: Omit<Campaign, 'id' | 'budgetSpent'>): Campaign {
    const newId = `CMP-${Date.now().toString().slice(-4)}`;
    const newCampaign: Campaign = { ...campaign, id: newId, budgetSpent: 0 };
    this.campaigns = [newCampaign, ...this.campaigns];
    this.recordAudit('CAMPAIGN_CREATED', 'Campaign', newCampaign.id, 'SUCCESS', { name: newCampaign.name });
    this.persist();
    return newCampaign;
  }

  public toggleCampaign(id: string): boolean {
    const campaign = this.campaigns.find((c) => c.id === id);
    if (!campaign) return false;
    campaign.status = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    this.recordAudit('CAMPAIGN_STATUS_CHANGED', 'Campaign', id, 'SUCCESS', { status: campaign.status });
    this.persist();
    return true;
  }

  // PAYMENTS & REFUNDS
  public getPayments(): PaymentTransaction[] {
    return this.payments;
  }

  public getRefunds(): RefundRequest[] {
    return this.refunds;
  }

  public processRefund(refundId: string, action: 'APPROVE' | 'REJECT'): boolean {
    const refund = this.refunds.find((r) => r.id === refundId);
    if (!refund) return false;
    if (action === 'APPROVE') {
      refund.status = 'COMPLETED';
      refund.processedAt = new Date().toLocaleTimeString('en-IN') + ' IST';
      refund.approvedBy = 'Rahul Sharma (Super Admin)';

      // Update associated order and payment
      const order = this.getOrderById(refund.orderId);
      if (order) {
        order.status = 'REFUNDED';
        order.paymentStatus = 'REFUNDED';
      }
      const payment = this.payments.find((p) => p.orderId === refund.orderId);
      if (payment) {
        payment.status = 'REFUNDED';
      }

      this.recordAudit('REFUND_APPROVED', 'Refund', refund.id, 'SUCCESS', {
        amount: refund.amount,
        orderId: refund.orderId,
      });
    } else {
      refund.status = 'REJECTED';
      this.recordAudit('REFUND_REJECTED', 'Refund', refund.id, 'WARNING', {
        amount: refund.amount,
        orderId: refund.orderId,
      });
    }
    this.persist();
    return true;
  }

  // SETTLEMENTS
  public getSettlements(): SettlementRecord[] {
    return this.settlements;
  }

  public markSettlementPaid(id: string): boolean {
    const settlement = this.settlements.find((s) => s.id === id);
    if (!settlement) return false;
    settlement.status = 'SETTLED';
    settlement.payoutDate = new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN');
    settlement.utrRef = `UTR${Date.now().toString().slice(-10)}`;
    this.recordAudit('SETTLEMENT_PROCESSED', 'Settlement', id, 'SUCCESS', {
      netPayout: settlement.netPayout,
      entity: settlement.entityName,
    });
    this.persist();
    return true;
  }

  // SUPPORT & TICKETS
  public getTickets(): SupportTicket[] {
    return this.tickets;
  }

  public getTicketById(id: string): SupportTicket | undefined {
    return this.tickets.find((t) => t.id === id || t.id.replace('#', '') === id.replace('#', ''));
  }

  public addTicketReply(ticketId: string, message: string, resolve = false, creditAmount?: number): boolean {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return false;
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    ticket.incidentThread.push({
      id: `TH-${Date.now()}`,
      senderType: 'AGENT',
      senderName: 'Rahul Sharma (You - Operations Lead)',
      timestamp: timeStr,
      message,
      actionTag: creditAmount ? `Compensation ₹${creditAmount} Attached` : undefined,
    });

    if (creditAmount && ticket.customerId) {
      this.addCustomerWalletCredit(ticket.customerId, creditAmount, `Support credit for ticket ${ticket.id}`);
    }

    if (resolve) {
      ticket.status = 'RESOLVED';
      ticket.slaBreachCountdownMinutes = 0;
      ticket.resolutionNotes = message;
    }

    ticket.updatedAt = new Date().toLocaleTimeString('en-IN') + ' IST';
    this.recordAudit('TICKET_REPLY_POSTED', 'SupportTicket', ticket.id, 'SUCCESS', {
      resolved: resolve,
      credit: creditAmount,
    });
    this.persist();
    return true;
  }

  public updateTicketStatus(id: string, status: TicketStatus): boolean {
    const ticket = this.getTicketById(id);
    if (!ticket) return false;
    ticket.status = status;
    if (status === 'RESOLVED' || status === 'CLOSED') {
      ticket.slaBreachCountdownMinutes = 0;
    }
    this.recordAudit('TICKET_STATUS_CHANGED', 'SupportTicket', ticket.id, 'SUCCESS', { status });
    this.persist();
    return true;
  }

  public updateTicketPriority(id: string, priority: TicketPriority): boolean {
    const ticket = this.getTicketById(id);
    if (!ticket) return false;
    ticket.priority = priority;
    ticket.isCriticalSla = priority === 'URGENT';
    this.recordAudit('TICKET_PRIORITY_CHANGED', 'SupportTicket', ticket.id, 'SUCCESS', { priority });
    this.persist();
    return true;
  }

  // REVIEWS
  public getReviews(): Review[] {
    return this.reviews;
  }

  public updateReviewStatus(id: string, status: 'PUBLISHED' | 'FLAGGED' | 'HIDDEN'): boolean {
    const review = this.reviews.find((r) => r.id === id);
    if (!review) return false;
    review.status = status;
    this.recordAudit('REVIEW_STATUS_UPDATED', 'Review', id, 'SUCCESS', { status });
    this.persist();
    return true;
  }

  // NOTIFICATIONS
  public getNotifications(): NotificationBroadcast[] {
    return this.notifications;
  }

  public sendNotification(data: Omit<NotificationBroadcast, 'id' | 'status' | 'sentCount'>): NotificationBroadcast {
    const newId = `NTF-${Date.now().toString().slice(-4)}`;
    const newNotification: NotificationBroadcast = {
      ...data,
      id: newId,
      status: 'SENT',
      sentCount: data.audience === 'ALL_CUSTOMERS' ? 128400 : 4890,
    };
    this.notifications = [newNotification, ...this.notifications];
    this.recordAudit('NOTIFICATION_BROADCAST_SENT', 'Notification', newNotification.id, 'SUCCESS', {
      title: newNotification.title,
      audience: newNotification.audience,
    });
    this.persist();
    return newNotification;
  }

  // ADMIN USERS & ROLES
  public getAdmins(): AdminUser[] {
    return this.admins;
  }

  public createAdmin(user: Omit<AdminUser, 'id' | 'lastLogin'>): AdminUser {
    const newId = `ADM-${Date.now().toString().slice(-4)}`;
    const newAdmin: AdminUser = {
      ...user,
      id: newId,
      lastLogin: 'Never',
    };
    this.admins = [...this.admins, newAdmin];
    this.recordAudit('ADMIN_USER_CREATED', 'AdminUser', newAdmin.id, 'SUCCESS', {
      name: newAdmin.name,
      role: newAdmin.role,
    });
    this.persist();
    return newAdmin;
  }

  public updateAdminRole(id: string, role: AdminRole): boolean {
    const admin = this.admins.find((a) => a.id === id);
    if (!admin) return false;
    admin.role = role;
    this.recordAudit('ADMIN_ROLE_UPDATED', 'AdminUser', id, 'SUCCESS', { role });
    this.persist();
    return true;
  }

  public toggleAdminStatus(id: string): boolean {
    const admin = this.admins.find((a) => a.id === id);
    if (!admin) return false;
    admin.status = admin.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.recordAudit('ADMIN_STATUS_CHANGED', 'AdminUser', id, 'SUCCESS', { status: admin.status });
    this.persist();
    return true;
  }

  public getRolePermissions(): Record<AdminRole, Permission[]> {
    return this.rolePermissions;
  }

  public updateRolePermission(role: AdminRole, permission: Permission, allowed: boolean): void {
    const current = new Set(this.rolePermissions[role] || []);
    if (allowed) {
      current.add(permission);
    } else {
      current.delete(permission);
    }
    this.rolePermissions = {
      ...this.rolePermissions,
      [role]: Array.from(current),
    };
    this.recordAudit('ROLE_PERMISSIONS_UPDATED', 'RoleMatrix', role, 'SUCCESS', {
      permission,
      allowed,
    });
    this.persist();
  }

  // AUDIT LOGS
  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  // PLATFORM SETTINGS
  public getSettings(): PlatformSettings {
    return this.settings;
  }

  public updateSettings(newSettings: Partial<PlatformSettings>): boolean {
    this.settings = { ...this.settings, ...newSettings };
    this.recordAudit('PLATFORM_SETTINGS_UPDATED', 'Settings', 'PLATFORM', 'SUCCESS', newSettings);
    this.persist();
    return true;
  }
}

export const mockStore = new MockStore();
