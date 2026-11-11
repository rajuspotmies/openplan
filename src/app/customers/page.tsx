import type { Metadata } from "next";
import CustomersView from "@/views/Customers";

export const metadata: Metadata = {
  title: "Customers | OpenPlan",
};

export default function Page() {
  return <CustomersView />;
}
