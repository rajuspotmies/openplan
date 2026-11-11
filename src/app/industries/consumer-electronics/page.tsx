import type { Metadata } from "next";
import ConsumerElectronicsView from "@/views/industries/ConsumerElectronics";

export const metadata: Metadata = {
  title: "Consumer Electronics | OpenPlan",
};

export default function Page() {
  return <ConsumerElectronicsView />;
}
