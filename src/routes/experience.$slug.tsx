import { createFileRoute } from "@tanstack/react-router";
import { ExperienceDetailPage } from "../pages/ExperienceDetailPage";

export const Route = createFileRoute("/experience/$slug")({
  component: ExperienceRouteComponent,
  head: ({ params }) => {
    const titleCase = params.slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      meta: [
        { title: `${titleCase} | MatsyaMart Coastal Offering` },
        { name: "description", content: "Book an authentic community-led coastal experience with MatsyaMart." },
        { property: "og:title", content: `${titleCase} | MatsyaMart` },
        { property: "og:description", content: "Book an authentic community-led coastal experience with MatsyaMart." },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `https://matsyamart.com/experience/${params.slug}` },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: `https://matsyamart.com/experience/${params.slug}` }],
    };
  },
});

function ExperienceRouteComponent() {
  const { slug } = Route.useParams();
  return <ExperienceDetailPage slug={slug} />;
}
