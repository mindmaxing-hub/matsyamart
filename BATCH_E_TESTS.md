# MatsyaMart QA — Batch E: Admin CRM & Vendor Onboarding

**Target:** Admin Operations Portal (`/admin`) & Community Onboarding (`/host-with-us`)  
**Platform:** Desktop Browser (`http://localhost:3000/admin`)  
**Governing Ledger:** [`MATSYAMART_QA_MASTER.md`](MATSYAMART_QA_MASTER.md)  
**Status:** Queued (Ready after Batch D)  

---

## 🛠️ Prerequisites

1. Navigate to `http://localhost:3000/admin` on desktop.
2. Ensure you have admin access (default local role).

---

## 📋 6 Concrete Manual Test Cases

### 1. M-E01 — Community Vendor Proposal Submission & Admin Queue
> **Concept:** A local fisherman or coastal cook can submit an experience proposal at `/host-with-us`, which appears in the Admin Proposal Queue for review.
- **Manual Actions:**
  1. Open a new tab and go to `http://localhost:3000/host-with-us`.
  2. Fill the proposal form:
     - Name: `Ramesh Tandel`, Phone: `9820099887`, Category: `Food`.
     - Title: `Versova Crab Masala Tasting Feast`.
     - Description: `Freshly cooked mangrove crab in earthen pots with bhakri.`
     - Target Price: `₹1,500`.
  3. Submit the proposal. Verify confirmation toast: *"Proposal submitted successfully"*.
  4. Navigate to `http://localhost:3000/admin` and click the **"Proposals"** tab.
  5. Locate `Ramesh Tandel`'s proposal.
  6. Click **"Approve"**.
- **Pass Assertions:**
  - [ ] Proposal submits cleanly from public form.
  - [ ] Appears in Admin Proposal Queue with pending badge.
  - [ ] Admin approval updates status to `Approved` with coordinator timestamp.
- **Failure Signature:** Form crashes on submit, or proposal fails to appear in admin CRM.

---

### 2. M-E02 — Inventory Stock Management & Low-Stock Warning
> **Concept:** The inventory manager flags items falling below their low-stock threshold and allows instant restocking.
- **Manual Actions:**
  1. In `/admin`, click the **"Inventory"** tab.
  2. Locate **"Raw Mangrove Wild Blossom Honey"**.
  3. Notice current stock count and threshold (e.g. Stock: `50`, Threshold: `5`).
  4. Edit threshold to `60` (higher than current stock).
     - Verify an amber/red **"Low Stock Warning"** badge immediately activates.
  5. Click **"Restock"** and add `50` units.
     - Verify stock updates to `100` and the low-stock warning clears.
- **Pass Assertions:**
  - [ ] Stock threshold alert dynamically triggers when `stock <= threshold`.
  - [ ] Restocking increments inventory count without data loss.
- **Failure Signature:** Inventory updates do not persist, or low stock alerts fail to display.

---

### 3. M-E03 — Places & Venues Manager: Google Maps URL Integration
> **Concept:** Admins can paste a direct Google Maps share link (`https://maps.app.goo.gl/...`) without manually calculating latitude and longitude.
- **Manual Actions:**
  1. In `/admin`, click the **"Venues & Places"** tab.
  2. Click **"Add Place"** (or edit an existing place).
  3. In the Maps URL input, paste a share link:
     `https://maps.app.goo.gl/TfKpsZPCyisNzSXv6`
  4. Save the venue.
  5. Inspect the venue card: verify the link is active and clickable to open the exact Google Maps location.
- **Pass Assertions:**
  - [ ] Direct Google Maps share URLs are accepted cleanly.
  - [ ] Admins are not forced to look up and type raw lat/long coordinates.
- **Failure Signature:** Form rejects Google Maps share URL or demands decimal coordinates.

---

### 4. M-E04 — Staff Role-Based Access Control (RBAC)
> **Concept:** MatsyaMart supports distinct staff roles (`admin`, `station_manager`, `lead_guide`, `volunteer`) with specific permission restrictions.
- **Manual Actions:**
  1. In `/admin`, click the **"Staff Roles"** tab.
  2. Inspect the current user's active role.
  3. Temporarily switch role to **"Lead Guide"**.
  4. Observe the admin dashboard tabs:
     - Verify sensitive tabs (like Payouts, Coupons, Loyalty Config) are hidden or read-only.
     - Verify Guide can still view Guest Manifest and attendance.
  5. Switch back to **"Admin"**.
- **Pass Assertions:**
  - [ ] Non-admin roles are prevented from editing payouts or system settings.
  - [ ] Manifest and gate controls remain accessible to guides.
- **Failure Signature:** Lower privilege roles can delete listings or modify bank accounts.

---

### 5. M-E05 — Refunds & Slot Capacity Recovery
> **Concept:** Processing a refund for an experience order marks the order refunded and automatically restores the booked capacity back to the slot.
- **Manual Actions:**
  1. In `/admin`, click the **"Refunds & Orders"** tab.
  2. Locate an experience order with `2` booked spots.
  3. Note the slot's current booked count (e.g. `12 / 15 spots booked`).
  4. Click **"Process Full Refund"**.
  5. Inspect the slot capacity:
     - Verify booked count drops by 2 (e.g. `10 / 15 spots booked`).
     - Order status updates to `refunded`.
- **Pass Assertions:**
  - [ ] Order status updates to `refunded`.
  - [ ] Capacity is restored immediately to the session.
- **Failure Signature:** Refund processes but slot remains blocked with old capacity.

---

### 6. M-E06 — Offline Resilience & LocalStorage Schema Safety
> **Concept:** When network disconnects or Supabase is unreachable, MatsyaMart operates 100% reliably off client storage with zero white-screen crashes.
- **Manual Actions:**
  1. Open Chrome DevTools (`F12` / `Inspect`).
  2. Open the **Network** tab and toggle throttling to **"Offline"**.
  3. Navigate between `/`, `/admin`, and `/host`.
  4. Add an item to cart and open checkout modal.
  5. Re-enable network (**"Online"**).
- **Pass Assertions:**
  - [ ] App continues to render from local state without blank screens.
  - [ ] Cart drawer, admin tables, and host scanner function offline.
- **Failure Signature:** App crashes with unhandled network exception or white screen.
