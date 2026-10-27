import { createFileRoute } from "@tanstack/react-router";
import {
  sendDelegationOtp,
  clean10DigitPhone,
} from "../../lib/bhoomiputraSecurity";

export const Route = createFileRoute("/api/bhoomiputra/delegation-otp/send")({
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

          const memberId = String(body?.memberId || "").trim();
          const requesterPhone = clean10DigitPhone(body?.requesterPhone || body?.customerPhone);

          if (!memberId) {
            return Response.json(
              { success: false, error: "Member ID required" },
              { status: 400 },
            );
          }

          if (requesterPhone.length !== 10) {
            return Response.json(
              {
                success: false,
                error: "Valid 10-digit requester mobile number required",
              },
              { status: 400 },
            );
          }

          const result = await sendDelegationOtp({ memberId, requesterPhone });

          if (result.success) {
            return Response.json({
              success: true,
              maskedPhone: result.maskedPhone,
              message: `Authorization code sent to member's WhatsApp (${result.maskedPhone}).`,
              waLink: result.waLink,
            });
          }

          return Response.json(
            {
              success: false,
              error: result.error || "Failed to dispatch authorization code",
              cooldownRemaining: result.cooldownRemaining,
            },
            { status: 400 },
          );
        } catch (err: unknown) {
          console.error("[Bhoomiputra Delegation Send Error]", err);
          return Response.json(
            { success: false, error: "Internal server error" },
            { status: 500 },
          );
        }
      },
    },
  },
});
