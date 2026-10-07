import { createFileRoute } from "@tanstack/react-router";
import { HostWithUsPage } from "../pages/HostWithUsPage";

export const Route = createFileRoute("/host-with-us")({
  component: HostWithUsPage,
  head: () => ({
    meta: [
      { title: "Partner With Us | MatsyaMart" },
      { name: "description", content: "Share a coastal experience or artisan craft with the MatsyaMart community." },
      { property: "og:title", content: "Partner With Us | MatsyaMart" },
      { property: "og:description", content: "Share a coastal experience or artisan craft with the MatsyaMart community." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://matsyamart.com/host-with-us" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://matsyamart.com/host-with-us" }],
  }),
});
