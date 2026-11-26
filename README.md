# SAIRAT COUTURE

Gender-adaptive luxury and archival fashion resale platform built for Bangladesh operations, featuring 1-of-1 piece inventory locking, flat garment measurements, local payment workflows (bKash, Nagad, SSLCommerz, and Partial COD), nationwide courier dispatch (Steadfast, Pathao, RedX), and an integrated operations dashboard.

---

## Features

- **Gender-Adaptive Storefront**: Dedicated Men's and Women's homepages, unified gateway landing, persistent preference switcher, and edge redirection logic (`middleware.ts`).
- **1-of-1 Atomic Inventory Hold Engine**: Concurrency-safe reservation leases (`POST /api/cart/hold`) to prevent double-selling one-of-a-kind archival pieces.
- **Curated Archive Catalog & Discovery**: Multi-facet filtering (gender, category, condition grade, era), search modal, style quiz, recently viewed history, size conversion table, complete-the-look recommendations, and price-drop alerts.
- **Bangladesh Checkout & Payments**: BDT pricing, Inside Dhaka (`৳80`) / Outside Dhaka (`৳150`) delivery zones, bKash payment creation/execution simulation, Nagad, SSLCommerz, and Partial COD workflows.
- **Courier Dispatch & Logistics**: Steadfast, Pathao, and RedX integration service (`src/services/courierService.ts`), consignment note generation, QR/barcode scanning, thermal consignment slips, PDF QR tags, and courier analytics.
- **Admin Vault Operations Dashboard**: Inventory CRUD, batch product status updates, manual order entry, hold management, storefront banner/campaign configuration, and order status tracking.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Motion
- **Backend**: Express, TypeScript (`tsx`), `dotenv`
- **Visualization & Document Generation**: D3, JsBarcode, `qrcode` / `qrcode.react`, jsPDF
- **Database Modeling**: Prisma ORM schema for PostgreSQL (`prisma/schema.prisma`)

---

## Project Structure

```text
sirat_couture/
├── server.ts                  # Unified Express + Vite dev/prod server (port 3000)
├── src/                       # Root application (storefront + admin dashboard)
│   ├── components/            # UI, checkout, admin, courier, and barcode components
│   ├── data/                  # Initial catalog & Bangladesh location taxonomy
│   ├── pages/                 # Gateway, Men's, and Women's homepages
│   ├── services/              # Auth & courier integration services
│   ├── types/                 # TypeScript domain models
│   └── utils/                 # Price alerts, PDF QR tags, size conversion, look recommender
├── storefront/                # Standalone storefront app (port 3000)
├── admin-dashboard/           # Standalone admin operations portal (port 3001)
├── backend/                   # Standalone API server with customer/admin JWT RBAC (port 4000)
├── prisma/schema.prisma       # PostgreSQL relational schema
├── scripts/                   # Asset utilities (e.g., remove_background.mjs)
├── public/                    # Static assets & fonts
└── DATABASE_MIGRATION_GUIDE.md
```

---

## Getting Started

### Prerequisites

- **Node.js** (v20+ recommended)
- **npm** (or **Bun**)

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

> **Note:** `--legacy-peer-deps` is recommended with `npm` because `package.json` specifies `esbuild@^0.25.0` while `vite@^8.3.0` declares an optional peer dependency on `esbuild@^0.27.0 || ^0.28.0`.

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and adjust values as needed:

```bash
cp .env.example .env
```

Available variables in root `.env`:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Port for the unified Express + Vite server |
| `NODE_ENV` | `development` | Set to `production` to serve built `dist/` files |
| `APP_URL` | `http://localhost:3000` | Application base URL |
| `STEADFAST_API_KEY` | *(optional)* | Steadfast courier API key |
| `STEADFAST_SECRET_KEY` | *(optional)* | Steadfast courier secret key |
| `PATHAO_CLIENT_ID` | *(optional)* | Pathao courier client ID |
| `PATHAO_CLIENT_SECRET` | *(optional)* | Pathao courier client secret |

### 3. Run the Application

```bash
npm run dev
```

The unified server starts at `http://localhost:3000`.

---

## Available Scripts (Root)

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the development server (`tsx server.ts`) with Vite middleware |
| `npm run build` | Build the production frontend bundle (`vite build`) |
| `npm run start` | Run the server (`tsx server.ts`) |
| `npm run preview` | Preview the production Vite build |
| `npm run lint` | Run TypeScript type-checking (`tsc --noEmit`) |
| `npm run clean` | Remove the `dist/` build directory |

---

## Decoupled Services Mode (Optional)

In addition to the unified root server, the repository includes separated packages for independent deployment:

1. **Backend API (`backend/`)** — Runs on `http://localhost:4000` with separate customer & admin JWT secrets and CORS allowlist. See `backend/.env.example`.
   ```bash
   cd backend && npm install && npm run dev
   ```
2. **Storefront (`storefront/`)** — Runs on `http://localhost:3000`, proxying `/api` to `http://localhost:4000`. See `storefront/.env.example`.
   ```bash
   cd storefront && npm install && npm run dev
   ```
3. **Admin Dashboard (`admin-dashboard/`)** — Runs on `http://localhost:3001`, proxying `/api` to `http://localhost:4000`. See `admin-dashboard/.env.example`.
   ```bash
   cd admin-dashboard && npm install && npm run dev
   ```

---

## Database Schema

Relational modeling for PostgreSQL is defined in [prisma/schema.prisma](prisma/schema.prisma). Refer to [DATABASE_MIGRATION_GUIDE.md](DATABASE_MIGRATION_GUIDE.md) for Prisma migration commands, transaction lease architecture, and API specifications.

---

## Core API Endpoints (`server.ts`)

- **Catalog & Config**
  - `GET /api/products` — List catalog products
  - `GET /api/products/:slugOrId` — Fetch single piece details
  - `GET /api/categories` — Fetch category taxonomy
  - `GET /api/storefront/config` — Retrieve active storefront hero & delivery configuration
- **Cart Hold, Checkout & Tracking**
  - `POST /api/cart/hold` / `DELETE /api/cart/hold/:productId` — Manage 1-of-1 piece reservation holds
  - `POST /api/payment/bkash/create` / `POST /api/payment/bkash/execute` — bKash payment flow
  - `POST /api/checkout/simulate` — Complete checkout simulation
  - `GET /api/orders/lookup` — Customer order tracking lookup
  - `POST /api/alerts/price-drop` — Subscribe to piece price-drop alerts
- **Admin & Courier Operations**
  - `GET /api/admin/dashboard` — Operations metrics and inventory/order overview
  - `POST /api/admin/products` / `PUT /api/admin/products/:id` / `DELETE /api/admin/products/:id` — Catalog management
  - `POST /api/admin/orders/:id/dispatch` / `POST /api/admin/orders/batch-dispatch` — Courier dispatch
  - `GET /api/admin/courier/analytics` / `POST /api/admin/courier/calculate-rate` — Logistics rates and analytics
