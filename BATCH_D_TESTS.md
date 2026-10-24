# MatsyaMart QA — Batch D: Cross-Device QR & Host Gate Scanner

**Target:** Gate Scanning, Host Authentication & Mobile Cross-Device Flow  
**Platform:** Mobile Phone Camera + Desktop Browser (`https://matsyamart.com/host`)  
**Governing Ledger:** [`MATSYAMART_QA_MASTER.md`](MATSYAMART_QA_MASTER.md)  
**Status:** Queued (Ready after Batch C)  

---

## 🛠️ Prerequisites

1. Have a confirmed experience pass displayed on a desktop computer screen on `https://matsyamart.com`.
2. Have a mobile phone with a camera ready to scan QR codes.
3. Open `https://matsyamart.com/host` on your browser to test the Host Portal.

---

## 📋 6 Concrete Manual Test Cases

### 1. M-D01 — Cross-Device QR Code Scanning ("Order Pass Not Found" Fix)
> **Concept:** Scanning the QR code displayed on a desktop screen with a mobile phone camera must decode the embedded `?p=...` payload and display the authentic pass immediately on the phone, even with an empty local storage.
- **Manual Actions:**
  1. Open a verified experience pass on your desktop screen.
  2. Point your physical mobile phone camera at the QR code on the desktop monitor.
  3. Tap the detected URL prompt on the phone (e.g. `https://matsyamart.com/order/confirmation/MM-EXP-...?p=...`).
  4. Alternatively, open an Incognito / Private window on desktop and paste the full QR URL containing `?p=...`.
  5. Observe the loaded page.
- **Pass Assertions:**
  - [ ] Page immediately renders the authentic Boarding Pass with guest name, date, and venue.
  - [ ] Does **NOT** display `"Order Pass Not Found"`.
  - [ ] Order is automatically saved into the mobile device's local storage for subsequent visits.
- **Failure Signature:** Mobile phone displays "Order Pass Not Found" or crashes on URL decode.

---

### 2. M-D02 — Host Portal Phone SMS OTP Authentication
> **Concept:** The Host Attendance Portal (`/host`) requires authentication by an authorized partner mobile number; unauthorized numbers are rejected.
- **Manual Actions:**
  1. Navigate to `https://matsyamart.com/host`.
  2. Enter an unauthorized phone number: `9111111111` and click **"Send Login OTP"**.
     - Verify error: *"This phone number is not bound to an authorized MatsyaMart host account"*.
  3. Enter an authorized host phone number: `9920477158` (or `7666511511`) and click **"Send Login OTP"**.
     - Verify success toast: *"6-digit OTP dispatched via SMS"*.
  4. Enter OTP: `123456` and submit.
     - Verify portal welcomes the host (e.g. *Capt. Dilip Koli* or *Anusaya Tai Koli*) and unlocks the scanner.
- **Pass Assertions:**
  - [ ] Unauthorized phone numbers cannot access gate scanner.
  - [ ] Authorized host logs in smoothly and sees their specific offering manifests.
- **Failure Signature:** Anyone can access host gate without phone check, or valid host phone is blocked.

---

### 3. M-D03 — Host Portal QR Code Admission & Payload Ingestion
> **Concept:** Scanning or pasting a pass reference (or full `?p=` URL) into the host scanner validates the pass and admits the guest.
- **Manual Actions:**
  1. In the Host Portal, locate the **"Manual Pass Reference"** input.
  2. Enter the reference of a confirmed booking (e.g. `MM-EXP-...`) OR paste the full URL with `?p=...`.
  3. Click **"Verify"**.
  4. Observe the admission result card:
     - Badge displays green: `PASS VERIFIED`.
     - Guest name, total booked seats, and arrival timestamp appear.
- **Pass Assertions:**
  - [ ] Pass is verified in real-time.
  - [ ] If scanned via camera or pasted with `?p=...`, order is automatically ingested into the host ledger even if created on another device.
- **Failure Signature:** Host portal reports "Pass not found in verified guest ledger".

---

### 4. M-D04 — Discrete Single-Seat Check-In & Arrived Counter
> **Concept:** For a 2-person booking, the host can admit Seat #1 first, and Seat #2 later when they arrive.
- **Manual Actions:**
  1. Inspect the admitted order details in the host portal.
  2. Locate the **"Guest Manifest & Seat Check-In"** list:
     - `Seat #1: Aryan Panchal` — [ Admit Seat ]
     - `Seat #2: Kunal Sharma` — [ Admit Seat ]
  3. Click **"Admit Seat"** for Seat #1 only.
     - Verify Seat #1 updates to green check: *Admitted at [Time]*.
     - Verify status banner updates: `1/2 seats arrived`.
  4. Click **"Admit Seat"** for Seat #2.
     - Verify both seats are now checked in (`2/2 seats arrived`).
- **Pass Assertions:**
  - [ ] Individual seats can be admitted independently.
  - [ ] Total arrived count increments accurately.
- **Failure Signature:** Checking in one seat marks all seats arrived, or counter fails to increment.

---

### 5. M-D05 — Undo Seat Check-In & Already Admitted Safety State
> **Concept:** If a seat was checked in by mistake, the host can undo check-in. If all seats are arrived, scanning again displays an explicit warning.
- **Manual Actions:**
  1. On an admitted seat, click the **"Undo"** icon button.
     - Verify seat returns to unadmitted state.
  2. Re-admit all seats so all `2/2` seats are checked in.
  3. Enter the pass reference again in the scanner and click **"Verify"**.
  4. Observe result card:
     - Status displays: `ALREADY ADMITTED: All 2 seats previously checked in`.
     - Timestamp displays original check-in time.
- **Pass Assertions:**
  - [ ] Undo reverses check-in cleanly.
  - [ ] Re-scanning an already admitted pass prevents duplicate entry.
- **Failure Signature:** Undo button is missing or re-scanning resets check-in state.

---

### 6. M-D06 — Canonical Manifest CSV Export
> **Concept:** The host can download the complete attendance manifest as a maritime-compliant CSV.
- **Manual Actions:**
  1. In the Host Portal, scroll to the **"Session Manifest"** section.
  2. Use the session dropdown to select a specific date or *"All Sessions"*.
  3. Click **"Download Manifest CSV"**.
  4. Open the downloaded CSV file in Excel, Numbers, or text editor.
  5. Verify columns exist:
     - `Pass Ref`, `Guest Name`, `Phone`, `Offering`, `Slot Time`, `Seat Index`, `Checked In`, `Emergency Contact`.
- **Pass Assertions:**
  - [ ] CSV downloads immediately without errors.
  - [ ] All attendees and seats are properly listed with check-in status (`YES` / `NO`).
- **Failure Signature:** CSV is empty, missing columns, or download fails.
