import type { Metadata } from "next";
import MedTechView from "@/views/industries/MedTech";

export const metadata: Metadata = {
  title: "MedTech | OpenPlan",
};

export default function Page() {
  return <MedTechView />;
}
