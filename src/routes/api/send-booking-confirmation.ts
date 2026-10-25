import { createFileRoute } from "@tanstack/react-router";
import { sendTemplateEmail } from "@/lib/email-templates/send-email";

export const Route = createFileRoute("/api/send-booking-confirmation")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const {
            orderRef,
            customerName,
            customerEmail,
            experienceTitle,
            pillar,
            seatsCount,
            totalAmountInr,
            dateFormatted,
            timeFormatted,
            meetingAddress,
            mapsUrl,
            passUrl,
            invoiceUrl,
            invoiceNumber,
            taxableValueInr,
            gstAmountInr,
            cgstInr,
            sgstInr,
            items,
            shippingAddress,
          } = body;

          if (!customerEmail) {
            return Response.json(
              { error: "Customer email is required" },
              { status: 400 }
            );
          }

          const templateData = {
            orderRef,
            customerName,
            customerEmail,
            experienceTitle,
            pillar,
            seatsCount,
            totalAmountInr,
            dateFormatted,
            timeFormatted,
            meetingAddress,
            mapsUrl,
            passUrl,
            invoiceUrl,
            invoiceNumber: invoiceNumber || `INV-${orderRef}`,
            taxableValueInr,
            gstAmountInr,
            cgstInr,
            sgstInr,
            items,
            shippingAddress,
          };

          const apiKey = process.env["LOVABLE_API_KEY"];
          if (!apiKey) {
            console.log(
              "[Email Dispatch Simulated] LOVABLE_API_KEY not configured in current environment. Data queued for:",
              customerEmail,
              templateData
            );
            return Response.json({
              success: true,
              simulated: true,
              recipient: customerEmail,
              message:
                "Email dispatch simulated (LOVABLE_API_KEY not configured in this environment)",
            });
          }

          const sendResult = await sendTemplateEmail(
            "booking-confirmation",
            customerEmail,
            { templateData }
          );

          return Response.json({ success: true, sendResult });
        } catch (err: any) {
          console.error("[Email Dispatch Error]", err);
          return Response.json(
            { error: err?.message || "Failed to dispatch email" },
            { status: 500 }
          );
        }
      },
    },
  },
});
