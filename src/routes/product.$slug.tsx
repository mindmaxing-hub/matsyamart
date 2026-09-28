import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "../pages/ProductDetailPage";

export const Route = createFileRoute("/product/$slug")({
  component: ProductRouteComponent,
});

function ProductRouteComponent() {
  const { slug } = Route.useParams();
  return <ProductDetailPage slug={slug} />;
}
