import type { Metadata } from "next";
import PrivacyPageView from "@/views/PrivacyPage";

export const metadata: Metadata = {
  title: "Privacy Policy | OpenPlan",
};

export default function Page() {
  return <PrivacyPageView />;
}
