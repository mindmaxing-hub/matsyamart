import { createFileRoute } from "@tanstack/react-router";
import {
  sendFast2SMSWhatsApp,
  sendPassWhatsAppCascade,
  buildMultiPassWhatsAppMessage,
  MultiPassParams,
  normalizeWhatsAppNumber,
} from "../../lib/fast2smsWhatsApp";

export const Route = createFileRoute("/api/whatsapp/send")({
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

          const { phone, passParams, customText, mode, imageUrl, pdfUrl } = body;
          const cleanPhone = normalizeWhatsAppNumber(phone);

          if (!cleanPhone || cleanPhone.length < 10) {
            return Response.json(
              { success: false, error: "Valid 10-digit Indian phone number required" },
              { status: 400 },
            );
          }

          // Case 1: Pass dispatch requested (via passParams or digitalPassUrl)
          if (passParams || body.digitalPassUrl) {
            const digitalPassUrl =
              body.digitalPassUrl ||
              passParams?.digitalPassUrl ||
              `https://matsyamart.com/order/confirmation/${passParams?.orderRef || "MM"}`;

            const cascadeResult = await sendPassWhatsAppCascade({
              phone: cleanPhone,
              orderRef: passParams?.orderRef || body.orderRef || "MM-ORDER",
              guestName: passParams?.guestName || body.guestName || "Valued Patron",
              digitalPassUrl,
              totalAmountInr: passParams?.totalPaidINR || body.totalPaidINR || 0,
              imageUrl: imageUrl || body.passImageUrl,
              pdfUrl: pdfUrl || body.passPdfUrl,
              mode: mode || "auto",
              itemsSummary: passParams?.items?.[0]?.title || body.itemsSummary,
              emergencyPhone: passParams?.emergencyPhone || body.emergencyPhone,
            });

            return Response.json({
              success: cascadeResult.success,
              phone: cleanPhone,
              mode: cascadeResult.mode,
              messageId: cascadeResult.messageId,
              requestId: cascadeResult.requestId,
              attempts: cascadeResult.attempts,
              waLink: cascadeResult.waLink,
              error: cascadeResult.error,
            });
          }

          // Case 2: Custom message text dispatch
          let messageToSend = customText;
          if (!messageToSend) {
            return Response.json(
              { success: false, error: "No message text or passParams provided" },
              { status: 400 },
            );
          }

          const result = await sendFast2SMSWhatsApp(cleanPhone, messageToSend);

          return Response.json({
            success: result.success,
            phone: cleanPhone,
            messageId: result.messageId,
            mode: result.mode,
            waLink: result.waLink,
            error: result.error,
          });
        } catch (err: unknown) {
          console.error("[WhatsApp Send Route Error]", err);
          return Response.json(
            { success: false, error: "Failed to dispatch WhatsApp message" },
            { status: 500 },
          );
        }
      },
    },
  },
});
