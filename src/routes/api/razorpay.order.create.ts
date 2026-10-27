import { createFileRoute } from "@tanstack/react-router";

export const RAZORPAY_KEY_ID =
  (typeof process !== "undefined" && process.env?.["RAZORPAY_KEY_ID"]) ||
  (typeof process !== "undefined" && process.env?.["VITE_RAZORPAY_KEY_ID"]) ||
  "rzp_live_TOorX9SfyIq1Au";

export const RAZORPAY_KEY_SECRET =
  (typeof process !== "undefined" && process.env?.["RAZORPAY_KEY_SECRET"]) ||
  (typeof process !== "undefined" && process.env?.["VITE_RAZORPAY_KEY_SECRET"]) ||
  "";

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

          const amountInr = Number(body?.amountInr);
          if (!amountInr || isNaN(amountInr) || amountInr <= 0) {
            return Response.json(
              { success: false, error: "Valid amount in INR required" },
              { status: 400 },
            );
          }

          const amountPaise = Math.round(amountInr * 100);
          const orderRef = String(body?.orderRef || `MM-${Date.now().toString(36).toUpperCase()}`);
          const customerName = String(body?.customerName || "Valued Patron");
          const customerPhone = String(body?.customerPhone || "");
          const customerEmail = String(body?.customerEmail || "");
          const description = String(body?.description || "MatsyaMart Coastal Reservation");

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
