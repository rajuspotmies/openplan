"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, DatabaseZap, EyeOff, MailQuestion } from "lucide-react";
import { useNavigate } from "@/lib/router";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const PrivacyPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navigation />
      <div className="mx-auto flex max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs sm:text-sm font-medium text-slate-200 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white/10">
                <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-slate-100" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.28em] text-slate-400">Your data</p>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white">Privacy Policy</h1>
              </div>
            </div>

            <div className="space-y-5 text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              <p>
                OpenPlan helps hardware teams coordinate requirements, approvals, reviews, and launch milestones. To deliver that experience, we collect and process only the information necessary to create accounts, keep workspaces active, support teammates, and improve the product over time.
              </p>
              <p>
                We respect the trust you place in us and aim to keep your data visible only to the people and systems that need it. Whether you are a founder, program lead, operations manager, or external partner, the privacy principles below apply to how your information is handled within OpenPlan.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-white">
              <DatabaseZap className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              <h2>What information we collect</h2>
            </div>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              We may collect account details such as your name, work email, company information, role, and profile preferences. We also process workspace data such as project names, milestone updates, review notes, comments, uploaded files, and product information that your team chooses to store in OpenPlan.
            </p>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              To improve reliability and support, we may also collect technical information such as IP address, browser details, device data, product usage behavior, and support communications. This information helps us resolve issues, maintain security, and optimize the experience for hardware teams.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-white">
              <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              <h2>How we use your information</h2>
            </div>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              Your information is used to provide, secure, and improve OpenPlan. This includes onboarding your team, enabling collaboration, sending important product updates, managing access controls, supporting case resolution, and analyzing usage trends so we can make the platform more useful and dependable for product-led organizations.
            </p>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              We do not sell personal data. We may share information only with trusted service providers that help us host, secure, and support the product, and only under strict confidentiality obligations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-white">
              <MailQuestion className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              <h2>How we protect sensitive data</h2>
            </div>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              We apply administrative, technical, and organizational safeguards designed to protect personal data and any sensitive business information processed through OpenPlan. Data is protected in transit using encrypted network connections and is stored using security controls intended to reduce the risk of unauthorized access, disclosure, alteration, or loss.
            </p>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              Access to sensitive data is limited to authorized personnel, contractors, and service providers who need that access to operate, maintain, secure, or support the service. We use role-based access controls, authentication protections, logging, and internal review procedures to help ensure that access is granted on a need-to-know basis only.
            </p>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              We also use monitoring, backups, change-management practices, and periodic security reviews to support system integrity and service resilience. While no platform can guarantee absolute security, we work continuously to maintain industry-standard protections for workspace content, connected account data, and sensitive operational information.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-white">
              <MailQuestion className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              <h2>Your choices and rights</h2>
            </div>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              You may request access to the personal data we hold about you, ask for corrections, or request deletion where the law allows. You can also manage communication preferences, adjust notification settings, and review who has access to your workspace through account and workspace settings.
            </p>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              If you are administering a team workspace, you are responsible for ensuring that your internal data practices align with your company’s privacy requirements and that access is granted only to those who need it.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.22, ease: "easeOut" }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-white">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              <h2>Google API Services User Data Policy</h2>
            </div>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              OpenPlan AI's use and transfer of information received from Google APIs will adhere to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-slate-500 underline-offset-4 hover:text-white"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              Data accessed through Google Sheets, Google Drive, Google Calendar, and Google Meet integrations is used solely to provide the specific feature you connect it to — such as syncing a linked Bill of Materials spreadsheet, storing an uploaded attachment, or creating a calendar event with a meeting link. This data is never sold, shared for advertising, or used for any purpose beyond the feature you explicitly enabled.
            </p>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              OpenPlan AI uses two third-party AI providers, both under enterprise data-processing terms that exclude our data from model training: Anthropic Claude for task-generation features, which processes only content you create directly within the product (project, task, and issue descriptions) and never data from a connected Google account; and Microsoft Azure OpenAI Service, used to auto-detect spreadsheet column layouts during Bill of Materials import — including, when a linked Google Sheet's columns aren't automatically recognized, a small sample of that sheet's column headers and row values. Azure OpenAI Service is a dedicated enterprise deployment, not the public ChatGPT product, and under{" "}
              <a
                href="https://learn.microsoft.com/en-us/legal/cognitive-services/openai/data-privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-slate-500 underline-offset-4 hover:text-white"
              >
                Microsoft's Azure OpenAI data privacy terms
              </a>
              , prompts and outputs sent to it are not used to train, retrain, or improve the underlying models, whether OpenAI's or Microsoft's.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
            className="space-y-4 rounded-[1.25rem] border border-white/10 bg-white/5 p-4 sm:p-6"
          >
            <h2 className="text-base sm:text-xl font-semibold text-white">Privacy notes for teams</h2>
            <ul className="space-y-3 text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              <li>• Workspace admins control who can view or edit projects, reviews, and milestone data.</li>
              <li>• Sensitive data protections include encryption in transit, controlled access, activity logging, and operational monitoring.</li>
              <li>• Aggregated product usage trends may be used to improve onboarding, reliability, and reporting.</li>
              <li>• If your team handles regulated or sensitive customer data, you should keep permissions, retention, and data-sharing practices aligned with your internal policies.</li>
            </ul>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPage;
