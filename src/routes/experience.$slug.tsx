import { createFileRoute } from "@tanstack/react-router";
import { ExperienceDetailPage } from "../pages/ExperienceDetailPage";

export const Route = createFileRoute("/experience/$slug")({
  component: ExperienceRouteComponent,
  head: ({ params }) => ({
    meta: [
      { title: "Coastal Experience | MatsyaMart" },
      { name: "description", content: "Book a community-led coastal experience with MatsyaMart." },
      { property: "og:title", content: "Coastal Experience | MatsyaMart" },
      { property: "og:description", content: "Book a community-led coastal experience with MatsyaMart." },
      { property: "og:type", content: "product" },
      { property: "og:url", content: `https://matsyamart.com/experience/${params.slug}` },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `https://matsyamart.com/experience/${params.slug}` }],
  }),
});

function ExperienceRouteComponent() {
  const { slug } = Route.useParams();
  return <ExperienceDetailPage slug={slug} />;
}
