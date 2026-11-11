import type { Metadata } from "next";
import TestVideoView from "@/views/TestVideo";

export const metadata: Metadata = {
  title: "Test video | OpenPlan",
  robots: { index: false },
};

export default function Page() {
  return <TestVideoView />;
}
