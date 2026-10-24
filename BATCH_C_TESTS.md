# MatsyaMart QA — Batch C: Category Passes & Shopify Delivery Portal

**Target:** Order Confirmation Page (`/order/confirmation/$orderRef`)  
**Platform:** Desktop & Mobile Browser  
**Governing Ledger:** [`MATSYAMART_QA_MASTER.md`](MATSYAMART_QA_MASTER.md)  
**Status:** Queued (Ready after Batch B)  

---

## 🛠️ Prerequisites

1. Have completed test orders from Batch B or navigate directly to test references:
   - Food Booking: `/order/confirmation/MM-EXP-FOOD-TEST`
   - Walk Booking: `/order/confirmation/MM-EXP-WALK-TEST`
   - Workshop Booking: `/order/confirmation/MM-EXP-WORKSHOP-TEST`
   - Physical Goods Order: `/order/confirmation/MM-PRD-TEST`

---

## 📋 6 Concrete Manual Test Cases

### 1. M-C01 — Food Pass Verification (Midnight Navy Theme)
> **Concept:** Booking an authentic dining feast (e.g. *Versova Koli Seafood Thali Feast*) renders the Food pass theme matching the user mockup.
- **Manual Actions:**
  1. Book a Food feast experience or open a Food confirmation page.
  2. Inspect the pass card:
     - **Top Banner:** Must show the banana leaf seafood feast photo with the white MatsyaMart logo and the **`Food`** pill badge (`/pass-header-food.png`).
     - **Card Background:** Deep Midnight Ocean Navy (`#1c3554`).
     - **Headline:** *"We are happy to host you! Yay!"* in white serif.
     - **Experience Title:** Warm Amber Gold (`#e3a157`).
     - **QR Code:** Centered white box with dark navy QR modules (`#1c2f44`).
     - **Venue:** Default reads *Versova Gaothan Dining Courtyard, Andheri West, Mumbai* (NOT Sassoon Docks!).
     - **Host Support WhatsApp:** In warm amber gold with pre-filled message.
- **Pass Assertions:**
  - [ ] Card matches mockup #1 pixel-for-pixel in colors, header, and typography.
  - [ ] Venue resolves accurately to Versova Gaothan courtyard.
- **Failure Signature:** Card renders in brown terracotta, shows "Walk" badge, or defaults to Sassoon Docks.

---

### 2. M-C02 — Walk Pass Verification (Seafoam Teal Theme & High-Contrast Title)
> **Concept:** Booking a walking trail (e.g. *Sassoon Docks Dawn Heritage Walk*) renders the Walk pass theme with deep marine navy title for high outdoor contrast.
- **Manual Actions:**
  1. Book a Walk experience or open a Walk confirmation page.
  2. Inspect the pass card:
     - **Top Banner:** Must show the coastal beach hiker photo with the white MatsyaMart logo and the **`Walk`** pill badge (`/pass-header-walk.png`).
     - **Card Background:** Seafoam Ocean Slate Teal (`#5f98a0`).
     - **Headline:** *"We are happy to host you! Yay!"* in white serif.
     - **Experience Title:** Deep Marine Navy (`#1b2b49` — ultra-sharp legibility on the teal background).
     - **QR Code:** White box with deep ocean teal QR modules (`#0c3a4b`).
     - **Venue:** *Historic Sassoon Docks Clock Tower Arch, Colaba, Mumbai*.
     - **Host Support WhatsApp:** High-contrast crisp white (`#ffffff`).
- **Pass Assertions:**
  - [ ] Card matches mockup #2 pixel-for-pixel.
  - [ ] Title is dark marine navy (NOT washed out gold).
- **Failure Signature:** Card renders in navy or brown, or title is unreadable.

---

### 3. M-C03 — Workshop Pass Verification (Espresso Terracotta Theme)
> **Concept:** Booking a craft workshop (e.g. *Mahim Bay Net-Weaving Guild*) renders the Workshop pass theme.
- **Manual Actions:**
  1. Book a Workshop experience or open a Workshop confirmation page.
  2. Inspect the pass card:
     - **Top Banner:** Must show the aerial turquoise beach surf photo with the white MatsyaMart logo and the **`Workshop`** pill badge (`/pass-header-workshop.png`).
     - **Card Background:** Deep Espresso Terracotta (`#2b120c`).
     - **Headline:** *"We are happy to host you! Yay!"* in white serif.
     - **Experience Title:** Warm Amber Gold (`#e3a157`).
     - **QR Code:** White box with dark espresso QR modules (`#260e03`).
     - **Venue:** *Mahim Bay Net-Weaving Guild, Mahim West, Mumbai*.
- **Pass Assertions:**
  - [ ] Card matches mockup #3 pixel-for-pixel.
  - [ ] Venue resolves to Mahim Bay.
- **Failure Signature:** Card renders with wrong banner or wrong category pill.

---

### 4. M-C04 — Physical Goods Delivery Tracker (Shopify-Style Dispatch Portal)
> **Concept:** Purchasing physical goods (e.g. Raw Mangrove Honey) displays the Shopify-style delivery tracker and NEVER an event admission boarding pass.
- **Manual Actions:**
  1. Complete an order containing ONLY **Raw Mangrove Honey**.
  2. Inspect the confirmation page:
     - **Top Banner:** Green badge *"Order Confirmed • Hand-Packed at Source"*.
     - **Personalized Greeting:** *"Thank you, [Name]! Your order supports indigenous coastal artisans..."*.
     - **Order Ref:** Pill with click-to-copy button (`MM-PRD-...`).
     - **5-Stage Stepper:**
       1. Order Placed (Checked • Green)
       2. Hand-Packed by Collective (Active • Gold animated pulse)
       3. Dispatched from Coastal Hub (Upcoming • Est. 24h)
       4. Out for Delivery (Upcoming)
       5. Delivered (Upcoming • Est. 3-5 business days)
     - **Shipping Card:** Customer address, city, state, pincode, carrier (*Coastal Express Courier*).
     - **Package Breakdown:** Honey jar image, *Madh Island Artisanal Collective*, weight *500g*, quantity, price.
     - **WhatsApp Alerts Button:** Direct link opening WhatsApp to track dispatch.
     - **Verify:** NO "Admit 2 Persons", NO "Reporting Time 6:30 PM", NO Sassoon Docks!
- **Pass Assertions:**
  - [ ] Boarding pass is 100% absent for physical goods.
  - [ ] 5-stage delivery stepper displays active progress.
  - [ ] Copy button copies order reference to clipboard.
- **Failure Signature:** Customer buys honey and gets an event boarding pass telling them to report to a boat dock.

---

### 5. M-C05 — Mixed Order Dual-View Layout
> **Concept:** An order containing BOTH an experience and a physical product renders Part 1 (Boarding Pass) on top, and Part 2 (Delivery Tracker) below.
- **Manual Actions:**
  1. Complete a mixed order (Walk + Honey).
  2. Inspect the confirmation page:
     - Top section displays badge: `Part 1 · Event Admission Boarding Pass` followed by the verified Boarding Pass card.
     - Bottom section displays badge: `Part 2 · Physical Goods Delivery Tracker` followed by the Shopify-style delivery portal.
- **Pass Assertions:**
  - [ ] Both components render cleanly in vertical succession.
  - [ ] The customer has their boarding pass for the event AND their shipment tracking for the goods.
- **Failure Signature:** One component completely overwrites or displaces the other.

---

### 6. M-C06 — GST Tax Invoice Modal & Print Isolation
> **Concept:** Clicking "GST Tax Invoice" opens a formal invoice with 18% inclusive GST calculations and clean print isolation.
- **Manual Actions:**
  1. Click **"GST Tax Invoice"** button on the confirmation page.
  2. Verify invoice header: *Kolibaba Seafood Inc · In strategic partnership with Bhoomiputra Foundation*.
  3. Verify math:
     - For total `₹2,400`: Taxable Value = `₹2,033.90`, CGST (9%) = `₹183.05`, SGST (9%) = `₹183.05`.
  4. Press `Cmd + P` / `Ctrl + P` to trigger Print preview:
     - Verify background controls, navbar, and buttons are hidden.
     - Only the clean invoice / pass card appears on the printable sheet.
- **Pass Assertions:**
  - [ ] GST is mathematically exact (18% inclusive).
  - [ ] Print preview isolates the invoice cleanly without extraneous UI elements.
- **Failure Signature:** GST math is incorrect (e.g. adding 18% on top of an inclusive price) or print preview shows navbar and footer clutter.
