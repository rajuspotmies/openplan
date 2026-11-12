import type { Metadata } from "next";
import IndustrialEquipmentView from "@/views/industries/IndustrialEquipment";

export const metadata: Metadata = {
  title: "Industrial Equipment | OpenPlan",
};

export default function Page() {
  return <IndustrialEquipmentView />;
}
