"use client";

import LegalPage, { LegalNotes, LegalSection } from "@/components/LegalPage";

const SecurityPage = () => (
  <LegalPage
    eyebrow="Trust & safety"
    title="Security"
    intro={[
      "OpenPlan is built for teams working with sensitive product information, launch milestones, engineering dependencies, and compliance-sensitive operations. Security is woven into the design of the product so teams can move quickly without exposing critical data or losing control over approvals and workflows.",
      "Our goal is to provide a secure workspace that supports visibility, collaboration, and momentum for hardware teams while protecting the information that powers every release and decision.",
    ]}
  >
    <LegalSection n={1} title="Access control and permissions">
      <p>
        OpenPlan supports role-based permissions so workspace owners and admins can decide who can view project information, edit records, approve milestones, or manage system settings. This helps teams keep review cycles controlled while retaining the flexibility needed for fast-moving operations.
      </p>
      <p>
        We strongly recommend that organizations review access regularly, especially when teams change, external collaborators join, or internal ownership shifts across functions such as engineering, manufacturing, and operations.
      </p>
    </LegalSection>

    <LegalSection n={2} title="Infrastructure protection">
      <p>
        We use layered security practices, service monitoring, and update procedures to reduce the likelihood of unauthorized access, service disruption, or preventable outages. These practices are part of how we maintain availability and protect the integrity of the data your team depends on every day.
      </p>
      <p>
        Sensitive data is handled with industry-standard safeguards, and our team actively reviews both product behavior and infrastructure controls to address emerging risks quickly.
      </p>
    </LegalSection>

    <LegalSection n={3} title="Responsible disclosures">
      <p>
        If you discover a potential vulnerability in OpenPlan, we ask that you report it to us immediately so we can investigate and resolve it responsibly. We take security concerns seriously and value thoughtful, actionable reports from the community and our users.
      </p>
    </LegalSection>

    <LegalNotes
      title="Security expectations"
      items={[
        "Team members should protect their accounts with strong credentials and avoid sharing access tokens.",
        "Workspace owners should regularly review permissions as teams expand or change responsibilities.",
        "We continuously evaluate our systems and practices to keep the platform aligned with modern security expectations.",
      ]}
    />
  </LegalPage>
);

export default SecurityPage;
