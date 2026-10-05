import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "../pages/AdminPage";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Coastal Operations Hub | MatsyaMart" },
      { name: "description", content: "Secure operations workspace for MatsyaMart coordinators." },
      { property: "og:title", content: "Coastal Operations Hub | MatsyaMart" },
      { property: "og:description", content: "Secure operations workspace for MatsyaMart coordinators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
