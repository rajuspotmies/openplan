"use client";

import IndustryPage, { type IndustryConfig } from "./IndustryPage";

const config: IndustryConfig = {
  crumb: "Industrial equipment",
  badge: "IEC 61508 ready",
  title: ["Industrial machines,", "traced to the shop floor."],
  lede: "Mechanical, controls and software teams plan against one machine, with every part, supplier and safety check traced from design to line.",
  figure: { key: "industrial", title: "Press cell on a conveyor" },
  stats: [
    { value: "40+", label: "Equipment makers" },
    { value: "120+", label: "Machine programs" },
    { value: "98%", label: "On-time builds" },
    { value: "30%", label: "Fewer ECO delays" },
  ],
  challenges: {
    title: ["Long-lived machines.", "Short lead times."],
    lede: "Industrial equipment ships in low volumes, runs for decades and changes per customer. These are the seams OpenPlan keeps closed.",
    items: [
      { title: "Configure to order", description: "Every customer gets a variant of the same machine.", stat: "100+", statLabel: "Variants" },
      { title: "Machine safety", description: "IEC 61508, ISO 13849 and CE marking on every build.", stat: "SIL 3", statLabel: "Safety level" },
      { title: "Long-lead parts", description: "Castings, drives and controllers with months of lead time.", stat: "20 wk", statLabel: "Lead times" },
      { title: "Field service", description: "Spares and retrofits for machines already installed.", stat: "20 yr", statLabel: "Service life" },
    ],
  },
  capabilities: {
    title: ["One plan for", "the whole machine."],
    lede: "Mechanics, controls, software and service on one dependency-aware plan.",
    items: [
      { title: "Controls & PLCs", description: "Drives, I/O and PLC code versioned with the machine.", figure: "Cabinet", caption: "Controls" },
      { title: "Connected equipment", description: "Sensors, telemetry and remote diagnostics.", figure: "Router", caption: "IIoT" },
      { title: "Machine safety", description: "Risk assessments, interlocks and safety functions.", figure: "Padlock", caption: "Safety" },
      { title: "Variant BOMs", description: "Configure-to-order structures from one base design.", figure: "Exploded", caption: "Variants" },
    ],
  },
  programs: {
    title: ["Machines that", "made it to the floor."],
    lede: "How equipment teams use OpenPlan to keep design and shop floor in step.",
    items: [
      { title: "Smart factory cell", description: "Coordinated robotics, conveyors and vision inspection for a fully automated assembly cell.", metrics: [{ value: "25%", label: "Faster commissioning" }, { value: "400+", label: "Parts traced" }] },
      { title: "Packaging machinery", description: "Moved a configure-to-order machine line onto variant BOMs with one change process.", metrics: [{ value: "60+", label: "Variants managed" }, { value: "40%", label: "Fewer ECO delays" }] },
      { title: "Heavy equipment retrofit", description: "Planned controls upgrades across an installed fleet with full safety traceability.", metrics: [{ value: "150+", label: "Units upgraded" }, { value: "0", label: "Safety findings" }] },
    ],
  },
  cta: {
    title: ["Put the whole machine", "on one plan."],
    lede: "Bring your BOMs, suppliers and safety files together. We will walk you through it with your own program.",
  },
};

export default function IndustrialEquipment() {
  return <IndustryPage c={config} />;
}
