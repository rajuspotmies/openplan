"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Workflow, Sparkles, LockKeyhole } from "lucide-react";
import { useNavigate } from "@/lib/router";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const TermsPage = () => {
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
                <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-slate-100" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.28em] text-slate-400">Legal</p>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white">Terms of Service</h1>
              </div>
            </div>

            <div className="space-y-5 text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              <p>
                These Terms of Service govern your use of OpenPlan, the product lifecycle operating system built for hardware companies that need clarity across engineering, manufacturing, procurement, and go-to-market teams. By creating an account, inviting collaborators, or using the platform, you agree to these terms and to any additional policies that appear within the product experience.
              </p>
              <p>
                OpenPlan is designed to help teams plan launches, track reviews, centralize decisions, and maintain momentum from concept through production. These terms ensure the platform is used responsibly, securely, and in a way that supports the long-term health of your operations.
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
              <Workflow className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              <h2>Use of the platform</h2>
            </div>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              You may use OpenPlan for lawful business purposes, internal collaboration, workflow visibility, and product decision management. You may not use the platform to transmit harmful, deceptive, infringing, or unauthorized material, or to interfere with its availability, security, and performance.
            </p>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              If your team uses OpenPlan to manage sensitive product data, supplier inputs, or customer-facing milestones, you are responsible for maintaining appropriate access levels, review practices, and internal governance so the platform is used in a compliant and reliable way.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-white">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              <h2>Accounts, permissions, and ownership</h2>
            </div>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              You are responsible for the accuracy of the information you provide, the security of your account credentials, and the permissions you grant to teammates, contractors, or external partners. If your organization changes leadership, workflow ownership, or team structure, you should update user access promptly so that the right people retain the right level of visibility.
            </p>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              Workspaces, projects, and documents created in OpenPlan remain under your organization’s control, while the platform itself and its underlying features remain the property of {/* Spotmies */}Velmond Labs Private Limited and its licensors unless otherwise specified in writing.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-white">
              <LockKeyhole className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              <h2>Intellectual property and service limitations</h2>
            </div>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              All product designs, interface elements, documentation, branding, and system logic provided through OpenPlan remain proprietary to {/* Spotmies */}Velmond Labs Private Limited unless otherwise stated. You retain rights to content you upload or create inside your workspace, subject to the permissions you grant and the limits of the service.
            </p>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              OpenPlan is provided on an “as is” basis. While we work hard to keep the product reliable and secure, we do not guarantee uninterrupted service, zero defects, or the complete elimination of operational risk. In no event shall {/* Spotmies */}Velmond Labs Private Limited be liable for indirect, incidental, consequential, or special damages arising from use of the service.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="space-y-4 rounded-[1.25rem] border border-white/10 bg-white/5 p-4 sm:p-6"
          >
            <h2 className="text-base sm:text-xl font-semibold text-white">Additional terms</h2>
            <ul className="space-y-3 text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              <li>• We may update these terms to reflect changes to the product, billing, or service offerings.</li>
              <li>• Continued use of the service after updates constitutes acceptance of the revised terms.</li>
              <li>• Any disputes will be handled in accordance with the applicable law and dispute resolution process in the jurisdiction where {/* Spotmies */}Velmond Labs Private Limited operates.</li>
            </ul>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsPage;
