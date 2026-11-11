"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CheckCircle, Clock, Zap, Cpu, Shield, Globe, Rocket, Terminal, Layers } from "lucide-react";

const Status = () => {
  // Product Roadmap Data
  const modules = [
    {
      name: "AI Product Architect",
      status: "Beta Testing",
      progress: 85,
      icon: Cpu,
      description: "PRD analysis and autonomous module generation engine.",
    },
    {
      name: "BOM & Lifecycle Engine",
      status: "Production Ready",
      progress: 100,
      icon: Layers,
      description: "Multi-level BOM management and revision control core.",
    },
    {
      name: "Compliance & Safety Hub",
      status: "In Development",
      progress: 60,
      icon: Shield,
      description: "Automated ISO/FDA reporting and safety requirement tracking.",
    },
    {
      name: "Global Supplier Network",
      status: "Architecture Phase",
      progress: 30,
      icon: Globe,
      description: "Real-time procurement and supplier tracking infrastructure.",
    },
  ];

  const milestones = [
    {
      date: "Q2 2026",
      title: "Public Beta Launch",
      status: "Upcoming",
      description: "Opening access to waitlisted teams for full production workflows.",
    },
    {
      date: "Q1 2026",
      title: "Closed Beta Phase 2",
      status: "In Progress",
      description: "Onboarding initial automotive and aerospace pilot partners.",
    },
    {
      date: "Q4 2025",
      title: "AI Architect MVP",
      status: "Completed",
      description: "Successfully deployed autonomous PRD-to-Module mapping logic.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B] text-white">
      <Navigation />

      <main className="flex-1">
        <section className="container mx-auto sm:px-12 px-4 pt-28 pb-16">
          {/* Header */}
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-6 border border-blue-500/20">
              <Zap className="h-3 w-3" /> Build Status
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Building the future of hardware.</h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              We're currently in a closed beta phase, working closely with industry leaders to refine the HardCraft ecosystem.
            </p>
          </div>

          {/* Current Phase Banner */}
          <div className="mb-12 p-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Rocket className="h-24 w-24" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <Terminal className="h-7 w-7 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Phase: Closed Beta</h2>
                  <p className="text-slate-400 mt-1">Status: Active Development & Testing</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium">
                  Uptime Target: 99.9%
                </div>
                <div className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  Systems Online
                </div>
              </div>
            </div>
          </div>

          {/* Core Modules Status */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <div className="h-8 w-1 bg-blue-500 rounded-full" />
              Core Infrastructure
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modules.map((module) => (
                <div
                  key={module.name}
                  className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-800/50 flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-colors">
                        <module.icon className="h-6 w-6 text-slate-400 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{module.name}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          module.progress === 100 ? "bg-green-500/10 text-green-400" : "bg-blue-500/10 text-blue-400"
                        }`}>
                          {module.status}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-mono text-slate-500">{module.progress}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${
                        module.progress === 100 ? "bg-green-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                  
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {module.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Roadmap Timeline */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <div className="h-8 w-1 bg-blue-500 rounded-full" />
              Launch Roadmap
            </h2>
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] relative"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-blue-400 font-bold">{milestone.date}</span>
                      <h3 className="font-bold text-xl">{milestone.title}</h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                        milestone.status === "Completed"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : milestone.status === "In Progress"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-white/5 text-slate-400 border-white/10"
                      }`}
                    >
                      {milestone.status}
                    </span>
                  </div>
                  <p className="text-slate-400">
                    {milestone.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Waitlist Call to Action */}
          <div className="p-10 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-center">
            <h2 className="text-2xl font-bold mb-4">Want early access?</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              We are slowly expanding our beta program. Join the waitlist to get notified as soon as a spot opens up for your team.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold transition-all shadow-lg shadow-blue-600/20"
                onClick={() => { window.location.href = "https://app.openplanai.com/"; }}
              >
                Sign In
              </button>
              <button className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-all">
                Read the Docs
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Status;

