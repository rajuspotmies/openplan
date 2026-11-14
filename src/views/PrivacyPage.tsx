"use client";

import LegalPage, { LegalNotes, LegalSection } from "@/components/LegalPage";

const PrivacyPage = () => (
  <LegalPage
    eyebrow="Your data"
    title="Privacy Policy"
    intro={[
      "OpenPlan helps hardware teams coordinate requirements, approvals, reviews, and launch milestones. To deliver that experience, we collect and process only the information necessary to create accounts, keep workspaces active, support teammates, and improve the product over time.",
      "We respect the trust you place in us and aim to keep your data visible only to the people and systems that need it. Whether you are a founder, program lead, operations manager, or external partner, the privacy principles below apply to how your information is handled within OpenPlan.",
    ]}
  >
    <LegalSection n={1} title="What information we collect">
      <p>
        We may collect account details such as your name, work email, company information, role, and profile preferences. We also process workspace data such as project names, milestone updates, review notes, comments, uploaded files, and product information that your team chooses to store in OpenPlan.
      </p>
      <p>
        To improve reliability and support, we may also collect technical information such as IP address, browser details, device data, product usage behavior, and support communications. This information helps us resolve issues, maintain security, and optimize the experience for hardware teams.
      </p>
    </LegalSection>

    <LegalSection n={2} title="How we use your information">
      <p>
        Your information is used to provide, secure, and improve OpenPlan. This includes onboarding your team, enabling collaboration, sending important product updates, managing access controls, supporting case resolution, and analyzing usage trends so we can make the platform more useful and dependable for product-led organizations.
      </p>
      <p>
        We do not sell personal data. We may share information only with trusted service providers that help us host, secure, and support the product, and only under strict confidentiality obligations.
      </p>
    </LegalSection>

    <LegalSection n={3} title="How we protect sensitive data">
      <p>
        We apply administrative, technical, and organizational safeguards designed to protect personal data and any sensitive business information processed through OpenPlan. Data is protected in transit using encrypted network connections and is stored using security controls intended to reduce the risk of unauthorized access, disclosure, alteration, or loss.
      </p>
      <p>
        Access to sensitive data is limited to authorized personnel, contractors, and service providers who need that access to operate, maintain, secure, or support the service. We use role-based access controls, authentication protections, logging, and internal review procedures to help ensure that access is granted on a need-to-know basis only.
      </p>
      <p>
        We also use monitoring, backups, change-management practices, and periodic security reviews to support system integrity and service resilience. While no platform can guarantee absolute security, we work continuously to maintain industry-standard protections for workspace content, connected account data, and sensitive operational information.
      </p>
    </LegalSection>

    <LegalSection n={4} title="Your choices and rights">
      <p>
        You may request access to the personal data we hold about you, ask for corrections, or request deletion where the law allows. You can also manage communication preferences, adjust notification settings, and review who has access to your workspace through account and workspace settings.
      </p>
      <p>
        If you are administering a team workspace, you are responsible for ensuring that your internal data practices align with your company’s privacy requirements and that access is granted only to those who need it.
      </p>
    </LegalSection>

    <LegalSection n={5} title="Google API Services User Data Policy">
      <p>
        OpenPlan AI&apos;s use and transfer of information received from Google APIs will adhere to the{" "}
        <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements.
      </p>
      <p>
        Data accessed through Google Sheets, Google Drive, Google Calendar, and Google Meet integrations is used solely to provide the specific feature you connect it to — such as syncing a linked Bill of Materials spreadsheet, storing an uploaded attachment, or creating a calendar event with a meeting link. This data is never sold, shared for advertising, or used for any purpose beyond the feature you explicitly enabled.
      </p>
      <p>
        OpenPlan AI uses two third-party AI providers, both under enterprise data-processing terms that exclude our data from model training: Anthropic Claude for task-generation features, which processes only content you create directly within the product (project, task, and issue descriptions) and never data from a connected Google account; and Microsoft Azure OpenAI Service, used to auto-detect spreadsheet column layouts during Bill of Materials import — including, when a linked Google Sheet&apos;s columns aren&apos;t automatically recognized, a small sample of that sheet&apos;s column headers and row values. Azure OpenAI Service is a dedicated enterprise deployment, not the public ChatGPT product, and under{" "}
        <a href="https://learn.microsoft.com/en-us/legal/cognitive-services/openai/data-privacy" target="_blank" rel="noopener noreferrer">
          Microsoft&apos;s Azure OpenAI data privacy terms
        </a>
        , prompts and outputs sent to it are not used to train, retrain, or improve the underlying models, whether OpenAI&apos;s or Microsoft&apos;s.
      </p>
    </LegalSection>

    <LegalNotes
      title="Privacy notes for teams"
      items={[
        "Workspace admins control who can view or edit projects, reviews, and milestone data.",
        "Sensitive data protections include encryption in transit, controlled access, activity logging, and operational monitoring.",
        "Aggregated product usage trends may be used to improve onboarding, reliability, and reporting.",
        "If your team handles regulated or sensitive customer data, you should keep permissions, retention, and data-sharing practices aligned with your internal policies.",
      ]}
    />
  </LegalPage>
);

export default PrivacyPage;
