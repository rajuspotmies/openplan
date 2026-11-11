import type { Metadata } from "next";
import SecurityPageView from "@/views/SecurityPage";

export const metadata: Metadata = {
  title: "Security | OpenPlan",
};

export default function Page() {
  return <SecurityPageView />;
}
