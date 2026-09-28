import { createFileRoute } from "@tanstack/react-router";
import { ExperienceDetailPage } from "../pages/ExperienceDetailPage";

export const Route = createFileRoute("/experience/$slug")({
  component: ExperienceRouteComponent,
});

function ExperienceRouteComponent() {
  const { slug } = Route.useParams();
  return <ExperienceDetailPage slug={slug} />;
}
