"use client";

import LegalPage, { LegalNotes, LegalSection } from "@/components/LegalPage";

const TermsPage = () => (
  <LegalPage
    eyebrow="Legal"
    title="Terms of Service"
    intro={[
      "These Terms of Service govern your use of OpenPlan, the product lifecycle operating system built for hardware companies that need clarity across engineering, manufacturing, procurement, and go-to-market teams. By creating an account, inviting collaborators, or using the platform, you agree to these terms and to any additional policies that appear within the product experience.",
      "OpenPlan is designed to help teams plan launches, track reviews, centralize decisions, and maintain momentum from concept through production. These terms ensure the platform is used responsibly, securely, and in a way that supports the long-term health of your operations.",
    ]}
  >
    <LegalSection n={1} title="Use of the platform">
      <p>
        You may use OpenPlan for lawful business purposes, internal collaboration, workflow visibility, and product decision management. You may not use the platform to transmit harmful, deceptive, infringing, or unauthorized material, or to interfere with its availability, security, and performance.
      </p>
      <p>
        If your team uses OpenPlan to manage sensitive product data, supplier inputs, or customer-facing milestones, you are responsible for maintaining appropriate access levels, review practices, and internal governance so the platform is used in a compliant and reliable way.
      </p>
    </LegalSection>

    <LegalSection n={2} title="Accounts, permissions, and ownership">
      <p>
        You are responsible for the accuracy of the information you provide, the security of your account credentials, and the permissions you grant to teammates, contractors, or external partners. If your organization changes leadership, workflow ownership, or team structure, you should update user access promptly so that the right people retain the right level of visibility.
      </p>
      <p>
        Workspaces, projects, and documents created in OpenPlan remain under your organization’s control, while the platform itself and its underlying features remain the property of {/* Spotmies */}Velmond Labs Private Limited and its licensors unless otherwise specified in writing.
      </p>
    </LegalSection>

    <LegalSection n={3} title="Intellectual property and service limitations">
      <p>
        All product designs, interface elements, documentation, branding, and system logic provided through OpenPlan remain proprietary to {/* Spotmies */}Velmond Labs Private Limited unless otherwise stated. You retain rights to content you upload or create inside your workspace, subject to the permissions you grant and the limits of the service.
      </p>
      <p>
        OpenPlan is provided on an “as is” basis. While we work hard to keep the product reliable and secure, we do not guarantee uninterrupted service, zero defects, or the complete elimination of operational risk. In no event shall {/* Spotmies */}Velmond Labs Private Limited be liable for indirect, incidental, consequential, or special damages arising from use of the service.
      </p>
    </LegalSection>

    <LegalNotes
      title="Additional terms"
      items={[
        "We may update these terms to reflect changes to the product, billing, or service offerings.",
        "Continued use of the service after updates constitutes acceptance of the revised terms.",
        "Any disputes will be handled in accordance with the applicable law and dispute resolution process in the jurisdiction where Velmond Labs Private Limited operates.",
      ]}
    />
  </LegalPage>
);

export default TermsPage;
