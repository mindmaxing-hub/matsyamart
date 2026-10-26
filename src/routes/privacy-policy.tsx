import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "../pages/PrivacyPage";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy | MatsyaMart" },
      {
        name: "description",
        content:
          "DPDP Act 2023 compliant privacy policy and data protection practices for MatsyaMart operated by Kolibaba Seafood Inc.",
      },
      { property: "og:title", content: "Privacy Policy | MatsyaMart" },
      {
        property: "og:description",
        content:
          "DPDP Act 2023 compliant privacy policy and data protection practices for MatsyaMart operated by Kolibaba Seafood Inc.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:url",
        content: "https://matsyamart.com/privacy-policy",
      },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://matsyamart.com/privacy-policy",
      },
    ],
  }),
});
