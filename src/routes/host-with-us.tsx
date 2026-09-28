import { createFileRoute } from "@tanstack/react-router";
import { HostWithUsPage } from "../pages/HostWithUsPage";

export const Route = createFileRoute("/host-with-us")({
  component: HostWithUsPage,
});
