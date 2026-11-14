/*
 * Scripted content for the live "Assistant" workflow screens. Ported from the
 * OpenPlan video repo (thakursameershetty/video-edit, AutonomousRoverVideoPage).
 */

export const USER_NAME = "John";
export const PROMPT = "Build an autonomous rover for last-mile logistics with operating range of 10km";

export const SUGGESTIONS = [
  "What's the status of Autonomous Rover Development?",
  "Create a task in Autonomous Rover Development and assign it to me, due Friday",
  "What's blocking Warehouse Delivery Rover Fleet?",
  "Push Warehouse Delivery Rover Fleet's next milestone out by a week",
  "How's requirements coverage looking for Autonomous Agricultural Robot System (AgriBot-X1)?",
  "Raise an issue in Autonomous Agricultural Robot System (AgriBot-X1) and assign it to me",
];

export const A = "/assets/assistant";
export const AVATARS: Record<string, string> = {
  John: `${A}/profile.jpg`,
  Noah: `${A}/collaborators/noah.jpg`,
  Mariana: `${A}/collaborators/mariana.jpg`,
  Jonathan: `${A}/collaborators/jonathan.jpg`,
  Ana: `${A}/collaborators/ana.jpg`,
  Marcus: `${A}/collaborators/marcus.jpg`,
};

/* ---------- requirements tree ---------- */

export type ReqLeaf = {
  type: "Subsystem" | "Component";
  id: string;
  label: string;
  status: "Approved" | "Reviewed" | "Draft";
  verification: "Passed" | "In Progress" | "Not Verified";
};
export type ReqBranch = { label: string; leaves: ReqLeaf[] };
export type ReqTreeData = { root: string; rootSub: string; branches: ReqBranch[] };

export const REQ_TREE: ReqTreeData = {
  root: "Delivery Rover",
  rootSub: "10km range · 2.5kg payload",
  branches: [
    {
      label: "Chassis & Drivetrain",
      leaves: [
        { type: "Subsystem", id: "CHS-001", label: "Six-wheel chassis", status: "Approved", verification: "Passed" },
        { type: "Subsystem", id: "CHS-002", label: "Motor & gearbox sizing", status: "Approved", verification: "Passed" },
      ],
    },
    {
      label: "Power System",
      leaves: [
        { type: "Subsystem", id: "PWR-001", label: "Swappable battery bay", status: "Approved", verification: "In Progress" },
        { type: "Subsystem", id: "PWR-002", label: "Power distribution", status: "Reviewed", verification: "Passed" },
        { type: "Component", id: "PWR-011", label: "Battery swap latch", status: "Draft", verification: "Not Verified" },
        { type: "Component", id: "PWR-012", label: "Charge controller", status: "Draft", verification: "Not Verified" },
      ],
    },
    {
      label: "Navigation & Control",
      leaves: [
        { type: "Subsystem", id: "NAV-001", label: "Main controller (F7)", status: "Approved", verification: "Passed" },
        { type: "Subsystem", id: "NAV-002", label: "GPS + IMU redundancy", status: "Reviewed", verification: "In Progress" },
        { type: "Component", id: "NAV-011", label: "Telemetry link (915MHz)", status: "Draft", verification: "Not Verified" },
      ],
    },
    {
      label: "Payload & Delivery",
      leaves: [
        { type: "Subsystem", id: "PLD-001", label: "Payload bay (2.5kg)", status: "Approved", verification: "Passed" },
        { type: "Subsystem", id: "PLD-002", label: "Release mechanism", status: "Approved", verification: "In Progress" },
      ],
    },
    {
      label: "Autonomy & Safety",
      leaves: [
        { type: "Subsystem", id: "SAF-001", label: "Obstacle avoidance", status: "Reviewed", verification: "In Progress" },
        { type: "Subsystem", id: "SAF-002", label: "Return-to-base failsafe", status: "Approved", verification: "Passed" },
        { type: "Component", id: "SAF-011", label: "Geofencing", status: "Draft", verification: "Not Verified" },
        { type: "Component", id: "SAF-012", label: "Collision alert system", status: "Draft", verification: "Not Verified" },
      ],
    },
    {
      label: "Ground Ops & Compliance",
      leaves: [
        { type: "Subsystem", id: "GND-001", label: "Charging dock interface", status: "Draft", verification: "Not Verified" },
        { type: "Subsystem", id: "GND-002", label: "Fleet tracking beacon", status: "Reviewed", verification: "Passed" },
        { type: "Subsystem", id: "GND-003", label: "Firmware OTA updates", status: "Draft", verification: "Not Verified" },
      ],
    },
  ],
};

/* ---------- kanban ---------- */

export type KanbanCard = { id: string; title: string; tag: string; assignee: string; date: string };
export type KanbanColumn = { title: string; cards: KanbanCard[] };

export const KANBAN: KanbanColumn[] = [
  {
    title: "Backlog",
    cards: [
      { id: "CHS-101", title: "Finalize suspension geometry", tag: "Chassis", assignee: "Noah", date: "Sep 22" },
      { id: "SAF-101", title: "Define geofence boundary rules", tag: "Safety", assignee: "Mariana", date: "Sep 24" },
      { id: "OPS-101", title: "Draft field service checklist", tag: "Ops", assignee: "Marcus", date: "Sep 26" },
    ],
  },
  {
    title: "To Do",
    cards: [
      { id: "PWR-101", title: "Source swappable battery packs", tag: "Power", assignee: "Noah", date: "Sep 18" },
      { id: "NAV-101", title: "Order secondary GPS antenna", tag: "Navigation", assignee: "Jonathan", date: "Sep 19" },
    ],
  },
  {
    title: "In Progress",
    cards: [
      { id: "CHS-002", title: "Motor & gearbox sizing", tag: "Chassis", assignee: "Noah", date: "Sep 16" },
      { id: "PLD-002", title: "Release mechanism assembly", tag: "Payload", assignee: "Mariana", date: "Sep 16" },
      { id: "SAF-001", title: "Obstacle avoidance tuning", tag: "Safety", assignee: "Marcus", date: "Sep 17" },
    ],
  },
  {
    title: "In Review",
    cards: [
      { id: "NAV-002", title: "GPS + IMU redundancy check", tag: "Navigation", assignee: "Jonathan", date: "Sep 13" },
      { id: "PWR-002", title: "Power distribution board", tag: "Power", assignee: "Noah", date: "Sep 14" },
    ],
  },
  {
    title: "Done",
    cards: [
      { id: "CHS-001", title: "Six-wheel chassis approved", tag: "Chassis", assignee: "Noah", date: "Sep 8" },
      { id: "SAF-002", title: "Return-to-base failsafe", tag: "Safety", assignee: "Marcus", date: "Sep 10" },
      { id: "PLD-001", title: "Payload bay (2.5kg) approved", tag: "Payload", assignee: "Mariana", date: "Sep 12" },
    ],
  },
];

/* ---------- bill of materials ---------- */

export type BomItem = {
  version: string;
  status: "Approved" | "Draft";
  name: string;
  partNumber: string;
  qty: string;
  unitPrice: string;
  manufacturer: string;
  leadTime: string;
  image: string;
};

export const BOM: BomItem[] = [
  { version: "1.0", status: "Approved", name: "Aluminum chassis kit", partNumber: "CMP-0405-001", qty: "1 EA", unitPrice: "$180.00", manufacturer: "TrueRC", leadTime: "—", image: `${A}/bom/carbon-fibre-frame-kit.webp` },
  { version: "2.0", status: "Draft", name: "DC gear motors (12V, 200RPM)", partNumber: "CMP-MOT-001", qty: "6 EA", unitPrice: "$96.00", manufacturer: "RCINPower", leadTime: "—", image: `${A}/bom/motor.png` },
  { version: "3.0", status: "Draft", name: "Main controller (F7)", partNumber: "CMP-FC-001", qty: "1 EA", unitPrice: "$65.00", manufacturer: "SpeedyBee", leadTime: "—", image: `${A}/bom/flight-controller.png` },
  { version: "4.0", status: "Draft", name: "GPS module", partNumber: "CMP-GPS-001", qty: "1 EA", unitPrice: "$28.00", manufacturer: "RadioMaster", leadTime: "—", image: `${A}/bom/gps-module.jpg` },
  { version: "5.0", status: "Draft", name: "Li-ion battery pack (48V 20Ah, swappable)", partNumber: "CMP-BAT-001", qty: "2 EA", unitPrice: "$220.00", manufacturer: "Tattu", leadTime: "—", image: `${A}/bom/lipi-battery-swappable.jpeg` },
  { version: "6.0", status: "Draft", name: "Motor drivers (40A)", partNumber: "CMP-055A-001", qty: "6 EA", unitPrice: "$52.00", manufacturer: "SpeedyBee", leadTime: "—", image: `${A}/bom/esc.png` },
  { version: "7.0", status: "Draft", name: "Payload release mechanism", partNumber: "CMP-PLD-001", qty: "1 EA", unitPrice: "$45.00", manufacturer: "DJI", leadTime: "—", image: `${A}/bom/payload-release-mechanism.webp` },
  { version: "8.0", status: "Draft", name: "All-terrain wheels (8in, set)", partNumber: "CMP-PROP-001", qty: "1 EA", unitPrice: "$18.00", manufacturer: "HQProp", leadTime: "—", image: `${A}/bom/propeller.png` },
];
export const BOM_TOTAL = "$704";
export const BOM_SPEC = [
  { label: "Total build time", value: "8 days" },
  { label: "Estimated total cost", value: "$704" },
  { label: "Target first drive", value: "Day 9" },
];

/* ---------- engineering change notice ---------- */

export type EcnSection = { heading: string; p?: string; ul?: string[]; spec?: { label: string; value: string }[] };

export const ECN: EcnSection[] = [
  {
    heading: "Summary of Changes",
    p: "A few engineering changes from the initial concept, made during the planning pass above. These refine the chassis, power, and navigation decisions to better match the 10km range and 2.5kg payload targets.",
  },
  {
    heading: "Reason for Change",
    p: "Bench testing of the original single-battery layout showed unacceptable turnaround time between deliveries, and the stock main controller lacked the sensor redundancy needed for reliable autonomous operation over suburban routes.",
  },
  {
    heading: "Change Log",
    ul: [
      "Switched to swappable battery packs for faster turnaround between deliveries",
      "Upgraded to an F7 main controller for redundant IMU and better autonomy support",
      "Added a payload release mechanism rated for 2.5kg",
      "Increased chassis wheelbase by 12% for wheel clearance with the larger payload bay",
      "Revised wheel guard geometry, reducing rolling resistance by an estimated 6%",
      "Added a secondary GPS antenna for improved signal lock in dense urban canyons",
    ],
  },
  {
    heading: "Affected Subsystems",
    spec: [
      { label: "Chassis", value: "Wheelbase, wheel guards" },
      { label: "Power system", value: "Battery mount, swap mechanism" },
      { label: "Navigation", value: "Main controller, GPS antenna" },
      { label: "Payload bay", value: "Release mechanism, bay liner" },
    ],
  },
  {
    heading: "Verification & Testing",
    ul: [
      "Bench test: payload release mechanism cycled 200x under rated 2.5kg load",
      "Static load test: confirmed wheel clearance at full suspension deflection",
      "Bench test: battery swap timed at under 90 seconds across 10 trials",
      "Field test: 3 test drives at 8km range to validate GPS lock and IMU redundancy",
    ],
  },
  {
    heading: "Impact Assessment",
    p: "These changes increase unit cost by roughly 4%, but improve payload margin and cut estimated turnaround time between deliveries by about 35%.",
  },
  {
    heading: "Approval & Rollout",
    spec: [
      { label: "Change ID", value: "ECN-2026-0142" },
      { label: "Status", value: "Pending review" },
      { label: "Effective date", value: "Upon approval" },
    ],
  },
];
