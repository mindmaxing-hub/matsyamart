import { createFileRoute } from "@tanstack/react-router";
import {
  verifyDelegationOtp,
  clean10DigitPhone,
} from "../../lib/bhoomiputraSecurity";

export const Route = createFileRoute("/api/bhoomiputra/delegation-otp/verify")({
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
          const code = String(body?.code || "").trim();

          if (!memberId || !code) {
            return Response.json(
              { success: false, error: "Member ID and 4-digit code required" },
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

          const result = verifyDelegationOtp({ memberId, requesterPhone, code });

          if (result.success) {
            return Response.json({
              success: true,
              valid: true,
              delegationToken: result.delegationToken,
              member: result.member,
              discount_percent: 15,
              message: "Bhoomiputra Member Authorization successfully verified!",
            });
          }

          return Response.json(
            {
              success: false,
              valid: false,
              error: result.error || "Invalid authorization code",
            },
            { status: 400 },
          );
        } catch (err: unknown) {
          console.error("[Bhoomiputra Delegation Verify Error]", err);
          return Response.json(
            { success: false, error: "Internal server error" },
            { status: 500 },
          );
        }
      },
    },
  },
});
