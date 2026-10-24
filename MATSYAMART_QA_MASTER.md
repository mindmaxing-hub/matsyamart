# MatsyaMart QA Master — Living Checklist & Continuation Ledger

**Target Environment:** Production Live (`https://matsyamart.com`)  
**Architecture:** TanStack Start (SSR) + Nitro + Vite + React + Tailwind + Supabase Fallback  
**Last Updated:** 24 October 2026  
**Status:** In Progress (Batch-Wise Manual QA on Production)

---

## 🧭 Master Progress Matrix

| Batch | Domain Focus | Total Tests | Status | Unresolved Defects |
| :--- | :--- | :---: | :---: | :---: |
| **A** | **Catalog, Discovery & Cart Mechanics** | 6 | 🟡 Live on `matsyamart.com` | 0 |
| **B** | **Checkout Engine & Payment Edge Cases** | 6 | ⚪ Queued | 0 |
| **C** | **Category Passes & Delivery Tracker** | 6 | ⚪ Queued | 0 |
| **D** | **Cross-Device QR & Host Gate Scanner** | 6 | ⚪ Queued | 0 |
| **E** | **Admin Operations CRM & Vendor Proposals** | 6 | ⚪ Queued | 0 |
| **AUTO**| **Parallel Automated QA Harness (`vitest`)** | 25+ | 🟢 Passing (62/62 Tests) | 0 |

---

## 📋 Batch Runbook Links

1. [BATCH_A_TESTS.md](file:///Users/aryupanchal/Downloads/bhoomiputra%20material/matsyamart/BATCH_A_TESTS.md) — Catalog, Discovery, Slot Picker & Cart Line Keying
2. [BATCH_B_TESTS.md](file:///Users/aryupanchal/Downloads/bhoomiputra%20material/matsyamart/BATCH_B_TESTS.md) — Checkout Validation, Coupons, Loyalty & Payment Simulation
3. [BATCH_C_TESTS.md](file:///Users/aryupanchal/Downloads/bhoomiputra%20material/matsyamart/BATCH_C_TESTS.md) — Category Passes (Food, Walk, Workshop) & Shopify Goods Tracker
4. [BATCH_D_TESTS.md](file:///Users/aryupanchal/Downloads/bhoomiputra%20material/matsyamart/BATCH_D_TESTS.md) — Cross-Device QR Rehydration, Host Gate Auth & Check-In
5. [BATCH_E_TESTS.md](file:///Users/aryupanchal/Downloads/bhoomiputra%20material/matsyamart/BATCH_E_TESTS.md) — Admin CRM (14 Tabs), Maps URL Integration & Vendor Onboarding

---

## 🛠️ Global Prerequisites for Manual Testing

1. **Target Site:**
   Open **[https://matsyamart.com](https://matsyamart.com)** directly on your desktop or phone browser.
2. **Recommended Browsers:**
   - Desktop: Google Chrome / Safari / Edge (`https://matsyamart.com`)
   - Mobile Phone: Native Camera + Safari (iOS) / Chrome (Android) for cross-device QR scanning
3. **Data State Reset (Optional):**
   - If you ever want to reset your local cart or test passes to a fresh state, open console or clear site data for `matsyamart.com`. Listings, categories, and slots will instantly re-seed from the production edge.
