import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { INITIAL_PRODUCTS, TAXONOMY } from './data/initialCatalog';
import {
  Product,
  InventoryLock,
  Order,
  ProductStatus,
  OrderStatus,
  AdminStats,
  DeliveryZone,
  PaymentGateway,
  CourierProvider,
  UserProfile,
  UserGender,
  StorefrontConfig
} from './types/resale';
import { CourierIntegrationService } from './services/courierService';
import { corsMiddleware } from './middleware/corsConfig';
import {
  AdminRole,
  AuthenticatedRequest,
  optionalCustomerAuth,
  requireAdminAuth,
  signAdminToken,
  signCustomerToken,
} from './middleware/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(corsMiddleware);
app.use(express.json());
app.use('/fonts', express.static(path.resolve(process.cwd(), 'public/fonts')));
app.use(express.static(path.resolve(process.cwd(), 'public')));

// Global API Auth Guards:
// Protect all staff & operational endpoints under /api/admin/*
app.use('/api/admin', requireAdminAuth(['SUPER_ADMIN', 'VAULT_STAFF', 'DISPATCHER']));
app.use('/api/user', optionalCustomerAuth);
app.use('/api/cart', optionalCustomerAuth);
app.use('/api/checkout', optionalCustomerAuth);
app.use('/api/payment', optionalCustomerAuth);

// ----------------------------------------------------------------------------
// 0. HEALTH & DECOUPLED AUTHENTICATION ENDPOINTS (CUSTOMER VS ADMIN RBAC)
// ----------------------------------------------------------------------------
const STAFF_ACCOUNTS: Array<{ id: string; email: string; name: string; role: AdminRole; passcode: string }> = [
  {
    id: 'adm_super_01',
    email: 'ops@sairatvault.com',
    name: 'Dhaka Vault Operations Lead',
    role: 'SUPER_ADMIN',
    passcode: process.env.ADMIN_DEMO_PASSCODE || 'VAULT-DHAKA-2026',
  },
  {
    id: 'adm_staff_02',
    email: 'curator@sairatvault.com',
    name: 'Archival Vault Curator',
    role: 'VAULT_STAFF',
    passcode: process.env.ADMIN_DEMO_PASSCODE || 'VAULT-DHAKA-2026',
  },
  {
    id: 'adm_dispatch_03',
    email: 'dispatch@sairatvault.com',
    name: 'Banani Courier Dispatcher',
    role: 'DISPATCHER',
    passcode: process.env.ADMIN_DEMO_PASSCODE || 'VAULT-DHAKA-2026',
  },
];

app.get('/api/health', (_req: Request, res: Response): void => {
  res.json({
    ok: true,
    service: 'sairat-backend-api',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/auth/customer/login', (req: Request, res: Response): void => {
  const { email, name, userId } = req.body || {};
  if (!email) {
    res.status(400).json({ error: 'Customer email is required.' });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const id = String(userId || `usr_${crypto.createHash('md5').update(normalizedEmail).digest('hex').slice(0, 8)}`);
  const customerName = String(name || normalizedEmail.split('@')[0]);
  const role: 'CUSTOMER' | 'VIP_CONSIGNOR' = normalizedEmail.includes('vip') ? 'VIP_CONSIGNOR' : 'CUSTOMER';

  const token = signCustomerToken({
    sub: id,
    email: normalizedEmail,
    name: customerName,
    role,
  });

  res.json({
    success: true,
    token,
    customer: { id, email: normalizedEmail, name: customerName, role },
  });
});

app.post('/api/auth/admin/login', (req: Request, res: Response): void => {
  const { email, passcode } = req.body || {};
  if (!email || !passcode) {
    res.status(400).json({ error: 'Staff email and vault passcode are required.' });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const account = STAFF_ACCOUNTS.find((a) => a.email.toLowerCase() === normalizedEmail);
  if (!account || account.passcode !== String(passcode)) {
    res.status(401).json({ error: 'Invalid staff email or vault passcode.' });
    return;
  }

  const token = signAdminToken({
    sub: account.id,
    email: account.email,
    name: account.name,
    role: account.role,
  });

  res.json({
    success: true,
    token,
    admin: {
      id: account.id,
      email: account.email,
      name: account.name,
      role: account.role,
    },
  });
});

app.get('/api/auth/admin/me', requireAdminAuth(), (req: AuthenticatedRequest, res: Response): void => {
  res.json({ success: true, admin: req.admin });
});

// ----------------------------------------------------------------------------
// IN-MEMORY DATABASE & CONCURRENCY TRANSACTION LEASE ENGINE (BANGLADESH)
// ----------------------------------------------------------------------------
let products: Product[] = [...INITIAL_PRODUCTS];
let inventoryLocks: Map<string, InventoryLock> = new Map(); // key = productId
let processedPaymentEvents: Set<string> = new Set(); // Payment idempotency
let userProfiles: Map<string, UserProfile> = new Map(); // key = userId / session ID

let storefrontConfig: StorefrontConfig = {
  announcementText: 'COMPLIMENTARY WHITE-GLOVE BANANI & GULSHAN SAME-DAY HAND DELIVERY · VERIFIED 1-OF-1 ARCHIVE PIECES',
  isAnnouncementVisible: true,
  heroHeadline: 'Minimalism and fantasy',
  heroSubheadline: 'Curated 1-of-1 archival relics verified with forensic authenticity and flat-measured to the millimeter.',
  heroTag: 'Archive Capsule 2026',
  heroImageUrl: 'https://innovecouture.vamtam.com/wp-content/uploads/2024/01/pexels-cottonbro-studio-9836585-1-scaled.jpg',
  menHeroHeadline: 'Minimalism and fantasy',
  menHeroSubheadline: 'Curated 1-of-1 relics from the Antwerp Six, 1990s Tokyo Ura-Harajuku, and bespoke Savile Row tailoring. Every garment verified with forensic authenticity and flat-measured to the half-inch.',
  menHeroImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=2200&q=85',
  insideDhakaDeliveryFeeBDT: 80,
  outsideDhakaDeliveryFeeBDT: 150,
  conciergePhone: '+880 1711-982341',
  isMaintenanceMode: false,
  activeCampaignName: 'Autumn / Winter Archival Capsule 2026',
  updatedAt: new Date().toISOString()
};

// Seed initial Bangladesh luxury resale orders
let orders: Order[] = [
  {
    id: 'ord_bd_9042',
    orderNumber: 'INV-BD-2026-9042',
    customerId: 'cust_nafis_01',
    customerName: 'Nafis Chowdhury',
    customerPhone: '01711982341',
    customerEmail: 'nafis.chowdhury@gulshan-vault.com',
    shippingAddress: {
      division: 'Dhaka',
      district: 'Dhaka (Metropolitan)',
      thana: 'Gulshan 1 & 2',
      streetAddress: 'House 42, Road 71, Gulshan-2',
      deliveryZone: 'INSIDE_DHAKA'
    },
    subtotalBDT: 195000,
    deliveryFeeBDT: 80,
    totalBDT: 195080,
    paymentGateway: 'BKASH',
    isAdvanceDeliveryPaid: false,
    advancePaidAmountBDT: 0,
    codPayableAmountBDT: 0,
    paymentTrxId: 'BKASH-TRX-9F2281A',
    status: 'DISPATCHED_COURIER',
    courier: 'STEADFAST',
    consignmentId: 'STDF-CN-892104',
    trackingCode: 'STDF-9042-DHAKA',
    trackingUrl: 'https://steadfast.com.bd/tracking/STDF-9042-DHAKA',
    estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date('2026-10-15T10:30:00Z').toISOString(),
    checkpoints: [
      {
        status: 'AUTHENTICATION_APPROVED',
        title: 'Physical Authentication Approved at Banani Inspection Vault',
        location: 'SAIRAT Banani Archival Vault, Dhaka',
        timestamp: '2026-10-15T11:00:00Z',
        isCompleted: true
      },
      {
        status: 'STEADFAST_PICKED_UP',
        title: 'Steadfast Courier Consignment Collected',
        location: 'Tejgaon Central Sorting Facility, Dhaka',
        timestamp: '2026-10-15T16:45:00Z',
        isCompleted: true
      },
      {
        status: 'OUT_FOR_DELIVERY',
        title: 'Rider Out for Signature Delivery in Gulshan-2',
        location: 'Steadfast Gulshan Hub, Dhaka',
        timestamp: '2026-10-16T09:30:00Z',
        isCompleted: true
      }
    ],
    items: [
      {
        id: 'item_sample_1',
        orderId: 'ord_bd_9042',
        productId: 'prod_margiela_02',
        product: INITIAL_PRODUCTS[1],
        priceBDT: 195000
      }
    ]
  },
  {
    id: 'ord_bd_8814',
    orderNumber: 'INV-BD-2026-8814',
    customerId: 'cust_tahmid_02',
    customerName: 'Tahmidur Rahman',
    customerPhone: '01844992100',
    customerEmail: 'tahmid.rahman@ctg-archive.com',
    shippingAddress: {
      division: 'Chittagong',
      district: 'Chittagong (Chattogram)',
      thana: 'Agrabad Commercial Area',
      streetAddress: 'CDA Avenue, Nasirabad Tower Level 4',
      deliveryZone: 'OUTSIDE_DHAKA'
    },
    subtotalBDT: 115000,
    deliveryFeeBDT: 150,
    totalBDT: 115150,
    paymentGateway: 'CASH_ON_DELIVERY',
    isAdvanceDeliveryPaid: true,
    advancePaidAmountBDT: 150, // Advance delivery fee collected via bKash
    codPayableAmountBDT: 115000, // Balance collected by courier
    paymentTrxId: 'BKASH-ADV-781190',
    status: 'DISPATCHED_COURIER',
    courier: 'PATHAO',
    consignmentId: 'PTH-CN-44120',
    trackingCode: 'PTH-8814-CTG',
    trackingUrl: 'https://pathao.com/courier/tracking?consignment_id=PTH-8814-CTG',
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date('2026-10-14T14:15:00Z').toISOString(),
    checkpoints: [
      {
        status: 'AUTHENTICATION_APPROVED',
        title: 'Physical Authentication Approved & Sealed',
        location: 'SAIRAT Central Vault, Dhaka',
        timestamp: '2026-10-14T15:00:00Z',
        isCompleted: true
      },
      {
        status: 'PATHAO_HUB_TRANSIT',
        title: 'Dispatched via Pathao Inter-District Highway Cargo',
        location: 'Dhaka - Chittagong Highway Logistics Express',
        timestamp: '2026-10-15T02:00:00Z',
        isCompleted: true
      },
      {
        status: 'ARRIVED_LOCAL_HUB',
        title: 'Arrived at Pathao Agrabad Distribution Center',
        location: 'Agrabad, Chattogram',
        timestamp: '2026-10-16T11:00:00Z',
        isCompleted: true
      }
    ],
    items: [
      {
        id: 'item_sample_2',
        orderId: 'ord_bd_8814',
        productId: 'prod_rick_04',
        product: INITIAL_PRODUCTS[3],
        priceBDT: 115000
      }
    ]
  }
];

// Helper to clean expired holds automatically
function purgeExpiredLocks(): void {
  const now = new Date();
  for (const [productId, lock] of inventoryLocks.entries()) {
    if (lock.isActive && new Date(lock.expiresAt) <= now) {
      lock.isActive = false;
      const product = products.find((p) => p.id === productId);
      if (product && product.status === 'IN_CART_HOLD') {
        product.status = 'ACTIVE';
        product.updatedAt = now.toISOString();
      }
    }
  }
}

// Background sweep every 15 seconds
setInterval(purgeExpiredLocks, 15000);

// SKU Generator helper: BRAND-CAT-YEAR-RANDOMHEX
export function generateResaleSKU(brand: string, categoryId: string, eraDecade: string): string {
  const brandSlug = brand.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase().padEnd(4, 'X');
  const catSlug = categoryId.replace(/cat_/g, '').slice(0, 3).toUpperCase().padEnd(3, 'GEN');
  
  let yearStr = '2026';
  if (eraDecade.includes('90')) yearStr = '1995';
  else if (eraDecade.includes('Y2K')) yearStr = '2002';
  else yearStr = new Date().getFullYear().toString();

  const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${brandSlug}-${catSlug}-${yearStr}-${randomHex}`;
}

// ----------------------------------------------------------------------------
// 1. ATOMIC INVENTORY RESERVATION WITH PHONE / OTP LEASE
// POST /api/cart/hold
// ----------------------------------------------------------------------------
app.post('/api/cart/hold', (req: Request, res: Response): void => {
  purgeExpiredLocks();
  const { productId, phone, userId } = req.body;

  if (!productId) {
    res.status(400).json({ success: false, error: 'Missing productId' });
    return;
  }

  const product = products.find((p) => p.id === productId);
  if (!product) {
    res.status(404).json({ success: false, error: 'PRODUCT_NOT_FOUND', message: 'Item does not exist' });
    return;
  }

  if (product.status === 'SOLD') {
    res.status(409).json({
      success: false,
      error: 'ITEM_ALREADY_SOLD',
      message: 'This one-of-a-kind piece has already been purchased in Bangladesh.'
    });
    return;
  }

  // Direct addition to cart session without restrictive 10-minute hold lockout
  const lockId = `cart_${crypto.randomBytes(6).toString('hex')}`;
  
  res.status(200).json({
    success: true,
    lockId,
    productId,
    message: 'Piece added to shopping bag successfully for direct checkout.'
  });
});

app.delete('/api/cart/hold/:productId', (req: Request, res: Response): void => {
  const { productId } = req.params;
  const lock = inventoryLocks.get(productId);
  if (lock) lock.isActive = false;

  const product = products.find((p) => p.id === productId);
  if (product && product.status === 'IN_CART_HOLD') {
    product.status = 'ACTIVE';
    product.updatedAt = new Date().toISOString();
  }

  res.status(200).json({ success: true, message: 'Hold released.' });
});

// ----------------------------------------------------------------------------
// USER PROFILE & SESSION PREFERENCES (GENDER & PREFERRED HOME)
// GET /api/user/profile/:userId & POST /api/user/profile
// ----------------------------------------------------------------------------
app.get('/api/user/profile/:userId', (req: Request, res: Response): void => {
  const { userId } = req.params;
  
  if (!userId) {
    res.status(400).json({ success: false, error: 'Missing userId parameter' });
    return;
  }

  let profile = userProfiles.get(userId);
  if (!profile) {
    profile = {
      id: userId,
      gender: 'UNSPECIFIED',
      preferredHome: 'HOME',
      updatedAt: new Date().toISOString()
    };
    userProfiles.set(userId, profile);
  }

  res.status(200).json({
    success: true,
    profile
  });
});

app.post('/api/user/profile', (req: Request, res: Response): void => {
  const { userId, gender, preferredHome, name, phone, email, notes } = req.body;

  if (!userId) {
    res.status(400).json({ success: false, error: 'Missing userId parameter in body' });
    return;
  }

  const validGenders: UserGender[] = ['MEN', 'WOMEN', 'UNSPECIFIED'];
  const userGender: UserGender = validGenders.includes(gender) ? gender : 'UNSPECIFIED';
  const userPreferredHome: string = preferredHome || 'HOME';

  const existing: UserProfile = userProfiles.get(userId) || {
    id: userId,
    gender: 'UNSPECIFIED',
    preferredHome: 'HOME',
    updatedAt: new Date().toISOString()
  };

  const updatedProfile: UserProfile = {
    ...existing,
    id: userId,
    gender: userGender,
    preferredHome: userPreferredHome,
    name: name !== undefined ? name : existing.name,
    phone: phone !== undefined ? phone : existing.phone,
    email: email !== undefined ? email : existing.email,
    notes: notes !== undefined ? notes : existing.notes,
    updatedAt: new Date().toISOString()
  };

  userProfiles.set(userId, updatedProfile);

  res.status(200).json({
    success: true,
    profile: updatedProfile,
    message: 'User profile and session preferences successfully persisted.'
  });
});

// ----------------------------------------------------------------------------
// 2. bKASH TOKENIZED CHECKOUT INTEGRATION
// POST /api/payment/bkash/create & POST /api/payment/bkash/execute
// ----------------------------------------------------------------------------
app.post('/api/payment/bkash/create', (req: Request, res: Response): void => {
  const { productIds, customerPhone, amountBDT } = req.body;

  if (!productIds || !amountBDT) {
    res.status(400).json({ success: false, error: 'Product IDs and amount are required' });
    return;
  }

  const paymentID = `BKASH_PAY_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
  
  res.status(200).json({
    success: true,
    paymentID,
    createTime: new Date().toISOString(),
    orgLogo: 'https://scripts.bkash.com/resources/img/bkash_logo.png',
    orgName: 'SAIRAT COUTURE BANGLADESH',
    amount: amountBDT,
    currency: 'BDT',
    intent: 'sale',
    merchantInvoiceNumber: `INV-BK-${Date.now().toString().slice(-6)}`,
    bkashURL: `/checkout/bkash-simulated?paymentID=${paymentID}`
  });
});

app.post('/api/payment/bkash/execute', (req: Request, res: Response): void => {
  const { paymentID, otp, pin, productIds, customerName, customerPhone, shippingAddress, deliveryZone } = req.body;

  if (!paymentID) {
    res.status(400).json({ success: false, error: 'PaymentID is required.' });
    return;
  }

  // Idempotency check
  if (processedPaymentEvents.has(paymentID)) {
    res.status(200).json({
      success: true,
      idempotent: true,
      message: 'bKash payment already settled.'
    });
    return;
  }

  processedPaymentEvents.add(paymentID);

  const trxID = `TRX${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
  const now = new Date().toISOString();

  // Deduct inventory atomically
  const purchasedProducts: Product[] = [];
  let subtotalBDT = 0;

  for (const pid of productIds || []) {
    const product = products.find((p) => p.id === pid);
    if (product) {
      product.status = 'SOLD';
      product.updatedAt = now;
      purchasedProducts.push(product);
      subtotalBDT += product.priceBDT;
      const lock = inventoryLocks.get(pid);
      if (lock) lock.isActive = false;
    }
  }

  const isDhaka = deliveryZone === 'INSIDE_DHAKA' || shippingAddress?.district?.toLowerCase().includes('dhaka');
  const deliveryFeeBDT = isDhaka ? 80 : 150;
  const totalBDT = subtotalBDT + deliveryFeeBDT;
  const orderNumber = `INV-BD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const trackingCode = `STDF-${orderNumber.slice(-4)}-DHAKA`;

  const newOrder: Order = {
    id: `ord_${crypto.randomBytes(6).toString('hex')}`,
    orderNumber,
    customerId: `cust_${crypto.randomBytes(4).toString('hex')}`,
    customerName: customerName || 'Valued Collector',
    customerPhone: customerPhone || '01700000000',
    customerEmail: req.body.customerEmail || 'client@innove-couture.com',
    shippingAddress: shippingAddress || {
      division: 'Dhaka',
      district: 'Dhaka (Metropolitan)',
      thana: 'Gulshan 1 & 2',
      streetAddress: 'House 12, Road 4, Sector 3',
      deliveryZone: isDhaka ? 'INSIDE_DHAKA' : 'OUTSIDE_DHAKA'
    },
    subtotalBDT,
    deliveryFeeBDT,
    totalBDT,
    paymentGateway: 'BKASH',
    isAdvanceDeliveryPaid: false,
    advancePaidAmountBDT: 0,
    codPayableAmountBDT: 0,
    paymentTrxId: trxID,
    status: 'PAID_FULL',
    courier: 'STEADFAST',
    consignmentId: `STDF-CN-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    trackingCode,
    trackingUrl: `https://steadfast.com.bd/tracking/${trackingCode}`,
    estimatedDelivery: new Date(Date.now() + (isDhaka ? 1 : 3) * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: now,
    checkpoints: [
      {
        status: 'PAYMENT_CONFIRMED',
        title: `bKash Payment Verified (TrxID: ${trxID})`,
        location: 'bKash Merchant Settlement Gateway',
        timestamp: now,
        isCompleted: true
      },
      {
        status: 'AUTHENTICATION_APPROVED',
        title: 'Archival Inspection Approved & Vault Sealed',
        location: 'SAIRAT Central Vault, Banani, Dhaka',
        timestamp: now,
        isCompleted: true
      },
      {
        status: 'STEADFAST_PICKUP_READY',
        title: 'Consignment Packaging Ready for Steadfast Courier Pickup',
        location: 'Dhaka Dispatch Center',
        timestamp: now,
        isCompleted: true
      }
    ],
    items: purchasedProducts.map((p) => ({
      id: `item_${crypto.randomBytes(4).toString('hex')}`,
      orderId: orderNumber,
      productId: p.id,
      product: p,
      priceBDT: p.priceBDT
    }))
  };

  orders.unshift(newOrder);

  res.status(200).json({
    success: true,
    trxID,
    paymentID,
    order: newOrder,
    message: 'bKash payment executed successfully. Inventory status updated to SOLD.'
  });
});

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// 3. AUTOMATED COURIER DISPATCH & ADMIN COURIER GATEWAY APIS (STEADFAST & PATHAO)
// ----------------------------------------------------------------------------

// Dispatch single order via Steadfast or Pathao Courier API
app.post('/api/admin/orders/:id/dispatch', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { courier = 'STEADFAST', note, deliveryType, deliveryZone, weightKg } = req.body;

  const order = orders.find((o) => o.id === id || o.orderNumber === id);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  const effectiveZone: DeliveryZone =
    deliveryZone === 'INSIDE_DHAKA' || deliveryZone === 'OUTSIDE_DHAKA'
      ? deliveryZone
      : order.shippingAddress.deliveryZone || 'INSIDE_DHAKA';

  const effectiveCourier: CourierProvider = courier === 'PATHAO' ? 'PATHAO' : 'STEADFAST';

  const rateResult = CourierIntegrationService.calculateRealTimeRate({
    courier: effectiveCourier,
    deliveryZone: effectiveZone,
    district: order.shippingAddress.district,
    thana: order.shippingAddress.thana,
    weightKg: weightKg ? Number(weightKg) : undefined,
    deliveryType: deliveryType === 12 ? 12 : 48,
    codAmountBDT: order.paymentGateway === 'CASH_ON_DELIVERY' ? order.subtotalBDT : 0
  });

  // Update delivery zone & dynamically computed courier tariff
  order.shippingAddress.deliveryZone = effectiveZone;
  order.deliveryFeeBDT = rateResult.quote.totalDeliveryFeeBDT;
  order.totalBDT = order.subtotalBDT + order.deliveryFeeBDT;

  // Recalculate COD payable amount if payment is Cash on Delivery
  if (order.paymentGateway === 'CASH_ON_DELIVERY') {
    if (order.isAdvanceDeliveryPaid) {
      order.codPayableAmountBDT = Math.max(0, order.totalBDT - (order.advancePaidAmountBDT || 0));
    } else {
      order.codPayableAmountBDT = order.totalBDT;
    }
  }

  const codAmount = order.paymentGateway === 'CASH_ON_DELIVERY' ? order.codPayableAmountBDT : 0;
  const now = new Date().toISOString();

  let bookingResult;
  if (effectiveCourier === 'PATHAO') {
    bookingResult = await CourierIntegrationService.bookPathaoOrder(order, {
      deliveryType: rateResult.quote.deliveryType,
      instruction: note
    });
  } else {
    bookingResult = await CourierIntegrationService.bookSteadfastOrder(order, { note });
  }

  // Atomically update order record
  order.courier = effectiveCourier;
  order.consignmentId = bookingResult.consignmentId;
  order.trackingCode = bookingResult.trackingCode;
  order.trackingUrl = bookingResult.trackingUrl;
  order.estimatedDelivery = rateResult.quote.estimatedSla;
  order.status = 'DISPATCHED_COURIER';

  if (!order.checkpoints) order.checkpoints = [];
  order.checkpoints.push({
    status: 'COURIER_DISPATCHED',
    title: `Consignment Registered & Dispatched via ${effectiveCourier} Courier (${bookingResult.trackingCode})`,
    location:
      effectiveCourier === 'STEADFAST'
        ? 'Steadfast Central Sorting Hub, Tejgaon, Dhaka'
        : 'Pathao Banani Fulfillment Hub, Dhaka',
    timestamp: now,
    isCompleted: true
  });

  const consignmentNote = CourierIntegrationService.generateConsignmentNote(order);

  res.status(200).json({
    success: true,
    consignmentId: bookingResult.consignmentId,
    trackingCode: bookingResult.trackingCode,
    trackingUrl: bookingResult.trackingUrl,
    courier: effectiveCourier,
    deliveryZone: order.shippingAddress.deliveryZone,
    deliveryFeeBDT: order.deliveryFeeBDT,
    totalBDT: order.totalBDT,
    codAmountToCollect: codAmount,
    rateQuote: rateResult.quote,
    apiResponse: bookingResult.apiResponse,
    consignmentNote,
    order,
    message: `Consignment successfully created with ${effectiveCourier} API. Tracking Code: ${bookingResult.trackingCode}`
  });
});

// Update delivery zone / courier tariff for an order prior to dispatch
app.patch('/api/admin/orders/:id/delivery-zone', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { deliveryZone, courier, weightKg, deliveryType } = req.body;

  const order = orders.find((o) => o.id === id || o.orderNumber === id);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  const effectiveZone: DeliveryZone =
    deliveryZone === 'INSIDE_DHAKA' || deliveryZone === 'OUTSIDE_DHAKA'
      ? deliveryZone
      : order.shippingAddress.deliveryZone || 'INSIDE_DHAKA';

  const effectiveCourier: CourierProvider =
    courier === 'PATHAO' || courier === 'STEADFAST' ? courier : order.courier || 'STEADFAST';

  const rateResult = CourierIntegrationService.calculateRealTimeRate({
    courier: effectiveCourier,
    deliveryZone: effectiveZone,
    district: order.shippingAddress.district,
    thana: order.shippingAddress.thana,
    weightKg: weightKg ? Number(weightKg) : undefined,
    deliveryType: deliveryType === 12 ? 12 : 48,
    codAmountBDT: order.paymentGateway === 'CASH_ON_DELIVERY' ? order.subtotalBDT : 0
  });

  order.shippingAddress.deliveryZone = effectiveZone;
  order.courier = effectiveCourier;
  order.deliveryFeeBDT = rateResult.quote.totalDeliveryFeeBDT;
  order.totalBDT = order.subtotalBDT + order.deliveryFeeBDT;

  if (order.paymentGateway === 'CASH_ON_DELIVERY') {
    if (order.isAdvanceDeliveryPaid) {
      order.codPayableAmountBDT = Math.max(0, order.totalBDT - (order.advancePaidAmountBDT || 0));
    } else {
      order.codPayableAmountBDT = order.totalBDT;
    }
  }

  res.status(200).json({
    success: true,
    order,
    rateQuote: rateResult.quote,
    deliveryZone: order.shippingAddress.deliveryZone,
    courier: order.courier,
    deliveryFeeBDT: order.deliveryFeeBDT,
    totalBDT: order.totalBDT,
    message: `Delivery zone updated to ${order.shippingAddress.deliveryZone} via ${order.courier} (Fee: ৳${order.deliveryFeeBDT})`
  });
});

// Synchronize Live Courier API status & checkpoints for an order
app.post('/api/admin/orders/:id/courier-status', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const order = orders.find((o) => o.id === id || o.orderNumber === id);

  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  const syncResult = await CourierIntegrationService.syncCourierStatus(order);

  // Update order status if delivered
  if (syncResult.deliveryStatus === 'DELIVERED') {
    order.status = 'DELIVERED';
  } else if (order.status !== 'DELIVERED') {
    order.status = 'DISPATCHED_COURIER';
  }

  // Append new checkpoint if not already present
  if (syncResult.newCheckpoint && order.checkpoints) {
    const exists = order.checkpoints.some((c) => c.title === syncResult.newCheckpoint?.title);
    if (!exists) {
      order.checkpoints.push(syncResult.newCheckpoint);
    }
  }

  res.status(200).json({
    success: true,
    syncResult,
    order,
    message: syncResult.message
  });
});

// Retrieve generated luxury Consignment Note / Waybill for print & verification
app.get('/api/admin/orders/:id/consignment-note', (req: Request, res: Response): void => {
  const { id } = req.params;
  const order = orders.find((o) => o.id === id || o.orderNumber === id);

  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  const consignmentNote = CourierIntegrationService.generateConsignmentNote(order);
  res.status(200).json({
    success: true,
    consignmentNote
  });
});

// Manual Tracking ID & Consignment Override
app.patch('/api/admin/orders/:id/tracking', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { trackingCode, consignmentId, courier, trackingUrl } = req.body;

  const order = orders.find((o) => o.id === id || o.orderNumber === id);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  if (trackingCode) order.trackingCode = trackingCode;
  if (consignmentId) order.consignmentId = consignmentId;
  if (courier) order.courier = courier;
  if (trackingUrl) {
    order.trackingUrl = trackingUrl;
  } else if (trackingCode) {
    order.trackingUrl = order.courier === 'PATHAO'
      ? `https://pathao.com/courier/tracking?consignment_id=${trackingCode}`
      : `https://steadfast.com.bd/tracking/${trackingCode}`;
  }

  const now = new Date().toISOString();
  if (!order.checkpoints) order.checkpoints = [];
  order.checkpoints.push({
    status: 'TRACKING_UPDATED',
    title: `Logistics Tracking Refreshed by Dispatch Admin: ${order.trackingCode}`,
    location: 'SAIRAT Central Vault, Banani, Dhaka',
    timestamp: now,
    isCompleted: true
  });

  res.status(200).json({
    success: true,
    order,
    message: `Tracking ID updated to ${order.trackingCode} (${order.courier})`
  });
});

// Batch Dispatch Orders to Steadfast or Pathao
app.post('/api/admin/orders/batch-dispatch', async (req: Request, res: Response): Promise<void> => {
  const { orderIds, courier = 'STEADFAST' } = req.body;

  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    res.status(400).json({ success: false, error: 'orderIds array is required' });
    return;
  }

  const updatedOrders: Order[] = [];
  const consignmentNotes: any[] = [];

  for (const id of orderIds) {
    const order = orders.find((o) => o.id === id || o.orderNumber === id);
    if (!order) continue;

    let booking;
    if (courier === 'PATHAO') {
      booking = await CourierIntegrationService.bookPathaoOrder(order);
    } else {
      booking = await CourierIntegrationService.bookSteadfastOrder(order);
    }

    order.courier = courier as CourierProvider;
    order.consignmentId = booking.consignmentId;
    order.trackingCode = booking.trackingCode;
    order.trackingUrl = booking.trackingUrl;
    order.status = 'DISPATCHED_COURIER';

    const now = new Date().toISOString();
    if (!order.checkpoints) order.checkpoints = [];
    order.checkpoints.push({
      status: 'COURIER_DISPATCHED',
      title: `Batch Dispatched via ${courier} Courier (${booking.trackingCode})`,
      location: courier === 'STEADFAST' ? 'Steadfast Sorting Hub, Tejgaon' : 'Pathao Hub, Banani',
      timestamp: now,
      isCompleted: true
    });

    updatedOrders.push(order);
    consignmentNotes.push(CourierIntegrationService.generateConsignmentNote(order));
  }

  res.status(200).json({
    success: true,
    dispatchedCount: updatedOrders.length,
    orders: updatedOrders,
    consignmentNotes,
    message: `Successfully batch dispatched ${updatedOrders.length} orders via ${courier} Courier.`
  });
});

// Courier Gateway API Config & Balances
app.get('/api/admin/courier/config', (_req: Request, res: Response): void => {
  const config = CourierIntegrationService.getGatewayConfig();
  res.status(200).json({
    success: true,
    config
  });
});

app.post('/api/admin/courier/config', (req: Request, res: Response): void => {
  const { steadfast, pathao } = req.body;
  const updated = CourierIntegrationService.updateGatewayConfig({ steadfast, pathao });
  res.status(200).json({
    success: true,
    config: updated,
    message: 'Courier API gateway credentials updated successfully.'
  });
});

// Real-Time Shipping Rate Calculator (Steadfast Tariff v1 & Pathao Aladdin Price Plan)
app.post('/api/admin/courier/calculate-rate', (req: Request, res: Response): void => {
  const {
    courier = 'STEADFAST',
    deliveryZone = 'INSIDE_DHAKA',
    district = '',
    thana = '',
    weightKg = 1.0,
    deliveryType = 48,
    codAmountBDT = 0
  } = req.body || {};

  const result = CourierIntegrationService.calculateRealTimeRate({
    courier: courier === 'PATHAO' ? 'PATHAO' : 'STEADFAST',
    deliveryZone: deliveryZone === 'OUTSIDE_DHAKA' ? 'OUTSIDE_DHAKA' : 'INSIDE_DHAKA',
    district,
    thana,
    weightKg: Number(weightKg) || 1.0,
    deliveryType: Number(deliveryType) === 12 ? 12 : 48,
    codAmountBDT: Number(codAmountBDT) || 0
  });

  res.status(200).json({
    success: true,
    ...result
  });
});

app.get('/api/admin/courier/rates', (req: Request, res: Response): void => {
  const courier = req.query.courier === 'PATHAO' ? 'PATHAO' : 'STEADFAST';
  const deliveryZone = req.query.deliveryZone === 'OUTSIDE_DHAKA' ? 'OUTSIDE_DHAKA' : 'INSIDE_DHAKA';
  const district = typeof req.query.district === 'string' ? req.query.district : '';
  const thana = typeof req.query.thana === 'string' ? req.query.thana : '';
  const weightKg = req.query.weightKg ? Number(req.query.weightKg) : 1.0;
  const deliveryType = Number(req.query.deliveryType) === 12 ? 12 : 48;
  const codAmountBDT = req.query.codAmountBDT ? Number(req.query.codAmountBDT) : 0;

  const result = CourierIntegrationService.calculateRealTimeRate({
    courier,
    deliveryZone,
    district,
    thana,
    weightKg,
    deliveryType,
    codAmountBDT
  });

  res.status(200).json({
    success: true,
    ...result
  });
});

// Courier Performance Analytics: Steadfast vs Pathao Fulfillment Success & Delivery Speed
app.get('/api/admin/courier/analytics', (_req: Request, res: Response): void => {
  const steadfastOrders = orders.filter((o) => (o.courier || 'STEADFAST') === 'STEADFAST');
  const pathaoOrders = orders.filter((o) => o.courier === 'PATHAO');

  const steadfastDeliveredLive = steadfastOrders.filter((o) => o.status === 'DELIVERED').length;
  const pathaoDeliveredLive = pathaoOrders.filter((o) => o.status === 'DELIVERED').length;

  const steadfastFailedLive = steadfastOrders.filter((o) => o.status === 'CANCELLED').length;
  const pathaoFailedLive = pathaoOrders.filter((o) => o.status === 'CANCELLED').length;

  // Baseline historical vault consignment ledger merged with live session orders
  const sfBaseTotal = 184;
  const sfBaseSuccess = 178;
  const ptBaseTotal = 142;
  const ptBaseSuccess = 134;

  const sfActiveShipments = steadfastOrders.filter((o) =>
    ['DISPATCHED_COURIER', 'DELIVERED', 'CANCELLED'].includes(o.status)
  ).length;
  const ptActiveShipments = pathaoOrders.filter((o) =>
    ['DISPATCHED_COURIER', 'DELIVERED', 'CANCELLED'].includes(o.status)
  ).length;

  const sfTotal = sfBaseTotal + sfActiveShipments;
  const sfSuccess = sfBaseSuccess + steadfastDeliveredLive + Math.max(0, sfActiveShipments - steadfastDeliveredLive - steadfastFailedLive);
  const ptTotal = ptBaseTotal + ptActiveShipments;
  const ptSuccess = ptBaseSuccess + pathaoDeliveredLive + Math.max(0, ptActiveShipments - pathaoDeliveredLive - pathaoFailedLive);

  const round1 = (n: number) => Math.round(n * 10) / 10;

  const sfRate = round1((sfSuccess / sfTotal) * 100);
  const ptRate = round1((ptSuccess / ptTotal) * 100);

  const analytics = {
    generatedAt: new Date().toISOString(),
    summary: {
      steadfast: {
        courier: 'STEADFAST' as const,
        name: 'Steadfast Courier Ltd.',
        totalShipments: sfTotal,
        deliveredCount: sfSuccess,
        liveOrdersCount: steadfastOrders.length,
        fulfillmentSuccessRate: sfRate,
        avgDeliveryTimeHours: 31.4,
        insideDhakaAvgHours: 18.6,
        outsideDhakaAvgHours: 49.2,
        onTimeSlaRate: 94.8
      },
      pathao: {
        courier: 'PATHAO' as const,
        name: 'Pathao Courier Express',
        totalShipments: ptTotal,
        deliveredCount: ptSuccess,
        liveOrdersCount: pathaoOrders.length,
        fulfillmentSuccessRate: ptRate,
        avgDeliveryTimeHours: 24.8,
        insideDhakaAvgHours: 13.2,
        outsideDhakaAvgHours: 42.5,
        onTimeSlaRate: 92.4
      }
    },
    byZone: [
      {
        segment: 'Dhaka Metro',
        zoneKey: 'INSIDE_DHAKA' as const,
        steadfastSuccessRate: 98.1,
        pathaoSuccessRate: 97.4,
        steadfastAvgHours: 18.6,
        pathaoAvgHours: 13.2,
        steadfastVolume: 112 + steadfastOrders.filter((o) => o.shippingAddress.deliveryZone === 'INSIDE_DHAKA').length,
        pathaoVolume: 96 + pathaoOrders.filter((o) => o.shippingAddress.deliveryZone === 'INSIDE_DHAKA').length
      },
      {
        segment: 'Chattogram & Tier-1',
        zoneKey: 'OUTSIDE_DHAKA' as const,
        steadfastSuccessRate: 96.4,
        pathaoSuccessRate: 93.8,
        steadfastAvgHours: 41.5,
        pathaoAvgHours: 36.8,
        steadfastVolume: 44 + steadfastOrders.filter((o) => o.shippingAddress.deliveryZone === 'OUTSIDE_DHAKA').length,
        pathaoVolume: 34 + pathaoOrders.filter((o) => o.shippingAddress.deliveryZone === 'OUTSIDE_DHAKA').length
      },
      {
        segment: '64-District Regional',
        zoneKey: 'OUTSIDE_DHAKA' as const,
        steadfastSuccessRate: 94.7,
        pathaoSuccessRate: 83.2,
        steadfastAvgHours: 54.0,
        pathaoAvgHours: 61.4,
        steadfastVolume: 28,
        pathaoVolume: 12
      },
      {
        segment: 'All Bangladesh',
        zoneKey: 'ALL' as const,
        steadfastSuccessRate: sfRate,
        pathaoSuccessRate: ptRate,
        steadfastAvgHours: 31.4,
        pathaoAvgHours: 24.8,
        steadfastVolume: sfTotal,
        pathaoVolume: ptTotal
      }
    ],
    monthlyTrend: [
      { month: 'Jun 26', steadfastSuccessRate: 95.2, pathaoSuccessRate: 92.1, steadfastAvgHours: 34.2, pathaoAvgHours: 27.6 },
      { month: 'Jul 26', steadfastSuccessRate: 95.8, pathaoSuccessRate: 93.0, steadfastAvgHours: 33.1, pathaoAvgHours: 26.8 },
      { month: 'Aug 26', steadfastSuccessRate: 96.1, pathaoSuccessRate: 92.8, steadfastAvgHours: 32.5, pathaoAvgHours: 26.1 },
      { month: 'Sep 26', steadfastSuccessRate: 96.5, pathaoSuccessRate: 93.9, steadfastAvgHours: 31.9, pathaoAvgHours: 25.4 },
      { month: 'Oct 26', steadfastSuccessRate: 96.4, pathaoSuccessRate: 94.1, steadfastAvgHours: 31.6, pathaoAvgHours: 25.0 },
      { month: 'Nov 26', steadfastSuccessRate: sfRate, pathaoSuccessRate: ptRate, steadfastAvgHours: 31.4, pathaoAvgHours: 24.8 }
    ]
  };

  res.status(200).json({
    success: true,
    analytics
  });
});

// ----------------------------------------------------------------------------
// 4. BANGLADESH CHECKOUT SIMULATION (bKash, Nagad, Partial-COD, SSLCommerz)
// POST /api/checkout/simulate
// ----------------------------------------------------------------------------
app.post('/api/checkout/simulate', (req: Request, res: Response): void => {
  const {
    productIds,
    customerName,
    customerPhone,
    customerEmail,
    shippingAddress,
    paymentGateway,
    isAdvanceDeliveryPaid,
    advancePaidAmountBDT
  } = req.body;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    res.status(400).json({ error: 'No items to checkout' });
    return;
  }

  if (!customerPhone) {
    res.status(400).json({ error: 'Valid Bangladesh mobile number (01X...) is required.' });
    return;
  }

  const purchasedProducts: Product[] = [];
  let subtotalBDT = 0;

  for (const pid of productIds) {
    const product = products.find((p) => p.id === pid);
    if (!product) {
      res.status(404).json({ error: `Product ${pid} not found` });
      return;
    }
    if (product.status === 'SOLD') {
      res.status(409).json({ error: `Piece ${product.title} has already been sold.` });
      return;
    }
    purchasedProducts.push(product);
    subtotalBDT += product.priceBDT;
  }

  const isDhaka = shippingAddress?.deliveryZone === 'INSIDE_DHAKA' ||
    shippingAddress?.district?.toLowerCase().includes('dhaka') ||
    shippingAddress?.district?.toLowerCase().includes('metropolitan');

  const deliveryFeeBDT = isDhaka ? 80 : 150;
  const totalBDT = subtotalBDT + deliveryFeeBDT;

  let codPayableAmountBDT = 0;
  let advanceAmount = 0;
  let status: any = 'PAID_FULL';

  if (paymentGateway === 'CASH_ON_DELIVERY') {
    // Partial COD: Advance delivery fee (৳80/৳150) paid via bKash to eliminate return loss
    advanceAmount = isAdvanceDeliveryPaid ? (advancePaidAmountBDT || deliveryFeeBDT) : 0;
    codPayableAmountBDT = subtotalBDT + (deliveryFeeBDT - advanceAmount);
    status = isAdvanceDeliveryPaid ? 'PARTIAL_COD_CONFIRMED' : 'PENDING_PAYMENT';
  }

  const now = new Date().toISOString();
  const orderNumber = `INV-BD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const trackingCode = `STDF-${orderNumber.slice(-4)}-${isDhaka ? 'DHK' : 'NATION'}`;

  // Deduct inventory atomically
  for (const p of purchasedProducts) {
    p.status = 'SOLD';
    p.updatedAt = now;
    const lock = inventoryLocks.get(p.id);
    if (lock) lock.isActive = false;
  }

  const newOrder: Order = {
    id: `ord_${crypto.randomBytes(8).toString('hex')}`,
    orderNumber,
    customerId: `cust_${crypto.randomBytes(4).toString('hex')}`,
    customerName: customerName || 'Valued Client',
    customerPhone,
    customerEmail: customerEmail || 'client@innove-couture.com',
    shippingAddress: {
      division: shippingAddress?.division || 'Dhaka',
      district: shippingAddress?.district || 'Dhaka (Metropolitan)',
      thana: shippingAddress?.thana || 'Gulshan 1 & 2',
      streetAddress: shippingAddress?.streetAddress || 'House 12, Road 4',
      deliveryZone: isDhaka ? 'INSIDE_DHAKA' : 'OUTSIDE_DHAKA'
    },
    subtotalBDT,
    deliveryFeeBDT,
    totalBDT,
    paymentGateway: paymentGateway || 'BKASH',
    isAdvanceDeliveryPaid: !!isAdvanceDeliveryPaid,
    advancePaidAmountBDT: advanceAmount,
    codPayableAmountBDT,
    paymentTrxId: paymentGateway === 'BKASH' || paymentGateway === 'NAGAD' ? `TRX${crypto.randomBytes(4).toString('hex').toUpperCase()}` : undefined,
    status,
    courier: 'STEADFAST',
    consignmentId: `STDF-CN-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    trackingCode,
    trackingUrl: `https://steadfast.com.bd/tracking/${trackingCode}`,
    estimatedDelivery: new Date(Date.now() + (isDhaka ? 1 : 3) * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: now,
    checkpoints: [
      {
        status: 'ORDER_PLACED',
        title: `Order Confirmed via ${paymentGateway}`,
        location: 'SAIRAT Bangladesh E-Commerce Center',
        timestamp: now,
        isCompleted: true
      },
      {
        status: 'AUTHENTICATION_APPROVED',
        title: 'Multi-Point Tactile Inspection Approved',
        location: 'SAIRAT Central Vault, Banani, Dhaka',
        timestamp: now,
        isCompleted: true
      },
      {
        status: 'STEADFAST_BOOKED',
        title: 'Steadfast Courier Consignment Registered',
        location: 'Tejgaon Central Hub, Dhaka',
        timestamp: now,
        isCompleted: true
      }
    ],
    items: purchasedProducts.map((p) => ({
      id: `item_${crypto.randomBytes(4).toString('hex')}`,
      orderId: orderNumber,
      productId: p.id,
      product: p,
      priceBDT: p.priceBDT
    }))
  };

  orders.unshift(newOrder);

  res.status(200).json({
    success: true,
    order: newOrder,
    message: 'Order created with automated Steadfast courier booking.'
  });
});

// ----------------------------------------------------------------------------
// 5. CATALOG BROWSING & PDP
// ----------------------------------------------------------------------------
app.get('/api/products', (req: Request, res: Response): void => {
  purgeExpiredLocks();
  let result = [...products];
  const { gender, category, brand, condition, era, query, status, maxPrice, sort } = req.query;

  if (gender && gender !== 'ALL') {
    result = result.filter((p) => p.gender === gender || p.gender === 'UNISEX');
  }

  if (category && category !== 'ALL') {
    const catStr = String(category).toLowerCase();
    if (catStr === 'cat_rtw' || catStr === 'ready-to-wear') {
      result = result.filter((p) => ['cat_outerwear', 'cat_knitwear', 'cat_tops', 'cat_trousers', 'cat_denim', 'cat_dresses', 'cat_skirts'].includes(p.categoryId) || p.categoryName.toLowerCase().includes('dress') || p.categoryName.toLowerCase().includes('jacket') || p.categoryName.toLowerCase().includes('top') || p.categoryName.toLowerCase().includes('knit') || p.categoryName.toLowerCase().includes('skirt'));
    } else if (catStr === 'cat_accessories' || catStr === 'accessories') {
      result = result.filter((p) => ['cat_bags', 'cat_totes', 'cat_crossbody', 'cat_wallets', 'cat_belts', 'cat_silver', 'cat_eyewear', 'cat_scarves', 'cat_footwear'].includes(p.categoryId) || p.categoryName.toLowerCase().includes('bag') || p.categoryName.toLowerCase().includes('shoe') || p.categoryName.toLowerCase().includes('accessory') || p.categoryName.toLowerCase().includes('jewelry'));
    } else if (catStr === 'cat_under_100' || catStr === 'under_100') {
      result = result.filter((p) => p.priceBDT <= 120000);
    } else if (catStr === 'cat_sale') {
      result = result.filter((p) => p.originalRetailBDT && p.originalRetailBDT > p.priceBDT);
    } else if (catStr === 'cat_bags' || catStr.includes('bag')) {
      result = result.filter((p) => p.categoryId === 'cat_bags' || p.categoryId === 'cat_totes' || p.categoryId === 'cat_crossbody' || p.categoryId === 'cat_wallets' || p.categoryName.toLowerCase().includes('bag'));
    } else if (catStr === 'cat_footwear' || catStr.includes('shoe') || catStr.includes('boot')) {
      result = result.filter((p) => p.categoryId === 'cat_footwear' || p.categoryId === 'cat_boots' || p.categoryId === 'cat_derbies' || p.categoryId === 'cat_sneakers' || p.categoryName.toLowerCase().includes('footwear') || p.categoryName.toLowerCase().includes('shoe'));
    } else if (catStr === 'cat_tailoring' || catStr === 'tailoring' || catStr.includes('tailor') || catStr.includes('blazer') || catStr.includes('suit')) {
      result = result.filter((p) => p.title.toLowerCase().includes('blazer') || p.title.toLowerCase().includes('suit') || p.title.toLowerCase().includes('gabardine') || p.categoryName.toLowerCase().includes('blazer') || p.categoryName.toLowerCase().includes('tailor') || p.categoryId === 'cat_trousers' || p.categoryId === 'cat_outerwear');
    } else if (catStr === 'cat_vintage_streetwear' || catStr === 'vintage-streetwear' || catStr === 'vintage_streetwear' || catStr === 'streetwear' || catStr === 'cat_archive' || catStr.includes('streetwear')) {
      result = result.filter((p) => p.categoryId === 'cat_archive' || p.categoryId === 'cat_denim' || p.categoryId === 'cat_tops' || p.brand.toLowerCase().includes('simons') || p.brand.toLowerCase().includes('undercover') || p.brand.toLowerCase().includes('number') || p.brand.toLowerCase().includes('prada') || p.brand.toLowerCase().includes('helmut') || p.title.toLowerCase().includes('bomber') || p.title.toLowerCase().includes('denim') || p.title.toLowerCase().includes('tee') || p.title.toLowerCase().includes('riot'));
    } else if (catStr.includes('hoodie') || catStr.includes('sweatshirt')) {
      result = result.filter((p) => p.title.toLowerCase().includes('hoodie') || p.title.toLowerCase().includes('bomber') || p.title.toLowerCase().includes('sweatshirt') || p.title.toLowerCase().includes('balaclava') || p.categoryId === 'cat_outerwear');
    } else if (catStr.includes('polo') || catStr.includes('shirt') || catStr.includes('top')) {
      result = result.filter((p) => p.categoryId === 'cat_tops' || p.categoryName.toLowerCase().includes('top') || p.categoryName.toLowerCase().includes('shirt') || p.title.toLowerCase().includes('shirt') || p.title.toLowerCase().includes('tee'));
    } else if (catStr.includes('jean') || catStr.includes('denim')) {
      result = result.filter((p) => p.categoryId === 'cat_denim' || p.categoryName.toLowerCase().includes('denim') || p.title.toLowerCase().includes('denim') || p.title.toLowerCase().includes('jean'));
    } else if (catStr.includes('pant') || catStr.includes('trouser')) {
      result = result.filter((p) => p.categoryId === 'cat_trousers' || p.categoryName.toLowerCase().includes('trouser') || p.title.toLowerCase().includes('trouser') || p.title.toLowerCase().includes('pant'));
    } else if (catStr.includes('jewel') || catStr.includes('silver')) {
      result = result.filter((p) => p.categoryId === 'cat_silver' || p.categoryName.toLowerCase().includes('silver') || p.title.toLowerCase().includes('silver') || p.title.toLowerCase().includes('bracelet') || p.title.toLowerCase().includes('ring'));
    } else {
      const cleanKey = catStr.replace(/^cat_/, '').replace(/s$/, '');
      result = result.filter((p) => p.categoryId === category || p.categoryId.includes(cleanKey) || p.categoryName.toLowerCase().includes(cleanKey) || p.title.toLowerCase().includes(cleanKey));
    }
  }

  if (brand && brand !== 'ALL') {
    result = result.filter((p) => p.brand.toLowerCase() === String(brand).toLowerCase());
  }

  if (condition && condition !== 'ALL') {
    result = result.filter((p) => p.condition === condition);
  }

  if (era && era !== 'ALL') {
    result = result.filter((p) => p.era === era);
  }

  if (status && status !== 'ALL') {
    result = result.filter((p) => p.status === status);
  }

  if (maxPrice) {
    const maxBDT = Number(maxPrice);
    if (!isNaN(maxBDT)) {
      result = result.filter((p) => p.priceBDT <= maxBDT);
    }
  }

  if (query) {
    const q = String(query).toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }

  if (sort === 'price_asc') {
    result.sort((a, b) => a.priceBDT - b.priceBDT);
  } else if (sort === 'price_desc') {
    result.sort((a, b) => b.priceBDT - a.priceBDT);
  } else if (sort === 'newest') {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json({ products: result, total: result.length });
});

app.get('/api/products/:slugOrId', (req: Request, res: Response): void => {
  purgeExpiredLocks();
  const { slugOrId } = req.params;
  const product = products.find((p) => p.id === slugOrId || p.slug === slugOrId);

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const lock = inventoryLocks.get(product.id);
  const isHeld = !!(lock && lock.isActive && new Date(lock.expiresAt) > new Date());

  res.json({
    product,
    isHeld,
    expiresAt: isHeld ? lock?.expiresAt : null
  });
});

app.get('/api/categories', (_req: Request, res: Response): void => {
  res.json(TAXONOMY);
});

// ----------------------------------------------------------------------------
// 6. ORDER TRACKING & PURCHASE HISTORY
// ----------------------------------------------------------------------------
app.get('/api/orders/lookup', (req: Request, res: Response): void => {
  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    res.status(400).json({ success: false, error: 'Query parameter is required.' });
    return;
  }

  const cleanQuery = query.trim().toLowerCase();

  const matched = orders.filter((ord) => {
    return (
      ord.orderNumber.toLowerCase().includes(cleanQuery) ||
      (ord.customerEmail && ord.customerEmail.toLowerCase().includes(cleanQuery)) ||
      ord.customerPhone.includes(cleanQuery) ||
      ord.trackingCode.toLowerCase().includes(cleanQuery) ||
      ord.customerName.toLowerCase().includes(cleanQuery)
    );
  });

  res.json({
    success: true,
    orders: matched,
    totalFound: matched.length
  });
});

// ----------------------------------------------------------------------------
// 7. ADMIN FAST-LISTING & DASHBOARD
// ----------------------------------------------------------------------------
app.post('/api/admin/products', (req: Request, res: Response): void => {
  try {
    const {
      title,
      brand,
      gender,
      cogsBDT,
      priceBDT,
      originalRetailBDT,
      condition,
      era,
      authenticityStatus,
      measurements,
      images,
      categoryId,
      categoryName,
      sizeTag,
      colorway,
      composition,
      madeIn,
      description
    } = req.body;

    if (!title || !brand || !priceBDT || !cogsBDT) {
      res.status(400).json({ success: false, error: 'Title, brand, price and COGS are required.' });
      return;
    }

    const sku = generateResaleSKU(brand, categoryId || 'cat_rtw', era || 'MODERN');
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${crypto.randomBytes(3).toString('hex')}`;
    const id = `prod_${crypto.randomBytes(6).toString('hex')}`;
    const now = new Date().toISOString();

    const formattedImages = Array.isArray(images) && images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80'];

    const newProduct: Product = {
      id,
      sku,
      title,
      slug,
      description: description || `Archival ${brand} piece verified in Dhaka. 100% authentic.`,
      brand,
      gender: gender || 'UNISEX',
      cogsBDT: Number(cogsBDT),
      priceBDT: Number(priceBDT),
      originalRetailBDT: originalRetailBDT ? Number(originalRetailBDT) : Math.round(Number(priceBDT) * 1.25),
      condition: condition || 'EXCELLENT_VINTAGE',
      era: era || 'MODERN',
      authenticityStatus: authenticityStatus || 'VERIFIED',
      authenticityNotes: 'Intake inspection passed at Dhaka archive vault.',
      wearDetails: {
        fabricIntegrity: 98,
        seamTension: 98,
        hardwarePatina: 95,
        labelLegibility: 98,
        defectsSummary: 'Pristine consignment piece.'
      },
      measurements: measurements || {
        chestWidthIn: 22.0,
        lengthIn: 27.5
      },
      images: formattedImages,
      status: 'ACTIVE',
      isUniquePiece: true,
      categoryId: categoryId || 'cat_rtw',
      categoryName: categoryName || 'Ready To Wear',
      sizeTag: sizeTag || 'One Size',
      colorway: colorway || 'Black',
      composition: composition || '100% Archival Blend',
      madeIn: madeIn || 'Italy',
      createdAt: now,
      updatedAt: now
    };

    products.unshift(newProduct);
    const margin = ((newProduct.priceBDT - newProduct.cogsBDT) / newProduct.priceBDT) * 100;

    res.status(201).json({
      success: true,
      product: newProduct,
      sku,
      grossMarginPercentage: parseFloat(margin.toFixed(1))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create product listing.' });
  }
});

app.get('/api/admin/dashboard', (_req: Request, res: Response): void => {
  purgeExpiredLocks();
  const totalCount = products.length;
  const activeCount = products.filter((p) => p.status === 'ACTIVE').length;
  const heldCount = products.filter((p) => p.status === 'IN_CART_HOLD').length;
  const soldCount = products.filter((p) => p.status === 'SOLD').length;

  const totalAssetValueBDT = products.reduce((acc, p) => acc + p.priceBDT, 0);
  const realizedSalesBDT = products
    .filter((p) => p.status === 'SOLD')
    .reduce((acc, p) => acc + p.priceBDT, 0);

  const totalCost = products.reduce((acc, p) => acc + p.cogsBDT, 0);
  const averageMargin = totalAssetValueBDT > 0
    ? ((totalAssetValueBDT - totalCost) / totalAssetValueBDT) * 100
    : 0;

  const stats: AdminStats = {
    totalInventoryCount: totalCount,
    activeListingCount: activeCount,
    heldCount,
    soldCount,
    totalAssetValueBDT,
    realizedSalesBDT,
    averageMarginPercentage: parseFloat(averageMargin.toFixed(1))
  };

  res.json({
    stats,
    recentOrders: orders,
    activeLocks: Array.from(inventoryLocks.values()).filter((l) => l.isActive)
  });
});

app.patch('/api/admin/products/batch-status', (req: Request, res: Response): void => {
  const { productIds, status } = req.body;
  if (!Array.isArray(productIds) || !status) {
    res.status(400).json({ success: false, error: 'productIds array and status are required' });
    return;
  }

  const now = new Date().toISOString();
  let updatedCount = 0;

  for (const pid of productIds) {
    const prod = products.find((p) => p.id === pid);
    if (prod) {
      prod.status = status;
      prod.updatedAt = now;
      if (status !== 'IN_CART_HOLD') {
        const lock = inventoryLocks.get(pid);
        if (lock) lock.isActive = false;
      }
      updatedCount++;
    }
  }

  res.json({ success: true, updatedCount, status });
});

// ----------------------------------------------------------------------------
// STOREFRONT MAINTENANCE & LIVE PROMOTIONS
// GET /api/storefront/config & POST /api/admin/storefront/config
// ----------------------------------------------------------------------------
app.get('/api/storefront/config', (_req: Request, res: Response): void => {
  res.json({ success: true, config: storefrontConfig });
});

app.post('/api/admin/storefront/config', (req: Request, res: Response): void => {
  storefrontConfig = {
    ...storefrontConfig,
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  res.json({
    success: true,
    config: storefrontConfig,
    message: 'Storefront configuration updated and live across client sessions.'
  });
});

// ----------------------------------------------------------------------------
// PRODUCT MANAGEMENT: EDIT & DELETE
// PUT /api/admin/products/:id & DELETE /api/admin/products/:id
// ----------------------------------------------------------------------------
app.put('/api/admin/products/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const prodIndex = products.findIndex((p) => p.id === id);

  if (prodIndex === -1) {
    res.status(404).json({ success: false, error: 'Product not found.' });
    return;
  }

  const existing = products[prodIndex];
  const updated: Product = {
    ...existing,
    ...req.body,
    id: existing.id,
    sku: req.body.sku || existing.sku,
    priceBDT: req.body.priceBDT !== undefined ? Number(req.body.priceBDT) : existing.priceBDT,
    cogsBDT: req.body.cogsBDT !== undefined ? Number(req.body.cogsBDT) : existing.cogsBDT,
    originalRetailBDT: req.body.originalRetailBDT !== undefined ? Number(req.body.originalRetailBDT) : existing.originalRetailBDT,
    updatedAt: new Date().toISOString()
  };

  products[prodIndex] = updated;

  res.json({
    success: true,
    product: updated,
    message: `Piece ${updated.sku} successfully updated.`
  });
});

app.delete('/api/admin/products/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const prodIndex = products.findIndex((p) => p.id === id);

  if (prodIndex === -1) {
    res.status(404).json({ success: false, error: 'Product not found.' });
    return;
  }

  const removed = products.splice(prodIndex, 1)[0];
  inventoryLocks.delete(id);

  res.json({
    success: true,
    message: `Piece ${removed.title} (${removed.sku}) permanently removed from catalog.`,
    removedId: id
  });
});

// ----------------------------------------------------------------------------
// PRICE DROP ALERTS & SUBSCRIBER NOTIFICATIONS
// POST /api/alerts/price-drop, GET /api/alerts/price-drop/:productId, DELETE /api/alerts/price-drop/:productId
// ----------------------------------------------------------------------------
interface ServerPriceAlert {
  id: string;
  productId: string;
  productTitle: string;
  productBrand: string;
  initialPriceBDT: number;
  targetPriceBDT: number;
  condition: string;
  notifyViaToast: boolean;
  notifyViaEmail: boolean;
  email: string;
  createdAt: string;
  status: string;
}

let serverPriceAlerts: ServerPriceAlert[] = [];

app.post('/api/alerts/price-drop', (req: Request, res: Response): void => {
  const alert = req.body;
  if (!alert || !alert.productId) {
    res.status(400).json({ success: false, error: 'Product ID is required' });
    return;
  }
  const existingIdx = serverPriceAlerts.findIndex((a) => a.productId === alert.productId);
  if (existingIdx >= 0) {
    serverPriceAlerts[existingIdx] = alert;
  } else {
    serverPriceAlerts.unshift(alert);
  }
  res.status(200).json({ success: true, alert, totalAlerts: serverPriceAlerts.length });
});

app.get('/api/alerts/price-drop/:productId', (req: Request, res: Response): void => {
  const { productId } = req.params;
  const alert = serverPriceAlerts.find((a) => a.productId === productId);
  res.status(200).json({ success: true, alert: alert || null });
});

app.delete('/api/alerts/price-drop/:productId', (req: Request, res: Response): void => {
  const { productId } = req.params;
  serverPriceAlerts = serverPriceAlerts.filter((a) => a.productId !== productId);
  res.status(200).json({ success: true, message: 'Price alert removed successfully' });
});

// ----------------------------------------------------------------------------
// ORDER COLLECTION MANAGEMENT: STATUS UPDATE & MANUAL ORDER CREATION
// PATCH /api/admin/orders/:id/status, POST /api/admin/orders, DELETE /api/admin/orders/:id
// ----------------------------------------------------------------------------
app.patch('/api/admin/orders/:id/status', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { status } = req.body;

  const order = orders.find((o) => o.id === id || o.orderNumber === id);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found.' });
    return;
  }

  order.status = status;
  if (status === 'PAID_FULL') {
    order.isAdvanceDeliveryPaid = true;
  }

  const now = new Date().toISOString();
  if (!order.checkpoints) order.checkpoints = [];
  if (status === 'READY_FOR_PICKUP') {
    order.checkpoints.push({
      status: 'READY_FOR_PICKUP',
      title: 'Order Authenticated, Sealed & Ready for Courier Pickup',
      location: 'SAIRAT Banani Archival Vault, Dhaka',
      timestamp: now,
      isCompleted: true
    });
  } else if (status === 'DISPATCHED_COURIER') {
    order.checkpoints.push({
      status: 'COURIER_DISPATCHED',
      title: `Order Marked Dispatched via ${order.courier || 'STEADFAST'}`,
      location: 'SAIRAT Banani Dispatch Gate, Dhaka',
      timestamp: now,
      isCompleted: true
    });
  }

  res.json({
    success: true,
    order,
    message: `Order ${order.orderNumber} status updated to ${status}.`
  });
});

// Scan SKU or Consignment Barcode from Consignment Note to mark Ready for Pickup or Dispatched
app.post('/api/admin/orders/scan-barcode', async (req: Request, res: Response): Promise<void> => {
  const {
    code,
    targetStatus = 'DISPATCHED_COURIER',
    courier,
    autoApply = true
  } = req.body || {};

  if (!code || typeof code !== 'string' || !code.trim()) {
    res.status(400).json({
      success: false,
      scannedCode: '',
      message: 'Please enter or scan a valid SKU, Consignment ID, or Order barcode.'
    });
    return;
  }

  let extractedCode = code.trim().replace(/^\*+|\*+$/g, '').trim();
  if (extractedCode.includes('sku=')) {
    try {
      const parsed = new URL(extractedCode.startsWith('http') ? extractedCode : `https://sairat.local/?${extractedCode.split('?').pop()}`);
      const skuParam = parsed.searchParams.get('sku');
      if (skuParam) extractedCode = skuParam.trim();
    } catch {
      const match = extractedCode.match(/sku=([^&]+)/i);
      if (match?.[1]) extractedCode = decodeURIComponent(match[1]).trim();
    }
  } else if (/^SKU:/i.test(extractedCode)) {
    extractedCode = extractedCode.replace(/^SKU:/i, '').trim();
  }

  const normalizedCode = extractedCode;
  const lookupUpper = normalizedCode.toUpperCase();

  let matchedOrder: Order | undefined;
  let matchedBy: 'ITEM_SKU' | 'CONSIGNMENT_ID' | 'TRACKING_CODE' | 'ORDER_NUMBER' | undefined;
  let matchedItem:
    | { id: string; sku: string; title: string; brand: string; priceBDT: number }
    | undefined;

  // 1. Primary Match: Item SKU from Consignment Note (Code-128 SKU barcode)
  for (const ord of orders) {
    const foundItem = (ord.items || []).find(
      (it) => it.product?.sku && it.product.sku.trim().toUpperCase() === lookupUpper
    );
    if (foundItem) {
      matchedOrder = ord;
      matchedBy = 'ITEM_SKU';
      matchedItem = {
        id: foundItem.productId,
        sku: foundItem.product.sku,
        title: foundItem.product.title,
        brand: foundItem.product.brand,
        priceBDT: foundItem.priceBDT || foundItem.product.priceBDT
      };
      break;
    }
  }

  // 2. Secondary Match: Consignment ID, Tracking Code, or Order Number
  if (!matchedOrder) {
    matchedOrder = orders.find((o) => {
      if (o.consignmentId && o.consignmentId.trim().toUpperCase() === lookupUpper) {
        matchedBy = 'CONSIGNMENT_ID';
        return true;
      }
      if (o.trackingCode && o.trackingCode.trim().toUpperCase() === lookupUpper) {
        matchedBy = 'TRACKING_CODE';
        return true;
      }
      if (o.orderNumber && o.orderNumber.trim().toUpperCase() === lookupUpper) {
        matchedBy = 'ORDER_NUMBER';
        return true;
      }
      return false;
    });

    if (matchedOrder && matchedOrder.items?.[0]) {
      const firstIt = matchedOrder.items[0];
      matchedItem = {
        id: firstIt.productId,
        sku: firstIt.product?.sku || 'N/A',
        title: firstIt.product?.title || 'Archival Garment',
        brand: firstIt.product?.brand || 'Sairat Archive',
        priceBDT: firstIt.priceBDT || firstIt.product?.priceBDT || 0
      };
    }
  }

  if (!matchedOrder || !matchedBy) {
    const catalogProd = products.find((p) => p.sku.trim().toUpperCase() === lookupUpper);
    if (catalogProd) {
      res.status(404).json({
        success: false,
        scannedCode: normalizedCode,
        message: `SKU ${catalogProd.sku} (${catalogProd.title}) is in Vault inventory (${catalogProd.status}), but not attached to any active order.`
      });
      return;
    }

    res.status(404).json({
      success: false,
      scannedCode: normalizedCode,
      message: `No order or consignment note found matching barcode "${normalizedCode}".`
    });
    return;
  }

  const previousStatus = matchedOrder.status;
  const resolvedTargetStatus: OrderStatus =
    targetStatus === 'READY_FOR_PICKUP' ? 'READY_FOR_PICKUP' : 'DISPATCHED_COURIER';

  if (autoApply) {
    const now = new Date().toISOString();
    if (!matchedOrder.checkpoints) matchedOrder.checkpoints = [];

    if (resolvedTargetStatus === 'DISPATCHED_COURIER') {
      const chosenCourier: CourierProvider =
        courier === 'PATHAO' || courier === 'STEADFAST'
          ? courier
          : matchedOrder.courier || 'STEADFAST';

      if (!matchedOrder.consignmentId || (courier && courier !== matchedOrder.courier)) {
        const bookingResult =
          chosenCourier === 'PATHAO'
            ? await CourierIntegrationService.bookPathaoOrder(matchedOrder, {
                instruction: `SKU Barcode Verified Dispatch (${matchedItem?.sku || normalizedCode})`
              })
            : await CourierIntegrationService.bookSteadfastOrder(matchedOrder, {
                note: `SKU Barcode Verified Dispatch (${matchedItem?.sku || normalizedCode})`
              });
        matchedOrder.courier = chosenCourier;
        matchedOrder.consignmentId = bookingResult.consignmentId;
        matchedOrder.trackingCode = bookingResult.trackingCode;
        matchedOrder.trackingUrl = bookingResult.trackingUrl;
      }

      matchedOrder.status = 'DISPATCHED_COURIER';
      matchedOrder.checkpoints.push({
        status: 'SKU_BARCODE_DISPATCHED',
        title: `SKU (${matchedItem?.sku || normalizedCode}) Scanned — Order Dispatched via ${matchedOrder.courier}`,
        location: 'SAIRAT Banani Dispatch Gate, Dhaka',
        timestamp: now,
        isCompleted: true
      });
    } else {
      matchedOrder.status = 'READY_FOR_PICKUP';
      matchedOrder.checkpoints.push({
        status: 'SKU_BARCODE_READY_FOR_PICKUP',
        title: `SKU (${matchedItem?.sku || normalizedCode}) Scanned — Sealed & Ready for Courier Pickup`,
        location: 'SAIRAT Banani Archival Vault, Dhaka',
        timestamp: now,
        isCompleted: true
      });
    }
  }

  const consignmentNote = CourierIntegrationService.generateConsignmentNote(matchedOrder);
  const statusLabel =
    matchedOrder.status === 'READY_FOR_PICKUP' ? 'Ready for Pickup' : 'Dispatched';

  res.status(200).json({
    success: true,
    scannedCode: normalizedCode,
    matchedBy,
    previousStatus,
    newStatus: matchedOrder.status,
    order: matchedOrder,
    matchedItem,
    consignmentNote,
    applied: Boolean(autoApply),
    message: autoApply
      ? `Scanned ${matchedItem?.sku || normalizedCode}: Order ${matchedOrder.orderNumber} marked as "${statusLabel}".`
      : `Matched ${matchedItem?.sku || normalizedCode} to Order ${matchedOrder.orderNumber} (Currently ${previousStatus}).`
  });
});

app.post('/api/admin/orders', (req: Request, res: Response): void => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    productId,
    deliveryZone,
    streetAddress,
    thana,
    district,
    division,
    paymentGateway,
    paymentTrxId,
    courier
  } = req.body;

  if (!customerName || !customerPhone || !productId) {
    res.status(400).json({ success: false, error: 'Customer name, phone and product ID are required.' });
    return;
  }

  const product = products.find((p) => p.id === productId);
  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found in inventory.' });
    return;
  }

  const orderId = `ord_manual_${crypto.randomBytes(4).toString('hex')}`;
  const orderNumber = `INV-BD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const zone: DeliveryZone = deliveryZone === 'OUTSIDE_DHAKA' ? 'OUTSIDE_DHAKA' : 'INSIDE_DHAKA';
  const deliveryFee = zone === 'INSIDE_DHAKA' ? storefrontConfig.insideDhakaDeliveryFeeBDT : storefrontConfig.outsideDhakaDeliveryFeeBDT;
  const subtotal = product.priceBDT;
  const total = subtotal + deliveryFee;

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    customerId: `cust_${customerPhone.replace(/[^0-9]/g, '')}`,
    customerName,
    customerPhone,
    customerEmail: customerEmail || `${customerPhone}@client-vault.bd`,
    shippingAddress: {
      division: division || 'Dhaka',
      district: district || 'Dhaka (Metropolitan)',
      thana: thana || 'Gulshan / Banani',
      streetAddress: streetAddress || 'VIP Walk-in Salon, Road 11 Banani',
      deliveryZone: zone
    },
    subtotalBDT: subtotal,
    deliveryFeeBDT: deliveryFee,
    totalBDT: total,
    paymentGateway: paymentGateway || 'CASH_ON_DELIVERY',
    isAdvanceDeliveryPaid: true,
    advancePaidAmountBDT: deliveryFee,
    codPayableAmountBDT: paymentGateway === 'CASH_ON_DELIVERY' ? subtotal : 0,
    paymentTrxId: paymentTrxId || `VIP-WALKIN-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    status: 'PAID_FULL',
    courier: courier || 'STEADFAST',
    trackingCode: `STDF-VIP-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    items: [
      {
        id: `item_${crypto.randomBytes(4).toString('hex')}`,
        orderId,
        productId: product.id,
        product,
        priceBDT: product.priceBDT
      }
    ]
  };

  // Mark piece as sold
  product.status = 'SOLD';
  product.updatedAt = new Date().toISOString();
  inventoryLocks.delete(product.id);

  orders.unshift(newOrder);

  res.status(201).json({
    success: true,
    order: newOrder,
    message: `Manual Order ${orderNumber} successfully collected and logged in archive.`
  });
});

app.delete('/api/admin/orders/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const orderIdx = orders.findIndex((o) => o.id === id);

  if (orderIdx === -1) {
    res.status(404).json({ success: false, error: 'Order not found.' });
    return;
  }

  const removed = orders.splice(orderIdx, 1)[0];
  res.json({
    success: true,
    message: `Order ${removed.orderNumber} deleted from system.`
  });
});

// ----------------------------------------------------------------------------
// INVENTORY HOLD MANAGEMENT: CLEAR ALL EXPIRED OR ALL HOLDS
// DELETE /api/admin/holds/all
// ----------------------------------------------------------------------------
app.delete('/api/admin/holds/all', (_req: Request, res: Response): void => {
  let clearedCount = 0;
  for (const [productId, lock] of inventoryLocks.entries()) {
    lock.isActive = false;
    const prod = products.find((p) => p.id === productId);
    if (prod && prod.status === 'IN_CART_HOLD') {
      prod.status = 'ACTIVE';
      prod.updatedAt = new Date().toISOString();
    }
    clearedCount++;
  }
  inventoryLocks.clear();

  res.json({
    success: true,
    clearedCount,
    message: `Successfully released ${clearedCount} active reservation holds.`
  });
});

// ----------------------------------------------------------------------------
// CORS & ERROR HANDLING + STANDALONE API SERVER STARTUP
// ----------------------------------------------------------------------------
app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err?.message?.startsWith('CORS policy blocked origin:')) {
    res.status(403).json({ error: err.message });
    return;
  }
  console.error('Unhandled backend error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[SAIRAT COUTURE Standalone API] Listening on http://localhost:${PORT}`);
});
