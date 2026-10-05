import { mockStore } from '../../mock/mockStore';
import {
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
  DeliveryStatus,
  TicketStatus,
  TicketPriority,
  AdminRole,
  AdminUser,
} from '../../types';

// Helper for simulated API latency
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const orderService = {
  async getOrders(params?: {
    search?: string;
    status?: string;
    payment?: string;
    zone?: string;
    city?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Order[]; total: number; page: number; totalPages: number }> {
    await delay();
    let all = mockStore.getOrders();

    if (params?.search) {
      const q = params.search.toLowerCase();
      all = all.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          o.restaurantName.toLowerCase().includes(q) ||
          (o.deliveryPartnerName && o.deliveryPartnerName.toLowerCase().includes(q))
      );
    }

    if (params?.status && params.status !== 'ALL') {
      all = all.filter((o) => o.status === params.status);
    }

    if (params?.payment && params.payment !== 'ALL') {
      all = all.filter((o) => o.paymentMethod === params.payment || o.paymentStatus === params.payment);
    }

    if (params?.city && params.city !== 'ALL') {
      all = all.filter((o) => o.city.toLowerCase() === params.city?.toLowerCase());
    }

    const total = all.length;
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const paginated = all.slice(start, start + limit);

    return {
      data: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  async getOrderById(id: string): Promise<Order | null> {
    await delay(100);
    return mockStore.getOrderById(id) || null;
  },

  async updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<boolean> {
    await delay();
    return mockStore.updateOrderStatus(id, status, note);
  },

  async reassignDeliveryPartner(orderId: string, partnerId: string): Promise<boolean> {
    await delay();
    return mockStore.reassignDeliveryPartner(orderId, partnerId);
  },

  async cancelOrder(id: string, reason: string): Promise<boolean> {
    await delay();
    return mockStore.cancelOrder(id, reason);
  },

  async addOrderNote(orderId: string, note: string): Promise<boolean> {
    await delay(80);
    return mockStore.addOrderNote(orderId, note);
  },

  async createManualOrder(data: Partial<Order>): Promise<Order> {
    await delay();
    return mockStore.createManualOrder(data);
  },
};

export const restaurantService = {
  async getRestaurants(params?: {
    search?: string;
    status?: string;
    zone?: string;
    cuisine?: string;
    city?: string;
  }): Promise<Restaurant[]> {
    await delay();
    let all = mockStore.getRestaurants();

    if (params?.search) {
      const q = params.search.toLowerCase();
      all = all.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.outletName.toLowerCase().includes(q) ||
          r.outletCode.toLowerCase().includes(q) ||
          r.ownerName.toLowerCase().includes(q) ||
          r.fssaiNumber.includes(q)
      );
    }

    if (params?.status && params.status !== 'ALL') {
      all = all.filter((r) => r.status === params.status);
    }

    if (params?.city && params.city !== 'ALL') {
      all = all.filter((r) => r.city === params.city);
    }

    return all;
  },

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    await delay(100);
    return mockStore.getRestaurantById(id) || null;
  },

  async approveRestaurant(id: string): Promise<boolean> {
    await delay();
    return mockStore.approveRestaurant(id);
  },

  async rejectRestaurant(id: string, reason: string): Promise<boolean> {
    await delay();
    return mockStore.rejectRestaurant(id, reason);
  },

  async togglePause(id: string): Promise<boolean> {
    await delay();
    return mockStore.toggleRestaurantPause(id);
  },

  async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<boolean> {
    await delay();
    return mockStore.updateRestaurant(id, updates);
  },

  async addRestaurant(data: Omit<Restaurant, 'id'>): Promise<Restaurant> {
    await delay();
    return mockStore.addRestaurant(data);
  },
};

export const deliveryService = {
  async getDeliveryPartners(params?: {
    search?: string;
    status?: string;
    kyc?: string;
    city?: string;
  }): Promise<DeliveryPartner[]> {
    await delay();
    let all = mockStore.getDeliveryPartners();

    if (params?.search) {
      const q = params.search.toLowerCase();
      all = all.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.vehicleNumber.toLowerCase().includes(q)
      );
    }

    if (params?.status && params.status !== 'ALL') {
      all = all.filter((p) => p.dutyStatus === params.status);
    }

    if (params?.kyc && params.kyc !== 'ALL') {
      all = all.filter((p) => p.kycStatus === params.kyc);
    }

    return all;
  },

  async getDeliveryPartnerById(id: string): Promise<DeliveryPartner | null> {
    await delay(100);
    return mockStore.getDeliveryPartnerById(id) || null;
  },

  async updateDutyStatus(id: string, status: DeliveryStatus): Promise<boolean> {
    await delay();
    return mockStore.updatePartnerDuty(id, status);
  },

  async verifyKyc(id: string): Promise<boolean> {
    await delay();
    return mockStore.verifyPartnerKyc(id);
  },
};

export const customerService = {
  async getCustomers(params?: { search?: string; status?: string }): Promise<Customer[]> {
    await delay();
    let all = mockStore.getCustomers();

    if (params?.search) {
      const q = params.search.toLowerCase();
      all = all.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }

    if (params?.status && params.status !== 'ALL') {
      all = all.filter((c) => c.status === params.status);
    }

    return all;
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    await delay(100);
    return mockStore.getCustomerById(id) || null;
  },

  async suspendCustomer(id: string, reason?: string): Promise<boolean> {
    await delay();
    return mockStore.suspendCustomer(id, reason);
  },

  async reactivateCustomer(id: string): Promise<boolean> {
    await delay();
    return mockStore.reactivateCustomer(id);
  },

  async issueWalletCredit(id: string, amount: number, note: string): Promise<boolean> {
    await delay();
    return mockStore.addCustomerWalletCredit(id, amount, note);
  },
};

export const catalogService = {
  async getCategories(): Promise<MenuCategory[]> {
    await delay();
    return mockStore.getCategories();
  },

  async getMenuItems(restaurantId?: string): Promise<MenuItem[]> {
    await delay();
    const all = mockStore.getMenuItems();
    if (restaurantId) {
      return all.filter((m) => m.restaurantId === restaurantId);
    }
    return all;
  },

  async getAddOns(): Promise<AddOn[]> {
    await delay();
    return mockStore.getAddOns();
  },

  async createMenuItem(data: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    await delay();
    return mockStore.createMenuItem(data);
  },

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<boolean> {
    await delay();
    return mockStore.updateMenuItem(id, updates);
  },

  async deleteMenuItem(id: string): Promise<boolean> {
    await delay();
    return mockStore.deleteMenuItem(id);
  },
};

export const promotionService = {
  async getCoupons(): Promise<Coupon[]> {
    await delay();
    return mockStore.getCoupons();
  },

  async createCoupon(data: Omit<Coupon, 'id' | 'usedCount'>): Promise<Coupon> {
    await delay();
    return mockStore.createCoupon(data);
  },

  async toggleCoupon(id: string): Promise<boolean> {
    await delay();
    return mockStore.toggleCoupon(id);
  },

  async deleteCoupon(id: string): Promise<boolean> {
    await delay();
    return mockStore.deleteCoupon(id);
  },

  async getCampaigns(): Promise<Campaign[]> {
    await delay();
    return mockStore.getCampaigns();
  },

  async createCampaign(data: Omit<Campaign, 'id' | 'budgetSpent'>): Promise<Campaign> {
    await delay();
    return mockStore.createCampaign(data);
  },

  async toggleCampaign(id: string): Promise<boolean> {
    await delay();
    return mockStore.toggleCampaign(id);
  },
};

export const financeService = {
  async getPayments(): Promise<PaymentTransaction[]> {
    await delay();
    return mockStore.getPayments();
  },

  async getRefunds(): Promise<RefundRequest[]> {
    await delay();
    return mockStore.getRefunds();
  },

  async processRefund(refundId: string, action: 'APPROVE' | 'REJECT'): Promise<boolean> {
    await delay();
    return mockStore.processRefund(refundId, action);
  },

  async getSettlements(): Promise<SettlementRecord[]> {
    await delay();
    return mockStore.getSettlements();
  },

  async markSettlementPaid(id: string): Promise<boolean> {
    await delay();
    return mockStore.markSettlementPaid(id);
  },
};

export const supportService = {
  async getTickets(params?: { category?: string; priority?: string; status?: string }): Promise<SupportTicket[]> {
    await delay();
    let all = mockStore.getTickets();

    if (params?.status && params.status !== 'ALL') {
      all = all.filter((t) => t.status === params.status);
    }
    if (params?.priority && params.priority !== 'ALL') {
      all = all.filter((t) => t.priority === params.priority);
    }
    return all;
  },

  async getTicketById(id: string): Promise<SupportTicket | null> {
    await delay(100);
    return mockStore.getTicketById(id) || null;
  },

  async addReply(ticketId: string, message: string, resolve = false, creditAmount?: number): Promise<boolean> {
    await delay();
    return mockStore.addTicketReply(ticketId, message, resolve, creditAmount);
  },

  async updateStatus(id: string, status: TicketStatus): Promise<boolean> {
    await delay();
    return mockStore.updateTicketStatus(id, status);
  },

  async updatePriority(id: string, priority: TicketPriority): Promise<boolean> {
    await delay();
    return mockStore.updateTicketPriority(id, priority);
  },
};

export const reviewService = {
  async getReviews(): Promise<Review[]> {
    await delay();
    return mockStore.getReviews();
  },

  async updateStatus(id: string, status: 'PUBLISHED' | 'FLAGGED' | 'HIDDEN'): Promise<boolean> {
    await delay();
    return mockStore.updateReviewStatus(id, status);
  },
};

export const notificationService = {
  async getNotifications(): Promise<NotificationBroadcast[]> {
    await delay();
    return mockStore.getNotifications();
  },

  async sendBroadcast(data: Omit<NotificationBroadcast, 'id' | 'status' | 'sentCount'>): Promise<NotificationBroadcast> {
    await delay();
    return mockStore.sendNotification(data);
  },
};

export const adminService = {
  async getAdmins(): Promise<AdminUser[]> {
    await delay();
    return mockStore.getAdmins();
  },

  async createAdmin(user: Omit<AdminUser, 'id' | 'lastLogin'>): Promise<AdminUser> {
    await delay();
    return mockStore.createAdmin(user);
  },

  async updateAdminRole(id: string, role: AdminRole): Promise<boolean> {
    await delay();
    return mockStore.updateAdminRole(id, role);
  },

  async toggleAdminStatus(id: string): Promise<boolean> {
    await delay();
    return mockStore.toggleAdminStatus(id);
  },

  async getRolePermissions() {
    await delay(50);
    return mockStore.getRolePermissions();
  },

  async updateRolePermission(role: AdminRole, permission: any, allowed: boolean) {
    await delay(50);
    mockStore.updateRolePermission(role, permission, allowed);
  },
};

export const auditService = {
  async getAuditLogs(): Promise<AuditLog[]> {
    await delay(80);
    return mockStore.getAuditLogs();
  },
};

export const settingsService = {
  async getSettings(): Promise<PlatformSettings> {
    await delay(80);
    return mockStore.getSettings();
  },

  async updateSettings(settings: Partial<PlatformSettings>): Promise<boolean> {
    await delay();
    return mockStore.updateSettings(settings);
  },
};

// Utilities for Browser CSV export
export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) =>
        keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k].toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
            return cell;
          })
          .join(separator)
      )
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
