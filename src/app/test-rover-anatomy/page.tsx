import type { Metadata } from "next";
import RoverClient from "./RoverClient";

export const metadata: Metadata = {
  title: "Rover anatomy | OpenPlan",
  robots: { index: false },
};

export default function Page() {
  return <RoverClient />;
}
