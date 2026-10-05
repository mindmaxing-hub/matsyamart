import { createFileRoute } from "@tanstack/react-router";
import { OrderConfirmationPage } from "../pages/OrderConfirmationPage";

export const Route = createFileRoute("/order/confirmation/$orderRef")({
  component: OrderConfirmationRouteComponent,
  head: () => ({
    meta: [
      { title: "Order Confirmation | MatsyaMart" },
      { name: "description", content: "View your MatsyaMart order confirmation and coastal digital pass." },
      { property: "og:title", content: "Order Confirmation | MatsyaMart" },
      { property: "og:description", content: "View your MatsyaMart order confirmation and coastal digital pass." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function OrderConfirmationRouteComponent() {
  const { orderRef } = Route.useParams();
  return <OrderConfirmationPage orderRef={orderRef} />;
}
