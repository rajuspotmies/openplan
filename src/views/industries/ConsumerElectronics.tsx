"use client";

import { useEffect, useRef, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  Package,
  Zap,
  Globe,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  Radio,
  Video,
  BarChart3,
  Clock,
  Users,
  Sparkles,
  Layers,
  Camera,
  Cpu,
  Home,
  Speaker,
  Monitor,
  Wifi,
  HeartPulse,
  Activity,
} from "lucide-react";

const ConsumerElectronics = () => {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [launchProgress, setLaunchProgress] = useState(0);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncProgress((prev) => (prev + 2) % 100);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const progress = Math.min(100, Math.round(latest * 142.857)); // 100 / 0.7
      setLaunchProgress(progress);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const products = [
    { icon: Smartphone, name: "Phone", color: "from-purple-500/20 to-pink-500/20" },
    { icon: Video, name: "Watch", color: "from-pink-500/20 to-purple-500/20" },
    { icon: Radio, name: "Hub", color: "from-purple-500/20 to-indigo-500/20" },
  ];

  const features = [
    {
      icon: Package,
      title: "Multi-Product Portfolio",
      description: "Visualize entire product roadmap with dependency tracking",
      highlight: "Product Roadmaps",
    },
    {
      icon: Smartphone,
      title: "Hardware-Software Sync",
      description: "Synchronize firmware and hardware milestones",
      highlight: "Firmware Sync",
    },
    {
      icon: Globe,
      title: "Global Launch Coordination",
      description: "Plan global product launches with marketing readiness",
      highlight: "Global Launches",
    },
  ];

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Modern tech grid */}
      <div className="fixed inset-0 opacity-[0.05] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Animated sync waves */}
      <div className="fixed inset-0 pointer-events-none">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full border border-purple-500/10"
            style={{ x: "-50%", y: "-50%" }}
            animate={{
              scale: [1 + i * 0.3, 2 + i * 0.3],
              opacity: [0.3 - i * 0.1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 1.3,
            }}
          />
        ))}
      </div>

      {/* Gradient orb */}
      <motion.div
        className="fixed top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-3xl pointer-events-none"
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <Navigation />
      <main className="flex-1 relative z-10 pt-20">
        {/* Hero Section - Product Showcase Layout */}
        <section className="relative py-32 overflow-hidden min-h-[90vh] flex items-center">
          <div className="container mx-auto max-w-7xl px-4 sm:px-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-purple-400 font-medium">Global Product Launches</span>
                </motion.div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Ship Innovative Products
                  </span>
                  <br />
                  <span className="text-white">Faster</span>
                </h1>

                <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                  Coordinate hardware, software, and supply chain to deliver
                  cutting-edge consumer devices at scale across global markets
                  with intelligent planning and real-time coordination.
                </p>


                {/* Quick Stats */}
                <div className="flex gap-8">
                  {[
                    { value: "50%", label: "Faster to Market" },
                    { value: "95%", label: "On-Time Launch" },
                    { value: "200+", label: "Companies" },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className="text-3xl font-bold text-purple-400 mb-1">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right - Product Sync Visualization */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-3xl p-10 border border-purple-500/20 shadow-2xl">
                  {/* Product Icons */}
                  <div className="flex justify-center gap-8 mb-10">
                    {products.map((product, index) => {
                      const IconComponent = product.icon;
                      return (
                        <motion.div
                          key={index}
                          className={`relative w-24 h-24 rounded-2xl bg-gradient-to-br ${product.color} border-2 border-purple-500/30 flex items-center justify-center cursor-pointer`}
                          onMouseEnter={() => setHoveredProduct(index)}
                          onMouseLeave={() => setHoveredProduct(null)}
                          animate={{
                            y: hoveredProduct === index ? [-8, 8, -8] : 0,
                            scale: hoveredProduct === index ? 1.2 : 1,
                          }}
                          transition={{ duration: 1.5, repeat: hoveredProduct === index ? Infinity : 0 }}
                          whileHover={{ 
                            scale: 1.2,
                            boxShadow: "0 15px 40px rgba(139, 92, 246, 0.4)"
                          }}
                        >
                          <IconComponent className="h-12 w-12 text-purple-400" />
                          {hoveredProduct === index && (
                            <motion.div
                              className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-purple-400"
                              animate={{ scale: [1, 1.8, 1], opacity: [1, 0.3, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Connection Lines */}
                  <svg className="absolute top-1/2 left-0 w-full h-0" style={{ top: '50%' }}>
                    <motion.line
                      x1="15%"
                      y1="0"
                      x2="40%"
                      y2="0"
                      stroke="rgb(139, 92, 246)"
                      strokeWidth="2"
                      strokeDasharray="5 5"
                      animate={{ pathLength: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.line
                      x1="60%"
                      y1="0"
                      x2="85%"
                      y2="0"
                      stroke="rgb(139, 92, 246)"
                      strokeWidth="2"
                      strokeDasharray="5 5"
                      animate={{ pathLength: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                  </svg>

                  {/* Sync Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-semibold">Device Sync</span>
                      </div>
                      <span className="text-lg font-bold text-purple-400">{syncProgress}%</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
                        animate={{ width: `${syncProgress}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </div>

                  {/* Launch Timeline */}
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold">Products Launched</span>
                      <span className="text-2xl font-bold text-purple-400">6</span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">18 Months Timeline</div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${launchProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Challenges - Modern Card Grid */}
        <section className="py-24 bg-gradient-to-b from-black via-purple-950/10 to-black relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-12">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                The Fast-Paced World of Consumer Electronics
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Managing rapid product cycles while maintaining quality and global coordination
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Zap,
                  title: "Rapid Product Cycles",
                  description: "Managing multiple product generations simultaneously",
                  stat: "6-12",
                  statLabel: "Month Cycles",
                },
                {
                  icon: Globe,
                  title: "Global Supply Chain",
                  description: "Managing components from multiple continents",
                  stat: "50+",
                  statLabel: "Countries",
                },
                {
                  icon: Smartphone,
                  title: "Software Integration",
                  description: "Synchronizing firmware, OS, and app development",
                  stat: "3",
                  statLabel: "Layers",
                },
                {
                  icon: CheckCircle2,
                  title: "Quality at Scale",
                  description: "Maintaining quality across millions of units",
                  stat: "100M+",
                  statLabel: "Units",
                },
              ].map((challenge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/50 transition-all h-full group">
                    <CardContent className="p-6">
                      <motion.div 
                        className="h-14 w-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20"
                        whileHover={{ rotate: [0, -15, 15, 0], scale: 1.2 }}
                        transition={{ duration: 0.6 }}
                      >
                        <challenge.icon className="h-7 w-7 text-purple-400" />
                      </motion.div>
                      <motion.div 
                        className="text-3xl font-bold text-purple-400 mb-2"
                        whileHover={{ scale: 1.15 }}
                      >
                        {challenge.stat}
                      </motion.div>
                      <div className="text-xs text-muted-foreground mb-3">{challenge.statLabel}</div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-purple-300 transition-colors">{challenge.title}</h3>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions - Feature Showcase */}
        <section className="py-24 bg-background relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-12">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Built for Consumer Electronics Speed
              </h2>
            </motion.div>

            {/* Large Feature Cards */}
            <div className="space-y-8 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ scale: 1.02, x: index % 2 === 0 ? -10 : 10 }}
                >
                  <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/50 transition-all">
                    <CardContent className="p-10">
                      <div className="flex gap-8 items-center">
                        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border-2 border-purple-500/30 flex-shrink-0">
                          <feature.icon className="h-12 w-12 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs text-purple-400 font-medium mb-3">
                            {feature.highlight}
                          </div>
                          <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases - Product Showcase Grid */}
        <section className="py-24 bg-gradient-to-b from-black via-purple-950/10 to-black relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-12">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Powering the World's Most Innovative Products
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Smartphone Platform",
                  company: "TechMobile Global",
                  description: "Accelerated flagship launch by coordinating chipset development, camera systems, and Android integration",
                  metrics: [
                    { value: "4", label: "Months Faster", icon: Clock },
                    { value: "50+", label: "Countries", icon: Globe },
                  ],
                  badge: "Flagship Launch",
                  gradient: "from-purple-500/20 via-pink-500/20 to-purple-500/20",
                },
                {
                  title: "Smart Home Ecosystem",
                  company: "HomeTech Solutions",
                  description: "Coordinated development of smart speakers, displays, and sensors with unified software platform",
                  metrics: [
                    { value: "10+", label: "Products", icon: Package },
                    { value: "18", label: "Months", icon: Clock },
                  ],
                  badge: "Ecosystem Launch",
                  gradient: "from-pink-500/20 via-purple-500/20 to-pink-500/20",
                },
                {
                  title: "Wearable Device Platform",
                  company: "FitTech Wearables",
                  description: "Integrated advanced sensors, health algorithms, and companion app development",
                  metrics: [
                    { value: "6", label: "Months Dev", icon: Clock },
                    { value: "5M+", label: "Units Shipped", icon: ShoppingBag },
                  ],
                  badge: "Health Platform",
                  gradient: "from-purple-500/20 via-indigo-500/20 to-purple-500/20",
                },
              ].map((useCase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, rotateY: -15 }}
                  whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, rotateY: 5 }}
                  className="group"
                >
                  <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/50 transition-all overflow-hidden h-full group">
                    <div className={`h-48 bg-gradient-to-br ${useCase.gradient} relative overflow-hidden`}>
                      {/* Unique Visuals for Each Card */}
                      {index === 0 && (
                        // Smartphone Platform - Phone with chipset and camera
                        <>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              className="relative"
                              animate={{ y: [0, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Smartphone className="h-20 w-20 text-purple-400/60" />
                              <motion.div
                                className="absolute -top-2 -right-2"
                                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                                transition={{ duration: 3, repeat: Infinity }}
                              >
                                <Camera className="h-6 w-6 text-purple-400" />
                              </motion.div>
                              <motion.div
                                className="absolute -bottom-2 -left-2"
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                              >
                                <Cpu className="h-5 w-5 text-purple-300" />
                              </motion.div>
                            </motion.div>
                          </div>
                          {/* Connection waves */}
                          <svg className="absolute inset-0 w-full h-full opacity-30">
                            {[0, 1, 2].map((i) => (
                              <motion.circle
                                key={i}
                                cx="50%"
                                cy="50%"
                                r={20 + i * 15}
                                fill="none"
                                stroke="rgb(139, 92, 246)"
                                strokeWidth="1"
                                animate={{
                                  r: [20 + i * 15, 40 + i * 15, 20 + i * 15],
                                  opacity: [0.3, 0.1, 0.3],
                                }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                              />
                            ))}
                          </svg>
                        </>
                      )}
                      
                      {index === 1 && (
                        // Smart Home Ecosystem - Multiple connected devices
                        <>
                          <div className="absolute inset-0 flex items-center justify-center gap-6">
                            <motion.div
                              animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
                              transition={{ duration: 2.5, repeat: Infinity }}
                            >
                              <Speaker className="h-12 w-12 text-purple-400/70" />
                            </motion.div>
                            <motion.div
                              animate={{ y: [0, -8, 0], scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                            >
                              <Monitor className="h-14 w-14 text-purple-400/70" />
                            </motion.div>
                            <motion.div
                              animate={{ y: [0, -15, 0], rotate: [0, -5, 5, 0] }}
                              transition={{ duration: 2.8, repeat: Infinity, delay: 0.6 }}
                            >
                              <Home className="h-10 w-10 text-purple-400/70" />
                            </motion.div>
                          </div>
                          {/* Connection lines between devices */}
                          <svg className="absolute inset-0 w-full h-full opacity-40">
                            <motion.line
                              x1="30%"
                              y1="50%"
                              x2="50%"
                              y2="50%"
                              stroke="rgb(139, 92, 246)"
                              strokeWidth="2"
                              strokeDasharray="5 5"
                              animate={{ pathLength: [0, 1, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            <motion.line
                              x1="50%"
                              y1="50%"
                              x2="70%"
                              y2="50%"
                              stroke="rgb(139, 92, 246)"
                              strokeWidth="2"
                              strokeDasharray="5 5"
                              animate={{ pathLength: [0, 1, 0] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            />
                          </svg>
                        </>
                      )}
                      
                      {index === 2 && (
                        // Wearable Device Platform - Watch with health sensors
                        <>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              className="relative"
                              animate={{ rotate: [0, 5, -5, 0] }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              <Video className="h-24 w-24 text-purple-400/60" />
                              <motion.div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <HeartPulse className="h-8 w-8 text-pink-400" />
                              </motion.div>
                              <motion.div
                                className="absolute -top-4 left-1/2 -translate-x-1/2"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <Activity className="h-5 w-5 text-purple-300" />
                              </motion.div>
                            </motion.div>
                          </div>
                          {/* Pulse rings */}
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-400/30"
                              style={{ width: 40 + i * 20, height: 40 + i * 20 }}
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.4, 0, 0.4],
                              }}
                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                            />
                          ))}
                        </>
                      )}
                      
                      <div className="absolute top-4 right-4 z-10">
                        <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs text-purple-400 font-medium">
                          {useCase.badge}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 z-10">
                        <div className="text-xs text-purple-400/80 font-medium">{useCase.company}</div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                      <p className="text-muted-foreground mb-6 text-sm leading-relaxed">{useCase.description}</p>
                      <div className="flex gap-4 pt-4 border-t border-white/10">
                        {useCase.metrics.map((metric, mIndex) => {
                          const IconComponent = metric.icon;
                          return (
                            <div key={mIndex} className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <IconComponent className="h-4 w-4 text-purple-400" />
                                <div className="text-xl font-bold text-purple-400">{metric.value}</div>
                              </div>
                              <div className="text-xs text-muted-foreground">{metric.label}</div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Metrics - Modern Dashboard */}
        <section className="py-24 bg-background relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-12">
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: ShoppingBag, value: "200+", label: "Electronics Companies", color: "purple" },
                { icon: Package, value: "500+", label: "Products Launched", color: "purple" },
                { icon: CheckCircle2, value: "95%", label: "On-Time Launch Rate", color: "purple" },
                { icon: TrendingUp, value: "50%", label: "Faster Time-to-Market", color: "purple" },
              ].map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/50 transition-all">
                    <CardContent className="p-8 text-center">
                      <motion.div
                        className="h-16 w-16 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-6 border border-purple-500/20"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <metric.icon className="h-8 w-8 text-purple-400" />
                      </motion.div>
                      <div className="text-4xl font-bold text-purple-400 mb-2">{metric.value}</div>
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

export default ConsumerElectronics;
