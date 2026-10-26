import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "../pages/TermsPage";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms & Conditions | MatsyaMart" },
      {
        name: "description",
        content:
          "Terms and conditions of service, bookings, and purchases for MatsyaMart operated by Kolibaba Seafood Inc.",
      },
      { property: "og:title", content: "Terms & Conditions | MatsyaMart" },
      {
        property: "og:description",
        content:
          "Terms and conditions of service, bookings, and purchases for MatsyaMart operated by Kolibaba Seafood Inc.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://matsyamart.com/terms" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://matsyamart.com/terms" }],
  }),
});
