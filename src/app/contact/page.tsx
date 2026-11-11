import type { Metadata } from "next";
import ContactView from "@/views/Contact";

export const metadata: Metadata = {
  title: "Contact | OpenPlan",
};

export default function Page() {
  return <ContactView />;
}
