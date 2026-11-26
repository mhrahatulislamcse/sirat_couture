export type Gender = 'MEN' | 'WOMEN' | 'UNISEX';

export type ConditionGrade =
  | 'BRAND_NEW_TAGS'
  | 'EXCELLENT_VINTAGE'
  | 'MINOR_FLAWS';

export type EraDecade =
  | 'ERA_90S'
  | 'Y2K'
  | 'MODERN';

export type AuthenticityStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'DIRECT_CONSIGNMENT';

export type ProductStatus =
  | 'ACTIVE'
  | 'IN_CART_HOLD'
  | 'SOLD'
  | 'ARCHIVED';

export type DeliveryZone =
  | 'INSIDE_DHAKA'
  | 'OUTSIDE_DHAKA';

export type PaymentGateway =
  | 'BKASH'
  | 'NAGAD'
  | 'SSLCOMMERZ'
  | 'CASH_ON_DELIVERY';

export type CourierProvider =
  | 'STEADFAST'
  | 'PATHAO'
  | 'REDX';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID_FULL'
  | 'PARTIAL_COD_CONFIRMED'
  | 'READY_FOR_PICKUP'
  | 'DISPATCHED_COURIER'
  | 'DELIVERED'
  | 'CANCELLED';

export interface WearDetails {
  fabricIntegrity: number; // 0 to 100%
  seamTension: number;     // 0 to 100%
  hardwarePatina: number;   // 0 to 100%
  labelLegibility: number;  // 0 to 100%
  defectsSummary?: string;
}

export interface GarmentMeasurements {
  chestWidthIn?: number;
  lengthIn?: number;
  shoulderWidthIn?: number;
  sleeveLengthIn?: number;
  waistIn?: number;
  inseamIn?: number;
  legOpeningIn?: number;
  riseIn?: number;
}

export interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  gender?: Gender;
  parentId?: string | null;
  subcategories?: CategoryItem[];
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  slug: string;
  description: string;
  brand: string;
  gender: Gender;
  
  // Pricing in Bangladeshi Taka (৳)
  priceBDT: number;
  salePriceBDT?: number | null;
  cogsBDT: number;
  originalRetailBDT?: number;

  condition: ConditionGrade;
  era: EraDecade;
  authenticityStatus: AuthenticityStatus;
  authenticityNotes?: string;
  
  measurements: GarmentMeasurements;
  wearDetails: WearDetails;
  images: string[];
  sizeTag: string;
  colorway: string;
  composition: string;
  madeIn: string;
  
  status: ProductStatus;
  isUniquePiece: boolean;
  categoryId: string;
  categoryName: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLock {
  id: string;
  productId: string;
  phone: string;
  userId?: string;
  otpCode?: string;
  isOtpVerified: boolean;
  lockedAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  priceBDT: number;
}

export interface OrderTrackingCheckpoint {
  status: string;
  title: string;
  location: string;
  timestamp: string;
  isCompleted: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  
  shippingAddress: {
    division: string;
    district: string;
    thana: string;
    streetAddress: string;
    deliveryZone: DeliveryZone;
  };

  // Amounts in BDT
  subtotalBDT: number;
  deliveryFeeBDT: number;
  totalBDT: number;

  // Localized Payment
  paymentGateway: PaymentGateway;
  isAdvanceDeliveryPaid: boolean;
  advancePaidAmountBDT: number;
  codPayableAmountBDT: number;
  paymentTrxId?: string;

  status: OrderStatus;
  items: OrderItem[];

  // Courier & Dispatch
  courier: CourierProvider;
  consignmentId?: string;
  trackingCode: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  checkpoints?: OrderTrackingCheckpoint[];

  createdAt: string;
}

export interface AdminStats {
  totalInventoryCount: number;
  activeListingCount: number;
  heldCount: number;
  soldCount: number;
  totalAssetValueBDT: number;
  realizedSalesBDT: number;
  averageMarginPercentage: number;
}

export interface ConsignmentItem {
  id: string;
  sku: string;
  title: string;
  brand: string;
  condition: string;
  era: string;
  sizeTag?: string;
  measurementsSummary?: string;
  priceBDT: number;
}

export interface ConsignmentNote {
  consignmentId: string;
  trackingCode: string;
  trackingUrl: string;
  courier: CourierProvider;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: {
    division: string;
    district: string;
    thana: string;
    streetAddress: string;
    deliveryZone: DeliveryZone;
  };
  items: ConsignmentItem[];
  subtotalBDT: number;
  deliveryFeeBDT: number;
  totalBDT: number;
  paymentGateway: PaymentGateway;
  paymentStatus: string;
  isAdvanceDeliveryPaid: boolean;
  advancePaidAmountBDT: number;
  codAmountToCollectBDT: number;
  specialInstructions: string;
  vaultSealNumber: string;
  inspectorName: string;
  barcodeValue: string;
  generatedAt: string;
}

export interface CourierGatewayDetails {
  provider: CourierProvider;
  name: string;
  apiKey: string;
  secretKey?: string;
  clientId?: string;
  clientSecret?: string;
  username?: string;
  storeId?: string;
  sandboxMode: boolean;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  currentBalanceBDT: number;
  pendingCodBDT: number;
  lastSyncTime?: string;
}

export interface CourierApiConfig {
  steadfast: CourierGatewayDetails;
  pathao: CourierGatewayDetails;
}

export interface CourierSyncResult {
  orderId: string;
  orderNumber: string;
  courier: CourierProvider;
  consignmentId: string;
  trackingCode: string;
  courierStatus: string;
  deliveryStatus: string;
  lastUpdated: string;
  newCheckpoint?: OrderTrackingCheckpoint;
  message: string;
}

export interface RateCalculationInput {
  courier: CourierProvider;
  deliveryZone: DeliveryZone;
  district?: string;
  thana?: string;
  weightKg?: number;
  deliveryType?: 12 | 48;
  codAmountBDT?: number;
}

export interface CourierRateQuote {
  courier: CourierProvider;
  deliveryZone: DeliveryZone;
  district: string;
  thana: string;
  weightKg: number;
  deliveryType: 12 | 48;
  baseRateBDT: number;
  weightSurchargeBDT: number;
  expressSurchargeBDT: number;
  codHandlingFeeBDT: number;
  totalDeliveryFeeBDT: number;
  estimatedSla: string;
  serviceTier: string;
  hubName: string;
  isServiceable: boolean;
  rateSource: 'STEADFAST_TARIFF_API_V1' | 'PATHAO_ALADDIN_PRICE_PLAN_V1';
  fetchedAt: string;
  comparison?: {
    alternateCourier: CourierProvider;
    alternateTotalFeeBDT: number;
    alternateEstimatedSla: string;
    alternateServiceable: boolean;
    savingsBDT: number;
  };
}

// ----------------------------------------------------------------------------
// USER PROFILE & SESSION PREFERENCES MODEL
// ----------------------------------------------------------------------------

export type UserGender = 'MEN' | 'WOMEN' | 'UNSPECIFIED';

export type PreferredHome = 'HOME' | 'SHOP' | string;

export interface UserProfile {
  id: string; // User / Session identifier
  gender: UserGender; // 'MEN' | 'WOMEN' | 'UNSPECIFIED'
  preferredHome: PreferredHome; // 'HOME' (Editorial Landing) vs 'SHOP' (Curated Vault)
  name?: string;
  phone?: string;
  email?: string;
  notes?: string;
  updatedAt?: string;
}

// ----------------------------------------------------------------------------
// STOREFRONT CONFIGURATION & PROMOTIONS MODEL
// ----------------------------------------------------------------------------

export interface StorefrontConfig {
  announcementText: string;
  isAnnouncementVisible: boolean;
  heroHeadline: string;
  heroSubheadline: string;
  heroTag: string;
  heroImageUrl: string;
  menHeroHeadline: string;
  menHeroSubheadline: string;
  menHeroImageUrl: string;
  insideDhakaDeliveryFeeBDT: number;
  outsideDhakaDeliveryFeeBDT: number;
  conciergePhone: string;
  isMaintenanceMode: boolean;
  activeCampaignName: string;
  updatedAt: string;
}

export interface BarcodeScanResult {
  success: boolean;
  scannedCode: string;
  matchedBy?: 'ITEM_SKU' | 'CONSIGNMENT_ID' | 'TRACKING_CODE' | 'ORDER_NUMBER';
  previousStatus?: OrderStatus;
  newStatus?: OrderStatus;
  order?: Order;
  matchedItem?: {
    id: string;
    sku: string;
    title: string;
    brand: string;
    priceBDT: number;
  };
  consignmentNote?: ConsignmentNote;
  message: string;
  applied?: boolean;
}

export interface CourierSummaryKPI {
  courier: 'STEADFAST' | 'PATHAO';
  name: string;
  totalShipments: number;
  deliveredCount: number;
  liveOrdersCount: number;
  fulfillmentSuccessRate: number;
  avgDeliveryTimeHours: number;
  insideDhakaAvgHours: number;
  outsideDhakaAvgHours: number;
  onTimeSlaRate: number;
}

export interface CourierZoneMetric {
  segment: string;
  zoneKey: 'INSIDE_DHAKA' | 'OUTSIDE_DHAKA' | 'ALL';
  steadfastSuccessRate: number;
  pathaoSuccessRate: number;
  steadfastAvgHours: number;
  pathaoAvgHours: number;
  steadfastVolume: number;
  pathaoVolume: number;
}

export interface CourierMonthlyTrendPoint {
  month: string;
  steadfastSuccessRate: number;
  pathaoSuccessRate: number;
  steadfastAvgHours: number;
  pathaoAvgHours: number;
}

export interface CourierPerformanceAnalytics {
  generatedAt: string;
  summary: {
    steadfast: CourierSummaryKPI;
    pathao: CourierSummaryKPI;
  };
  byZone: CourierZoneMetric[];
  monthlyTrend: CourierMonthlyTrendPoint[];
}

