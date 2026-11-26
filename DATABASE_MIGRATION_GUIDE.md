# INNOVÉ COUTURE - Database Architecture & Migration Guide

## 1. Overview & Architecture Design
INNOVÉ COUTURE is a luxury and archival fashion resale platform designed for one-of-a-kind, 1-of-1 pieces. In high-demand drops (analogous to Grailed Heat drops, SSENSE sales, and GOAT sneaker releases), race conditions and inventory conflicts are critical business risks.

The relational PostgreSQL schema designed in `prisma/schema.prisma` guarantees:
1. **Financial Integrity**: Prices and COGS stored as integer cents (`priceCents`, `cogsCents`) avoiding floating-point rounding bugs.
2. **Concurrency & Double-Spend Prevention**: Single-quantity inventory enforced through `InventoryLock` and atomic lease transactions (`POST /api/cart/hold`).
3. **Idempotent Financial Audits**: Webhooks from Stripe record both `stripeEventId` and `stripePaymentId` to protect against duplicate payment processing.
4. **Resale Specifics**: Precise flat garment measurements (pit-to-pit, length, waist, inseam, rise), multi-point authenticity status (`PENDING`, `VERIFIED`, `NOT_APPLICABLE`), and 4-grade condition taxonomy.

---

## 2. Database Migration Commands (Prisma CLI)

To deploy or run migrations against your PostgreSQL instance:

```bash
# 1. Ensure DATABASE_URL is set in .env
DATABASE_URL="postgresql://user:password@localhost:5432/innove_couture?schema=public"

# 2. Generate Prisma Client bindings
npx prisma generate

# 3. Create initial migration for local development
npx prisma migrate dev --name init_resale_platform

# 4. For CI/CD or production environments (applies pending migrations)
npx prisma migrate deploy

# 5. Seed initial taxonomy and archival products
npx tsx scripts/seed.ts

# 6. Launch Prisma Studio for relational inspection
npx prisma studio --port 5555
```

---

## 3. Atomic Inventory Hold Lifecycle

```
[Customer adds 1-of-1 to bag]
              │
              ▼
    POST /api/cart/hold
              │
              ├──> [Check Product Status != 'SOLD' & Active Locks expired?]
              ├──> [Atomic DB Transaction: Create InventoryLock with 10-min expiration]
              └──> [Set Product Status = 'IN_CART_HOLD']
              │
              ├─ (Scenario A: User checks out within 10 minutes)
              │       │
              │       ▼
              │   POST /api/webhooks/stripe (checkout.session.completed)
              │       │
              │       ├── Verify stripe-signature
              │       ├── Check idempotency table (PaymentAudit)
              │       ├── Mark Product Status = 'SOLD'
              │       ├── Create Order & OrderItem
              │       └── Release Lock
              │
              └─ (Scenario B: 10 minutes elapse without checkout)
                      │
                      ▼
                  Hold expires automatically;
                  background lease cleaner or next customer request releases hold;
                  Product Status reverts to 'ACTIVE'.
```

---

## 4. API Endpoints Specification

### A. Atomic Cart Hold (`POST /api/cart/hold`)
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "productId": "prod_archive_bomber_01",
    "userId": "usr_session_9281a8"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "lockId": "lock_cuid_abc123",
    "productId": "prod_archive_bomber_01",
    "expiresAt": "2026-10-16T13:25:00.000Z",
    "remainingSeconds": 600,
    "message": "Piece reserved exclusively for 10 minutes."
  }
  ```
- **Conflict Response (409 Conflict)**:
  ```json
  {
    "success": false,
    "error": "ITEM_HELD_OR_SOLD",
    "message": "This one-of-a-kind piece is currently reserved by another collector."
  }
  ```

### B. Stripe Webhook Idempotency (`POST /api/webhooks/stripe`)
- **Headers**: `stripe-signature: t=...,v1=...`
- **Logic**:
  1. Validates signature with `STRIPE_WEBHOOK_SECRET`.
  2. Queries `PaymentAudit` for existing `stripeEventId`. If exists, returns `200 { received: true, idempotent: true }`.
  3. Executes atomic Prisma transaction:
     - Deducts inventory and sets product status to `SOLD`.
     - Creates `Order`, `OrderItem`, and `PaymentAudit` record.
     - Creates initial `Shipment` record with generated carrier tracking code.

### C. Admin Fast-Listing API (`POST /api/admin/products`)
- **Payload**:
  ```json
  {
    "title": "Helmut Lang 1999 Astro Moto Jacket",
    "brand": "Helmut Lang",
    "gender": "MEN",
    "cogsCents": 95000,
    "priceCents": 185000,
    "conditionGrade": "EXCELLENT",
    "eraDecade": "ERA_90S",
    "categoryId": "cat_outerwear",
    "measurements": {
      "chestWidthIn": 21.5,
      "lengthIn": 25.0,
      "shoulderWidthIn": 18.5,
      "sleeveLengthIn": 26.0
    },
    "images": ["/assets/helmut_astro_front.jpg"]
  }
  ```
- **Returns**: Auto-generated SKU (e.g. `HELM-OUT-1999-E8A1`), margin calculation (`48.6%`), and persisted record.
