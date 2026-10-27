import { createFileRoute } from "@tanstack/react-router";
import { createHmac } from "crypto";
import { SEED_LISTINGS } from "../../data/seedData";
import { verifyMemberDiscountEligibility, clean10DigitPhone } from "../../lib/bhoomiputraSecurity";
import { verifyPhoneVerificationToken } from "../../lib/serverAuthToken";

const QUOTE_SECRET =
  (typeof process !== "undefined" && process.env?.["AUTH_TOKEN_SECRET"]) ||
  (typeof process !== "undefined" && process.env?.["RAZORPAY_KEY_SECRET"]) ||
  "matsyamart-canonical-quote-secret-key-2026";

interface QuoteItemInput {
  listingId: string;
  quantity: number;
  slotId?: string;
}

export function signQuoteData(quoteData: {
  quoteId: string;
  finalAmount: number;
  customerPhone?: string;
  exp: number;
}): string {
  const payload = `${quoteData.quoteId}:${quoteData.finalAmount}:${quoteData.customerPhone || ""}:${quoteData.exp}`;
  return createHmac("sha256", QUOTE_SECRET).update(payload).digest("hex");
}

export function verifyQuoteData(
  quoteData: {
    quoteId: string;
    finalAmount: number;
    customerPhone?: string;
    exp: number;
  },
  signature: string,
): boolean {
  if (Date.now() > quoteData.exp) return false;
  const expected = signQuoteData(quoteData);
  return expected === signature;
}

export const Route = createFileRoute("/api/checkout/quote")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          let body: any = {};
          try {
            body = await request.json();
          } catch {
            return Response.json(
              { success: false, error: "Invalid JSON payload" },
              { status: 400 },
            );
          }

          const itemsInput: QuoteItemInput[] = Array.isArray(body?.items) ? body.items : [];
          if (itemsInput.length === 0) {
            return Response.json(
              { success: false, error: "Cart is empty" },
              { status: 400 },
            );
          }

          const couponCode = String(body?.couponCode || "").trim().toUpperCase();
          const bhoomiMemberId = String(body?.bhoomiMemberId || "").trim();
          const customerPhone = clean10DigitPhone(body?.customerPhone);
          const verificationToken = String(body?.verificationToken || "").trim();
          const requestedPoints = Math.max(0, Number(body?.pointsRedeemed) || 0);

          // Resolve items against authoritative listing records
          const resolvedItems: Array<{
            listingId: string;
            title: string;
            pillar: string;
            priceINR: number;
            quantity: number;
          }> = [];

          for (const item of itemsInput) {
            const qty = Math.max(1, Number(item.quantity) || 1);
            const foundListing = SEED_LISTINGS.find((l) => l.id === item.listingId);
            if (!foundListing) {
              return Response.json(
                { success: false, error: `Listing not found for ID: ${item.listingId}` },
                { status: 404 },
              );
            }

            resolvedItems.push({
              listingId: foundListing.id,
              title: foundListing.title,
              pillar: foundListing.pillar || "goods",
              priceINR: foundListing.price_inr,
              quantity: qty,
            });
          }

          const subtotalAmount = resolvedItems.reduce(
            (sum, it) => sum + it.priceINR * it.quantity,
            0,
          );

          // 1. Coupon Discount Calculation
          let promoDiscountAmount = 0;
          let couponValid = false;
          let couponDescription = "";

          if (couponCode === "DEAL100") {
            // Flat ₹549 Off test coupon across all pillars
            promoDiscountAmount = Math.min(549, subtotalAmount > 1 ? subtotalAmount - 1 : 0);
            couponValid = true;
            couponDescription = "Live Order Verification Deal · Flat ₹549 Off (₹1 Test Checkout)";
          } else if (couponCode === "COASTAL10" && subtotalAmount >= 500) {
            promoDiscountAmount = Math.round(subtotalAmount * 0.1);
            couponValid = true;
            couponDescription = "Welcome Coastal Community Discount · 10% Off";
          } else if (couponCode === "FISHFEAST100" && subtotalAmount >= 1000) {
            const foodTotal = resolvedItems
              .filter((i) => i.pillar === "food")
              .reduce((sum, it) => sum + it.priceINR * it.quantity, 0);
            if (foodTotal > 0) {
              promoDiscountAmount = Math.min(100, foodTotal);
              couponValid = true;
              couponDescription = "Special Flat ₹100 Off on Coastal Feasts";
            }
          }

          // 2. Bhoomiputra Membership Discount Calculation
          let bhoomiDiscountAmount = 0;
          let bhoomiVerified = false;
          let bhoomiEligible = false;
          let bhoomiMessage = "";

          if (bhoomiMemberId) {
            const eligibility = await verifyMemberDiscountEligibility({
              memberId: bhoomiMemberId,
              customerPhone,
            });

            if (eligibility.eligible && eligibility.member) {
              bhoomiVerified = true;
              const eligibleItems = resolvedItems.filter((i) =>
                ["food", "walks", "workshops"].includes(i.pillar),
              );
              const eligibleTotal = eligibleItems.reduce(
                (sum, it) => sum + it.priceINR * it.quantity,
                0,
              );

              if (eligibleTotal > 0) {
                bhoomiEligible = true;
                bhoomiDiscountAmount = Math.round((eligibleTotal * 15) / 100);
                bhoomiMessage = `15% Bhoomiputra discount applied (-₹${bhoomiDiscountAmount})`;
              } else {
                bhoomiEligible = false;
                bhoomiDiscountAmount = 0;
                bhoomiMessage = "Membership verified; cart items (Artisan Goods) are not eligible for member discount (applies to Food, Walks, Workshops).";
              }
            } else {
              bhoomiVerified = false;
              bhoomiMessage = eligibility.reason || "Membership verification failed";
            }
          }

          // 3. Strict Discount Non-Clubbing Policy
          // Bhoomiputra Member Privilege and Promo Coupons CANNOT be clubbed together.
          // If Bhoomiputra is verified and applied, promo coupons are explicitly invalidated.
          let activeDiscountAmount = 0;
          let finalCouponValid = couponValid;
          let finalPromoDiscountAmount = promoDiscountAmount;
          let couponDeclineReason: string | undefined = undefined;

          if (bhoomiVerified && bhoomiDiscountAmount > 0) {
            activeDiscountAmount = bhoomiDiscountAmount;
            if (couponCode) {
              finalCouponValid = false;
              finalPromoDiscountAmount = 0;
              couponDeclineReason = "Coupon codes cannot be clubbed with Bhoomiputra Membership privilege.";
            }
          } else if (couponValid && promoDiscountAmount > 0) {
            activeDiscountAmount = promoDiscountAmount;
          }

          // 4. Loyalty Points (capped at 50% of subtotal, ₹0.1 per point)
          const maxPointsDiscount = Math.floor(subtotalAmount * 0.5);
          const pointsDiscountAmount = Math.min(
            maxPointsDiscount,
            Math.floor(requestedPoints * 0.1),
          );

          // 5. Final Payable Amount (minimum ₹1 for live gateway validation)
          const finalAmount = Math.max(
            1,
            subtotalAmount - activeDiscountAmount - pointsDiscountAmount,
          );

          const quoteId = `quote_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          const exp = Date.now() + 30 * 60 * 1000; // 30 mins
          const signature = signQuoteData({
            quoteId,
            finalAmount,
            customerPhone,
            exp,
          });

          return Response.json({
            success: true,
            quote: {
              quoteId,
              subtotalAmount,
              activeDiscountAmount,
              promoDiscountAmount: finalCouponValid ? finalPromoDiscountAmount : 0,
              bhoomiDiscountAmount,
              pointsDiscountAmount,
              finalAmount,
              currency: "INR",
              exp,
              signature,
              bhoomiputra: {
                verified: bhoomiVerified,
                eligible: bhoomiEligible,
                discountAmount: bhoomiDiscountAmount,
                message: bhoomiMessage,
              },
              coupon: {
                applied: finalCouponValid,
                code: couponCode,
                discountAmount: finalCouponValid ? finalPromoDiscountAmount : 0,
                description: finalCouponValid ? couponDescription : undefined,
                error: couponDeclineReason,
              },
            },
          });
        } catch (err: unknown) {
          console.error("[Checkout Quote Error]", err);
          return Response.json(
            { success: false, error: "Internal error calculating authoritative quote" },
            { status: 500 },
          );
        }
      },
    },
  },
});
