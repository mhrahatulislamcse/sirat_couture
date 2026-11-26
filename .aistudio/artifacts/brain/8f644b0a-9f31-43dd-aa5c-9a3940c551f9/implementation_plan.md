# Implementation Plan: AdminDispatchControl Sub-Component for Courier Dispatch & Consignment Generation

Build an interactive, high-efficiency `AdminDispatchControl` sub-component within the `AdminDashboard`. This component empowers managers to seamlessly choose between **Steadfast** and **Pathao** couriers, switch delivery zones (**Inside Dhaka** ৳120 vs. **Outside Dhaka** ৳200) with automatic recalculation of delivery fees and COD totals, and instantly generate and preview printable consignment notes.

---

## 1. User & Technical Requirements Alignment
- **Courier Selection**: Switchable between Steadfast and Pathao Courier APIs.
- **Delivery Zone Control**: Toggle between `INSIDE_DHAKA` (৳120) and `OUTSIDE_DHAKA` (৳200). As confirmed in user clarification, delivery fee changes dynamically adjust shipping fee, order total, and COD collection amount.
- **Consignment Generation & Instant Preview**: Triggering dispatch generates the official consignment note via the courier API and automatically opens the printable `ConsignmentNoteModal` with barcode, QR code, and tracking details.
- **Real-Time Courier Sync**: Live checkpoint sync button for tracking parcel transit directly from Steadfast/Pathao.

---

## 2. Proposed Changes

### Backend: `server.ts`
- Enhance `POST /api/admin/orders/:id/dispatch` endpoint:
  - Accept `deliveryZone: 'INSIDE_DHAKA' | 'OUTSIDE_DHAKA'`.
  - Dynamically recalculate `deliveryFeeBDT` (120 BDT for Inside Dhaka, 200 BDT for Outside Dhaka).
  - Recalculate `totalBDT` and `codPayableAmountBDT` based on the updated delivery zone.
  - Execute booking with Steadfast or Pathao API and return the finalized `consignmentNote`.

### Frontend: New Component `src/components/AdminDispatchControl.tsx`
- Dedicated sub-component featuring:
  - **Courier Selector**: Visual segmented toggle for Steadfast (emerald branding) and Pathao (crimson/rose branding) with live API status badge.
  - **Zone Toggle**: Pill selector for Inside Dhaka (৳120) vs Outside Dhaka (৳200) displaying live fee delta.
  - **Special Instruction / Notes**: Optional quick-input field for courier riders (e.g. "Fragile luxury garment - call customer before delivery").
  - **One-Click Dispatch Button**: High-contrast action button that triggers booking and consignment generation.
  - **Active Consignment Header / Waybill Action**: Once dispatched, displays Tracking Code, Consignment ID, live courier link, and instant "Print Consignment Note" button.
  - **Live Tracking Sync**: One-click sync button to fetch the latest transit checkpoints.

### Frontend: Integration in `src/components/AdminDashboard.tsx`
- Import and embed `AdminDispatchControl` inside the Order item card within the **Orders** tab.
- Update order dispatch handler to support `deliveryZone` selection and pass returned consignment note straight to `ConsignmentNoteModal`.
- Update state when zone changes so financial summaries match in real-time.

---

## 3. Verification Plan

### Automated & API Tests
1. **Compilation & Linting**: Run `lint_applet` and `compile_applet` to ensure TypeScript compliance and zero broken imports.
2. **Endpoint Dispatch Test**:
   - `curl -X POST http://localhost:3000/api/admin/orders/<ORDER_ID>/dispatch` with `{ courier: 'STEADFAST', deliveryZone: 'OUTSIDE_DHAKA' }`.
   - Verify `deliveryFeeBDT` updates to 200 BDT, total recalculated, tracking code issued, and consignment note returned.
3. **Pathao Booking Test**:
   - `curl -X POST http://localhost:3000/api/admin/orders/<ORDER_ID>/dispatch` with `{ courier: 'PATHAO', deliveryZone: 'INSIDE_DHAKA' }`.
   - Verify Pathao consignment note generation and tracking URL.
4. **Interactive UI Verification**:
   - Toggle courier selector and delivery zone in the Admin Dashboard.
   - Click dispatch and verify the instant popup of the printable Consignment Note modal.
