# MatsyaMart QA — Batch B: Checkout Engine & Payment Edge Cases

**Target:** Checkout Modal & Transaction Processing on Production  
**Platform:** Desktop Browser (`https://matsyamart.com/`) & Mobile Viewport  
**Governing Ledger:** [`MATSYAMART_QA_MASTER.md`](MATSYAMART_QA_MASTER.md)  
**Status:** Queued (Ready after Batch A)  

---

## 🛠️ Prerequisites

1. Have items in your cart (from Batch A or by adding any item).
2. Click **"Proceed to Checkout"** in the Cart Drawer to open the Checkout Modal.

---

## 📋 6 Concrete Manual Test Cases

### 1. M-B01 — Pure Physical Goods Checkout (No Event Slots Prompt)
> **Concept:** When checking out physical products only (e.g. Honey), shipping address is required, but attendee seat names and maritime safety fields must be completely hidden.
- **Manual Actions:**
  1. Add only **Raw Mangrove Honey** to cart.
  2. Click **"Proceed to Checkout"**.
  3. Inspect modal sections:
     - Customer details: Name, Email, Phone.
     - Shipping Address: Address Line 1, Landmark (optional), City, State, Pincode.
     - **Verify:** NO "Maritime Safety", NO "Attendee Seats", NO boat reporting time fields are shown.
  4. Attempt to submit with an empty Address: Verify form prompts for required address.
  5. Fill test address: `Flat 102, Beach Road`, City: `Mumbai`, State: `Maharashtra`, Pincode: `400061`.
- **Pass Assertions:**
  - [ ] Shipping address fields are displayed and required.
  - [ ] Experience-only fields (seats, maritime safety) are absent.
  - [ ] Pay button reads: *"Pay ₹650 via UPI / Cards"*.
- **Failure Signature:** Experiential boarding pass questions appear for physical goods.

---

### 2. M-B02 — Experience Checkout: Discrete Seats & Optional Maritime Emergency Contact
> **Concept:** Booking an experience for 2 seats prompts for both attendee names and shows Maritime Safety as explicitly optional.
- **Manual Actions:**
  1. Add **2 spots** for any Experience (e.g. *Dawn Walk*).
  2. Open Checkout Modal.
  3. Scroll to **"Maritime Safety & Emergency Contact"**:
     - Verify header reads: `Maritime Safety & Emergency Contact (Optional)`.
     - Verify input label reads: `Emergency Contact Name & Phone (Optional for boat/harbor manifests)`.
  4. Leave the emergency contact completely BLANK.
  5. Inspect **"Attendee Seats per Experience"**:
     - Verify there are 2 seat inputs: `Seat #1 Guest Name` and `Seat #2 Guest Name`.
  6. Fill Seat #1: `Aryan Panchal`, Seat #2: `Kunal Sharma`.
- **Pass Assertions:**
  - [ ] Form submits successfully even when Emergency Contact is left blank (truly optional).
  - [ ] Discrete seat attendee names are captured for each ticket.
- **Failure Signature:** Form blocks submission claiming emergency contact is required.

---

### 3. M-B03 — Coupon Code Mechanics (`COASTAL10` vs Invalid Codes)
> **Concept:** Entering a valid promo code deducts the correct percentage discount; invalid codes display an inline error without wiping cart state.
- **Manual Actions:**
  1. In Checkout Modal, locate the coupon code input.
  2. Enter an invalid code: `FAKEDISCOUNT99` and click **"Apply"**.
     - Verify error toast/message: *"Invalid or expired coupon code"*.
  3. Enter valid code: `COASTAL10` and click **"Apply"**.
     - Verify success message: *"Coupon COASTAL10 applied! (10% off)"*.
  4. Check the order summary math:
     - Subtotal: e.g. `₹2,400`
     - Discount: `- ₹240`
     - Final Total: `₹2,160`
  5. Click **"Remove"** on the applied coupon badge.
     - Verify discount is revoked and total returns to `₹2,400`.
- **Pass Assertions:**
  - [ ] Invalid coupons are rejected safely without crashing.
  - [ ] `COASTAL10` deducts exactly 10%.
  - [ ] Coupon can be removed cleanly.
- **Failure Signature:** Math does not update, or discount exceeds 100%.

---

### 4. M-B04 — Loyalty Program Points Redemption & Floor Protection
> **Concept:** Redeeming loyalty points applies a rupee deduction but can never drive the final payable amount below ₹0.
- **Manual Actions:**
  1. In Checkout Modal, look for the **"MatsyaMart Coastal Loyalty"** section.
  2. Enter phone number with seed points (e.g. `9920477158`).
  3. If points are available, enter a redemption amount.
  4. Verify discount appears as *"Loyalty Points Redeemed"*.
  5. Verify final payable amount is properly calculated and floored at `>= ₹0`.
- **Pass Assertions:**
  - [ ] Points deduction reflects in total amount paid.
  - [ ] Points balance updates accurately.
- **Failure Signature:** Points redemption allows negative totals or errors out.

---

### 5. M-B05 — Payment Simulation & Double-Submit Lockout
> **Concept:** Clicking the Pay button locks the button with `Securing Spot...` / `Placing Order...` to prevent duplicate charges or double orders.
- **Manual Actions:**
  1. Fill required checkout fields (Name: `Aryan Panchal`, Phone: `9920477158`, Email: `test@matsyamart.in`).
  2. Rapidly double-click the **"Pay via UPI / Cards"** button.
  3. Observe button state:
     - For Experiences: Button changes to `Securing Spot...` with spinning icon and `disabled={true}`.
     - For Goods: Button changes to `Placing Order...` and `disabled={true}`.
  4. Wait ~1 second for demo sandbox transaction to resolve.
  5. Verify browser redirects to `/order/confirmation/MM-...`.
- **Pass Assertions:**
  - [ ] Double-clicking does NOT create duplicate orders.
  - [ ] Redirects cleanly to the confirmation route with generated reference (`MM-EXP-...` or `MM-PRD-...`).
- **Failure Signature:** Multiple rapid clicks spawn multiple orders in DataContext/localStorage.

---

### 6. M-B06 — Mixed Cart Checkout (Experience + Honey in Single Order)
> **Concept:** Checking out with both an Experience and a physical product captures both shipping address AND attendee seats.
- **Manual Actions:**
  1. Add **1 spot** for *Sassoon Docks Dawn Heritage Walk* (`₹1,200`).
  2. Add **1 jar** of *Raw Mangrove Wild Blossom Honey* (`₹650`).
  3. Total: `₹1,850`.
  4. Open Checkout Modal.
  5. Verify BOTH sections appear:
     - Shipping address is present (for the honey).
     - Attendee seats & Maritime safety are present (for the walk).
  6. Fill all fields and complete payment.
  7. Verify confirmation page loads.
- **Pass Assertions:**
  - [ ] Mixed checkout captures both physical shipping and attendee details.
  - [ ] Order ref has standard prefix and full combined total (`₹1,850`).
- **Failure Signature:** One category's fields overwrite or suppress the other.
