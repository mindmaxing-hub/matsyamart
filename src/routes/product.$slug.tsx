import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "../pages/ProductDetailPage";

export const Route = createFileRoute("/product/$slug")({
  component: ProductRouteComponent,
  head: ({ params }) => ({
    meta: [
      { title: "Coastal Artisan Product | MatsyaMart" },
      { name: "description", content: "Shop coastal artisan goods directly from community makers through MatsyaMart." },
      { property: "og:title", content: "Coastal Artisan Product | MatsyaMart" },
      { property: "og:description", content: "Shop coastal artisan goods directly from community makers through MatsyaMart." },
      { property: "og:type", content: "product" },
      { property: "og:url", content: `https://matsyamart.com/product/${params.slug}` },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `https://matsyamart.com/product/${params.slug}` }],
  }),
});

function ProductRouteComponent() {
  const { slug } = Route.useParams();
  return <ProductDetailPage slug={slug} />;
}
