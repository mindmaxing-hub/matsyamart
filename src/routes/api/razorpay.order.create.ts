import { createFileRoute } from "@tanstack/react-router";
import { verifyMemberDiscountEligibility } from "../../lib/bhoomiputraSecurity";
import { verifyQuoteData } from "./checkout.quote";
import { verifyPhoneVerificationToken } from "../../lib/serverAuthToken";

export const RAZORPAY_KEY_ID =
  (typeof process !== "undefined" && process.env?.["RAZORPAY_KEY_ID"]) ||
  (typeof process !== "undefined" && process.env?.["VITE_RAZORPAY_KEY_ID"]) ||
  "rzp_live_TsxeJqBUCJLHdx";

export const RAZORPAY_KEY_SECRET =
  (typeof process !== "undefined" && process.env?.["RAZORPAY_KEY_SECRET"]) ||
  (typeof process !== "undefined" && process.env?.["VITE_RAZORPAY_KEY_SECRET"]) ||
  "76QgXL8gEMFS01FStzJJDtbr";

export const Route = createFileRoute("/api/razorpay/order/create")({
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

          const quote = body?.quote;
          const quoteSignature = body?.quoteSignature;
          let amountInr = Number(body?.amountInr);

          // Authoritative Quote Validation Gate:
          // If quote is provided, verify cryptographic HMAC signature
          if (quote && quoteSignature) {
            const isQuoteValid = verifyQuoteData(
              {
                quoteId: quote.quoteId,
                finalAmount: quote.finalAmount,
                customerPhone: body?.customerPhone,
                exp: quote.exp,
              },
              quoteSignature,
            );

            if (!isQuoteValid) {
              return Response.json(
                { success: false, error: "Quote validation failed or expired. Please refresh your checkout summary." },
                { status: 403 },
              );
            }
            amountInr = quote.finalAmount;
          }

          if (!amountInr || isNaN(amountInr) || amountInr <= 0) {
            return Response.json(
              { success: false, error: "Valid amount in INR required" },
              { status: 400 },
            );
          }

          const orderRef = String(body?.orderRef || `MM-${Date.now().toString(36).toUpperCase()}`);
          const customerName = String(body?.customerName || "Valued Patron");
          const customerPhone = String(body?.customerPhone || "");
          const customerEmail = String(body?.customerEmail || "");
          const description = String(body?.description || "MatsyaMart Coastal Reservation");
          const bhoomiMemberId = String(body?.bhoomiMemberId || body?.notes?.bhoomiputra_member_id || "").trim();
          const delegationToken = String(body?.delegationToken || "").trim();
          const verificationToken = String(body?.verificationToken || "").trim();

          // Server-Side Phone Verification Verification
          if (verificationToken) {
            const tokenCheck = verifyPhoneVerificationToken(verificationToken, customerPhone);
            if (!tokenCheck.valid) {
              return Response.json(
                { success: false, error: tokenCheck.error || "Phone verification expired" },
                { status: 401 },
              );
            }
          }

          // Server-Side Anti-Theft Verification Gate:
          // If a Bhoomiputra discount is claimed, verify caller ownership or valid delegation
          if (bhoomiMemberId) {
            const eligibility = await verifyMemberDiscountEligibility({
              memberId: bhoomiMemberId,
              customerPhone,
              delegationToken,
            });

            if (!eligibility.eligible) {
              console.warn(
                `[Razorpay Anti-Theft Warning] Phone ${customerPhone} attempted to claim member ID ${bhoomiMemberId}. Blocked.`,
              );
              return Response.json(
                {
                  success: false,
                  theftAlert: true,
                  error:
                    eligibility.reason ||
                    "Security Verification Failed: Bhoomiputra Membership is registered to a different mobile number. Payment token creation blocked.",
                },
                { status: 403 },
              );
            }
          }

          const amountPaise = Math.round(amountInr * 100);

          const authHeader = `Basic ${Buffer.from(
            `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`,
          ).toString("base64")}`;

          const res = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: authHeader,
            },
            body: JSON.stringify({
              amount: amountPaise,
              currency: "INR",
              receipt: orderRef.slice(0, 40),
              notes: {
                order_ref: orderRef,
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_email: customerEmail,
                description: description.slice(0, 100),
                bhoomiputra_member_id: bhoomiMemberId || undefined,
              },
            }),
            signal: AbortSignal.timeout(5000),
          });

          const data = await res.json().catch(() => ({}));

          if (res.ok && data.id) {
            return Response.json({
              success: true,
              orderId: data.id,
              amount: data.amount,
              currency: data.currency,
              receipt: data.receipt,
              keyId: RAZORPAY_KEY_ID,
            });
          }

          console.warn("[Razorpay Order Create Gateway Response]", data);
          const errorMsg =
            data?.error?.description || "Failed to create Razorpay order";

          return Response.json(
            { success: false, error: errorMsg },
            { status: 400 },
          );
        } catch (err: unknown) {
          console.error("[Razorpay Order Create Route Error]", err);
          return Response.json(
            {
              success: false,
              error: "Internal server error while creating Razorpay order",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});

