"use client";

import IndustryPage, { type IndustryConfig } from "./IndustryPage";

const config: IndustryConfig = {
  crumb: "MedTech",
  badge: "FDA 21 CFR Part 820 ready",
  title: ["Medical devices,", "built for compliance."],
  lede: "Design controls, risk files and the design history file stay linked to the work itself, so your submission is assembled as you build.",
  figure: { key: "medtech", title: "Syringe pump and its DHF" },
  stats: [
    { value: "98%", label: "First-pass FDA approval" },
    { value: "40%", label: "Faster time-to-market" },
    { value: "2,000+", label: "Regulatory submissions" },
    { value: "500+", label: "Medical device companies" },
  ],
  challenges: {
    title: ["Every change", "leaves a record."],
    lede: "Medical device teams work under standards that expect proof at every step. OpenPlan keeps that proof attached to the work.",
    items: [
      { title: "Design controls", description: "Establish design inputs, outputs and verification protocols.", stat: "820", statLabel: "21 CFR" },
      { title: "Risk management", description: "FMEA integration with automated risk scoring and mitigation.", stat: "14971", statLabel: "ISO" },
      { title: "Quality system", description: "Built-in workflows for ISO 13485 and international regulatory requirements.", stat: "13485", statLabel: "ISO" },
      { title: "Validation", description: "Clinical evidence tracking and regulatory submission prep.", stat: "62304", statLabel: "IEC" },
    ],
  },
  capabilities: {
    title: ["Traceability,", "without the binders."],
    lede: "From the first design input to the final submission, every artifact is linked, versioned and ready for audit.",
    items: [
      { title: "Automated design history file", description: "Generate DHF documentation with full traceability from design inputs to outputs, verification and validation.", figure: "Drawer", caption: "DHF" },
      { title: "Risk management file", description: "Score, mitigate and trace design, process and clinical risks in one living file.", figure: "Sieve", caption: "Risk" },
      { title: "Clinical evidence management", description: "Track clinical protocols, patient data and evidence requirements linked to regulatory submissions.", figure: "Format", caption: "Evidence" },
      { title: "Cross-functional collaboration", description: "Coordinate clinical, engineering, regulatory and quality teams with role-based access and workflows.", figure: "Padlock", caption: "Access" },
    ],
  },
  programs: {
    title: ["From design input", "to clearance."],
    lede: "The three records every submission depends on, kept current by the work itself.",
    items: [
      { title: "Design history file", description: "Inputs, outputs, reviews, verification and validation, assembled automatically as the program moves.", metrics: [{ value: "DHF", label: "Auto-generated" }, { value: "100%", label: "Linked" }] },
      { title: "Risk management file", description: "Hazards, harms and mitigations scored and traced to the requirements that control them.", metrics: [{ value: "FMEA", label: "Integrated" }, { value: "ISO", label: "14971" }] },
      { title: "Regulatory submission", description: "Clinical evaluation and submission packages built from the same traced records.", metrics: [{ value: "510(k)", label: "Ready" }, { value: "CE", label: "MDR" }] },
    ],
  },
  cta: {
    title: ["Audit-ready", "from day one."],
    lede: "See how OpenPlan keeps your design controls and risk files current while your team builds.",
  },
};

export default function MedTech() {
  return <IndustryPage c={config} />;
}
