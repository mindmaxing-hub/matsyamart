import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "../pages/HomePage";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "MatsyaMart | Coastal Experiences & Artisan Goods" },
      { name: "description", content: "Discover community-led coastal walks, workshops, feasts, and artisan goods across Mumbai and Konkan." },
      { property: "og:title", content: "MatsyaMart | Coastal Experiences & Artisan Goods" },
      { property: "og:description", content: "Discover community-led coastal walks, workshops, feasts, and artisan goods across Mumbai and Konkan." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://matsyamart.com/" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://matsyamart.com/" }],
  }),
});
