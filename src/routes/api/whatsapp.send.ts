import { createFileRoute } from "@tanstack/react-router";
import {
  sendFast2SMSWhatsApp,
  buildMultiPassWhatsAppMessage,
  MultiPassParams,
  normalizeWhatsAppNumber,
} from "@/lib/fast2smsWhatsApp";

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

          const { phone, passParams, customText } = body;
          const cleanPhone = normalizeWhatsAppNumber(phone);

          if (!cleanPhone || cleanPhone.length < 10) {
            return Response.json(
              { success: false, error: "Valid phone number required" },
              { status: 400 },
            );
          }

          let messageToSend = customText;
          if (!messageToSend && passParams) {
            messageToSend = buildMultiPassWhatsAppMessage(passParams as MultiPassParams);
          }

          if (!messageToSend) {
            return Response.json(
              { success: false, error: "No message text or passParams provided" },
              { status: 400 },
            );
          }

          const result = await sendFast2SMSWhatsApp(cleanPhone, messageToSend);

          return Response.json({
            success: true,
            phone: cleanPhone,
            messageId: result.messageId,
            mode: result.mode,
            waLink: result.waLink,
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
