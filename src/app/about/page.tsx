import type { Metadata } from "next";
import AboutView from "@/views/About";

export const metadata: Metadata = {
  title: "About | OpenPlan",
};

export default function Page() {
  return <AboutView />;
}
