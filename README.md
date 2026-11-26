# SAIRAT COUTURE

**SAIRAT COUTURE** is a gender-adaptive luxury and archival fashion resale platform tailored for **Bangladesh** operations. It manages **1-of-1 unique archival garments** with flat-measured specifications, concurrency-safe reservation holds, localized BDT (`৳`) pricing, local payment workflows (**bKash**, **Nagad**, **SSLCommerz**, and **Partial COD**), nationwide courier integrations (**Steadfast**, **Pathao**, **RedX**), printable QR/barcode consignment tooling, and an integrated operations dashboard.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Key Features & Domain Workflows](#key-features--domain-workflows)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started (Unified Mode)](#getting-started-unified-mode)
- [Decoupled Services Mode](#decoupled-services-mode)
- [Authentication & RBAC (Decoupled Backend)](#authentication--rbac-decoupled-backend)
- [Database Schema & Migrations](#database-schema--migrations)
- [API Reference](#api-reference)
- [Utility Scripts](#utility-scripts)
- [Available NPM Scripts](#available-npm-scripts)

---

## Architecture Overview

The repository supports **two operational architectures**:

1. **Unified Monolithic Mode (Root)** — A single Express + Vite server ([server.ts](server.ts)) serving both the storefront/admin React app (`src/`) and the REST API on `http://localhost:3000`. Ideal for rapid local development, demos, and single-service deployments.
2. **Decoupled Three-Service Mode** — Separated applications for independent scaling and strict security isolation:
   - **`backend/`** (port `4000`): Express API with strict CORS allowlisting ([backend/src/middleware/corsConfig.ts](backend/src/middleware/corsConfig.ts)) and decoupled Customer vs. Admin JWT authentication ([backend/src/middleware/authMiddleware.ts](backend/src/middleware/authMiddleware.ts)).
   - **`storefront/`** (port `3000`): Customer-facing React + Vite storefront proxying `/api` to `http://localhost:4000`.
   - **`admin-dashboard/`** (port `3001`): Staff-only operations portal proxying `/api` to `http://localhost:4000`.

---

## Key Features & Domain Workflows

### 1. Gender-Adaptive Storefront & Routing
- Dedicated **Gateway**, **Men's**, and **Women's** landing experiences (`GatewayHomePage`, `MenHomePage`, `WomenHomePage`).
- Persistent customer profile and department preferences stored via cookies (`preferred_storefront`, `user_gender`, `user_preferred_home`, `auth_token`, `innove_user_session`) and edge redirection rules defined in [middleware.ts](middleware.ts).
- Live storefront banner, hero copy, campaign metadata, delivery fees, and maintenance mode configurable via `/api/storefront/config` and `/api/admin/storefront/config`.

### 2. 1-of-1 Archival Scarcity & Inventory Concurrency
- Every garment is treated as a unique `1-of-1` piece (`isUniquePiece: true`) with SKU tracking, 3-grade condition taxonomy (`BRAND_NEW_TAGS`, `EXCELLENT_VINTAGE`, `MINOR_FLAWS`), era classification (`ERA_90S`, `Y2K`, `MODERN`), and authenticity verification (`PENDING`, `VERIFIED`, `DIRECT_CONSIGNMENT`).
- Precise flat garment measurements in inches (`chestWidthIn`, `lengthIn`, `shoulderWidthIn`, `sleeveLengthIn`, `waistIn`, `inseamIn`, `riseIn`) and wear notes (`fabricIntegrity`, `seamTension`, `hardwarePatina`).
- Atomic reservation hold endpoints (`POST /api/cart/hold`, `DELETE /api/cart/hold/:productId`) transition items between `ACTIVE` and `IN_CART_HOLD` to prevent double-selling.

### 3. Bangladesh Localization, Payments & Logistics
- **BDT (`৳`) Financials**: Listing prices, promotional prices, COGS, and delivery fees stored as integer Taka.
- **Address Hierarchy**: Division, District, and Thana taxonomy in [src/data/bangladeshLocations.ts](src/data/bangladeshLocations.ts) with automatic zone classification:
  - `INSIDE_DHAKA`: Default `৳80` delivery fee
  - `OUTSIDE_DHAKA`: Default `৳150` delivery fee
- **Payment Workflows**:
  - `BKASH` (create/execute flow via `/api/payment/bkash/create` and `/api/payment/bkash/execute`)
  - `NAGAD`, `SSLCOMMERZ`, and `CASH_ON_DELIVERY` (supports `PARTIAL_COD_CONFIRMED` where advance delivery fee is collected upfront and the garment balance is collected by the courier).
- **Courier Gateway (`src/services/courierService.ts`)**:
  - Supports **Steadfast** (nationwide 64 districts), **Pathao** (express/on-demand), and **RedX**.
  - Single and batch dispatch, live status syncing, rate calculation, consignment notes, and courier analytics.

### 4. Collector Discovery & Vault Operations Tooling
- **Storefront Tools**: Search modal, multi-facet catalog filters, interactive **Style Quiz** (`StyleQuizModal`), **Size Conversion Table** (`SizeConversionTable`), **Complete the Look** recommendations (`lookRecommender.ts`), **Recently Viewed** tracking, **Price-Drop Alerts** (`/api/alerts/price-drop`), and customer **Order Tracking** (`OrderTracking`) with provenance checkpoints.
- **Admin Vault Operations (`AdminDashboard`)**:
  - Inventory CRUD and batch status updates
  - Manual order logging and order status management
  - Barcode scanner panel (`BarcodeScannerPanel` + `POST /api/admin/orders/scan-barcode`)
  - Printable thermal consignment slips (`ThermalConsignmentSlips`), print previews (`PrintPreviewModal`), and A4 3×5 QR inventory tag PDF exports (`src/utils/qrTagPdfGenerator.ts`)
  - D3-powered courier analytics (`CourierAnalyticsPanel`) and interactive architecture viewer (`ArchitectureViewer`).

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), Lucide React, Motion |
| **Backend** | Express 4, TypeScript (`tsx`), `dotenv`, `cors` & `jsonwebtoken` (in `backend/`) |
| **Data Visualization & Print** | D3 (`d3`), JsBarcode (`jsbarcode`), QR Code (`qrcode`, `qrcode.react`), jsPDF (`jspdf`) |
| **Database Modeling** | Prisma ORM (`prisma/schema.prisma`) targeting PostgreSQL |

---

## Repository Structure

```text
sirat_couture/
├── server.ts                      # Unified Express + Vite server (port 3000)
├── index.html                     # Root HTML entry point & typography imports
├── middleware.ts                  # Gender-adaptive storefront routing middleware
├── vite.config.ts                 # Root Vite + React + Tailwind v4 configuration
├── package.json                   # Root dependencies & scripts
├── .env.example                   # Root environment template
├── DATABASE_MIGRATION_GUIDE.md    # Prisma & concurrency lease architecture guide
├── prisma/
│   └── schema.prisma              # PostgreSQL relational schema
├── public/
│   ├── assets/                    # Brand logo & crest imagery
│   └── fonts/                     # Aeonik WOFF2 font assets
├── scripts/
│   └── remove_background.mjs      # ImageMagick RGBA keying script for brand logo
├── src/
│   ├── App.tsx                    # Main storefront + admin application shell
│   ├── components/                # Storefront, checkout, admin, courier & print components
│   ├── data/                      # Initial archival catalog & Bangladesh locations
│   ├── pages/                     # GatewayHomePage, MenHomePage, WomenHomePage
│   ├── services/                  # authService.ts, courierService.ts
│   ├── types/                     # resale.ts, auth.ts, priceAlert.ts
│   └── utils/                     # lookRecommender, priceAlerts, qrTagPdfGenerator, etc.
├── backend/                       # Decoupled API server (port 4000)
│   ├── src/
│   │   ├── server.ts              # Express API with JWT + RBAC guards
│   │   ├── middleware/            # authMiddleware.ts, corsConfig.ts
│   │   ├── data/                  # Catalog & location data
│   │   └── services/              # Courier integration gateway
│   ├── .env.example
│   └── package.json
├── storefront/                    # Decoupled customer storefront (port 3000)
│   ├── src/
│   ├── .env.example
│   └── package.json
└── admin-dashboard/               # Decoupled admin portal (port 3001)
    ├── src/
    ├── .env.example
    └── package.json
```

---

## Getting Started (Unified Mode)

### Prerequisites

- **Node.js** `v20+`
- **npm** (or **Bun**)

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

> **Note:** `--legacy-peer-deps` is needed with `npm` because root `package.json` pins `esbuild@^0.25.0` while `vite@^8.3.0` declares an optional peer dependency on `esbuild@^0.27.0 || ^0.28.0`.

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Port for the unified Express + Vite server |
| `NODE_ENV` | `development` | Set to `production` to serve static files from `dist/` |
| `APP_URL` | `http://localhost:3000` | Base URL for the application |
| `STEADFAST_API_KEY` | *(optional)* | Steadfast Courier API key (falls back to dev credentials if unset) |
| `STEADFAST_SECRET_KEY` | *(optional)* | Steadfast Courier secret key |
| `PATHAO_CLIENT_ID` | *(optional)* | Pathao Courier OAuth client ID |
| `PATHAO_CLIENT_SECRET` | *(optional)* | Pathao Courier OAuth client secret |

### 3. Run the Unified Development Server

```bash
npm run dev
```

The storefront, admin modal/dashboard, and API are served together at **`http://localhost:3000`**.

### 4. Production Build & Start (Unified Mode)

```bash
npm run build
NODE_ENV=production npm run start
```

---

## Decoupled Services Mode

To run the API, Storefront, and Admin Dashboard as three separate processes:

### 1. Backend API (`backend/` — Port `4000`)

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Environment variables (`backend/.env.example`):

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `4000` | API server port |
| `NODE_ENV` | `development` | Environment mode |
| `DATABASE_URL` | `postgresql://user:password@localhost:5432/sairat_couture` | PostgreSQL connection string |
| `STOREFRONT_ORIGIN` | `http://localhost:3000` | Allowed storefront CORS origin |
| `ADMIN_ORIGIN` | `http://localhost:3001` | Allowed admin portal CORS origin |
| `ADDITIONAL_CORS_ORIGINS` | *(optional)* | Comma-separated additional CORS origins |
| `CUSTOMER_JWT_SECRET` | *(dev fallback)* | Signing secret for customer JWTs (`aud: "storefront"`) |
| `ADMIN_JWT_SECRET` | *(dev fallback)* | Signing secret for admin JWTs (`aud: "admin"`) |
| `ADMIN_DEMO_PASSCODE` | `VAULT-DHAKA-2026` | Passcode for seeded staff accounts in dev |
| `STEADFAST_API_KEY` / `STEADFAST_SECRET_KEY` | *(optional)* | Steadfast API credentials |
| `PATHAO_CLIENT_ID` / `PATHAO_CLIENT_SECRET` | *(optional)* | Pathao API credentials |

### 2. Customer Storefront (`storefront/` — Port `3000`)

```bash
cd storefront
cp .env.example .env
npm install
npm run dev
```

Proxies `/api` requests to `VITE_API_BASE_URL` (default `http://localhost:4000`).

### 3. Admin Dashboard (`admin-dashboard/` — Port `3001`)

```bash
cd admin-dashboard
cp .env.example .env
npm install
npm run dev
```

Proxies `/api` requests to `VITE_API_BASE_URL` (default `http://localhost:4000`).

---

## Authentication & RBAC (Decoupled Backend)

In `backend/src/server.ts`, authentication is strictly split by audience (`aud`) and signing secret:

- **Customer JWT (`aud: "storefront"`, 7-day expiry)**:
  - Issued by `POST /api/auth/customer/login`
  - Roles: `CUSTOMER`, `VIP_CONSIGNOR`
  - Attached optionally on `/api/user`, `/api/cart`, `/api/checkout`, and `/api/payment` via `optionalCustomerAuth`.
- **Admin JWT (`aud: "admin"`, 12-hour expiry)**:
  - Issued by `POST /api/auth/admin/login`
  - Required on all `/api/admin/*` endpoints via `requireAdminAuth(['SUPER_ADMIN', 'VAULT_STAFF', 'DISPATCHER'])`.
  - Seeded staff accounts in development (default passcode `VAULT-DHAKA-2026` or `ADMIN_DEMO_PASSCODE`):
    - `ops@sairatvault.com` (`SUPER_ADMIN`)
    - `curator@sairatvault.com` (`VAULT_STAFF`)
    - `dispatch@sairatvault.com` (`DISPATCHER`)

Pre-seeded demo customer profiles in `src/services/authService.ts` include:
- `tariq.rahman@menswear.com` (`MEN` / `VIP_CONSIGNOR`)
- `zara.huq@hautevault.com` (`WOMEN` / `VIP_CONSIGNOR`)
- `alex.roy@archivegateway.com` (`UNSPECIFIED` / `CUSTOMER`)

---

## Database Schema & Migrations

The relational schema in [prisma/schema.prisma](prisma/schema.prisma) defines:

- **Models**: `Category` (self-referential hierarchy), `Product`, `InventoryLock`, `Customer`, `ShippingAddress`, `Order`, `OrderItem` (`productId @unique` enforcing 1-of-1 sale exclusivity), `CourierConsignment`, and `UserProfile`.
- **Enums**: `Gender`, `ConditionGrade`, `EraDecade`, `AuthenticityStatus`, `ProductStatus`, `OrderStatus`, `DeliveryZone`, `PaymentGateway`, `CourierProvider`, `CourierFulfillmentStatus`, `UserGender`.

Common Prisma commands (also documented in [DATABASE_MIGRATION_GUIDE.md](DATABASE_MIGRATION_GUIDE.md)):

```bash
npx prisma generate
npx prisma migrate dev --name init_resale_platform
npx prisma migrate deploy
npx prisma studio --port 5555
```

> **Note:** Both `server.ts` and `backend/src/server.ts` currently boot with an in-memory data store seeded from `INITIAL_PRODUCTS` so the application runs immediately without a live PostgreSQL instance.

---

## API Reference

### Health & Auth (`backend/src/server.ts` only)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check |
| `POST` | `/api/auth/customer/login` | Issue customer storefront JWT |
| `POST` | `/api/auth/admin/login` | Authenticate staff account and issue admin JWT |
| `GET` | `/api/auth/admin/me` | Return authenticated staff profile (requires admin JWT) |

### Storefront, Catalog & Checkout (`server.ts` & `backend/src/server.ts`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | List products with filter/sort support |
| `GET` | `/api/products/:slugOrId` | Retrieve a single archival piece by slug or ID |
| `GET` | `/api/categories` | Retrieve category taxonomy |
| `GET` | `/api/storefront/config` | Fetch active hero, announcement, campaign & delivery fee config |
| `GET` | `/api/user/profile/:userId` | Retrieve user gender & preferred home profile |
| `POST` | `/api/user/profile` | Create or update user profile preferences |
| `POST` | `/api/cart/hold` | Place a 1-of-1 inventory reservation hold |
| `DELETE` | `/api/cart/hold/:productId` | Release an active inventory hold |
| `POST` | `/api/payment/bkash/create` | Initialize bKash payment session |
| `POST` | `/api/payment/bkash/execute` | Execute/confirm bKash payment (idempotent) |
| `POST` | `/api/checkout/simulate` | Complete checkout simulation & create order |
| `GET` | `/api/orders/lookup` | Look up order status and courier checkpoints |
| `POST` | `/api/alerts/price-drop` | Subscribe to price-drop alerts for a piece |
| `GET` | `/api/alerts/price-drop/:productId` | Check price-drop alert subscription status |
| `DELETE` | `/api/alerts/price-drop/:productId` | Remove a price-drop alert subscription |

### Admin & Courier Operations (`/api/admin/*`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Revenue, inventory stats, orders, holds, and catalog overview |
| `POST` | `/api/admin/storefront/config` | Update storefront hero, banner, delivery fees & maintenance mode |
| `POST` | `/api/admin/products` | Create a new 1-of-1 archival product |
| `PUT` | `/api/admin/products/:id` | Update product details or pricing |
| `DELETE` | `/api/admin/products/:id` | Delete a product from catalog |
| `PATCH` | `/api/admin/products/batch-status` | Bulk-update product statuses |
| `POST` | `/api/admin/orders` | Create a manual/walk-in order |
| `PATCH` | `/api/admin/orders/:id/status` | Update order lifecycle status |
| `PATCH` | `/api/admin/orders/:id/delivery-zone` | Update delivery zone and recalculate delivery fee |
| `PATCH` | `/api/admin/orders/:id/tracking` | Update order tracking details |
| `DELETE` | `/api/admin/orders/:id` | Delete an order |
| `POST` | `/api/admin/orders/:id/dispatch` | Dispatch order to Steadfast, Pathao, or RedX |
| `POST` | `/api/admin/orders/batch-dispatch` | Batch-dispatch multiple orders |
| `POST` | `/api/admin/orders/:id/courier-status` | Sync or update courier fulfillment checkpoint |
| `GET` | `/api/admin/orders/:id/consignment-note` | Generate printable consignment note data |
| `POST` | `/api/admin/orders/scan-barcode` | Process barcode/QR scan for order fulfillment |
| `GET` | `/api/admin/courier/config` | Fetch Steadfast & Pathao gateway config/balances |
| `POST` | `/api/admin/courier/config` | Update courier credentials or sandbox mode |
| `POST` | `/api/admin/courier/calculate-rate` | Calculate courier rate quote |
| `GET` | `/api/admin/courier/rates` | List courier rate quotes |
| `GET` | `/api/admin/courier/analytics` | Fetch courier dispatch & COD analytics |
| `DELETE` | `/api/admin/holds/all` | Release all active inventory holds |

---

## Utility Scripts

- **`scripts/remove_background.mjs`** (also mirrored at `backend/scripts/remove_background.mjs`):
  Extracts and keys out the dark background from `public/assets/sairat-couture-crest-source.jpg` into a trimmed transparent PNG at `public/assets/sairat-couture-logo.png`. Requires **ImageMagick** (`convert` CLI) installed on your `PATH`:
  ```bash
  node scripts/remove_background.mjs
  ```

---

## Available NPM Scripts

From the repository root:

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `tsx server.ts` | Start unified Express + Vite development server |
| `npm run build` | `vite build` | Build client bundle into `dist/` |
| `npm run start` | `tsx server.ts` | Run Express server (`NODE_ENV=production` serves `dist/`) |
| `npm run preview` | `vite preview` | Preview built Vite bundle |
| `npm run lint` | `tsc --noEmit` | Typecheck root TypeScript sources |
| `npm run clean` | `rm -rf dist` | Remove production build output |
