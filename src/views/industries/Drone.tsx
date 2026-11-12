"use client";

import IndustryPage, { type IndustryConfig } from "./IndustryPage";

const config: IndustryConfig = {
  crumb: "Drones",
  badge: "FAA Part 107 ready",
  title: ["Drone development,", "from airframe to airspace."],
  lede: "Coordinate airframe, avionics, firmware and payload teams in one plan, and carry every flight test back to the requirement it proves.",
  figure: { key: "drone", title: "Quadcopter on a test stand" },
  stats: [
    { value: "60%", label: "Faster development" },
    { value: "95%", label: "On-time delivery" },
    { value: "300+", label: "Drone manufacturers" },
    { value: "1,500+", label: "UAV platforms" },
  ],
  challenges: {
    title: ["Four domains.", "One aircraft."],
    lede: "A drone only flies when mechanics, electronics, firmware and regulation land together. These are the seams OpenPlan keeps closed.",
    items: [
      { title: "Hardware, software and firmware integration", description: "Synchronizing mechanical, electrical and software development cycles.", stat: "4", statLabel: "Domains" },
      { title: "Regulatory compliance", description: "Navigating FAA, EASA and country-specific regulations.", stat: "50+", statLabel: "Regulators" },
      { title: "Rapid technology evolution", description: "Adapting to new sensor technologies and AI capabilities.", stat: "2x", statLabel: "Tech refresh" },
    ],
  },
  capabilities: {
    title: ["Built for", "flight programs."],
    lede: "Plan the aircraft, the campaign and the airspace in one workspace, with every decision traceable.",
    items: [
      { title: "Multi-domain planning", description: "Airframe, avionics, firmware and payload on one dependency-aware timeline.", figure: "Exploded", caption: "Layers" },
      { title: "Flight test management", description: "Plan and track flight test campaigns, sortie by sortie.", figure: "Slow", caption: "Campaign" },
      { title: "Telemetry & analytics", description: "Connect flight data to development so every anomaly lands on a task.", figure: "Plot", caption: "Flight data" },
      { title: "BVLOS operations", description: "Manage beyond-visual-line-of-sight waivers, links and readiness.", figure: "Dish", caption: "Link" },
    ],
  },
  programs: {
    title: ["Programs that", "made it to the air."],
    lede: "How drone teams use OpenPlan to move from prototype to certified platform.",
    items: [
      {
        title: "Commercial delivery drone",
        description: "Accelerated time-to-market by coordinating hardware optimization and flight control software.",
        metrics: [{ value: "50%", label: "Faster development" }, { value: "FAA", label: "Approved" }],
      },
      {
        title: "Agricultural monitoring UAV",
        description: "Coordinated development of a multispectral imaging payload and autonomous flight software.",
        metrics: [{ value: "30%", label: "Efficiency gain" }, { value: "EASA", label: "Certified" }],
      },
      {
        title: "Search & rescue drone",
        description: "Rapidly developed a ruggedized platform with thermal imaging and AI-powered detection.",
        metrics: [{ value: "6", label: "Months to production" }, { value: "BVLOS", label: "Certified" }],
      },
    ],
  },
  cta: {
    title: ["Ready for", "your next flight?"],
    lede: "Bring your airframe, firmware and test campaigns into one plan. We will walk you through it with your own program.",
  },
};

export default function Drone() {
  return <IndustryPage c={config} />;
}
