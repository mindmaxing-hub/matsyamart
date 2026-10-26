import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "../pages/ContactPage";

export const Route = createFileRoute("/contact-us")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact Us & Grievance Cell | MatsyaMart" },
      {
        name: "description",
        content:
          "Official merchant contacts, registered office address, helpline, and customer grievance redressal for MatsyaMart.",
      },
      {
        property: "og:title",
        content: "Contact Us & Grievance Cell | MatsyaMart",
      },
      {
        property: "og:description",
        content:
          "Official merchant contacts, registered office address, helpline, and customer grievance redressal for MatsyaMart.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://matsyamart.com/contact-us" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://matsyamart.com/contact-us",
      },
    ],
  }),
});
