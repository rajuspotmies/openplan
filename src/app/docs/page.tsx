import type { Metadata } from "next";
import DocsView from "@/views/Docs";

export const metadata: Metadata = {
  title: "Docs | OpenPlan",
};

export default function Page() {
  return <DocsView />;
}
