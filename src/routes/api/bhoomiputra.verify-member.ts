import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

// In-memory sliding window rate limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15; // 15 attempts per minute per IP

function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

// Foundation Verified Member Directory (Offline/Seed registry for high availability)
interface VerifiedMemberRecord {
  id: string;
  name: string;
  tier: string;
  settlement: string;
  phone?: string;
}

const VERIFIED_SEEDS: VerifiedMemberRecord[] = [
  {
    id: "BH-MMR-061",
    name: "Ashwini Koli",
    tier: "Active Member",
    settlement: "Versova Koliwada",
    phone: "9920477158",
  },
  {
    id: "BH-MMR-062",
    name: "Anusaya Tai Koli",
    tier: "Active Member",
    settlement: "Sassoon Docks",
    phone: "9820044556",
  },
  {
    id: "BH-MMR-063",
    name: "Harshada Koli",
    tier: "Active Member",
    settlement: "Mahim Koliwada",
    phone: "9769011223",
  },
  {
    id: "BH-MMR-064",
    name: "Ramesh Tandel",
    tier: "Host & Community Guide",
    settlement: "Worli Koliwada",
    phone: "9821123456",
  },
  {
    id: "BH-MMR-065",
    name: "Devendra Koli",
    tier: "Active Member",
    settlement: "Bandra Bazar",
    phone: "9819988776",
  },
  {
    id: "BPF-77158",
    name: "Bhoomiputra Patron Member",
    tier: "Lifetime Patron",
    settlement: "Versova Koliwada",
    phone: "9920477158",
  },
  {
    id: "BP-2026-001",
    name: "Aryan Panchal",
    tier: "Founding Member",
    settlement: "Versova",
    phone: "7666511511",
  },
];

export const Route = createFileRoute("/api/bhoomiputra/verify-member")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // 1. Client IP detection for rate limiting
          const clientIp =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            request.headers.get("cf-connecting-ip") ||
            request.headers.get("x-real-ip") ||
            "127.0.0.1";

          if (!checkRateLimit(clientIp)) {
            return Response.json(
              {
                valid: false,
                error:
                  "Too many verification attempts. Please wait 60 seconds before trying again.",
              },
              { status: 429 },
            );
          }

          // 2. Parse & sanitize input
          let memberIdInput = "";
          try {
            const body = await request.json();
            memberIdInput = String(body?.memberId || "").trim();
          } catch {
            return Response.json(
              { valid: false, error: "Invalid JSON payload" },
              { status: 400 },
            );
          }

          if (!memberIdInput || memberIdInput.length < 3) {
            return Response.json(
              {
                valid: false,
                error:
                  "Please enter a valid Bhoomiputra Member ID (e.g. BH-MMR-061) or registered 10-digit phone number.",
              },
              { status: 400 },
            );
          }

          // Strip dangerous characters
          const cleanInput = memberIdInput.replace(/[^a-zA-Z0-9-+_\s]/g, "").trim();
          const cleanUpper = cleanInput.toUpperCase();
          const cleanDigits = cleanInput.replace(/\D/g, "");

          // 3. Check Live Supabase Database if available
          if (supabase) {
            try {
              let query = supabase
                .from("membership_applications")
                .select("id, full_name, phone, status, payment_status, settlement_type, district")
                .limit(1);

              if (cleanDigits.length >= 10) {
                const last10 = cleanDigits.slice(-10);
                query = query.or(`phone.ilike.%${last10}%,id.ilike.%${cleanUpper}%`);
              } else {
                query = query.ilike("id", `%${cleanUpper}%`);
              }

              const { data, error } = await query;
              const record = data?.[0];
              if (!error && record) {
                const isPaidOrApproved =
                  record.payment_status === "paid" ||
                  record.status === "approved" ||
                  record.status === "active";

                if (isPaidOrApproved) {
                  return Response.json({
                    valid: true,
                    member: {
                      id: record.id || cleanUpper,
                      name: record.full_name || "Bhoomiputra Member",
                      tier: "Verified Member",
                      settlement: record.settlement_type || record.district || "Coastal Collective",
                      verifiedAt: new Date().toISOString(),
                    },
                    discount_percent: 15,
                    message: "Bhoomiputra Foundation Membership successfully verified",
                  });
                }
              }
            } catch (dbErr) {
              console.warn("[Bhoomiputra Live Check Warning]", dbErr);
              // Fall through to offline verified registry
            }
          }

          // 4. Check Offline Verified Registry / Seeds
          const seedMatch = VERIFIED_SEEDS.find((s) => {
            if (s.id.toUpperCase() === cleanUpper) return true;
            if (s.phone && cleanDigits.length >= 10 && s.phone.endsWith(cleanDigits.slice(-10))) {
              return true;
            }
            // Allow prefix variations: BH-MMR-061 vs MMR-061 vs 061
            const numPart = s.id.replace(/\D/g, "");
            if (numPart && cleanUpper.includes(numPart) && cleanUpper.includes("MMR")) {
              return true;
            }
            return false;
          });

          if (seedMatch) {
            return Response.json({
              valid: true,
              member: {
                id: seedMatch.id,
                name: seedMatch.name,
                tier: seedMatch.tier,
                settlement: seedMatch.settlement,
                verifiedAt: new Date().toISOString(),
              },
              discount_percent: 15,
              message: "Bhoomiputra Foundation Membership successfully verified",
            });
          }

          // 5. Verification Failed
          return Response.json(
            {
              valid: false,
              error: `Member ID or Phone "${cleanInput}" was not found in the active Bhoomiputra Foundation register. Please check your card or enroll at bhoomiputra.org`,
            },
            { status: 404 },
          );
        } catch (err: unknown) {
          console.error("[Bhoomiputra Verification Error]", err);
          return Response.json(
            { valid: false, error: "Internal server error during verification" },
            { status: 500 },
          );
        }
      },
    },
  },
});
