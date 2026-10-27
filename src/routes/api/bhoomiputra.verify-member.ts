import { createFileRoute } from "@tanstack/react-router";
import {
  findBhoomiputraMember,
  verifyMemberDiscountEligibility,
  maskPhone,
  clean10DigitPhone,
} from "../../lib/bhoomiputraSecurity";

// In-memory sliding window rate limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 40; // 40 attempts per minute per IP

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

/**
 * Normalizes input string by replacing all Unicode dashes with standard ASCII '-'
 */
export function normalizeMemberId(raw: string): {
  normalized: string;
  cleanUpper: string;
  cleanDigits: string;
  sequenceNum: number | null;
  canonicalId: string;
} {
  const normalized = String(raw || "")
    .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, "-")
    .replace(/\s+/g, "")
    .trim();

  const cleanUpper = normalized.toUpperCase();
  const cleanDigits = normalized.replace(/\D/g, "");

  let sequenceNum: number | null = null;
  if (cleanDigits.length < 10 && cleanDigits.length > 0) {
    const match = cleanUpper.match(/(?:BH-?MMR-?|MMR-?)?(\d+)/i);
    if (match && match[1]) {
      sequenceNum = parseInt(match[1], 10);
    }
  }

  const canonicalId =
    sequenceNum !== null && sequenceNum >= 1
      ? `BH-MMR-${String(sequenceNum).padStart(3, "0")}`
      : cleanUpper;

  return {
    normalized,
    cleanUpper,
    cleanDigits,
    sequenceNum,
    canonicalId,
  };
}

export const Route = createFileRoute("/api/bhoomiputra/verify-member")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // 1. Client IP rate limiting
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

          // 2. Parse payload
          let body: any = {};
          try {
            body = await request.json();
          } catch {
            return Response.json(
              { valid: false, error: "Invalid JSON payload" },
              { status: 400 },
            );
          }

          const rawMemberId = String(body?.memberId || "").trim();
          const customerPhone = clean10DigitPhone(body?.customerPhone || body?.phone);
          const delegationToken = String(body?.delegationToken || "").trim();

          // If no Member ID is provided, check for Phone-First discovery
          if (!rawMemberId || rawMemberId.length < 3) {
            if (customerPhone && customerPhone.length === 10) {
              const eligibility = await verifyMemberDiscountEligibility({
                customerPhone,
                delegationToken,
              });

              if (eligibility.eligible && eligibility.member) {
                return Response.json({
                  valid: true,
                  discount_percent: eligibility.discountPercent,
                  member: {
                    id: eligibility.member.id,
                    name: eligibility.member.name,
                    tier: eligibility.member.tier,
                    settlement: eligibility.member.settlement,
                    phone: `+91 ${eligibility.member.phones[0] || customerPhone}`,
                    verifiedAt: new Date().toISOString(),
                  },
                  message: "Bhoomiputra Foundation Membership recognized by registered phone number",
                });
              }
            }

            return Response.json(
              {
                valid: false,
                error: "Please enter your official Bhoomiputra Member ID (e.g. BH-MMR-075).",
              },
              { status: 400 },
            );
          }

          const { canonicalId } = normalizeMemberId(rawMemberId);

          // CASE 2: Member ID Verification with Strict Phone / Delegation Binding
          const eligibility = await verifyMemberDiscountEligibility({
            memberId: canonicalId,
            customerPhone,
            delegationToken,
          });

          if (eligibility.eligible && eligibility.member) {
            return Response.json({
              valid: true,
              discount_percent: eligibility.discountPercent,
              member: {
                id: eligibility.member.id,
                name: eligibility.member.name,
                tier: eligibility.member.tier,
                settlement: eligibility.member.settlement,
                phone: `+91 ${eligibility.member.phones[0] || customerPhone}`,
                verifiedAt: new Date().toISOString(),
              },
              message: "Bhoomiputra Foundation Membership successfully verified and bound to order",
            });
          }

          // Case where member card is recognized but customer has not entered mobile number yet
          // Zero-disclosure privacy invariant: Do not leak member name or ID details to unverified requesters
          if (eligibility.requiresPhone && eligibility.member) {
            return Response.json(
              {
                valid: false,
                requiresPhone: true,
                theftAlert: false,
                error:
                  eligibility.reason ||
                  "Please enter your 10-digit mobile number in Contact Information below to verify card ownership.",
              },
              { status: 400 },
            );
          }

          // If member was found but phone did NOT match -> Phone mismatch block
          // Zero-disclosure privacy invariant: Never leak member name or phone to a non-matching requester
          if (eligibility.member) {
            return Response.json(
              {
                valid: false,
                theftAlert: false,
                error: "This Member ID does not match the mobile number entered at checkout. Please check your card number or enter your registered mobile number below.",
              },
              { status: 403 },
            );
          }

          // Member ID was not found anywhere
          return Response.json(
            {
              valid: false,
              theftAlert: false,
              error: `Member ID "${rawMemberId}" was not found in the active Bhoomiputra Foundation register. Please check your card or enroll at bhoomiputra.org`,
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
