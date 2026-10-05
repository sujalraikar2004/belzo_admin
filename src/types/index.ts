export type AdminRole =
  | 'SUPER_ADMIN'
  | 'OPERATIONS_ADMIN'
  | 'FINANCE_ADMIN'
  | 'SUPPORT_ADMIN'
  | 'RESTAURANT_ADMIN'
  | 'ANALYST';

export type Permission =
  | 'dashboard.view'
  | 'orders.view'
  | 'orders.create'
  | 'orders.update'
  | 'orders.cancel'
  | 'restaurants.view'
  | 'restaurants.create'
  | 'restaurants.update'
  | 'restaurants.approve'
  | 'restaurants.suspend'
  | 'delivery.view'
  | 'delivery.update'
  | 'delivery.assign'
  | 'customers.view'
  | 'customers.update'
  | 'customers.suspend'
  | 'catalog.view'
  | 'catalog.create'
  | 'catalog.update'
  | 'catalog.delete'
  | 'payments.view'
  | 'refunds.view'
  | 'refunds.process'
  | 'settlements.view'
  | 'settlements.process'
  | 'analytics.view'
  | 'analytics.export'
  | 'support.view'
  | 'support.manage'
  | 'notifications.view'
  | 'notifications.create'
  | 'admins.view'
  | 'admins.manage'
  | 'roles.view'
  | 'roles.manage'
  | 'settings.view'
  | 'settings.manage'
  | 'audit.view';

export type OrderStatus =
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_CONFIRMED'
  | 'RESTAURANT_PENDING'
  | 'RESTAURANT_ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'DELIVERY_PARTNER_ASSIGNED'
  | 'PARTNER_ACCEPTED'
  | 'PARTNER_REACHED_RESTAURANT'
  | 'ORDER_PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'PAYMENT_FAILED'
  | 'RESTAURANT_REJECTED'
  | 'CUSTOMER_CANCELLED'
  | 'RESTAURANT_CANCELLED'
  | 'DELIVERY_CANCELLED'
  | 'ORDER_FAILED'
  | 'REFUNDED';

export type RestaurantStatus = 'ONLINE' | 'BUSY' | 'PAUSED' | 'PENDING_AUDIT' | 'SUSPENDED';

export type DeliveryStatus =
  | 'AVAILABLE'
  | 'DELIVERING'
  | 'EN_ROUTE_TO_STORE'
  | 'ON_BREAK'
  | 'OFFLINE';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type RefundStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'PROCESSING'
  | 'COMPLETED';

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING'
  | 'RESOLVED'
  | 'CLOSED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: string;
  phone?: string;
  department: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: 'REGULAR' | 'SILVER' | 'GOLD' | 'VIP';
  totalOrders: number;
  totalSpend: number;
  aov: number;
  lastOrderDate: string;
  status: 'ACTIVE' | 'SUSPENDED';
  avatar?: string;
  addresses: {
    id: string;
    type: 'HOME' | 'WORK' | 'OTHER';
    addressLine: string;
    landmark?: string;
    city: string;
    pincode: string;
    lat: number;
    lng: number;
    isDefault: boolean;
  }[];
  walletBalance: number;
  joinedDate: string;
  notes?: string;
}

export interface RestaurantDocument {
  id: string;
  type: 'FSSAI' | 'GST' | 'PAN' | 'BANK_CANCELLED_CHEQUE' | 'OWNER_ID';
  title: string;
  documentNumber: string;
  expiryDate?: string;
  fileUrl: string;
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  rejectionReason?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  outletName: string;
  outletCode: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  address: string;
  zone: string;
  city: string;
  lat: number;
  lng: number;
  cuisine: string[];
  status: RestaurantStatus;
  isVerified: boolean;
  isSuperPartner?: boolean;
  isEnterprise?: boolean;
  rating: number;
  ratingCount: number;
  avgPrepTimeMinutes: number;
  commissionRate: number; // e.g. 18.0
  ordersToday: number;
  gmvToday: number;
  totalOrders: number;
  totalGmv: number;
  fssaiNumber: string;
  fssaiExpiry: string;
  fssaiGrade: 'A+' | 'A' | 'B' | 'PENDING';
  operatingHours: string;
  image: string;
  bankAccount: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
    beneficiaryName: string;
  };
  documents: RestaurantDocument[];
  onboardingDate: string;
  cancellationRate: number;
}

export interface DeliveryPartner {
  id: string;
  code: string; // e.g. #DP-1042
  name: string;
  phone: string;
  email: string;
  avatar: string;
  cluster: string;
  city: string;
  vehicleType: 'EV_SCOOTER' | 'PETROL_BIKE' | 'BICYCLE';
  vehicleModel: string;
  vehicleNumber: string;
  batteryOrFuelPercent: number;
  isElectric: boolean;
  dutyStatus: DeliveryStatus;
  currentOrderId?: string;
  rating: number;
  ratingCount: number;
  acceptanceRate: number; // e.g. 98
  completedDeliveriesToday: number;
  shiftHoursToday: number;
  earningsToday: number;
  totalEarnings: number;
  kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  lat: number;
  lng: number;
  speedKmH: number;
  heading?: number;
  joinedDate: string;
  documents: {
    drivingLicense: string;
    vehicleRc: string;
    aadhaarNumber: string;
    verified: boolean;
  };
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isVeg: boolean;
  specialInstructions?: string;
  addOns?: { name: string; price: number }[];
}

export interface Order {
  id: string; // e.g. #BG10293
  date: string;
  createdAt: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerTier: 'REGULAR' | 'SILVER' | 'GOLD' | 'VIP';
  restaurantId: string;
  restaurantName: string;
  restaurantOutlet: string;
  restaurantPhone: string;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  deliveryPartnerVehicle?: string;
  deliveryPartnerRating?: number;
  items: OrderItem[];
  itemsSubtotal: number;
  packagingCharges: number;
  deliveryFee: number;
  surgeFee: number;
  gstAmount: number;
  discountAmount: number;
  promoCode?: string;
  totalAmount: number;
  paymentMethod: 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'CASH_ON_DELIVERY' | 'WALLET';
  paymentProvider: string;
  paymentId: string;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  orderAgeMinutes: number;
  etaMinutes?: number;
  cluster: string;
  city: string;
  platformCommission: number;
  merchantNetPayout: number;
  riderEarnings: number;
  timeline: {
    stage: OrderStatus;
    label: string;
    timestamp: string;
    completed: boolean;
    active?: boolean;
    note?: string;
  }[];
  courierLocation?: {
    lat: number;
    lng: number;
    speedKmH: number;
    updatedAt: string;
  };
  deliveryCoordinates: {
    restaurantLat: number;
    restaurantLng: number;
    customerLat: number;
    customerLng: number;
  };
  delayMinutes?: number;
  isPriority?: boolean;
  hasSlaBreach?: boolean;
  notes?: string[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  prepTimeMinutes: number;
  spiceLevel: 'MILD' | 'MEDIUM' | 'SPICY' | 'EXTRA_SPICY';
  taxPercent: number;
  rating: number;
  addOnIds?: string[];
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  itemCount: number;
  isActive: boolean;
  sortOrder: number;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  isVeg: boolean;
  category: string;
  isAvailable: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  maxDiscount: number;
  minOrderValue: number;
  applicableCities: string[];
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PAUSED';
}

export interface Campaign {
  id: string;
  name: string;
  tagline: string;
  bannerUrl: string;
  targetAudience: 'ALL' | 'NEW_USERS' | 'INACTIVE_30D' | 'HIGH_SPENDERS';
  discountPercent: number;
  budgetTotal: number;
  budgetSpent: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'PAUSED' | 'SCHEDULED' | 'COMPLETED';
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: 'UPI' | 'CARD' | 'NET_BANKING' | 'COD' | 'WALLET';
  provider: string; // Razorpay, PhonePe, Paytm, HDFC
  status: PaymentStatus;
  date: string;
  gatewayRef: string;
}

export interface RefundRequest {
  id: string;
  orderId: string;
  paymentId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  createdAt: string;
  processedAt?: string;
  approvedBy?: string;
  refundMethod: 'ORIGINAL_PAYMENT' | 'WALLET_CREDIT';
}

export interface SettlementRecord {
  id: string;
  entityType: 'RESTAURANT' | 'DELIVERY_PARTNER';
  entityId: string;
  entityName: string;
  cyclePeriod: string;
  grossSales: number;
  commissionOrDeductions: number;
  taxTcsGst: number;
  adjustments: number;
  netPayout: number;
  status: 'SETTLED' | 'PENDING' | 'ON_HOLD';
  payoutDate: string;
  bankAccount: string;
  utrRef?: string;
}

export interface SupportTicket {
  id: string; // e.g. #TCK-9402
  orderId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerTier: 'REGULAR' | 'SILVER' | 'GOLD' | 'VIP';
  userType: 'CUSTOMER' | 'RESTAURANT' | 'DELIVERY_PARTNER';
  category: 'FOOD_DELAY' | 'MISSING_ITEM' | 'WRONG_ORDER' | 'RIDER_DISPUTE' | 'PAYMENT_ISSUE' | 'OTHER';
  priority: TicketPriority;
  subject: string;
  description: string;
  status: TicketStatus;
  assignedAdminId?: string;
  assignedAdminName?: string;
  createdAt: string;
  updatedAt: string;
  slaBreachCountdownMinutes: number;
  isCriticalSla: boolean;
  incidentThread: {
    id: string;
    senderType: 'SYSTEM' | 'CUSTOMER' | 'AGENT' | 'RIDER' | 'RESTAURANT';
    senderName: string;
    timestamp: string;
    message: string;
    actionTag?: string;
    channel?: string;
  }[];
  resolutionNotes?: string;
}

export interface Review {
  id: string;
  orderId: string;
  customerName: string;
  restaurantId: string;
  restaurantName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'PUBLISHED' | 'FLAGGED' | 'HIDDEN';
  flagsCount: number;
}

export interface NotificationBroadcast {
  id: string;
  title: string;
  message: string;
  audience: 'ALL_CUSTOMERS' | 'SELECTED_CUSTOMERS' | 'RESTAURANTS' | 'DELIVERY_PARTNERS';
  platform: 'APP_PUSH' | 'SMS' | 'IN_APP_BANNER';
  deepLink?: string;
  scheduledTime: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'SENT' | 'SCHEDULED' | 'DRAFT';
  sentCount?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  adminEmail: string;
  action: string;
  entity: string;
  entityId: string;
  result: 'SUCCESS' | 'FAILED' | 'WARNING';
  metadata: Record<string, any>;
}

export interface PlatformSettings {
  general: {
    platformName: string;
    supportEmail: string;
    supportPhone: string;
    operationalCities: string[];
    maintenanceMode: boolean;
    clusterVersion: string;
  };
  business: {
    defaultTakeRatePercent: number;
    gstPercent: number;
    tcsPercent: number;
    packagingChargeCap: number;
    surgePricingMultiplierMax: number;
  };
  orders: {
    maxDeliveryDistanceKm: number;
    targetPrepTimeMinutes: number;
    targetDeliveryTimeMinutes: number;
    autoCancelTimeoutMinutes: number;
    maxActiveOrdersPerPartner: number;
  };
  delivery: {
    baseDeliveryFee: number;
    perKmFeeAfter3Km: number;
    rainSurgeBonusPerOrder: number;
    evIncentivePerOrder: number;
    nightShiftBonusPerOrder: number;
  };
  payments: {
    gatewayProvider: string;
    autoRefundApprovalLimit: number;
    codEnabled: boolean;
    payoutSettlementDays: number; // e.g. 1 for T+1
  };
  security: {
    enforce2FA: boolean;
    sessionTimeoutHours: number;
    ipWhitelistingEnabled: boolean;
    strictRoleBasedAccess: boolean;
  };
}
