"use client";

import { useEffect, useRef, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  FileText,
  CheckCircle2,
  ClipboardCheck,
  Activity,
  Heart,
  Stethoscope,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Lock,
  Database,
  Link2,
  FileCheck,
  Users,
  Clock,
  Award,
} from "lucide-react";

const MedTech = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [hoveredDocument, setHoveredDocument] = useState<number | null>(null);
  const [traceabilityProgress, setTraceabilityProgress] = useState(0);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const progress = Math.min(100, Math.round(latest * 200));
      setTraceabilityProgress(progress);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const complianceSteps = [
    {
      step: "01",
      title: "Design Controls",
      description: "Establish design inputs, outputs, and verification protocols",
      icon: ClipboardCheck,
      color: "from-blue-500/20 to-blue-600/10",
    },
    {
      step: "02",
      title: "Risk Management",
      description: "FMEA integration with automated risk scoring and mitigation",
      icon: Shield,
      color: "from-emerald-500/20 to-emerald-600/10",
    },
    {
      step: "03",
      title: "Documentation",
      description: "Automated Design History File generation and traceability",
      icon: FileText,
      color: "from-indigo-500/20 to-indigo-600/10",
    },
    {
      step: "04",
      title: "Validation",
      description: "Clinical evidence tracking and regulatory submission prep",
      icon: CheckCircle2,
      color: "from-teal-500/20 to-teal-600/10",
    },
  ];

  const documents = [
    { name: "Design History File", status: "Complete", progress: 100 },
    { name: "Risk Management File", status: "In Review", progress: 85 },
    { name: "Clinical Evaluation", status: "In Progress", progress: 60 },
    { name: "Regulatory Submission", status: "Draft", progress: 30 },
  ];

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Subtle medical grid background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(16, 185, 129, 0.1) 2px, rgba(16, 185, 129, 0.1) 4px),
                           repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(16, 185, 129, 0.1) 2px, rgba(16, 185, 129, 0.1) 4px)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Subtle pulse effect */}
      <motion.div
        className="fixed top-1/2 left-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        style={{ x: "-50%", y: "-50%" }}
      />

      <Navigation />
      <main className="flex-1 relative z-10 pt-20">
        {/* Hero Section - Enhanced Medical Device Visualization */}
        <section className="relative py-24 md:py-32 overflow-hidden min-h-[90vh] flex items-center">
          {/* Animated medical device background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Pulsing medical device icon */}
            <motion.div
              className="absolute top-1/4 right-1/4 w-64 h-64"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <div className="w-full h-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl" />
            </motion.div>
            
            {/* Floating compliance badges */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute w-32 h-32 rounded-full border border-emerald-500/20"
                style={{
                  top: `${20 + i * 30}%`,
                  right: `${10 + i * 15}%`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 1.3 }}
              />
            ))}
          </div>

          <div className="container mx-auto max-w-7xl px-4 sm:px-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Lock className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400 font-medium">FDA 21 CFR Part 820 Compliant</span>
                </motion.div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                  <span className="bg-gradient-to-r from-white via-emerald-50 to-white bg-clip-text text-transparent">
                    Medical Device Development
                  </span>
                  <br />
                  <span className="text-white">Built for Compliance</span>
                </h1>

                <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed">
                  End-to-end traceability from design inputs to regulatory submission.
                  Automated documentation, risk management, and compliance workflows
                  built specifically for medical device teams.
                </p>


                {/* Trust Indicators */}
                <div className="grid grid-cols-3 gap-3 pt-8 border-t border-white/10 sm:gap-6">
                  {[
                    { value: "98%", label: "First-Pass FDA Approval" },
                    { value: "500+", label: "Medical Companies" },
                    { value: "2,000+", label: "Regulatory Submissions" },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <div className="mb-2 text-[clamp(1.5rem,7vw,2.25rem)] font-bold leading-tight text-emerald-400 sm:text-4xl">{stat.value}</div>
                      <div className="text-xs text-muted-foreground sm:text-sm">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right - Enhanced Document Stack Visualization */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative h-[600px] lg:block hidden"
              >
                {/* Medical Device Icon Center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <motion.div
                    className="w-32 h-32 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/30 flex items-center justify-center backdrop-blur-sm shadow-2xl"
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Heart className="h-16 w-16 text-emerald-400" />
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-emerald-400"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                </div>

                {/* Document Stack - Enhanced */}
                <div className="relative w-full h-full">
                  {documents.map((doc, index) => {
                    const angle = (index - 1.5) * 25; // Spread documents around center
                    const radius = 180;
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;
                    
                    return (
                      <motion.div
                        key={index}
                        className={`absolute w-72 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md rounded-xl border p-6 shadow-2xl cursor-pointer ${
                          hoveredDocument === index
                            ? "border-emerald-500/60 z-30 shadow-emerald-500/30"
                            : "border-white/10 z-10 opacity-70"
                        }`}
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          transform: `translate(-50%, -50%) ${hoveredDocument === index ? 'rotate(0deg)' : `rotate(${angle * 0.3}deg)`}`,
                        }}
                        onMouseEnter={() => setHoveredDocument(index)}
                        onMouseLeave={() => setHoveredDocument(null)}
                        animate={{
                          y: hoveredDocument === index ? -20 : 0,
                          opacity: hoveredDocument === index ? 1 : 0.7,
                          scale: hoveredDocument === index ? 1.15 : 1,
                          rotate: hoveredDocument === index ? 0 : angle * 0.3,
                        }}
                        transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                        whileHover={{ 
                          scale: 1.15, 
                          zIndex: 40,
                          boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)"
                        }}
                      >
                        {/* Document Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                              <FileText className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-white">{doc.name}</h3>
                              <div className="text-xs text-muted-foreground mt-0.5">Document #{index + 1}</div>
                            </div>
                          </div>
                          <motion.span
                            className={`text-xs px-3 py-1 rounded-full border font-medium ${
                              doc.status === "Complete"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : doc.status === "In Review"
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                : doc.status === "In Progress"
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                            }`}
                            animate={{
                              scale: hoveredDocument === index ? [1, 1.15, 1] : 1,
                            }}
                            transition={{ duration: 1.5, repeat: hoveredDocument === index ? Infinity : 0 }}
                          >
                            {doc.status}
                          </motion.span>
                        </div>

                        {/* Progress Section */}
                        <div className="mt-6">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs text-muted-foreground font-medium">Progress</span>
                            <motion.span
                              className="text-lg font-bold text-emerald-400"
                              animate={{
                                scale: hoveredDocument === index ? [1, 1.3, 1] : 1,
                              }}
                              transition={{ duration: 1, repeat: hoveredDocument === index ? Infinity : 0 }}
                            >
                              {doc.progress}%
                            </motion.span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                            <motion.div
                              className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${doc.progress}%`,
                                boxShadow: hoveredDocument === index
                                  ? "0 0 15px rgba(16, 185, 129, 0.7)"
                                  : "none",
                              }}
                              transition={{ duration: 1.5, delay: index * 0.2, ease: "easeOut" }}
                            />
                          </div>
                        </div>

                        {/* Document Details - Show on Hover */}
                        {hoveredDocument === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-emerald-500/20"
                          >
                            <div className="flex items-center gap-2 text-xs text-emerald-400">
                              <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <CheckCircle2 className="h-3 w-3" />
                              </motion.div>
                              <span>Traceability linked</span>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Connecting Lines Animation */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                  {documents.map((_, index) => {
                    const angle = (index - 1.5) * 25;
                    const radius = 180;
                    const x1 = Math.cos((angle * Math.PI) / 180) * radius;
                    const y1 = Math.sin((angle * Math.PI) / 180) * radius;
                    
                    return (
                      <motion.line
                        key={index}
                        x1="50%"
                        y1="50%"
                        x2={`calc(50% + ${x1}px)`}
                        y2={`calc(50% + ${y1}px)`}
                        stroke="rgb(16, 185, 129)"
                        strokeWidth="2"
                        strokeDasharray="5 5"
                        opacity={hoveredDocument === index ? 0.8 : 0.2}
                        animate={{
                          pathLength: hoveredDocument === index ? [0, 1, 0] : 0.3,
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    );
                  })}
                </svg>

                {/* Pulse Rings - Show on Hover */}
                {hoveredDocument !== null && (
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-2 border-emerald-500/30"
                    animate={{
                      scale: [1, 1.5, 2],
                      opacity: [0.6, 0.3, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                
                {/* Medical Device Visual Elements */}
                <div className="absolute top-10 right-10 w-24 h-24 opacity-20">
                  <motion.div
                    className="w-full h-full rounded-lg bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/40 flex items-center justify-center"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Stethoscope className="h-12 w-12 text-emerald-400/50" />
                  </motion.div>
                </div>
                
                <div className="absolute bottom-20 left-10 w-20 h-20 opacity-15">
                  <motion.div
                    className="w-full h-full rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-blue-500/40 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Activity className="h-10 w-10 text-blue-400/50" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Compliance Workflow - Horizontal Timeline */}
        <section className="py-24 bg-gradient-to-b from-black via-slate-950/50 to-black relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-12">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <ClipboardCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">Compliance Workflow</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                From Concept to Regulatory Approval
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                A structured approach to medical device development with built-in compliance
              </p>
            </motion.div>

            {/* Horizontal Timeline */}
            <div className="relative">
              {/* Connection Line */}
              <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/20 via-emerald-500/50 to-emerald-500/20 hidden md:block" />

              <div className="grid md:grid-cols-4 gap-8 relative">
                {complianceSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    {/* Step Number Circle */}
                    <div className="relative mb-8">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} border-2 border-emerald-500/30 flex items-center justify-center mx-auto relative z-10`}>
                        <step.icon className="h-8 w-8 text-emerald-400" />
                      </div>
                      {index < complianceSteps.length - 1 && (
                        <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-emerald-500/30" />
                      )}
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-emerald-400/60 font-mono mb-2">{step.step}</div>
                      <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Risk Management & Traceability - Split Layout */}
        <section className="py-24 bg-background relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-12">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Risk Management */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">Risk Management</span>
                </div>
                <h2 className="text-4xl font-bold mb-6">
                  Integrated FMEA & Risk Analysis
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Automated risk scoring, mitigation tracking, and continuous monitoring
                  throughout the device lifecycle. Link risks directly to design controls
                  and verification activities.
                </p>

                <div className="space-y-4">
                  {[
                    { label: "Design Risks", value: 127, color: "emerald" },
                    { label: "Process Risks", value: 89, color: "blue" },
                    { label: "Clinical Risks", value: 43, color: "indigo" },
                  ].map((risk, index) => (
                    <div key={index} className="bg-slate-900/50 rounded-lg p-4 border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{risk.label}</span>
                        <span className="text-emerald-400 font-bold">{risk.value}</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r from-${risk.color}-500 to-${risk.color}-400`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(risk.value / 200) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Traceability Matrix */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/20 shadow-2xl">
                  <div className="flex items-center gap-2 mb-6">
                    <Link2 className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-xl font-bold">Traceability Matrix</h3>
                  </div>

                  {/* Matrix Grid */}
                  <div className="space-y-3">
                    {[
                      { from: "Design Input", to: "Design Output", status: "linked" },
                      { from: "Design Output", to: "Verification", status: "linked" },
                      { from: "Verification", to: "Validation", status: "in-progress" },
                      { from: "Risk", to: "Mitigation", status: "linked" },
                    ].map((link, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-white/5"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex-1 text-sm">{link.from}</div>
                        <motion.div
                          className="w-8 h-0.5 bg-emerald-500"
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                        />
                        <div className="flex-1 text-sm text-right">{link.to}</div>
                        <div className={`w-2 h-2 rounded-full ${
                          link.status === "linked" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
                        }`} />
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Traceability Coverage</span>
                      <motion.span
                        className="text-2xl font-bold text-emerald-400"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                      >
                        {traceabilityProgress}%
                      </motion.span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Key Capabilities - Vertical Card Stack */}
        <section className="py-24 bg-gradient-to-b from-black via-slate-950/50 to-black relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-12">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Purpose-Built for Medical Device Teams
              </h2>
            </motion.div>

            <div className="max-w-4xl mx-auto space-y-6">
              {[
                {
                  icon: FileCheck,
                  title: "Automated Design History File",
                  description: "Generate comprehensive DHF documentation with full traceability from design inputs to outputs, verification, and validation.",
                  features: ["Real-time updates", "Audit-ready format", "Version control"],
                },
                {
                  icon: Database,
                  title: "Clinical Evidence Management",
                  description: "Track clinical protocols, patient data, and evidence requirements linked to regulatory submissions.",
                  features: ["Protocol tracking", "Evidence linking", "IDE management"],
                },
                {
                  icon: Shield,
                  title: "ISO 13485 & FDA Compliance",
                  description: "Built-in workflows for FDA 21 CFR Part 820, ISO 13485, and international regulatory requirements.",
                  features: ["Compliance templates", "Automated checks", "Regulatory mapping"],
                },
                {
                  icon: Users,
                  title: "Cross-Functional Collaboration",
                  description: "Coordinate clinical, engineering, regulatory, and quality teams with role-based access and workflows.",
                  features: ["Team coordination", "Role-based access", "Workflow automation"],
                },
              ].map((capability, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="bg-slate-900/50 border-white/10 hover:border-emerald-500/30 transition-all">
                    <CardContent className="p-8">
                      <div className="flex gap-6">
                        <div className="h-16 w-16 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <capability.icon className="h-8 w-8 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-3">{capability.title}</h3>
                          <p className="text-muted-foreground mb-4 leading-relaxed">
                            {capability.description}
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {capability.features.map((feature, i) => (
                              <span
                                key={i}
                                className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Metrics - Clean Grid */}
        <section className="py-24 bg-background relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-12">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: Award, value: "98%", label: "First-Pass FDA Approval Rate", suffix: "" },
                { icon: Clock, value: "40%", label: "Faster Time-to-Market", suffix: "" },
                { icon: FileText, value: "2,000+", label: "Regulatory Submissions", suffix: "" },
                { icon: Users, value: "500+", label: "Medical Device Companies", suffix: "" },
              ].map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="h-16 w-16 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                    <metric.icon className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div className="text-5xl font-bold text-emerald-400 mb-3">
                    {metric.value}{metric.suffix}
                  </div>
                  <div className="text-muted-foreground">{metric.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default MedTech;
