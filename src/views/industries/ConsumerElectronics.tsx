"use client";

import IndustryPage, { type IndustryConfig } from "./IndustryPage";

const config: IndustryConfig = {
  crumb: "Consumer electronics",
  badge: "Global launch ready",
  title: ["Consumer devices,", "launched on time."],
  lede: "Keep industrial design, hardware, firmware and launch teams on one roadmap, across every product generation you ship.",
  figure: { key: "electronics", title: "Phone on an assembly jig" },
  stats: [
    { value: "50%", label: "Faster to market" },
    { value: "95%", label: "On-time launch" },
    { value: "200+", label: "Electronics companies" },
    { value: "500+", label: "Products launched" },
  ],
  challenges: {
    title: ["Short cycles.", "Global scale."],
    lede: "Consumer hardware ships on fixed dates to millions of people. These are the seams OpenPlan keeps closed.",
    items: [
      { title: "Rapid product cycles", description: "Managing multiple product generations simultaneously.", stat: "6–12", statLabel: "Month cycles" },
      { title: "Global supply chain", description: "Managing components from multiple continents.", stat: "50+", statLabel: "Countries" },
      { title: "Software integration", description: "Synchronizing firmware, OS and app development.", stat: "3", statLabel: "Layers" },
      { title: "Quality at scale", description: "Maintaining quality across millions of units.", stat: "100M+", statLabel: "Units" },
    ],
  },
  capabilities: {
    title: ["One roadmap,", "every product."],
    lede: "Plan the whole portfolio, keep hardware and software in step, and land every launch on its date.",
    items: [
      { title: "Multi-product portfolio", description: "Visualize the entire product roadmap with dependency tracking.", figure: "Turntable", caption: "Portfolio" },
      { title: "Hardware-software sync", description: "Synchronize firmware and hardware milestones.", figure: "Phone", caption: "Layers" },
      { title: "Global launch coordination", description: "Plan global product launches with marketing readiness.", figure: "Relay", caption: "Rollout" },
    ],
  },
  programs: {
    title: ["Products that", "shipped on time."],
    lede: "How device teams use OpenPlan to bring hardware, software and launch together.",
    items: [
      { title: "Smartphone platform", description: "Accelerated a flagship launch by coordinating chipset development, camera systems and Android integration.", metrics: [{ value: "4", label: "Months faster" }, { value: "50+", label: "Countries" }] },
      { title: "Smart home ecosystem", description: "Coordinated development of smart speakers, displays and sensors with a unified software platform.", metrics: [{ value: "10+", label: "Products" }, { value: "18", label: "Months" }] },
      { title: "Wearable device platform", description: "Integrated advanced sensors, health algorithms and companion app development.", metrics: [{ value: "6", label: "Months dev" }, { value: "5M+", label: "Units shipped" }] },
    ],
  },
  cta: {
    title: ["Your next launch,", "on one plan."],
    lede: "Bring your portfolio, firmware and launch plans together. We will walk you through it with your own products.",
  },
};

export default function ConsumerElectronics() {
  return <IndustryPage c={config} />;
}
