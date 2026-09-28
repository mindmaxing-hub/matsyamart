import { createFileRoute } from "@tanstack/react-router";
import { OrderConfirmationPage } from "../pages/OrderConfirmationPage";

export const Route = createFileRoute("/order/confirmation/$orderRef")({
  component: OrderConfirmationRouteComponent,
});

function OrderConfirmationRouteComponent() {
  const { orderRef } = Route.useParams();
  return <OrderConfirmationPage orderRef={orderRef} />;
}
