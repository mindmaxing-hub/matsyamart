# MatsyaMart (`matsyamart.com`)

### Coastal Experiences & Community Marketplace — Bhoomiputra Foundation

> **Platform Mission:** Dedicated community-led experiential tourism and artisan goods marketplace built for indigenous coastal communities (Koliwadas, Gaothans, and mangrove ecosystems across Mumbai, Thane, Navi Mumbai, and the Konkan coast).
>
> **Zero-Middlemen Payouts:** 100% direct-to-community revenue model.

---

## 🌊 Architecture & Technology Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + Lucide Icons + React Router.
- **Backend & Database:** Supabase (`@supabase/supabase-js`) PostgreSQL with Row-Level Security (RLS) & atomic slot reservation functions.
- **Client-Side Payments:** Razorpay Browser Modal (`checkout.razorpay.com/v1/checkout.js`) with instant interactive test sandbox simulation.
- **Digital Passes:** Dynamic QR code generation, verified ticket references (`MM-EXP-2026-XXXX`), unlocked secret coordinates, and WhatsApp sharing.
- **Admin Dashboard:** Passcode-gated (`matsya2026`) attendee manifest with CSV/Print export, recurring weekend batch scheduler, and vendor proposal queue.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Navigate to matsyamart directory
cd "matsyamart"

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit `http://localhost:3000` to interact with the platform immediately.

---

## 🛠️ Deploying to Lovable (Two-Way Sync)

Because this repository strictly follows Lovable's client-side build rules (React + Vite + Tailwind + `@supabase/supabase-js` + browser Razorpay):

1. Initialize a Git repository inside `matsyamart/`:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for MatsyaMart platform"
   ```
2. Create a new GitHub repository (e.g. `matsyamart`) and push your code:
   ```bash
   git remote add origin https://github.com/<your-username>/matsyamart.git
   git branch -M main
   git push -u origin main
   ```
3. In **Lovable.dev**:
   - Create a new project.
   - Click the **GitHub Connect** button and link your GitHub repository.
   - Lovable will compile the live preview and maintain real-time two-way synchronization.
4. Custom Domain:
   - In Lovable Project Settings &rarr; Domains &rarr; Add `matsyamart.com`.

---

## ⚡ Deploying to Vercel / Netlify / Cloudflare Pages

This project is standard Vite SPA:

- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

On Vercel, simply import the GitHub repository and click **Deploy**.

---

## 🗄️ Supabase PostgreSQL Setup (Optional Live Sync)

MatsyaMart works offline and in preview mode with rich pre-seeded data right out of the box. To connect a live Supabase backend:

1. Create a project on [supabase.com](https://supabase.com).
2. Go to **SQL Editor** &rarr; Paste and execute `supabase/migrations/20260928000000_matsyamart_schema.sql`.
3. Copy your **Project URL** and **Anon Public Key**.
4. In your `.env` (or Lovable / Vercel Environment Variables):
   ```env
   VITE_SUPABASE_URL="https://<your-project-id>.supabase.co"
   VITE_SUPABASE_ANON_KEY="<your-anon-key>"
   ```

---

## 💳 Razorpay Gateway Configuration

1. In `.env`:
   ```env
   VITE_RAZORPAY_KEY_ID="rzp_test_YourKeyHere"
   ```
2. If left empty, MatsyaMart automatically activates its **Interactive Sandbox Simulator**, allowing you to test the complete booking, capacity decrement, and digital pass generation flows without entering banking credentials.

---

## 🛡️ Admin Portal Access

- URL: `/admin`
- Default Coordinator Passcode: `matsya2026`
- Features: Live Attendee Manifests, CSV Export, Printable Guide Briefings, 4-Week Weekend Slot Generator, Community Vendor Proposal Moderation.
