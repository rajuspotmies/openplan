"use client";

import { useEffect, useRef, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plane,
  Radar,
  Zap,
  Activity,
  Navigation as NavIcon,
  Satellite,
  Gauge,
  ArrowRight,
  Radio,
  MapPin,
  TrendingUp,
  AlertCircle,
  Cpu,
  Battery,
  Wind,
  Layers,
  Shield,
  Package,
  Truck,
  Camera,
  Search,
  Thermometer,
  Sprout,
  Eye,
} from "lucide-react";

const Drone = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFlightPath, setActiveFlightPath] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlightPath((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const flightPaths = [
    { id: 0, d: "M 50 200 Q 200 50 350 150 T 650 200", color: "rgb(6, 182, 212)" },
    { id: 1, d: "M 50 150 Q 300 300 550 100 T 650 200", color: "rgb(99, 102, 241)" },
    { id: 2, d: "M 50 250 Q 250 50 450 200 T 650 150", color: "rgb(139, 92, 246)" },
  ];

  const telemetryData = [
    { label: "Altitude", value: "120m", icon: Gauge, trend: "+5m" },
    { label: "Speed", value: "45 km/h", icon: Zap, trend: "Stable" },
    { label: "Battery", value: "78%", icon: Battery, trend: "-2%" },
    { label: "Signal", value: "95%", icon: Satellite, trend: "Strong" },
  ];

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Dynamic sky background with moving gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              "radial-gradient(circle at 20% 30%, rgba(6, 182, 212, 0.4) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.4) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.4) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 30%, rgba(6, 182, 212, 0.4) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>
          
          {/* Animated flight path lines */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <svg className="absolute inset-0 w-full h-full">
          {flightPaths.map((path) => (
              <motion.path
              key={path.id}
              d={path.d}
                fill="none"
              stroke={path.color}
                strokeWidth="2"
                strokeDasharray="10 5"
                initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: activeFlightPath === path.id ? 1 : 0.3,
                opacity: activeFlightPath === path.id ? 0.6 : 0.1,
              }}
              transition={{ duration: 2 }}
            />
          ))}
            </svg>
          </div>

      {/* Parallax cursor effect */}
      <motion.div
        className="fixed w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none z-0"
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />

      <Navigation />
      <main className="flex-1 relative z-10 pt-20">
        {/* Hero Section - Asymmetric Dynamic Layout */}
        <section className="relative py-32 overflow-hidden min-h-[90vh] flex items-center">
          <div className="container mx-auto max-w-7xl px-4 sm:px-12 relative z-10">
            <div className="grid lg:grid-cols-5 gap-12 items-center">
              {/* Left Content - 2 columns */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-2"
              >
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Radar className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-cyan-400 font-medium">FAA Part 107 Compliant</span>
                </motion.div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    Master Complex
                  </span>
                  <br />
                  <span className="text-white">Drone Development</span>
                </h1>

                <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                  Coordinate hardware, firmware, and software teams to deliver
                  cutting-edge UAV solutions faster with integrated flight testing
                  and real-time telemetry.
                </p>


                {/* Live Stats */}
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { value: "60%", label: "Faster Dev" },
                    { value: "95%", label: "On-Time" },
                    { value: "300+", label: "Manufacturers" },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className="text-3xl font-bold text-cyan-400 mb-1">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right Visualization - 3 columns with telemetry */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-3 relative"
              >
                {/* Drone with rotating propellers */}
                <div className="relative mb-12">
                  <motion.div
                    className="w-48 h-48 mx-auto relative"
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                      <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 rounded-2xl border-2 border-cyan-500/30 flex items-center justify-center backdrop-blur-sm">
                        <Plane className="h-16 w-16 text-cyan-400" />
                      </div>
                    </div>
                    {/* Rotating propellers */}
                      {[0, 90, 180, 270].map((rotation, i) => (
                        <motion.div
                          key={i}
                        className="absolute w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"
                          style={{
                            top: '50%',
                            left: '50%',
                            transformOrigin: '0 0',
                          transform: `rotate(${rotation}deg) translateY(-60px)`,
                          }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.1, repeat: Infinity, ease: "linear" }}
                        />
                      ))}
                  </motion.div>
                  </div>

                {/* Telemetry Grid */}
                    <div className="grid grid-cols-2 gap-4">
                  {telemetryData.map((data, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/20 cursor-pointer"
                      whileHover={{ 
                        scale: 1.05, 
                        borderColor: "rgba(6, 182, 212, 0.5)",
                        boxShadow: "0 10px 30px rgba(6, 182, 212, 0.2)"
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <data.icon className="h-5 w-5 text-cyan-400" />
                        <span className="text-xs text-cyan-400/60">{data.trend}</span>
                      </div>
                      <div className="text-2xl font-bold text-cyan-400 mb-1">{data.value}</div>
                      <div className="text-xs text-muted-foreground">{data.label}</div>
                    </motion.div>
                  ))}
                  </div>

                {/* Flight Path Indicator */}
                <motion.div
                  className="mt-6 bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="text-xs text-muted-foreground mb-3">Active Flight Path</div>
                  <svg className="w-full h-20" viewBox="0 0 700 250">
                        <motion.path
                      d={flightPaths[activeFlightPath].d}
                          fill="none"
                      stroke={flightPaths[activeFlightPath].color}
                      strokeWidth="3"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                      transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.circle
                      r="4"
                      fill={flightPaths[activeFlightPath].color}
                      animate={{
                        cx: [50, 350, 650],
                        cy: [200, 150, 200],
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                      </svg>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Challenges - Diagonal Card Layout */}
        <section className="py-24 bg-background relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-12">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
                <AlertCircle className="h-4 w-4 text-cyan-400" />
                <span className="text-sm text-cyan-400">Development Challenges</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                The Multi-Domain Challenge
              </h2>
            </motion.div>

            {/* Asymmetric Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Layers,
                  title: "Hardware-Software-Firmware Integration",
                  description: "Synchronizing mechanical, electrical, and software development cycles",
                  stat: "4",
                  statLabel: "Domains",
                  delay: 0,
                },
                {
                  icon: Shield,
                  title: "Regulatory Compliance",
                  description: "Navigating FAA, EASA, and country-specific regulations",
                  stat: "50+",
                  statLabel: "Regulatory Bodies",
                  delay: 0.1,
                },
                {
                  icon: Zap,
                  title: "Rapid Technology Evolution",
                  description: "Adapting to new sensor technologies and AI capabilities",
                  stat: "2x",
                  statLabel: "Tech Refresh",
                  delay: 0.2,
                },
              ].map((challenge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, rotate: -2 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: challenge.delay }}
                  whileHover={{ y: -10, rotate: 1, scale: 1.02 }}
                  className={index === 1 ? "md:col-span-2" : ""}
                >
                  <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border-cyan-500/20 hover:border-cyan-500/50 transition-all h-full relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-8 relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <motion.div 
                          className="h-16 w-16 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20"
                          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <challenge.icon className="h-8 w-8 text-cyan-400" />
                        </motion.div>
                        <div className="text-right">
                          <motion.div 
                            className="text-4xl font-bold text-cyan-400"
                            whileHover={{ scale: 1.1 }}
                          >
                            {challenge.stat}
                          </motion.div>
                          <div className="text-xs text-muted-foreground">{challenge.statLabel}</div>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-cyan-300 transition-colors">{challenge.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{challenge.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions - Hexagonal/Network Layout */}
        <section className="py-24 bg-gradient-to-b from-black via-cyan-950/20 to-black relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-12">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Unified Platform for Innovation
              </h2>
            </motion.div>

            {/* Central Hub with Connected Nodes */}
            <div className="relative max-w-5xl mx-auto">
              {/* Central Feature */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <div className="inline-block bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 rounded-3xl p-12 border-2 border-cyan-500/30 backdrop-blur-sm">
                  <Cpu className="h-20 w-20 text-cyan-400 mx-auto mb-6" />
                  <h3 className="text-3xl font-bold mb-4">Multi-Domain Planning</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Integrated hardware, firmware, and software roadmaps with real-time dependency tracking
                  </p>
                </div>
              </motion.div>

              {/* Connected Features */}
              <div className="grid md:grid-cols-3 gap-8 relative">
                {[
                {
                  icon: Activity,
                  title: "Flight Test Management",
                    description: "Plan and track flight test campaigns",
                    position: "top",
                },
                {
                  icon: Radio,
                  title: "Telemetry & Analytics",
                    description: "Connect flight data to development",
                    position: "left",
                },
                {
                  icon: NavIcon,
                  title: "BVLOS Operations",
                    description: "Manage beyond visual line of sight",
                    position: "right",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                    initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Card className="bg-slate-900/80 backdrop-blur-sm border-cyan-500/20 hover:border-cyan-500/50 transition-all">
                      <CardContent className="p-6 text-center">
                        <div className="h-16 w-16 rounded-xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                          <feature.icon className="h-8 w-8 text-cyan-400" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases - Carousel-like Cards */}
        <section className="py-24 bg-background relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-12">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Powering the Future of Flight
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Commercial Delivery Drone",
                  company: "LogiFly Systems",
                  description: "Accelerated time-to-market by coordinating hardware optimization and flight control software",
                  metrics: { value: 50, label: "Faster Development", suffix: "%" },
                  badge: "FAA Approved",
                },
                {
                  title: "Agricultural Monitoring UAV",
                  company: "AgriTech Drones",
                  description: "Coordinated development of multispectral imaging payload and autonomous flight software",
                  metrics: { value: 30, label: "Efficiency Gain", suffix: "%" },
                  badge: "EASA Certified",
                },
                {
                  title: "Search & Rescue Drone",
                  company: "RescueTech Aviation",
                  description: "Rapidly developed ruggedized platform with thermal imaging and AI-powered detection",
                  metrics: { value: 6, label: "Months to Production" },
                  badge: "BVLOS Certified",
                },
              ].map((useCase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, rotateY: -15 }}
                  whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, rotateY: 5 }}
                  className="group perspective-1000"
                >
                  <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border-cyan-500/20 hover:border-cyan-500/50 transition-all overflow-hidden h-full group">
                    <div className="h-48 bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-cyan-500/20 relative overflow-hidden">
                      {/* Unique Visuals for Each Drone Use Case */}
                      {index === 0 && (
                        // Commercial Delivery - Drone with package and delivery route
                        <>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              className="relative"
                              animate={{ y: [0, -20, 0] }}
                              transition={{ duration: 2.5, repeat: Infinity }}
                            >
                              <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                              >
                                <Plane className="h-20 w-20 text-cyan-400/80" />
                              </motion.div>
                              {/* Package hanging below */}
                              <motion.div
                                className="absolute -bottom-10 left-1/2 -translate-x-1/2"
                                animate={{ y: [0, 8, 0], rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                              >
                                <Package className="h-12 w-12 text-cyan-300 drop-shadow-lg" />
                              </motion.div>
                              {/* Connection line */}
                              <motion.div
                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-cyan-400/50"
                                animate={{ height: [32, 40, 32] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            </motion.div>
                          </div>
                          {/* Delivery route path */}
                          <svg className="absolute inset-0 w-full h-full opacity-50">
                            <motion.path
                              d="M 20 120 Q 150 80 280 100 T 500 120"
                              fill="none"
                              stroke="rgb(6, 182, 212)"
                              strokeWidth="3"
                              strokeDasharray="8 4"
                              animate={{ pathLength: [0, 1, 0] }}
                              transition={{ duration: 4, repeat: Infinity }}
                            />
                            {/* Moving delivery point */}
                            <motion.circle
                              r="4"
                              fill="rgb(6, 182, 212)"
                              animate={{
                                cx: [20, 150, 280, 500],
                                cy: [120, 80, 100, 120],
                              }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            />
                          </svg>
                          {/* Delivery destination markers */}
                          {[0, 1].map((i) => (
                            <motion.div
                              key={i}
                              className="absolute bottom-4 w-2 h-2 rounded-full bg-cyan-400"
                              style={{ left: `${20 + i * 60}%` }}
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                            />
                          ))}
                        </>
                      )}
                      
                      {index === 1 && (
                        // Agricultural Monitoring - Drone scanning fields
                        <>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              className="relative"
                              animate={{ y: [0, -15, 0], x: [0, 12, 0] }}
                              transition={{ duration: 3.5, repeat: Infinity }}
                            >
                              <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                              >
                                <Plane className="h-20 w-20 text-cyan-400/80" />
                              </motion.div>
                              {/* Multispectral camera */}
                              <motion.div
                                className="absolute -bottom-8 left-1/2 -translate-x-1/2"
                                animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                              >
                                <Camera className="h-10 w-10 text-emerald-400 drop-shadow-lg" />
                              </motion.div>
                              {/* Scanning beam */}
                              <motion.div
                                className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-16 h-1 bg-emerald-400/60 blur-sm"
                                animate={{ width: [64, 96, 64], opacity: [0.6, 1, 0.6] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            </motion.div>
                          </div>
                          {/* Animated field rows */}
                          <div className="absolute bottom-0 left-0 right-0 h-20 opacity-40">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                              <motion.div
                                key={i}
                                className="absolute bottom-0 h-6 bg-emerald-500/50 rounded-t"
                                style={{ 
                                  left: `${i * 16.66}%`,
                                  width: '15%',
                                }}
                                animate={{ 
                                  height: [24, 32, 24],
                                  opacity: [0.4, 0.7, 0.4]
                                }}
                                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }}
                              />
                            ))}
                          </div>
                          {/* Crop icons */}
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="absolute bottom-6"
                              style={{ left: `${25 + i * 25}%` }}
                              animate={{ 
                                y: [0, -3, 0],
                                rotate: [0, 5, -5, 0]
                              }}
                              transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                            >
                              <Sprout className="h-5 w-5 text-emerald-300" />
                            </motion.div>
                          ))}
                          {/* Grid pattern overlay */}
                          <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.2) 1px, transparent 1px),
                                             linear-gradient(90deg, rgba(16, 185, 129, 0.2) 1px, transparent 1px)`,
                            backgroundSize: '30px 30px',
                          }} />
                        </>
                      )}
                      
                      {index === 2 && (
                        // Search & Rescue - Drone with thermal imaging and search pattern
                        <>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              className="relative"
                              animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              <Plane className="h-24 w-24 text-cyan-400/80" />
                              {/* Central search icon */}
                              <motion.div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                animate={{ 
                                  scale: [1, 1.4, 1], 
                                  opacity: [0.8, 1, 0.8],
                                  rotate: [0, 180, 360]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <Search className="h-12 w-12 text-orange-400 drop-shadow-lg" />
                              </motion.div>
                              {/* Thermal sensor */}
                              <motion.div
                                className="absolute -right-6 top-1/2 -translate-y-1/2"
                                animate={{ 
                                  rotate: [0, 360],
                                  scale: [1, 1.2, 1]
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              >
                                <Thermometer className="h-7 w-7 text-red-400" />
                              </motion.div>
                              {/* Eye icon for detection */}
                              <motion.div
                                className="absolute -left-6 top-1/2 -translate-y-1/2"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                              >
                                <Eye className="h-6 w-6 text-orange-300" />
                              </motion.div>
                            </motion.div>
                          </div>
                          {/* Scanning radar pattern */}
                          <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {[0, 1, 2].map((i) => (
                              <motion.g
                                key={i}
                                transform={`rotate(${i * 120} 50 50)`}
                              >
                                <motion.line
                                  x1="50"
                                  y1="50"
                                  x2="50"
                                  y2="0"
                                  stroke="rgb(251, 146, 60)"
                                  strokeWidth="2"
                                  strokeDasharray="5 5"
                                  animate={{ 
                                    pathLength: [0, 1, 0],
                                    opacity: [0.3, 0.8, 0.3]
                                  }}
                                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                                />
                              </motion.g>
                            ))}
                          </svg>
                          {/* Moving scan line */}
                          <svg className="absolute inset-0 w-full h-full opacity-70">
                            <motion.line
                              x1="0"
                              y1="50%"
                              x2="100%"
                              y2="50%"
                              stroke="rgb(251, 146, 60)"
                              strokeWidth="3"
                              strokeDasharray="15 5"
                              animate={{ 
                                x1: ["-10%", "110%"],
                                x2: ["90%", "210%"],
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{ duration: 3, repeat: Infinity }}
                            />
                          </svg>
                          {/* Heat signature hotspots */}
                          {[0, 1, 2, 3].map((i) => (
                            <motion.div
                              key={i}
                              className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-red-500"
                              style={{
                                bottom: `${15 + i * 20}%`,
                                left: `${20 + i * 15}%`,
                              }}
                              animate={{
                                scale: [1, 1.8, 1],
                                opacity: [0.6, 1, 0.6],
                                boxShadow: [
                                  "0 0 0px rgba(251, 146, 60, 0)",
                                  "0 0 15px rgba(251, 146, 60, 0.8)",
                                  "0 0 0px rgba(251, 146, 60, 0)"
                                ]
                              }}
                              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                            />
                          ))}
                          {/* Crosshair overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-30">
                            <div className="w-24 h-24 border-2 border-orange-400/50 rounded-full">
                              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-orange-400/50" />
                              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-orange-400/50" />
                            </div>
                          </div>
                        </>
                      )}
                      
                      {/* Company name overlay */}
                      <div className="absolute bottom-4 left-4 z-10">
                      <motion.div
                          className="text-xs text-cyan-400/90 font-semibold"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                          {useCase.company}
                      </motion.div>
                      </div>
                      
                      {/* Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <motion.span
                          className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-xs text-cyan-400 font-medium"
                          whileHover={{ scale: 1.1 }}
                        >
                          {useCase.badge}
                        </motion.span>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{useCase.company}</p>
                      <p className="text-muted-foreground mb-6 text-sm leading-relaxed">{useCase.description}</p>
                      <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                        <TrendingUp className="h-5 w-5 text-cyan-400" />
                        <div>
                          <div className="text-2xl font-bold text-cyan-400">
                            {useCase.metrics.value}{useCase.metrics.suffix}
                                </div>
                          <div className="text-xs text-muted-foreground">{useCase.metrics.label}</div>
                            </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Metrics - Animated Dashboard Style */}
        <section className="py-24 bg-gradient-to-b from-black via-cyan-950/20 to-black relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-12">
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: Plane, value: "300+", label: "Drone Manufacturers", color: "cyan" },
                { icon: Activity, value: "1,500+", label: "UAV Platforms", color: "cyan" },
                { icon: Gauge, value: "95%", label: "On-Time Delivery", color: "cyan" },
                { icon: Zap, value: "60%", label: "Faster Time-to-Market", color: "cyan" },
              ].map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Card className="bg-slate-900/80 backdrop-blur-sm border-cyan-500/20 hover:border-cyan-500/50 transition-all">
                    <CardContent className="p-8 text-center">
                      <motion.div
                        className="h-16 w-16 rounded-xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-6 border border-cyan-500/20"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <metric.icon className="h-8 w-8 text-cyan-400" />
                      </motion.div>
                      <div className="text-4xl font-bold text-cyan-400 mb-2">{metric.value}</div>
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

export default Drone;
