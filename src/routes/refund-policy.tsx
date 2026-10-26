import { createFileRoute } from "@tanstack/react-router";
import { RefundPolicyPage } from "../pages/RefundPolicyPage";

export const Route = createFileRoute("/refund-policy")({
  component: RefundPolicyPage,
  head: () => ({
    meta: [
      { title: "Cancellation & Refund Policy | MatsyaMart" },
      {
        name: "description",
        content:
          "Cancellation and refund terms for coastal walks, experiences, and artisanal goods. 5 to 7 business day Razorpay settlement.",
      },
      {
        property: "og:title",
        content: "Cancellation & Refund Policy | MatsyaMart",
      },
      {
        property: "og:description",
        content:
          "Cancellation and refund terms for coastal walks, experiences, and artisanal goods. 5 to 7 business day Razorpay settlement.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://matsyamart.com/refund-policy" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://matsyamart.com/refund-policy",
      },
    ],
  }),
});
