"use client";

import { useEffect, useRef, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Car,
  Cpu,
  Shield,
  Network,
  Battery,
  Settings,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Wrench,
  Gauge,
  Layers,
  Zap,
  FileText,
  Users,
  Truck,
  Plug,
  Eye,
  Radio,
  Wifi,
  Radar,
} from "lucide-react";

const Automotive = () => {
  const [hoveredSystem, setHoveredSystem] = useState<number | null>(null);
  const [hoveredModule, setHoveredModule] = useState<number | null>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const vehicleSystems = [
    {
      name: "Powertrain",
      icon: Zap,
      ecus: 25,
      status: "Operational",
      progress: 92,
      color: "amber",
    },
    {
      name: "Body Control",
      icon: Car,
      ecus: 18,
      status: "Operational",
      progress: 88,
      color: "amber",
    },
    {
      name: "Infotainment",
      icon: Cpu,
      ecus: 12,
      status: "Operational",
      progress: 85,
      color: "amber",
    },
    {
      name: "ADAS",
      icon: Shield,
      ecus: 15,
      status: "Operational",
      progress: 95,
      color: "amber",
    },
  ];

  const subsystems = [
    {
      icon: Battery,
      title: "Electrification",
      description: "Battery systems, powertrain, and charging infrastructure",
      modules: 8,
    },
    {
      icon: Network,
      title: "Connectivity",
      description: "V2X communication, telematics, and cloud integration",
      modules: 6,
    },
    {
      icon: Shield,
      title: "Safety Systems",
      description: "Functional safety, cybersecurity, and crash avoidance",
      modules: 12,
    },
    {
      icon: Gauge,
      title: "Performance",
      description: "Engine control, transmission, and vehicle dynamics",
      modules: 10,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Technical grid background */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(245, 158, 11, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(245, 158, 11, 0.1) 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }} />
      </div>

      {/* Subtle system pulse */}
      <motion.div
        className="fixed top-1/2 left-1/2 w-[800px] h-[800px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 6, repeat: Infinity }}
        style={{ x: "-50%", y: "-50%" }}
      />

      <Navigation />
      <main className="flex-1 relative z-10 pt-20">
        {/* Hero Section - System Architecture Layout */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="container mx-auto max-w-7xl px-4 sm:px-12 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-5"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
                  <Shield className="h-4 w-4 text-amber-400" />
                  <span className="text-sm text-amber-400 font-medium">ISO 26262 Compliant</span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                  <span className="text-white">Precision Engineering</span>
                  <br />
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                    at Scale
                  </span>
                </h1>

                <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                  Coordinate complex automotive systems from concept to production
                  with AI-powered planning intelligence across 100+ ECUs and
                  multi-tier supply chains.
                </p>


                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-3 pt-8 border-t border-white/10 sm:gap-6">
                  <div>
                    <div className="text-3xl font-bold text-amber-400 mb-1">35%</div>
                    <div className="text-xs text-muted-foreground">Faster Dev</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-amber-400 mb-1">99.9%</div>
                    <div className="text-xs text-muted-foreground">On-Time</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-amber-400 mb-1">50+</div>
                    <div className="text-xs text-muted-foreground">OEMs</div>
                  </div>
                </div>
              </motion.div>

              {/* Right - System Architecture Visualization */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-7"
              >
                <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-amber-500/20 shadow-2xl">
                  {/* Central Vehicle */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/30 mb-4">
                      <Car className="h-16 w-16 text-amber-400" />
                    </div>
                    <div className="text-sm font-semibold text-amber-400">Vehicle Platform</div>
                  </div>

                  {/* ECU Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4 sm:gap-4">
                    {vehicleSystems.map((system, index) => (
                      <motion.div
                        key={index}
                        className={`bg-slate-800/50 rounded-lg p-4 border transition-all cursor-pointer ${
                          hoveredSystem === index
                            ? "border-amber-500/50 bg-amber-500/10 scale-105"
                            : "border-amber-500/20"
                        }`}
                        onMouseEnter={() => setHoveredSystem(index)}
                        onMouseLeave={() => setHoveredSystem(null)}
                        whileHover={{ 
                          scale: 1.08, 
                          borderColor: "rgba(245, 158, 11, 0.6)",
                          boxShadow: "0 10px 30px rgba(245, 158, 11, 0.2)"
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <system.icon className="h-5 w-5 text-amber-400" />
                          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        </div>
                        <div className="text-xs font-semibold text-amber-400 mb-1">{system.name}</div>
                        <div className="text-xs text-muted-foreground mb-2">{system.ecus} ECUs</div>
                        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${system.progress}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* System Status */}
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-amber-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold">System Status</span>
                      <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        All Operational
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {vehicleSystems.map((_, i) => (
                        <motion.div
                          key={i}
                          className="h-2 bg-slate-700 rounded-full overflow-hidden"
                          initial={{ opacity: 0.5 }}
                          animate={{ opacity: hoveredSystem === i ? 1 : 0.5 }}
                        >
                          <motion.div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.5 }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Challenges - Modular Grid */}
        <section className="py-24 bg-gradient-to-b from-black via-slate-950/50 to-black relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-12">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                The Complexity of Modern Vehicles
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Managing complex systems across multiple domains and suppliers
              </p>
            </motion.div>

            {/* Modular Grid Layout */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Cpu,
                  title: "Multi-System Integration",
                  description: "Coordinating powertrain, chassis, body, and electronics",
                  stat: "100+",
                  statLabel: "ECUs",
                  span: "md:col-span-2",
                },
                {
                  icon: Shield,
                  title: "Safety & Compliance",
                  description: "ISO 26262 functional safety and ISO 21434 cybersecurity",
                  stat: "ASIL-D",
                  statLabel: "Safety Level",
                  span: "",
                },
                {
                  icon: Truck,
                  title: "Supply Chain",
                  description: "Managing thousands of components from hundreds of suppliers",
                  stat: "1000+",
                  statLabel: "Components",
                  span: "",
                },
                {
                  icon: Battery,
                  title: "Electrification",
                  description: "Balancing ICE, hybrid, and EV development",
                  stat: "3x",
                  statLabel: "Platforms",
                  span: "md:col-span-2",
                },
              ].map((challenge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredModule(index)}
                  onMouseLeave={() => setHoveredModule(null)}
                  className={`${challenge.span} group`}
                >
                  <Card className="bg-slate-900/50 border-white/10 hover:border-amber-500/50 transition-all h-full relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-8 relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <motion.div 
                          className="h-16 w-16 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20"
                          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                          transition={{ duration: 0.5 }}
                        >
                          <challenge.icon className="h-8 w-8 text-amber-400" />
                        </motion.div>
                        <div className="text-right">
                          <motion.div 
                            className="text-3xl font-bold text-amber-400"
                            whileHover={{ scale: 1.15 }}
                          >
                            {challenge.stat}
                          </motion.div>
                          <div className="text-xs text-muted-foreground">{challenge.statLabel}</div>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-amber-300 transition-colors">{challenge.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{challenge.description}</p>
                      {hoveredModule === index && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 pt-4 border-t border-amber-500/20"
                        >
                          <div className="flex items-center gap-2 text-sm text-amber-400">
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 1, ease: "linear" }}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </motion.div>
                            <span>Integrated system management</span>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions - System Architecture View */}
        <section className="py-24 bg-background relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-12">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Built for Automotive Excellence
              </h2>
            </motion.div>

            {/* Central Hub with Subsystems */}
            <div className="max-w-6xl mx-auto">
              {/* Central Feature */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <div className="inline-block bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl p-12 border-2 border-amber-500/30 backdrop-blur-sm max-w-3xl">
                  <Layers className="h-20 w-20 text-amber-400 mx-auto mb-6" />
                  <h3 className="text-3xl font-bold mb-4">System-Level Planning</h3>
                  <p className="text-muted-foreground">
                    Visualize vehicle architecture and dependencies with integration milestone tracking
                  </p>
                </div>
              </motion.div>

              {/* Subsystem Modules */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {subsystems.map((subsystem, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    <Card className="bg-slate-900/50 border-white/10 hover:border-amber-500/50 transition-all h-full">
                      <CardContent className="p-6">
                        <div className="h-14 w-14 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20">
                          <subsystem.icon className="h-7 w-7 text-amber-400" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">{subsystem.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{subsystem.description}</p>
                        <div className="flex items-center gap-2 text-xs text-amber-400">
                          <Settings className="h-4 w-4" />
                          <span>{subsystem.modules} modules</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases - Production Timeline View */}
        <section className="py-24 bg-gradient-to-b from-black via-slate-950/50 to-black relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-12">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Trusted by Leading Innovators
              </h2>
            </motion.div>

            {/* Timeline-style Layout */}
            <div className="space-y-12 max-w-5xl mx-auto">
              {[
                {
                  title: "Electric Vehicle Platform",
                  company: "EV Motors Inc.",
                  description: "Accelerated EV platform development by coordinating battery systems, powertrain, and charging infrastructure",
                  metrics: [
                    { value: "30%", label: "Faster Development" },
                    { value: "150+", label: "ECUs Coordinated" },
                  ],
                  badge: "EV Platform",
                },
                {
                  title: "Autonomous Vehicle System",
                  company: "AutoDrive Tech",
                  description: "Coordinated development of perception systems, decision-making algorithms, and vehicle control systems",
                  metrics: [
                    { value: "5", label: "Teams Synced" },
                    { value: "1000+", label: "Requirements" },
                  ],
                  badge: "ASIL-D Certified",
                },
                {
                  title: "Connected Vehicle Platform",
                  company: "ConnectAuto Systems",
                  description: "Integrated telematics, infotainment, and V2X communication systems with cybersecurity compliance",
                  metrics: [
                    { value: "50+", label: "Features Launched" },
                    { value: "0", label: "Security Incidents" },
                  ],
                  badge: "ISO 21434",
                },
              ].map((useCase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Timeline Line */}
                  {index < 2 && (
                    <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-amber-500/30 to-transparent hidden md:block" />
                  )}

                  <Card className="bg-slate-900/50 border-white/10 hover:border-amber-500/50 transition-all group">
                    <CardContent className="p-8">
                      <div className="flex gap-6">
                        {/* Timeline Dot with Unique Visuals */}
                        <div className="hidden md:block flex-shrink-0 relative">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/30 flex items-center justify-center relative overflow-hidden">
                            {index === 0 && (
                              // EV Platform - Battery and charging
                              <>
                                <Battery className="h-8 w-8 text-amber-400" />
                                <motion.div
                                  className="absolute -top-1 -right-1"
                                  animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                                  transition={{ duration: 3, repeat: Infinity }}
                                >
                                  <Plug className="h-5 w-5 text-emerald-400" />
                                </motion.div>
                                <motion.div
                                  className="absolute inset-0 rounded-full border-2 border-emerald-400/40"
                                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              </>
                            )}
                            {index === 1 && (
                              // Autonomous Vehicle - Sensors and eyes
                              <>
                                <Car className="h-8 w-8 text-amber-400" />
                                <motion.div
                                  className="absolute -top-2 left-1/2 -translate-x-1/2"
                                  animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <Eye className="h-4 w-4 text-cyan-400" />
                                </motion.div>
                                <motion.div
                                  className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                                  animate={{ scale: [1, 1.3, 1], rotate: [360, 180, 0] }}
                                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                >
                                  <Radar className="h-4 w-4 text-blue-400" />
                                </motion.div>
                                {/* Sensor array */}
                                {[0, 1, 2, 3].map((i) => (
                                  <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 rounded-full bg-cyan-400"
                                    style={{
                                      top: `${25 + (i % 2) * 50}%`,
                                      left: `${25 + Math.floor(i / 2) * 50}%`,
                                    }}
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                  />
                                ))}
                              </>
                            )}
                            {index === 2 && (
                              // Connected Vehicle - Network and signals
                              <>
                                <Car className="h-8 w-8 text-amber-400" />
                                <motion.div
                                  className="absolute -top-2 -right-2"
                                  animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <Wifi className="h-5 w-5 text-blue-400" />
                                </motion.div>
                                <motion.div
                                  className="absolute -bottom-2 -left-2"
                                  animate={{ scale: [1, 1.3, 1] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                  <Network className="h-5 w-5 text-indigo-400" />
                                </motion.div>
                                {/* Signal waves */}
                                {[0, 1, 2].map((i) => (
                                  <motion.div
                                    key={i}
                                    className="absolute inset-0 rounded-full border border-blue-400/30"
                                    animate={{
                                      scale: [1, 1.5 + i * 0.3, 1],
                                      opacity: [0.4, 0, 0.4],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                                  />
                                ))}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs text-amber-400 font-medium mb-2">
                                {useCase.badge}
                              </div>
                              <h3 className="text-2xl font-bold mb-2 group-hover:text-amber-300 transition-colors">{useCase.title}</h3>
                              <p className="text-sm text-muted-foreground mb-4">{useCase.company}</p>
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-6 leading-relaxed">{useCase.description}</p>
                          <div className="flex gap-6">
                            {useCase.metrics.map((metric, mIndex) => (
                              <motion.div 
                                key={mIndex}
                                whileHover={{ scale: 1.1 }}
                              >
                                <div className="text-2xl font-bold text-amber-400 mb-1">{metric.value}</div>
                                <div className="text-xs text-muted-foreground">{metric.label}</div>
                              </motion.div>
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

        {/* Metrics - Dashboard Grid */}
        <section className="py-24 bg-background relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-12">
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: Car, value: "50+", label: "OEMs & Suppliers", color: "amber" },
                { icon: Settings, value: "200+", label: "Vehicle Programs", color: "amber" },
                { icon: CheckCircle2, value: "99%", label: "On-Time Delivery", color: "amber" },
                { icon: TrendingUp, value: "35%", label: "Dev Acceleration", color: "amber" },
              ].map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="bg-slate-900/50 border-white/10 hover:border-amber-500/50 transition-all">
                    <CardContent className="p-8 text-center">
                      <div className="h-16 w-16 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                        <metric.icon className="h-8 w-8 text-amber-400" />
                      </div>
                      <div className="text-4xl font-bold text-amber-400 mb-2">{metric.value}</div>
                      <div className="text-sm text-muted-foreground">{metric.label}</div>
                    </CardContent>
                  </Card>
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

export default Automotive;

