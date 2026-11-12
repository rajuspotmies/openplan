"use client";

import IndustryPage, { type IndustryConfig } from "./IndustryPage";

const config: IndustryConfig = {
  crumb: "Automotive",
  badge: "ISO 26262 ready",
  title: ["Vehicle programs,", "engineered as one system."],
  lede: "Powertrain, body, infotainment and ADAS teams plan against one vehicle, with safety and supplier work traced to every ECU.",
  figure: { key: "automotive", title: "EV platform on stands" },
  stats: [
    { value: "50+", label: "OEMs & suppliers" },
    { value: "200+", label: "Vehicle programs" },
    { value: "99%", label: "On-time delivery" },
    { value: "35%", label: "Dev acceleration" },
  ],
  challenges: {
    title: ["Thousands of parts.", "One vehicle."],
    lede: "Modern vehicles are networks of systems built by hundreds of teams. These are the seams OpenPlan keeps closed.",
    items: [
      { title: "Multi-system integration", description: "Coordinating powertrain, chassis, body and electronics.", stat: "100+", statLabel: "ECUs" },
      { title: "Safety & compliance", description: "ISO 26262 functional safety and ISO 21434 cybersecurity.", stat: "ASIL-D", statLabel: "Safety level" },
      { title: "Supply chain", description: "Managing thousands of components from hundreds of suppliers.", stat: "1000+", statLabel: "Components" },
      { title: "Electrification", description: "Balancing ICE, hybrid and EV development.", stat: "3", statLabel: "Powertrains" },
    ],
  },
  capabilities: {
    title: ["System-level", "planning."],
    lede: "Every domain of the vehicle on one dependency-aware plan, from cell to cloud.",
    items: [
      { title: "Electrification", description: "Battery systems, powertrain and charging infrastructure.", figure: "Plug", caption: "Charge" },
      { title: "Connectivity", description: "V2X communication, telematics and cloud integration.", figure: "Router", caption: "V2X" },
      { title: "Safety systems", description: "Functional safety, cybersecurity and crash avoidance.", figure: "Vault", caption: "Safety" },
      { title: "Performance", description: "Engine control, transmission and vehicle dynamics.", figure: "Cabinet", caption: "ECUs" },
    ],
  },
  programs: {
    title: ["Programs that", "made it to the road."],
    lede: "How vehicle teams use OpenPlan to keep every domain moving together.",
    items: [
      { title: "Electric vehicle platform", description: "Accelerated EV platform development by coordinating battery systems, powertrain and charging infrastructure.", metrics: [{ value: "30%", label: "Faster development" }, { value: "150+", label: "ECUs coordinated" }] },
      { title: "Autonomous vehicle system", description: "Coordinated development of perception systems, decision-making algorithms and vehicle control systems.", metrics: [{ value: "5", label: "Teams synced" }, { value: "1000+", label: "Requirements" }] },
      { title: "Connected vehicle platform", description: "Integrated telematics, infotainment and V2X communication systems with cybersecurity compliance.", metrics: [{ value: "50+", label: "Features launched" }, { value: "0", label: "Security incidents" }] },
    ],
  },
  cta: {
    title: ["Put the whole vehicle", "on one plan."],
    lede: "Bring your ECUs, suppliers and safety cases together. We will walk you through it with your own program.",
  },
};

export default function Automotive() {
  return <IndustryPage c={config} />;
}
