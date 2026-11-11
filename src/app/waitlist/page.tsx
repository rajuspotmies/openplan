import type { Metadata } from "next";
import WaitlistView from "@/views/Waitlist";

export const metadata: Metadata = {
  title: "Join the waitlist | OpenPlan",
};

export default function Page() {
  return <WaitlistView />;
}
