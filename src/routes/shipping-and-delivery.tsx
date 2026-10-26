import { createFileRoute } from "@tanstack/react-router";
import { ShippingPolicyPage } from "../pages/ShippingPolicyPage";

export const Route = createFileRoute("/shipping-and-delivery")({
  component: ShippingPolicyPage,
  head: () => ({
    meta: [
      { title: "Shipping & Delivery Policy | MatsyaMart" },
      {
        name: "description",
        content:
          "Cold-chain morning delivery for Mumbai seafood, pan-India courier for pantry goods, and instant digital pass delivery.",
      },
      {
        property: "og:title",
        content: "Shipping & Delivery Policy | MatsyaMart",
      },
      {
        property: "og:description",
        content:
          "Cold-chain morning delivery for Mumbai seafood, pan-India courier for pantry goods, and instant digital pass delivery.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:url",
        content: "https://matsyamart.com/shipping-and-delivery",
      },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://matsyamart.com/shipping-and-delivery",
      },
    ],
  }),
});
