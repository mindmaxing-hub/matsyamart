import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/bhoomiputra/delegation-otp/send")({
  server: {
    handlers: {
      POST: async () => {
        // Strict anti-spam invariant: Arbitrary visitors at checkout must NEVER trigger unsolicited OTPs to third-party cardholders.
        return Response.json(
          {
            success: false,
            error:
              "Unsolicited member delegation is disabled. Bhoomiputra discounts can only be redeemed when the checkout phone matches the registered member phone.",
          },
          { status: 403 },
        );
      },
    },
  },
});
