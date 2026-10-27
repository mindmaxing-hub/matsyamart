import { createFileRoute } from "@tanstack/react-router";
import {
  cleanIndianMobile,
  createWhatsAppOtpSession,
  sendWhatsAppOtp,
} from "../../lib/whatsappOtp";

export const Route = createFileRoute("/api/otp/send")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          let phoneInput = "";
          try {
            const body = await request.json();
            phoneInput = String(body?.phone || "").trim();
          } catch {
            return Response.json(
              { success: false, error: "Invalid JSON payload" },
              { status: 400 },
            );
          }

          const cleanPhone = cleanIndianMobile(phoneInput);
          if (cleanPhone.length !== 10) {
            return Response.json(
              {
                success: false,
                error: "Please enter a valid 10-digit mobile number.",
              },
              { status: 400 },
            );
          }

          // Create session with rate limiting & cooldown
          const sessionResult = createWhatsAppOtpSession(cleanPhone);
          if (!sessionResult.success || !sessionResult.otp) {
            return Response.json(
              {
                success: false,
                error: sessionResult.error || "Failed to generate OTP",
                cooldownRemaining: sessionResult.cooldownRemaining,
              },
              { status: 429 },
            );
          }

          // Dispatch via WhatsApp (bypassing carrier SMS DLT restrictions)
          const waResult = await sendWhatsAppOtp(
            cleanPhone,
            sessionResult.otp,
          );

          return Response.json({
            success: true,
            phone: cleanPhone,
            message: waResult.message,
            provider: waResult.provider,
            waLink: waResult.waLink,
          });
        } catch (err: unknown) {
          console.error("[OTP Send Route Error]", err);
          return Response.json(
            { success: false, error: "Internal server error while sending OTP" },
            { status: 500 },
          );
        }
      },
    },
  },
});
