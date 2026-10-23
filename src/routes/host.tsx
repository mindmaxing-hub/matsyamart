import { createFileRoute } from "@tanstack/react-router";
import { HostAttendancePortal } from "../components/host/HostAttendancePortal";

export const Route = createFileRoute("/host")({
  component: HostAttendancePortal,
  head: () => ({
    meta: [
      { title: "Host Attendance Portal | MatsyaMart" },
      { name: "description", content: "Mobile gate scanner and attendance manager for MatsyaMart verified hosts." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
