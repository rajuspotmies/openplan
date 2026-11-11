import type { Metadata } from "next";
import AutomotiveView from "@/views/industries/Automotive";

export const metadata: Metadata = {
  title: "Automotive | OpenPlan",
};

export default function Page() {
  return <AutomotiveView />;
}
