import type { Metadata } from "next";
import DroneView from "@/views/industries/Drone";

export const metadata: Metadata = {
  title: "Drones | OpenPlan",
};

export default function Page() {
  return <DroneView />;
}
