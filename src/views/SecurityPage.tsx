"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, DatabaseZap, ShieldCheck, Cpu, BadgeCheck } from "lucide-react";
import { useNavigate } from "@/lib/router";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const SecurityPage = () => {
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
      <div className="mx-auto flex max-w-6xl flex-col px-4 pb-8 pt-24 sm:px-6 lg:px-8 lg:pb-12 lg:pt-28">
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
                <DatabaseZap className="h-5 w-5 sm:h-6 sm:w-6 text-slate-100" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.28em] text-slate-400">Trust & safety</p>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white">Security</h1>
              </div>
            </div>

            <div className="space-y-5 text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              <p>
                OpenPlan is built for teams working with sensitive product information, launch milestones, engineering dependencies, and compliance-sensitive operations. Security is woven into the design of the product so teams can move quickly without exposing critical data or losing control over approvals and workflows.
              </p>
              <p>
                Our goal is to provide a secure workspace that supports visibility, collaboration, and momentum for hardware teams while protecting the information that powers every release and decision.
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
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              <h2>Access control and permissions</h2>
            </div>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              OpenPlan supports role-based permissions so workspace owners and admins can decide who can view project information, edit records, approve milestones, or manage system settings. This helps teams keep review cycles controlled while retaining the flexibility needed for fast-moving operations.
            </p>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              We strongly recommend that organizations review access regularly, especially when teams change, external collaborators join, or internal ownership shifts across functions such as engineering, manufacturing, and operations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-white">
              <Cpu className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              <h2>Infrastructure protection</h2>
            </div>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              We use layered security practices, service monitoring, and update procedures to reduce the likelihood of unauthorized access, service disruption, or preventable outages. These practices are part of how we maintain availability and protect the integrity of the data your team depends on every day.
            </p>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              Sensitive data is handled with industry-standard safeguards, and our team actively reviews both product behavior and infrastructure controls to address emerging risks quickly.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-white">
              <BadgeCheck className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              <h2>Responsible disclosures</h2>
            </div>
            <p className="text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              If you discover a potential vulnerability in OpenPlan, we ask that you report it to us immediately so we can investigate and resolve it responsibly. We take security concerns seriously and value thoughtful, actionable reports from the community and our users.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="space-y-4 rounded-[1.25rem] border border-white/10 bg-white/5 p-4 sm:p-6"
          >
            <h2 className="text-base sm:text-xl font-semibold text-white">Security expectations</h2>
            <ul className="space-y-3 text-sm leading-6 text-slate-300 sm:text-base sm:leading-8">
              <li>• Team members should protect their accounts with strong credentials and avoid sharing access tokens.</li>
              <li>• Workspace owners should regularly review permissions as teams expand or change responsibilities.</li>
              <li>• We continuously evaluate our systems and practices to keep the platform aligned with modern security expectations.</li>
            </ul>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SecurityPage;
