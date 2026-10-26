import { createFileRoute } from "@tanstack/react-router";
import { TrackOrdersPage } from "../pages/TrackOrdersPage";

export const Route = createFileRoute("/track")({
  component: TrackOrdersRouteComponent,
  head: () => ({
    meta: [
      { title: "Track Coastal Orders & Access Passes | MatsyaMart" },
      {
        name: "description",
        content:
          "Verify via mobile OTP to lookup your 9:16 mobile admission passes, GST invoices, and delivery tracking.",
      },
    ],
  }),
});

function TrackOrdersRouteComponent() {
  return <TrackOrdersPage />;
}
