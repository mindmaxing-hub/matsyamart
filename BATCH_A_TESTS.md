# MatsyaMart QA — Batch A: Catalog, Discovery & Cart Mechanics

**Target:** Public Consumer Experience on Live Production  
**Platform:** Desktop Browser (`https://matsyamart.com/`) & Mobile Viewport  
**Governing Ledger:** [`MATSYAMART_QA_MASTER.md`](MATSYAMART_QA_MASTER.md)  
**Status:** Ready for Physical Manual Testing on Production  

---

## 🛠️ Prerequisites

1. Open **`https://matsyamart.com/`** in Chrome, Safari, or mobile browser.
2. Open Cart Drawer by clicking the cart icon in navbar to ensure it starts empty (or clear cart if items exist).

---

## 📋 6 Concrete Manual Test Cases

### 1. M-A01 — Category Pillar Filtering
> **Concept:** Clicking the category filter pills (`All`, `Walks`, `Food`, `Workshops`, `Goods`) must immediately filter the catalog grid without layout shift or page reloads.
- **Manual Actions:**
  1. Navigate to `https://matsyamart.com/`.
  2. Click the **"Food"** pill filter.
  3. Verify only dining/thali offerings appear (e.g. *Versova Koli Seafood Thali Feast*).
  4. Click the **"Goods"** pill filter.
  5. Verify physical pantry goods appear (e.g. *Raw Mangrove Wild Blossom Honey*, *Miniature Boat*).
  6. Click **"All"** to restore the full catalog.
- **Pass Assertions:**
  - [ ] Clicking each pill immediately filters the grid with zero full-page reload.
  - [ ] No blank cards, broken images, or missing titles.
  - [ ] Active filter pill is highlighted in warm gold (`#e3a157`).
- **Failure Signature:** Grid remains static, displays wrong offerings, or shows 0 items when offerings exist.

---

### 2. M-A02 — Experience Detail & Dynamic Slot Booking Sheet
> **Concept:** On an experience detail page, selecting a date and slot must dynamically reflect remaining capacity and update the booking CTA.
- **Manual Actions:**
  1. Click on **"Versova Coastal Heritage & Dawn Fish Auction Trail"** (or `/experience/versova-coastal-heritage-dawn-fish-auction-trail`).
  2. Scroll down to the booking widget / slot sheet.
  3. Select an available weekend date.
  4. Select a session time (e.g. *6:30 AM – 8:30 AM*).
  5. Adjust quantity from `1` to `2`.
  6. Verify the subtotal calculates accurately (`₹1,200 × 2 = ₹2,400`).
  7. Click **"Book 2 Spots"** / **"Add to Cart"**.
- **Pass Assertions:**
  - [ ] Slot sheet opens cleanly and displays host bio (*Anusaya Tai Koli* or guide).
  - [ ] Capacity counter displays spots remaining.
  - [ ] Subtotal updates dynamically when quantity changes.
  - [ ] Cart drawer slides in automatically showing the booked experience with date and time.
- **Failure Signature:** Date selector is unclickable, subtotal fails to calculate, or adding to cart throws an error.

---

### 3. M-A03 — Physical Product Detail & Weight Selection
> **Concept:** Physical products (pantry goods) must display net weight, artisanal collective attribution, and stock badge without any slot booking sheet.
- **Manual Actions:**
  1. Click on **"Raw Mangrove Wild Blossom Honey (500g)"** (or `/product/raw-mangrove-wild-blossom-honey-500g`).
  2. Verify the collective badge shows **"Madh Island Artisanal Collective"**.
  3. Verify weight is displayed as **"500g"** (or grams badge).
  4. Verify stock status badge shows **"In Stock"** (or remaining jar count).
  5. Notice there is **NO date selector or slot picker** (because it is physical goods).
  6. Click **"Add to Cart"**.
- **Pass Assertions:**
  - [ ] Product page does NOT render an experience slot picker or maritime itinerary.
  - [ ] Displays artisan collective origin clearly.
  - [ ] Cart drawer opens and shows the Honey with correct price (e.g. `₹650`).
- **Failure Signature:** Product page attempts to ask for event dates, shows "Dawn Heritage", or fails to add to cart.

---

### 4. M-A04 — Cart Line-Item Keying Integrity
> **Concept:** Booking the SAME experience for two DIFFERENT dates must create TWO distinct line items in the cart. Adding the same physical good must simply increment quantity.
- **Manual Actions:**
  1. Open Cart Drawer. Clear any existing items.
  2. Add **1 spot** for *Sassoon Docks Dawn Heritage Walk* on **Saturday 25 October**.
  3. Add **1 spot** for *Sassoon Docks Dawn Heritage Walk* on **Sunday 26 October**.
  4. Inspect Cart Drawer: Verify there are **2 separate rows**, each showing its specific slot date.
  5. Now add **Raw Mangrove Honey**.
  6. Go back and click **"Add to Cart"** on Raw Mangrove Honey a second time.
  7. Inspect Cart Drawer: Verify Honey is **1 row with Qty = 2** (NOT duplicated rows).
- **Pass Assertions:**
  - [ ] Experiences on different dates/sessions never overwrite each other.
  - [ ] Physical goods increment quantity on the same row.
  - [ ] Cart total accurately sums: `(Walk Day 1) + (Walk Day 2) + (Honey × 2)`.
  - [ ] Increment `+`, decrement `-`, and remove trash buttons work smoothly.
- **Failure Signature:** Booking two different dates merges them into one row, losing the scheduled slot start.

---

### 5. M-A05 — Wishlist Drawer & Local State Persistence
> **Concept:** Clicking the heart icon on any card adds it to the Wishlist drawer and persists across browser refreshes.
- **Manual Actions:**
  1. From Home Page, click the heart icon on any 2 cards.
  2. Open the Wishlist drawer from the navbar (heart icon).
  3. Verify both items appear with image, title, and price.
  4. Refresh the browser page (`F5` or `Cmd + R`).
  5. Re-open Wishlist drawer.
- **Pass Assertions:**
  - [ ] Heart icon toggles filled warm gold when active.
  - [ ] Both wishlisted items persist after full page refresh.
  - [ ] "Move to Cart" button in wishlist moves the item to Cart Drawer.
- **Failure Signature:** Refreshing the page wipes the wishlist to empty.

---

### 6. M-A06 — Google Maps Directions Link from Catalog Card
> **Concept:** Experience cards and detail pages contain a "Click for Directions" or location link that opens authentic Google Maps.
- **Manual Actions:**
  1. On the home page or experience detail page, locate the meeting point / location name (e.g. *Sassoon Docks* or *Versova Jetty*).
  2. Click the map pin or location link.
  3. Verify it opens Google Maps in a new tab with the coordinates or verified location query.
- **Pass Assertions:**
  - [ ] Opens in a new tab (`target="_blank"` with `rel="noopener noreferrer"`).
  - [ ] URL is a valid Google Maps link (`https://www.google.com/maps/...`).
- **Failure Signature:** Link is dead (`href="#"`), opens in same tab, or gives 404.
