import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Database,
  GitBranch,
  Shield,
  Zap,
  FileCode,
  Terminal,
  Share2,
  Layers,
  ShoppingBag,
  Store,
  LayoutDashboard,
  Server,
  ArrowRight,
  Truck,
  DollarSign,
  Search,
  User,
  SlidersHorizontal,
  CheckCircle2,
  Box,
  Eye,
  CreditCard
} from 'lucide-react';

interface ArchitectureViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureViewer: React.FC<ArchitectureViewerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'DECOUPLED' | 'SCHEMA' | 'CONCURRENCY' | 'IDEMPOTENCY' | 'CLI' | 'SEO'>('DECOUPLED');
  const [architectureParadigm, setArchitectureParadigm] = useState<'HEADLESS' | 'MODULAR_MONOLITH'>('HEADLESS');
  const [activeModuleFilter, setActiveModuleFilter] = useState<'ALL' | 'STOREFRONT' | 'ADMIN'>('ALL');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const prismaSchemaCode = `// SAIRAT COUTURE - PostgreSQL & Prisma ORM Schema
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Gender {
  MEN
  WOMEN
  UNISEX
}

enum ConditionGrade {
  BRAND_NEW_WITH_TAGS
  EXCELLENT
  GENTLY_USED
  VINTAGE_FLAWS
}

enum EraDecade {
  ERA_70S
  ERA_80S
  ERA_90S
  Y2K
  MODERN
}

enum AuthenticityStatus {
  PENDING
  VERIFIED
  NOT_APPLICABLE
}

enum ProductStatus {
  DRAFT
  ACTIVE
  IN_CART_HOLD
  SOLD
  RETURNED
  ARCHIVED
}

model Product {
  id                 String             @id @default(cuid())
  sku                String             @unique // BRAND-CAT-YEAR-RANDOMHEX
  title              String
  slug               String             @unique
  description        String             @db.Text
  brand              String
  gender             Gender             @default(UNISEX)
  cogsCents          Int                // Cost of goods in cents
  priceCents         Int                // Current listing price
  salePriceCents     Int?
  conditionGrade     ConditionGrade     @default(EXCELLENT)
  eraDecade          EraDecade          @default(MODERN)
  authenticityStatus AuthenticityStatus @default(VERIFIED)
  conditionNotes     String?            @db.Text
  wearBreakdown      Json?
  measurements       Measurement?
  images             ProductImage[]
  status             ProductStatus      @default(ACTIVE)
  isUniquePiece      Boolean            @default(true)
  categoryId         String
  category           Category           @relation(fields: [categoryId], references: [id])
  inventoryLocks     InventoryLock[]
  orderItem          OrderItem?
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  @@index([brand])
  @@index([status])
  @@index([gender])
  @@index([conditionGrade])
}

model Measurement {
  id             String   @id @default(cuid())
  productId      String   @unique
  product        Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  chestWidthIn   Float?   // Pit-to-pit flat
  lengthIn       Float?   // Collar to hem
  shoulderWidthIn Float?
  sleeveLengthIn Float?
  waistIn        Float?   // Waistband flat * 2
  inseamIn       Float?
  legOpeningIn   Float?
  riseIn         Float?
  displayUnit    String   @default("INCHES")
  updatedAt      DateTime @updatedAt
}

model InventoryLock {
  id         String    @id @default(cuid())
  productId  String
  product    Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  userId     String    // Session/Customer ID
  lockedAt   DateTime  @default(now())
  expiresAt  DateTime  // 10-minute hold window
  releasedAt DateTime?
  isActive   Boolean   @default(true)

  @@index([productId, isActive])
  @@index([expiresAt])
}

model Order {
  id                String          @id @default(cuid())
  orderNumber       String          @unique
  customerId        String
  customer          Customer        @relation(fields: [customerId], references: [id])
  shippingAddressId String
  shippingAddress   ShippingAddress @relation(fields: [shippingAddressId], references: [id])
  subtotalCents     Int
  shippingCents     Int             @default(0)
  taxCents          Int             @default(0)
  totalCents        Int
  status            String          @default("PAID")
  items             OrderItem[]
  shipment          Shipment?
  paymentAudits     PaymentAudit[]
  createdAt         DateTime        @default(now())
}

model PaymentAudit {
  id              String   @id @default(cuid())
  orderId         String?
  order           Order?   @relation(fields: [orderId], references: [id])
  stripePaymentId String   @unique
  stripeEventId   String   @unique // Idempotency key
  eventType       String
  amountCents     Int
  status          String
  createdAt       DateTime @default(now())

  @@index([stripeEventId])
}

model Shipment {
  id             String   @id @default(cuid())
  orderId        String   @unique
  order          Order    @relation(fields: [orderId], references: [id])
  carrier        String
  trackingNumber String   @unique
  status         String   @default("LABEL_CREATED")
  createdAt      DateTime @default(now())
}

enum UserGender {
  MEN
  WOMEN
  UNISEX
}

model UserProfile {
  id            String      @id @default(cuid())
  userId        String      @unique // Persistent session identifier
  gender        UserGender  @default(UNSPECIFIED)
  preferredHome String      @default("HOME") // 'HOME' (Editorial) | 'SHOP' (Catalog)
  name          String?
  phone         String?
  email         String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([userId])
}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(prismaSchemaCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-neutral-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-[#121212] text-neutral-100 border border-neutral-800 shadow-2xl rounded-sm overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-editorial text-lg font-bold uppercase tracking-wider text-white">
                Sairat Couture · Decoupled Architecture Dossier
              </h2>
              <span className="text-[10px] font-mono text-neutral-400">
                Storefront (Customer UI) ⇄ Backend API ⇄ Admin Dashboard (Admin UI) ⇄ PostgreSQL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-mono uppercase bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Prisma Schema'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded transition-colors ml-2 cursor-pointer"
              title="Close Architecture Inspector"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950 px-6 text-xs font-mono uppercase overflow-x-auto">
          <button
            onClick={() => setActiveTab('DECOUPLED')}
            className={`py-3 px-4 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'DECOUPLED'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Decoupled Architecture</span>
          </button>
          <button
            onClick={() => setActiveTab('SCHEMA')}
            className={`py-3 px-4 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'SCHEMA'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Prisma Schema
          </button>
          <button
            onClick={() => setActiveTab('CONCURRENCY')}
            className={`py-3 px-4 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'CONCURRENCY'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            10-Min Atomic Hold Engine
          </button>
          <button
            onClick={() => setActiveTab('IDEMPOTENCY')}
            className={`py-3 px-4 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'IDEMPOTENCY'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Stripe/bKash Webhooks
          </button>
          <button
            onClick={() => setActiveTab('CLI')}
            className={`py-3 px-4 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'CLI'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Migration CLI
          </button>
          <button
            onClick={() => setActiveTab('SEO')}
            className={`py-3 px-4 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'SEO'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            SEO &amp; OpenGraph
          </button>
        </div>

        {/* Content Pane */}
        <div className="overflow-y-auto flex-grow p-5 sm:p-7 text-xs font-mono">
          {/* ================================================================= */}
          {/* TAB 1: DECOUPLED ARCHITECTURE & CORE MODULES MATRIX               */}
          {/* ================================================================= */}
          {activeTab === 'DECOUPLED' && (
            <div className="space-y-8 text-neutral-300">
              {/* Architecture Paradigm Selector */}
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-white uppercase flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      Recommended Architecture Topology
                    </h3>
                    <p className="text-neutral-400 text-xs font-sans mt-0.5">
                      Separating customer-facing shopping discovery from administrative inventory, courier fulfillment, and financial intelligence.
                    </p>
                  </div>

                  <div className="flex items-center bg-neutral-950 p-1 rounded-md border border-neutral-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setArchitectureParadigm('HEADLESS')}
                      className={`px-3 py-1.5 rounded font-bold transition-all cursor-pointer ${
                        architectureParadigm === 'HEADLESS'
                          ? 'bg-amber-400 text-neutral-950 shadow-xs'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      ★ Headless / Decoupled (Recommended)
                    </button>
                    <button
                      type="button"
                      onClick={() => setArchitectureParadigm('MODULAR_MONOLITH')}
                      className={`px-3 py-1.5 rounded font-bold transition-all cursor-pointer ${
                        architectureParadigm === 'MODULAR_MONOLITH'
                          ? 'bg-amber-400 text-neutral-950 shadow-xs'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Modular Express Monolith
                    </button>
                  </div>
                </div>

                {/* Paradigm Detail Card */}
                {architectureParadigm === 'HEADLESS' ? (
                  <div className="p-3 bg-neutral-950 rounded border border-amber-500/30 text-xs font-sans space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-mono font-bold text-[11px]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>DECOUPLED / HEADLESS APPROACH · PRODUCTION PATTERN</span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed text-[11.5px]">
                      Two distinct applications communicating via authenticated REST APIs over a centralized PostgreSQL database:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-[11px]">
                        <span className="text-amber-400 font-bold block mb-1">1. STOREFRONT APPLICATION</span>
                        <p className="text-neutral-400 font-sans text-xs">
                          Built with React / Next.js. Exclusively serves public buyers: product discovery, dynamic search, multi-angle PDP galleries, 4-item Recently Viewed scroll, localized BDT pricing, and checkout.
                        </p>
                      </div>
                      <div className="p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold block mb-1">2. BACKEND DASHBOARD APPLICATION</span>
                        <p className="text-neutral-400 font-sans text-xs">
                          Isolated administrative console. Handles product intake, SKU minting, live analytics (AOV, gross margin), Steadfast/Pathao courier dispatch, and 4×6 thermal waybill printing.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-neutral-950 rounded border border-neutral-700 text-xs font-sans space-y-2">
                    <div className="flex items-center gap-2 text-neutral-200 font-mono font-bold text-[11px]">
                      <Server className="w-4 h-4 text-amber-400" />
                      <span>MODULAR MONOLITH WITH STRICT ROUTE SEGREGATION</span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed text-[11.5px]">
                      A unified Node/Express codebase where routes and controllers are strictly isolated into customer storefront modules (<code className="text-amber-300">/api/products</code>, <code className="text-amber-300">/api/cart</code>, <code className="text-amber-300">/api/orders</code>) and admin modules (<code className="text-amber-300">/api/admin/*</code>) sharing the same Prisma models.
                    </p>
                  </div>
                )}
              </div>

              {/* Visual System Topology Diagram */}
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold block">
                  Interactive System Data Flow Diagram
                </span>
                <div className="p-4 bg-neutral-950 rounded-lg border border-neutral-800 text-[11px] leading-relaxed overflow-x-auto">
                  <div className="min-w-[620px] space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-neutral-900/90 border border-neutral-700 rounded text-neutral-200">
                        <ShoppingBag className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                        <span className="font-bold block">CUSTOMER STOREFRONT</span>
                        <span className="text-[10px] text-neutral-400">Buyer UI (Web &amp; Mobile)</span>
                      </div>
                      <div className="p-3 bg-neutral-900/90 border border-neutral-700 rounded text-neutral-200">
                        <LayoutDashboard className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                        <span className="font-bold block">ADMIN DASHBOARD</span>
                        <span className="text-[10px] text-neutral-400">Warehouse &amp; Logistics Hub</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-around text-neutral-500 font-mono text-[10px]">
                      <span>↕ REST API (Public JSON)</span>
                      <span>↕ REST API (Admin Bearer / OTP)</span>
                    </div>

                    <div className="p-3.5 bg-neutral-900 border border-amber-500/40 rounded text-center">
                      <Server className="w-5 h-5 mx-auto mb-1 text-amber-300" />
                      <span className="font-bold text-white block">CENTRAL BACKEND API &amp; ORCHESTRATION GATEWAY</span>
                      <span className="text-[10px] text-neutral-400">
                        Express Router · 10-Min Atomic Hold Concurrency · Waybill Generator · SEO Engine
                      </span>
                    </div>

                    <div className="flex items-center justify-around text-neutral-500 font-mono text-[10px]">
                      <span>↕ Prisma ORM Queries</span>
                      <span>↕ External API Connectors</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-neutral-900/90 border border-neutral-700 rounded text-neutral-200">
                        <Database className="w-5 h-5 mx-auto mb-1 text-sky-400" />
                        <span className="font-bold block">SHARED POSTGRESQL DB</span>
                        <span className="text-[10px] text-neutral-400">Products, Orders, Locks, Profiles</span>
                      </div>
                      <div className="p-3 bg-neutral-900/90 border border-neutral-700 rounded text-neutral-200">
                        <Truck className="w-5 h-5 mx-auto mb-1 text-orange-400" />
                        <span className="font-bold block">3P COURIER &amp; PAYMENT APIs</span>
                        <span className="text-[10px] text-neutral-400">Steadfast, Pathao, bKash, Stripe</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Modules Breakdown: Storefront vs Admin UI */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <h4 className="font-bold text-sm text-white uppercase">
                    Core Application Modules Matrix
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setActiveModuleFilter('ALL')}
                      className={`px-2 py-1 rounded cursor-pointer ${
                        activeModuleFilter === 'ALL' ? 'bg-neutral-800 text-white' : 'text-neutral-500'
                      }`}
                    >
                      All Modules
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModuleFilter('STOREFRONT')}
                      className={`px-2 py-1 rounded cursor-pointer ${
                        activeModuleFilter === 'STOREFRONT' ? 'bg-amber-400 text-neutral-950 font-bold' : 'text-neutral-500'
                      }`}
                    >
                      1. Storefront UI
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModuleFilter('ADMIN')}
                      className={`px-2 py-1 rounded cursor-pointer ${
                        activeModuleFilter === 'ADMIN' ? 'bg-emerald-400 text-neutral-950 font-bold' : 'text-neutral-500'
                      }`}
                    >
                      2. Admin UI
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* MODULE 1: STOREFRONT (CUSTOMER UI) */}
                  {(activeModuleFilter === 'ALL' || activeModuleFilter === 'STOREFRONT') && (
                    <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-lg space-y-4">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-white text-xs uppercase tracking-wider">
                            1. Storefront (Customer UI)
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Active &amp; Live
                        </span>
                      </div>

                      {/* Submodule A: Product Discovery */}
                      <div className="space-y-1.5">
                        <span className="font-bold text-amber-300 text-[11px] block flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5" /> A. Product Discovery
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-neutral-400 text-[11px] font-sans">
                          <li><strong>Gender-Adaptive Homepage:</strong> Independent Men and Women curated homepages with persistent preference switcher.</li>
                          <li><strong>Dynamic Search:</strong> Real-time fuzzy query filtering across designer brands, SKUs, and eras.</li>
                          <li><strong>Rich PDP &amp; Gallery:</strong> Multi-angle image views, condition grades, and flat garment measurements.</li>
                          <li><strong>Recently Viewed Section:</strong> 4-item horizontal scroll at bottom of modal persisted in <code className="text-neutral-300">sessionStorage</code>.</li>
                        </ul>
                      </div>

                      {/* Submodule B: Cart & Checkout */}
                      <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                        <span className="font-bold text-amber-300 text-[11px] block flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" /> B. Cart &amp; Checkout
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-neutral-400 text-[11px] font-sans">
                          <li><strong>10-Minute Atomic Hold:</strong> Concurrency lock preventing double-sale race conditions on rare 1-of-1 pieces.</li>
                          <li><strong>Regional BDT Pricing:</strong> Native Bangladeshi Taka formatting with localized pricing rules.</li>
                          <li><strong>Delivery Zone Matrix:</strong> Inside Dhaka (৳120) &amp; Outside Dhaka (৳200) fee calculations.</li>
                          <li><strong>Payment Integrations:</strong> Advance bKash partial delivery payment + Cash on Delivery (COD) balance.</li>
                        </ul>
                      </div>

                      {/* Submodule C: Customer Account */}
                      <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                        <span className="font-bold text-amber-300 text-[11px] block flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> C. Customer Account
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-neutral-400 text-[11px] font-sans">
                          <li><strong>OTP Mobile Auth:</strong> Phone number login with fast simulated verification code.</li>
                          <li><strong>Order Tracking Portal:</strong> Multi-stage timeline checkpoints with live courier sync.</li>
                          <li><strong>Customer Address Book:</strong> Saved Thana, District, Division, and delivery preferences.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* MODULE 2: BACKEND DASHBOARD (ADMIN UI) */}
                  {(activeModuleFilter === 'ALL' || activeModuleFilter === 'ADMIN') && (
                    <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-lg space-y-4">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <div className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-white text-xs uppercase tracking-wider">
                            2. Backend Dashboard (Admin UI)
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Active &amp; Live
                        </span>
                      </div>

                      {/* Submodule A: Live Analytics */}
                      <div className="space-y-1.5">
                        <span className="font-bold text-emerald-300 text-[11px] block flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5" /> A. Live Financial Analytics
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-neutral-400 text-[11px] font-sans">
                          <li><strong>Executive Summary Cards:</strong> Total Gross Revenue, Realized Sales, and Orders Count.</li>
                          <li><strong>Average Order Value (AOV):</strong> Dynamic AOV computation across realized transactions.</li>
                          <li><strong>Vault Inventory Valuation:</strong> Real-time asset sum across active 1-of-1 pieces.</li>
                          <li><strong>Profit Margin Matrix:</strong> COGS vs Listing price margin tracking.</li>
                        </ul>
                      </div>

                      {/* Submodule B: Product & Inventory */}
                      <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                        <span className="font-bold text-emerald-300 text-[11px] block flex items-center gap-1.5">
                          <Box className="w-3.5 h-3.5" /> B. Product &amp; Inventory Intake
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-neutral-400 text-[11px] font-sans">
                          <li><strong>Product Intake Studio:</strong> Form for listing, editing, or archiving 1-of-1 luxury garments.</li>
                          <li><strong>SKU Minting:</strong> Automatic deterministic SKU generation (<code className="text-neutral-300">BRAND-CAT-YEAR-HEX</code>).</li>
                          <li><strong>Garment Specifications:</strong> Flat pit-to-pit chest, length, era, and condition taxonomy.</li>
                          <li><strong>Atomic Hold Inspector:</strong> View and release expiring cart holds manually.</li>
                        </ul>
                      </div>

                      {/* Submodule C: Order Management & Thermal Dispatch */}
                      <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                        <span className="font-bold text-emerald-300 text-[11px] block flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5" /> C. Orders &amp; Courier Logistics
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-neutral-400 text-[11px] font-sans">
                          <li><strong>Fulfillment Lifecycle:</strong> Pending Payment ➔ Paid Full / Partial COD ➔ Dispatched ➔ Delivered.</li>
                          <li><strong>Official Courier Gateways:</strong> Direct API integration with Steadfast &amp; Pathao Courier.</li>
                          <li><strong>4×6″ Mock Label Print Preview:</strong> Tactile parcel mock (Kraft/Polymailer) with 1D/2D verification checks.</li>
                          <li><strong>Thermal Print Output:</strong> Direct 203/300 DPI thermal printing with zero waste margins.</li>
                        </ul>
                      </div>

                      {/* Submodule D: Storefront Customization */}
                      <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                        <span className="font-bold text-emerald-300 text-[11px] block flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5" /> D. Store Settings &amp; Live Tickers
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-neutral-400 text-[11px] font-sans">
                          <li><strong>Live Customization:</strong> Adjust promotional marquee ticker, seasonal hero campaigns, and concierge hotline.</li>
                          <li><strong>Branding Control:</strong> Sairat Couture high-res monochrome logo, typography, and accent themes.</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* REST API Endpoints Contract Map */}
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold block">
                  Segregated REST API Endpoint Registry
                </span>
                <div className="overflow-x-auto border border-neutral-800 rounded-lg">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Domain</th>
                        <th className="p-2.5">Method</th>
                        <th className="p-2.5">Endpoint</th>
                        <th className="p-2.5">Module Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/80 bg-neutral-950/60 text-neutral-300">
                      <tr>
                        <td className="p-2.5 text-amber-400 font-bold">Storefront</td>
                        <td className="p-2.5 text-emerald-400 font-bold">GET</td>
                        <td className="p-2.5 text-white">/api/products</td>
                        <td className="p-2.5 text-neutral-400 font-sans">Public catalog, gender filter, search queries</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-amber-400 font-bold">Storefront</td>
                        <td className="p-2.5 text-emerald-400 font-bold">GET</td>
                        <td className="p-2.5 text-white">/api/products/:slugOrId</td>
                        <td className="p-2.5 text-neutral-400 font-sans">Single PDP with flat measurements &amp; gallery</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-amber-400 font-bold">Storefront</td>
                        <td className="p-2.5 text-sky-400 font-bold">POST</td>
                        <td className="p-2.5 text-white">/api/cart/hold</td>
                        <td className="p-2.5 text-neutral-400 font-sans">10-minute atomic inventory concurrency lease</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-amber-400 font-bold">Storefront</td>
                        <td className="p-2.5 text-sky-400 font-bold">POST</td>
                        <td className="p-2.5 text-white">/api/orders</td>
                        <td className="p-2.5 text-neutral-400 font-sans">Place order with bKash advance / COD selection</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-emerald-400 font-bold">Admin UI</td>
                        <td className="p-2.5 text-emerald-400 font-bold">GET</td>
                        <td className="p-2.5 text-white">/api/admin/dashboard</td>
                        <td className="p-2.5 text-neutral-400 font-sans">Live telemetry: Gross sales, AOV, inventory value</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-emerald-400 font-bold">Admin UI</td>
                        <td className="p-2.5 text-sky-400 font-bold">POST</td>
                        <td className="p-2.5 text-white">/api/admin/products</td>
                        <td className="p-2.5 text-neutral-400 font-sans">Intake studio: Mint SKU, condition grade, flat specs</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-emerald-400 font-bold">Admin UI</td>
                        <td className="p-2.5 text-sky-400 font-bold">POST</td>
                        <td className="p-2.5 text-white">/api/admin/orders/:id/dispatch</td>
                        <td className="p-2.5 text-neutral-400 font-sans">Steadfast/Pathao API courier waybill generation</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-emerald-400 font-bold">Admin UI</td>
                        <td className="p-2.5 text-emerald-400 font-bold">GET</td>
                        <td className="p-2.5 text-white">/api/admin/orders/:id/consignment-note</td>
                        <td className="p-2.5 text-neutral-400 font-sans">4×6 thermal printable consignment &amp; provenance QR</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: PRISMA SCHEMA                                              */}
          {/* ================================================================= */}
          {activeTab === 'SCHEMA' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-neutral-400 text-[11px] pb-2 border-b border-neutral-800">
                <span>File: /prisma/schema.prisma</span>
                <span>Provider: PostgreSQL</span>
              </div>
              <pre className="p-4 bg-neutral-950 rounded text-neutral-300 overflow-x-auto text-[11px] leading-relaxed border border-neutral-800/80">
                <code>{prismaSchemaCode}</code>
              </pre>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: CONCURRENCY LEASE                                          */}
          {/* ================================================================= */}
          {activeTab === 'CONCURRENCY' && (
            <div className="space-y-6 text-neutral-300">
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded">
                <h4 className="font-bold text-sm text-white uppercase mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Atomic Cart Hold &amp; Single-Quantity Invariant
                </h4>
                <p className="text-neutral-400 leading-relaxed font-sans text-xs">
                  Resale pieces are unique (quantity = 1). Traditional shopping carts suffer double-sale race conditions when two high-speed buyers checkout the same rare garment simultaneously.
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold uppercase text-white">Concurrency Lease State Machine:</h5>
                <ol className="list-decimal pl-5 space-y-2 text-neutral-400 leading-relaxed font-sans text-xs">
                  <li>
                    <strong className="text-white">Request:</strong> Client calls <code className="text-amber-300 bg-neutral-900 px-1 py-0.5 rounded font-mono">POST /api/cart/hold</code> with <code className="text-neutral-200 font-mono">productId</code> and <code className="text-neutral-200 font-mono">userId</code>.
                  </li>
                  <li>
                    <strong className="text-white">Validation:</strong> Server verifies <code className="text-neutral-200 font-mono">Product.status !== 'SOLD'</code> and checks for existing active <code className="text-neutral-200 font-mono">InventoryLock</code>.
                  </li>
                  <li>
                    <strong className="text-white">Atomic Lock Creation:</strong> If unreserved or held by the same user, creates/refreshes a lock with <code className="text-amber-300 font-mono">expiresAt = now() + 600 seconds</code> and sets status to <code className="text-neutral-200 font-mono">IN_CART_HOLD</code>.
                  </li>
                  <li>
                    <strong className="text-white">Checkout Transition:</strong> Upon successful payment confirmation, transitions product to <code className="text-emerald-400 font-mono">SOLD</code> and deactivates the lock lease atomically.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: IDEMPOTENCY & WEBHOOKS                                     */}
          {/* ================================================================= */}
          {activeTab === 'IDEMPOTENCY' && (
            <div className="space-y-6 text-neutral-300 font-sans text-xs">
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded font-mono">
                <h4 className="font-bold text-sm text-white uppercase mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  bKash &amp; Stripe Idempotency Enforcement
                </h4>
                <p className="text-neutral-400 leading-relaxed text-xs">
                  Every webhook and manual verification checks <code className="text-white">PaymentAudit.stripeEventId</code> or <code className="text-white">Order.paymentTrxId</code>. Duplicate delivery calls immediately return HTTP 200 without duplicate state changes.
                </p>
              </div>

              <div className="p-4 bg-neutral-950 rounded border border-neutral-800 space-y-2 font-mono text-[11px]">
                <div className="text-white font-bold">ATOMIC WEBHOOK PIPELINE:</div>
                <div className="pl-4 text-neutral-400">├── Validate Webhook Signature / TrxID verification</div>
                <div className="pl-4 text-neutral-400">├── Check for duplicate event in <code className="text-white">PaymentAudit</code></div>
                <div className="pl-4 text-neutral-400">├── Begin Prisma DB Transaction</div>
                <div className="pl-4 text-neutral-400">├── Set <code className="text-white">Product.status = 'SOLD'</code></div>
                <div className="pl-4 text-neutral-400">├── Create <code className="text-white">Order</code> &amp; <code className="text-white">OrderItem</code></div>
                <div className="pl-4 text-neutral-400">├── Create <code className="text-white">Shipment</code> record with tracking waybill</div>
                <div className="pl-4 text-neutral-400">└── Release <code className="text-white">InventoryLock.isActive = false</code></div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: CLI COMMANDS                                               */}
          {/* ================================================================= */}
          {activeTab === 'CLI' && (
            <div className="space-y-4 text-neutral-300">
              <div className="flex items-center gap-2 text-white font-bold uppercase">
                <Terminal className="w-4 h-4" />
                <span>Prisma Deployment &amp; Migration Commands</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-neutral-950 rounded border border-neutral-800">
                  <div className="text-[10px] text-neutral-500 uppercase mb-1">Generate Prisma Client</div>
                  <code className="text-amber-300">npx prisma generate</code>
                </div>

                <div className="p-3 bg-neutral-950 rounded border border-neutral-800">
                  <div className="text-[10px] text-neutral-500 uppercase mb-1">Development Migration</div>
                  <code className="text-amber-300">npx prisma migrate dev --name init_resale_platform</code>
                </div>

                <div className="p-3 bg-neutral-950 rounded border border-neutral-800">
                  <div className="text-[10px] text-neutral-500 uppercase mb-1">Production Migration Deploy</div>
                  <code className="text-amber-300">npx prisma migrate deploy</code>
                </div>

                <div className="p-3 bg-neutral-950 rounded border border-neutral-800">
                  <div className="text-[10px] text-neutral-500 uppercase mb-1">Interactive Studio Inspection</div>
                  <code className="text-amber-300">npx prisma studio --port 5555</code>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 6: SEO & OPENGRAPH TAGS                                       */}
          {/* ================================================================= */}
          {activeTab === 'SEO' && (
            <div className="space-y-6 text-neutral-300">
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded">
                <h4 className="font-bold text-sm text-white uppercase mb-2 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-sky-400" />
                  Dynamic SEOManager &amp; Social Graph Engine
                </h4>
                <p className="text-neutral-400 leading-relaxed font-sans text-xs">
                  The <code className="text-white">SEOManager</code> component monitors application state (`selectedProduct`, `selectedCategory`, `selectedGender`) and synchronizes the DOM <code className="text-white">&lt;head&gt;</code> in real time. It automatically generates OpenGraph product tags, Twitter Summary Large Image cards, canonical URLs, and Schema.org JSON-LD microdata for Google search indexation.
                </p>
              </div>

              {/* Sample Product OpenGraph Tag Output */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase text-white">1. Generated OpenGraph Meta (Product View Example)</span>
                <pre className="p-3 bg-neutral-950 rounded border border-neutral-800 text-[11px] text-neutral-300 overflow-x-auto leading-relaxed">
{`<title>Raf Simons AW2001 "Riot Riot Riot" Oversized Patch Bomber (EU 50) · ৳385,000 | SAIRAT COUTURE</title>
<meta name="description" content="Verified 1-of-1 archival Raf Simons piece from 90S. Condition: VINTAGE FLAWS. Tagged EU 50. Guaranteed authentic with atomic 10-min reservation lease." />
<meta property="og:type" content="product" />
<meta property="og:title" content="Raf Simons AW2001 'Riot Riot Riot' Oversized Patch Bomber..." />
<meta property="og:image" content="https://images.unsplash.com/photo-1551028719-00167b16eac5..." />
<meta property="og:price:amount" content="385000" />
<meta property="og:price:currency" content="BDT" />
<meta property="og:availability" content="https://schema.org/InStock" />`}
                </pre>
              </div>

              {/* Sample Twitter Card Output */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase text-white">2. Generated Twitter / X Large Summary Card</span>
                <pre className="p-3 bg-neutral-950 rounded border border-neutral-800 text-[11px] text-neutral-300 overflow-x-auto leading-relaxed">
{`<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@SairatCouture" />
<meta name="twitter:title" content="Raf Simons AW2001 'Riot Riot Riot' Oversized Patch Bomber..." />
<meta name="twitter:label1" content="Condition & Authenticity" />
<meta name="twitter:data1" content="Vintage Patina & Flaws · Verified" />
<meta name="twitter:label2" content="Price & Availability" />
<meta name="twitter:data2" content="৳385,000 · 1 of 1 Available" />`}
                </pre>
              </div>

              {/* Schema.org JSON-LD Output */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase text-white">3. Schema.org Product Rich Snippet (JSON-LD)</span>
                <pre className="p-3 bg-neutral-950 rounded border border-neutral-800 text-[11px] text-amber-300/90 overflow-x-auto leading-relaxed">
{`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "AW2001 'Riot Riot Riot' Oversized Patch Bomber",
  "sku": "RAFS-OUT-2001-9F2A",
  "brand": { "@type": "Brand", "name": "Raf Simons" },
  "itemCondition": "https://schema.org/DamagedCondition",
  "offers": {
    "@type": "Offer",
    "price": "385000.00",
    "priceCurrency": "BDT",
    "availability": "https://schema.org/InStock",
    "seller": { "@type": "Organization", "name": "SAIRAT COUTURE Archive & Resale" }
  }
}
</script>`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
