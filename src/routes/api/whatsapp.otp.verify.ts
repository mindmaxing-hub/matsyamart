import { createFileRoute } from "@tanstack/react-router";
import {
  cleanIndianMobile,
  verifyWhatsAppOtpSession,
} from "../../lib/whatsappOtp";
import { signPhoneVerificationToken } from "../../lib/serverAuthToken";

export const Route = createFileRoute("/api/whatsapp/otp/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          let phoneInput = "";
          let otpInput = "";

          try {
            const body = await request.json();
            phoneInput = String(body?.phone || "").trim();
            otpInput = String(body?.otp || "").trim();
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

          if (!otpInput || otpInput.length < 4) {
            return Response.json(
              {
                success: false,
                error: "Please enter the complete 6-digit WhatsApp verification code.",
              },
              { status: 400 },
            );
          }

          const verifyResult = verifyWhatsAppOtpSession(cleanPhone, otpInput);

          if (!verifyResult.valid) {
            return Response.json(
              {
                success: false,
                verified: false,
                error: verifyResult.error || "Invalid WhatsApp verification code",
              },
              { status: 400 },
            );
          }

          const verificationToken = signPhoneVerificationToken(cleanPhone);

          return Response.json({
            success: true,
            verified: true,
            phone: cleanPhone,
            verificationToken,
            message: "Mobile phone verified successfully.",
          });
        } catch (err: unknown) {
          console.error("[WhatsApp OTP Verify Route Error]", err);
          return Response.json(
            {
              success: false,
              error: "Internal server error while verifying WhatsApp code",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
