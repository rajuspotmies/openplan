"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "@/lib/router";

// Teams & roles that use OpenPlan across the hardware lifecycle
interface TeamCard {
  name: string;
  logo: string;
}

const logoCompanies: TeamCard[] = [
  { name: "Product Teams", logo: "Nova" },
  { name: "Sourcing & Supply Chain", logo: "Atlas" },
  { name: "Build Tracking", logo: "Pixel" },
  { name: "Production Planning", logo: "Orbit" },
  { name: "Analytics & Reporting", logo: "Sync" },
  { name: "Cross-team Collaboration", logo: "Flux" },
  { name: "Quality & Testing", logo: "Vertex" },
  { name: "Inventory & Warehouse", logo: "Nimbus" },
  { name: "End-to-End Planning", logo: "Horizon" },
  { name: "Procurement", logo: "Apex" },
  { name: "Design-to-Manufacturing", logo: "Prism" },
  { name: "Rapid Prototyping", logo: "Acme" },
];

// Core workflow pillars OpenPlan unifies
interface WorkflowPillar {
  title: string;
  description: string;
  icon: "plan" | "source" | "build";
  color: string;
}

const workflowPillars: WorkflowPillar[] = [
  {
    title: "Unified BOM & Planning",
    description:
      "Keep your bill of materials, specs, and roadmap in sync as your product evolves.",
    icon: "plan",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Supplier & Sourcing Visibility",
    description:
      "See lead times, costs, and supplier status without leaving OpenPlan.",
    icon: "source",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    title: "Build & Quality Tracking",
    description:
      "Track builds and catch quality issues before they reach customers.",
    icon: "build",
    color: "from-green-500/20 to-emerald-500/20",
  },
];

// SVG-style logo component with visual icons
const CompanyLogo = ({
  name,
  iconKey,
  className = "",
  variant = "default"
}: {
  name: string;
  iconKey?: string;
  className?: string;
  variant?: "default" | "large" | "featured";
}) => {

  const size = variant === "default" ? 32 : variant === "large" ? 48 : 40;

  // Create unique, professional icon designs with animations
  const renderLogo = () => {
    const logoSize = 32;
    const logos: Record<string, React.JSX.Element> = {
      'Nova': <svg width={logoSize} height={logoSize} viewBox="0 0 32 32" fill="none" className="icon-nova"><circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" className="animate-pulse-ring" /><circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" className="animate-pulse-ring-delayed" /><circle cx="16" cy="16" r="3" fill="currentColor" opacity="0.8" className="animate-pulse-dot" /></svg>,
      'Atlas': <svg width={logoSize} height={logoSize} viewBox="0 0 32 32" fill="none" className="icon-atlas"><rect x="6" y="8" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" /><path d="M16 8v16M6 16h20" stroke="currentColor" strokeWidth="1.5" opacity="0.6" className="animate-draw-line" /><circle cx="16" cy="16" r="2" fill="currentColor" opacity="0.8" className="animate-pulse-dot" /></svg>,
      'Pixel': <svg width={logoSize} height={logoSize} viewBox="0 0 32 32" fill="none" className="icon-pixel"><rect x="4" y="4" width="10" height="10" rx="1" fill="currentColor" opacity="0.5" className="animate-pixel-1" /><rect x="18" y="4" width="10" height="10" rx="1" fill="currentColor" opacity="0.5" className="animate-pixel-2" /><rect x="4" y="18" width="10" height="10" rx="1" fill="currentColor" opacity="0.5" className="animate-pixel-3" /><rect x="18" y="18" width="10" height="10" rx="1" fill="currentColor" opacity="0.5" className="animate-pixel-4" /></svg>,
      'Orbit': <svg width={logoSize} height={logoSize} viewBox="0 0 32 32" fill="none" className="icon-orbit"><circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" className="animate-rotate-slow" style={{ transformOrigin: '16px 16px' }} /><circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" className="animate-rotate-reverse" style={{ transformOrigin: '16px 16px' }} /><circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.7" className="animate-pulse-dot" /><circle cx="24" cy="16" r="2" fill="currentColor" opacity="0.6" className="animate-orbit-planet" /></svg>,
      'Sync': <svg width={logoSize} height={logoSize} viewBox="0 0 32 32" fill="none" className="icon-sync"><path d="M8 16L14 10L20 16L14 22L8 16Z" fill="currentColor" opacity="0.5" className="animate-sync-1" /><path d="M12 10L18 4L24 10L18 16L12 10Z" fill="currentColor" opacity="0.3" className="animate-sync-2" /><path d="M12 22L18 16L24 22L18 28L12 22Z" fill="currentColor" opacity="0.3" className="animate-sync-3" /></svg>,
      'Flux': <svg width={logoSize} height={logoSize} viewBox="0 0 32 32" fill="none" className="icon-flux"><path d="M16 4L20 12L28 14L20 16L16 24L12 16L4 14L12 12L16 4Z" fill="currentColor" opacity="0.5" className="animate-rotate-slow" style={{ transformOrigin: '16px 16px' }} /><circle cx="16" cy="16" r="3" fill="currentColor" opacity="0.8" className="animate-pulse-dot" /></svg>,
      'Vertex': <svg width={logoSize} height={logoSize} viewBox="0 0 32 32" fill="none" className="icon-vertex"><polygon points="16,4 26,26 6,26" fill="currentColor" opacity="0.4" className="animate-vertex-glow" /><polygon points="16,10 22,24 10,24" fill="currentColor" opacity="0.6" className="animate-vertex-glow-delayed" /><circle cx="16" cy="18" r="2" fill="currentColor" opacity="0.9" className="animate-pulse-dot" /></svg>,
      'Nimbus': <svg width={logoSize} height={logoSize} viewBox="0 0 32 32" fill="none" className="icon-nimbus"><ellipse cx="10" cy="16" rx="6" ry="4" fill="currentColor" opacity="0.4" className="animate-nimbus-1" /><ellipse cx="22" cy="16" rx="6" ry="4" fill="currentColor" opacity="0.4" className="animate-nimbus-2" /><ellipse cx="16" cy="12" rx="4" ry="3" fill="currentColor" opacity="0.5" className="animate-nimbus-3" /><ellipse cx="16" cy="20" rx="4" ry="3" fill="currentColor" opacity="0.5" className="animate-nimbus-4" /></svg>,
      'Horizon': <svg width={logoSize} height={logoSize} viewBox="0 0 32 32" fill="none" className="icon-horizon"><rect x="4" y="14" width="24" height="2" fill="currentColor" opacity="0.6" /><circle cx="8" cy="15" r="3" fill="currentColor" opacity="0.5" className="animate-horizon-dot-1" /><circle cx="16" cy="15" r="3" fill="currentColor" opacity="0.5" className="animate-horizon-dot-2" /><circle cx="24" cy="15" r="3" fill="currentColor" opacity="0.5" className="animate-horizon-dot-3" /><path d="M4 8 Q16 4 28 8" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" className="animate-horizon-wave" /></svg>,
      'Apex': <svg width={logoSize} height={logoSize} viewBox="0 0 32 32" fill="none" className="icon-apex"><path d="M16 4L28 28H4L16 4Z" fill="currentColor" opacity="0.5" className="animate-apex-glow" /><path d="M16 10L24 26H8L16 10Z" fill="currentColor" opacity="0.7" className="animate-apex-glow-delayed" /><rect x="14" y="20" width="4" height="6" fill="currentColor" opacity="0.9" className="animate-pulse-dot" /></svg>,
      'Prism': <svg width={logoSize} height={logoSize} viewBox="0 0 32 32" fill="none" className="icon-prism"><polygon points="16,4 26,12 26,20 16,28 6,20 6,12" fill="currentColor" opacity="0.4" className="animate-prism-rotate" style={{ transformOrigin: '16px 16px' }} /><polygon points="16,8 22,12 22,20 16,24 10,20 10,12" fill="currentColor" opacity="0.6" className="animate-prism-rotate-reverse" style={{ transformOrigin: '16px 16px' }} /><circle cx="16" cy="16" r="2" fill="currentColor" opacity="0.9" className="animate-pulse-dot" /></svg>,
      'Acme': <svg width={logoSize} height={logoSize} viewBox="0 0 32 32" fill="none" className="icon-acme"><rect x="6" y="6" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" className="animate-acme-pulse" /><path d="M12 12L20 20M20 12L12 20" stroke="currentColor" strokeWidth="2" opacity="0.6" className="animate-acme-rotate" style={{ transformOrigin: '16px 16px' }} /><circle cx="16" cy="16" r="2" fill="currentColor" opacity="0.8" className="animate-pulse-dot" /></svg>,
    };
    return logos[iconKey || name] || <svg width={logoSize} height={logoSize} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" /><circle cx="16" cy="16" r="6" fill="currentColor" opacity="0.6" /></svg>;
  };

  const baseStyles = "flex items-center justify-center gap-3 font-semibold transition-all duration-500 ease-out";
  const textSize = variant === "default" ? "0.95rem" : variant === "large" ? "1.75rem" : "1.5rem";
  
  return (
    <div className={`${baseStyles} text-white ${className}`}>
      <div style={{ color: 'white' }} className="flex-shrink-0">
        {renderLogo()}
      </div>
      <span 
        className="font-semibold text-white"
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: "-0.02em",
          fontSize: textSize,
          color: 'white',
          fontWeight: 600,
        }}
      >
        {name}
      </span>
    </div>
  );
};

// Enhanced logo card with creative animations
const LogoCard = ({ company, index, isVisible }: { company: TeamCard; index: number; isVisible: boolean }) => {
  return (
    <div
      className="group relative flex items-center justify-center min-h-[80px] md:min-h-[96px] cursor-pointer rounded-xl transition-all duration-500 ease-out p-4 overflow-visible"
      style={{
        animation: isVisible ? `logoEntrance 800ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards, float 6s ease-in-out infinite` : "none",
        animationDelay: isVisible ? `${index * 80}ms, ${index * 100 + 800}ms` : "0ms",
        opacity: 0,
      }}
    >
      {/* Continuous subtle background glow (always visible) */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.01] via-white/[0.005] to-white/[0.01] animate-breathe" />
      
      {/* Animated background gradient with glow on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/0 via-white/0 to-white/0 group-hover:from-white/[0.04] group-hover:via-white/[0.02] group-hover:to-white/[0.04] transition-all duration-500 ease-out" />
      
      {/* Continuous subtle border glow */}
      <div className="absolute inset-0 rounded-xl border border-white/[0.03] animate-border-glow" />
      
      {/* Animated border with glow effect on hover */}
      <div className="absolute inset-0 rounded-xl border border-white/0 group-hover:border-white/20 transition-all duration-500 ease-out group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
      
      {/* Continuous subtle pulsing glow ring */}
      <div className="absolute inset-0 rounded-xl opacity-30 group-hover:opacity-100 transition-opacity duration-500 ease-out">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/3 to-transparent blur-xl animate-pulse-slow" />
      </div>
      
      {/* Logo with continuous subtle scale animation and enhanced hover */}
      <div className="relative z-10 transform animate-gentle-scale group-hover:scale-110 group-hover:-translate-y-2 group-hover:rotate-1 transition-all duration-500 ease-out">
        <div className="transform group-hover:rotate-3 transition-transform duration-500 ease-out">
        <CompanyLogo
          name={company.name}
          iconKey={company.logo}
          variant="default"
            className="opacity-90 group-hover:opacity-100 transition-all duration-500 ease-out"
          />
        </div>
      </div>
      
      {/* Particle effect on hover */}
      <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none">
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/30 rounded-full animate-particle-1" />
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white/20 rounded-full animate-particle-2" />
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white/40 rounded-full animate-particle-3" />
      </div>
    </div>
  );
};

const Customers = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when component mounts or route changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsVisible(true);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0A0A0B" }}>
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 text-center">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight hover:-translate-y-[1px] transition-all duration-500 ease-out cursor-default"
            style={{
              animation: isVisible ? "heroFadeInUp 700ms ease-out forwards" : "none",
              opacity: 0,
            }}
          >
            Built for hardware teams, from prototype to production
          </h1>
          <p
            className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto hover:-translate-y-[1px] transition-all duration-500 ease-out cursor-default"
            style={{
              animation: isVisible ? "heroFadeInUp 700ms ease-out 120ms forwards" : "none",
              opacity: 0,
            }}
          >
            Whether you're an early-stage startup or a scaling manufacturer, OpenPlan brings planning, BOM, sourcing, builds, and quality into one place.
          </p>

          {/* Workflow Pillars */}
          <div
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
            style={{
              animation: isVisible ? "heroFadeInUp 700ms ease-out 240ms forwards" : "none",
              opacity: 0,
            }}
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">Plan</div>
              <div className="text-sm text-gray-500">Roadmaps & BOM</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">Source</div>
              <div className="text-sm text-gray-500">Suppliers & sourcing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">Build</div>
              <div className="text-sm text-gray-500">Production tracking</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">Ship</div>
              <div className="text-sm text-gray-500">Quality & analytics</div>
            </div>
          </div>
        </section>

        {/* Team/Persona Wall (Linear-style) with enhanced animations */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-gradient-1" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-gradient-2" />
          </div>

          <div className="text-center mb-12 relative z-10">
            <p
              className="text-sm text-gray-500 uppercase tracking-wider mb-2"
              style={{
                animation: isVisible ? "fadeInUp 700ms ease-out 200ms forwards" : "none",
                opacity: 0,
              }}
            >
              Built for
            </p>
            <h2
              className="text-2xl md:text-3xl font-semibold text-white"
              style={{
                animation: isVisible ? "fadeInUp 700ms ease-out 300ms forwards" : "none",
                opacity: 0,
              }}
            >
              Every team behind your hardware product
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 relative z-10">
            {logoCompanies.map((company, index) => (
              <LogoCard 
                key={company.name}
                company={company}
                index={index}
                isVisible={isVisible}
              />
            ))}
          </div>
        </section>

        {/* Workflow Pillars Section - What OpenPlan unifies */}
        <section className="py-20 md:py-28 relative overflow-hidden" style={{ backgroundColor: "#0A0A0B" }}>
          {/* Animated background particles */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-stats-bg-1" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-stats-bg-2" />
            <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-stats-bg-3" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto">
              <h2
                className="text-3xl md:text-4xl font-semibold text-white text-center mb-12 relative"
                style={{
                  animation: isVisible ? "statsTitleEntrance 800ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none",
                  opacity: 0,
                }}
              >
                <span className="inline-block animate-title-glow">What OpenPlan unifies for your team</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {workflowPillars.map((pillar, index) => (
                  <div
                    key={pillar.title}
                    className="group relative text-center p-8 rounded-2xl border border-white/10 bg-white/[0.01] overflow-hidden cursor-pointer"
                    style={{
                      animation: isVisible ? `statCardEntrance 800ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards, statCardFloat 6s ease-in-out infinite` : "none",
                      animationDelay: isVisible ? `${index * 150 + 400}ms, ${index * 200 + 1200}ms` : "0ms",
                      opacity: 0,
                    }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${pillar.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-stat-bg-pulse`} />
                    <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-white/30 transition-all duration-500 animate-stat-border-glow" />
                    <div className="absolute inset-0 rounded-2xl opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent blur-xl animate-stat-glow ${pillar.color}`} />
                    </div>

                    <div className="relative z-10 mb-4 flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/[0.05] group-hover:bg-white/[0.1] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 animate-stat-icon-float">
                        <div className="text-white/80 group-hover:text-white transition-colors duration-500">
                          {pillar.icon === "plan" && (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
                              <path d="M9 9h6M9 13h6M9 17h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          )}
                          {pillar.icon === "source" && (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M3 16V6a1 1 0 0 1 1-1h9v11" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
                              <path d="M13 9h4l4 4v3h-8V9Z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
                              <circle cx="7.5" cy="17.5" r="1.75" stroke="currentColor" strokeWidth="1.5" />
                              <circle cx="17.5" cy="17.5" r="1.75" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                          )}
                          {pillar.icon === "build" && (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M12 3l7 3.5v6c0 4.5-3 7-7 8.5-4-1.5-7-4-7-8.5v-6L12 3Z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
                              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 mb-3">
                      <div className="text-lg md:text-xl font-semibold text-white">{pillar.title}</div>
                    </div>

                    <div className="relative z-10">
                      <div className="text-sm md:text-base text-gray-400 group-hover:text-gray-300 transition-colors duration-500 ease-out">
                        {pillar.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Customer Benefits Section - Bottom */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative overflow-hidden">
          {/* Linear-style Background Vectors */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            {/* Grid pattern */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
            
            {/* Geometric shapes */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64">
              <svg width="100%" height="100%" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-vector-float-1">
                <circle cx="128" cy="128" r="60" stroke="white" strokeWidth="1" fill="none" opacity="0.2"/>
                <path d="M128 68 L128 188 M68 128 L188 128" stroke="white" strokeWidth="0.5" opacity="0.15"/>
              </svg>
            </div>
            
            <div className="absolute top-1/2 right-1/4 w-48 h-48">
              <svg width="100%" height="100%" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-vector-float-2">
                <polygon points="96,32 160,160 32,160" stroke="white" strokeWidth="1" fill="none" opacity="0.2"/>
                <polygon points="96,64 128,128 64,128" stroke="white" strokeWidth="0.5" fill="none" opacity="0.15"/>
              </svg>
            </div>
            
            <div className="absolute bottom-1/4 left-1/3 w-56 h-56">
              <svg width="100%" height="100%" viewBox="0 0 224 224" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-vector-float-3">
                <rect x="32" y="32" width="160" height="160" rx="8" stroke="white" strokeWidth="1" fill="none" opacity="0.2"/>
                <rect x="64" y="64" width="96" height="96" rx="4" stroke="white" strokeWidth="0.5" fill="none" opacity="0.15"/>
              </svg>
            </div>
            
            {/* Diagonal lines */}
            <div className="absolute top-0 left-0 w-full h-full">
              <svg width="100%" height="100%" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-vector-diagonal">
                <line x1="0" y1="200" x2="1000" y2="0" stroke="white" strokeWidth="0.5" opacity="0.1"/>
                <line x1="0" y1="400" x2="1000" y2="200" stroke="white" strokeWidth="0.5" opacity="0.1"/>
                <line x1="0" y1="600" x2="1000" y2="400" stroke="white" strokeWidth="0.5" opacity="0.1"/>
                <line x1="0" y1="800" x2="1000" y2="600" stroke="white" strokeWidth="0.5" opacity="0.1"/>
                <line x1="0" y1="1000" x2="1000" y2="800" stroke="white" strokeWidth="0.5" opacity="0.1"/>
              </svg>
            </div>
            
            {/* Animated dots pattern */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-vector-dot"
                  style={{
                    left: `${(i * 5) % 100}%`,
                    top: `${(i * 7) % 100}%`,
                    animationDelay: `${i * 0.3}s`,
                    opacity: 0.1,
                  }}
                />
              ))}
            </div>
            
            {/* Curved lines */}
            <div className="absolute top-1/3 right-0 w-96 h-96 opacity-10">
              <svg width="100%" height="100%" viewBox="0 0 384 384" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-vector-curve">
                <path d="M0 192 Q96 96 192 192 T384 192" stroke="white" strokeWidth="1" fill="none"/>
                <path d="M0 192 Q96 288 192 192 T384 192" stroke="white" strokeWidth="1" fill="none"/>
              </svg>
            </div>
          </div>
          
          <div className="max-w-5xl mx-auto relative z-10">
            <h2 className="text-3xl md:text-4xl font-semibold text-white text-center mb-12 hover:-translate-y-[1px] transition-all duration-500 ease-out">
              Why teams choose OpenPlan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Unified Platform */}
              <div className="group relative p-8 rounded-xl border border-white/10 bg-white/[0.01] hover:border-white/25 hover:bg-gradient-to-br hover:from-white/[0.03] hover:via-white/[0.02] hover:to-white/[0.03] transition-all duration-500 ease-out cursor-pointer overflow-hidden feature-card">
                {/* Continuous gradient background (always visible) */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500 animate-feature-gradient-1" />
                
                {/* Animated border glow (always pulsing) */}
                <div className="absolute inset-0 rounded-xl border border-blue-500/20 group-hover:border-white/30 transition-all duration-500 animate-feature-border-1" />
                
                {/* Continuous subtle glow effect */}
                <div className="absolute inset-0 rounded-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-blue-500/10 to-transparent blur-xl animate-feature-glow-1" />
                </div>
                
                {/* Floating particles (always visible) */}
                <div className="absolute inset-0 rounded-xl overflow-hidden opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-blue-400/40 rounded-full animate-feature-particle"
                      style={{
                        left: `${20 + i * 30}%`,
                        top: `${30 + i * 20}%`,
                        animationDelay: `${i * 0.5}s`,
                      }}
                    />
                  ))}
                </div>
                
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-feature-shimmer" />
                </div>
                
                {/* Content */}
                <div className="relative z-10 transform group-hover:-translate-y-1 transition-all duration-500 ease-out animate-feature-content-float">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.08] group-hover:bg-white/[0.12] flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3 animate-feature-icon-float">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white animate-feature-icon-pulse">
                        <rect x="4" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        <path d="M8 8h4M8 12h4" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <div className="text-white font-semibold text-lg group-hover:tracking-wide transition-all duration-500 ease-out animate-feature-title-glow">Unified Platform</div>
                  </div>
                  <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-500 ease-out animate-feature-text-fade">Everything from BOM to shipping in one place</div>
                </div>
              </div>

              {/* Real-time Collaboration */}
              <div className="group relative p-8 rounded-xl border border-white/10 bg-white/[0.01] hover:border-white/25 hover:bg-gradient-to-br hover:from-white/[0.03] hover:via-white/[0.02] hover:to-white/[0.03] transition-all duration-500 ease-out cursor-pointer overflow-hidden feature-card">
                {/* Continuous gradient background (always visible) */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500 animate-feature-gradient-2" />
                
                {/* Animated border glow (always pulsing) */}
                <div className="absolute inset-0 rounded-xl border border-purple-500/20 group-hover:border-white/30 transition-all duration-500 animate-feature-border-2" />
                
                {/* Continuous subtle glow effect */}
                <div className="absolute inset-0 rounded-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-purple-500/10 to-transparent blur-xl animate-feature-glow-2" />
                </div>
                
                {/* Floating particles */}
                <div className="absolute inset-0 rounded-xl overflow-hidden opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-purple-400/40 rounded-full animate-feature-particle"
                      style={{
                        left: `${20 + i * 30}%`,
                        top: `${30 + i * 20}%`,
                        animationDelay: `${i * 0.5}s`,
                      }}
                    />
                  ))}
                </div>
                
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-feature-shimmer" />
                </div>
                
                {/* Content */}
                <div className="relative z-10 transform group-hover:-translate-y-1 transition-all duration-500 ease-out animate-feature-content-float">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.08] group-hover:bg-white/[0.12] flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3 animate-feature-icon-float">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white animate-feature-icon-pulse">
                        <circle cx="10" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        <path d="M4 16c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        <circle cx="15" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        <path d="M18 16c0-1.5 1-2.5 2-2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                      </svg>
                    </div>
                    <div className="text-white font-semibold text-lg group-hover:tracking-wide transition-all duration-500 ease-out animate-feature-title-glow">Real-time Collaboration</div>
                  </div>
                  <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-500 ease-out animate-feature-text-fade">Keep teams aligned across design, engineering, and ops</div>
                </div>
              </div>

              {/* Smart Automation */}
              <div className="group relative p-8 rounded-xl border border-white/10 bg-white/[0.01] hover:border-white/25 hover:bg-gradient-to-br hover:from-white/[0.03] hover:via-white/[0.02] hover:to-white/[0.03] transition-all duration-500 ease-out cursor-pointer overflow-hidden feature-card">
                {/* Continuous gradient background (always visible) */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500 animate-feature-gradient-3" />
                
                {/* Animated border glow (always pulsing) */}
                <div className="absolute inset-0 rounded-xl border border-green-500/20 group-hover:border-white/30 transition-all duration-500 animate-feature-border-3" />
                
                {/* Continuous subtle glow effect */}
                <div className="absolute inset-0 rounded-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-green-500/10 to-transparent blur-xl animate-feature-glow-3" />
                </div>
                
                {/* Floating particles */}
                <div className="absolute inset-0 rounded-xl overflow-hidden opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-green-400/40 rounded-full animate-feature-particle"
                      style={{
                        left: `${20 + i * 30}%`,
                        top: `${30 + i * 20}%`,
                        animationDelay: `${i * 0.5}s`,
                      }}
                    />
                  ))}
                </div>
                
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-feature-shimmer" />
                </div>
                
                {/* Content */}
                <div className="relative z-10 transform group-hover:-translate-y-1 transition-all duration-500 ease-out animate-feature-content-float">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.08] group-hover:bg-white/[0.12] flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3 animate-feature-icon-float">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white animate-feature-icon-pulse">
                        <path d="M10 2v4M10 14v4M18 10h-4M6 10H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        <path d="M10 7v6M7 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="text-white font-semibold text-lg group-hover:tracking-wide transition-all duration-500 ease-out animate-feature-title-glow">Smart Automation</div>
                  </div>
                  <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-500 ease-out animate-feature-text-fade">Reduce manual work with intelligent workflows</div>
                </div>
              </div>

              {/* Enterprise Security */}
              <div className="group relative p-8 rounded-xl border border-white/10 bg-white/[0.01] hover:border-white/25 hover:bg-gradient-to-br hover:from-white/[0.03] hover:via-white/[0.02] hover:to-white/[0.03] transition-all duration-500 ease-out cursor-pointer overflow-hidden feature-card">
                {/* Continuous gradient background (always visible) */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500 animate-feature-gradient-4" />
                
                {/* Animated border glow (always pulsing) */}
                <div className="absolute inset-0 rounded-xl border border-orange-500/20 group-hover:border-white/30 transition-all duration-500 animate-feature-border-4" />
                
                {/* Continuous subtle glow effect */}
                <div className="absolute inset-0 rounded-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-orange-500/10 to-transparent blur-xl animate-feature-glow-4" />
                </div>
                
                {/* Floating particles */}
                <div className="absolute inset-0 rounded-xl overflow-hidden opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-orange-400/40 rounded-full animate-feature-particle"
                      style={{
                        left: `${20 + i * 30}%`,
                        top: `${30 + i * 20}%`,
                        animationDelay: `${i * 0.5}s`,
                      }}
                    />
                  ))}
                </div>
                
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-feature-shimmer" />
                </div>
                
                {/* Content */}
                <div className="relative z-10 transform group-hover:-translate-y-1 transition-all duration-500 ease-out animate-feature-content-float">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.08] group-hover:bg-white/[0.12] flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3 animate-feature-icon-float">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white animate-feature-icon-pulse">
                        <rect x="4" y="8" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        <path d="M6 8V6a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="10" cy="12" r="1" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="text-white font-semibold text-lg group-hover:tracking-wide transition-all duration-500 ease-out animate-feature-title-glow">Enterprise Security</div>
                  </div>
                  <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-500 ease-out animate-feature-text-fade">Role-based access control and encrypted infrastructure</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust CTA Section */}
        <section className="py-20 md:py-28" style={{ backgroundColor: "#0A0A0B" }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 hover:-translate-y-[1px] transition-all duration-500 ease-out cursor-default">
              Get early access to OpenPlan
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              We're onboarding hardware teams in cohorts. Join the waitlist to be one of the first to try it.
            </p>
            <Button
              className="mt-8 px-8 py-6 text-base md:text-lg bg-white text-black hover:bg-gray-100 hover:scale-[1.02] transition-all duration-500 rounded-lg font-medium shadow-sm hover:shadow-md"
              onClick={() => { window.location.href = "https://app.openplanai.com/"; }}
            >
              Sign In
            </Button>
            <p className="mt-6 text-xs text-gray-500">
              No spam. We'll only email you when it's your turn.
            </p>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        @keyframes heroFadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes logoEntrance {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.8) rotate(-5deg);
          }
          60% {
            transform: translateY(-5px) scale(1.05) rotate(2deg);
          }
          100% {
            opacity: 0.9;
            transform: translateY(0) scale(1) rotate(0deg);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Featured Stories Animations */
        @keyframes featuredCardEntrance {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.9) rotateX(10deg);
          }
          60% {
            transform: translateY(-5px) scale(1.02) rotateX(-2deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotateX(0deg);
          }
        }
        
        @keyframes featuredCardFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        
        @keyframes featured-bg-1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          50% {
            transform: translate(30px, -20px) scale(1.2);
            opacity: 0.3;
          }
        }
        
        @keyframes featured-bg-2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          50% {
            transform: translate(-25px, 30px) scale(1.15);
            opacity: 0.3;
          }
        }
        
        @keyframes featured-gradient {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
        
        @keyframes featured-border {
          0%, 100% {
            border-color: rgba(255, 255, 255, 0.1);
            box-shadow: 0 0 0 rgba(255, 255, 255, 0);
          }
          50% {
            border-color: rgba(255, 255, 255, 0.2);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
          }
        }
        
        @keyframes featured-glow {
          0%, 100% {
            opacity: 0.3;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 0.5;
            transform: translateX(50%) scale(1.2);
          }
        }
        
        @keyframes featured-shimmer {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }
        
        @keyframes featured-particle-1 {
          0%, 100% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(20px, -30px) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes featured-particle-2 {
          0%, 100% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(-25px, 20px) scale(1);
            opacity: 0.8;
          }
        }
        
        @keyframes featured-particle-3 {
          0%, 100% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(15px, 25px) scale(1);
            opacity: 0.9;
          }
        }
        
        @keyframes featured-logo {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-2px) rotate(2deg);
          }
        }
        
        @keyframes featured-quote {
          0%, 100% {
            opacity: 0.9;
          }
          50% {
            opacity: 1;
          }
        }
        
        @keyframes featured-avatar-glow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        
        @keyframes featured-name {
          0%, 100% {
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.1);
          }
          50% {
            text-shadow: 0 0 15px rgba(255, 255, 255, 0.3), 0 0 25px rgba(255, 255, 255, 0.1);
          }
        }
        
        .featured-story-card {
          will-change: transform, opacity;
        }
        
        .animate-featured-bg-1 {
          animation: featured-bg-1 8s ease-in-out infinite;
        }
        
        .animate-featured-bg-2 {
          animation: featured-bg-2 10s ease-in-out infinite;
        }
        
        .animate-featured-gradient {
          animation: featured-gradient 4s ease-in-out infinite;
        }
        
        .animate-featured-border {
          animation: featured-border 3s ease-in-out infinite;
        }
        
        .animate-featured-glow {
          animation: featured-glow 4s ease-in-out infinite;
        }
        
        .animate-featured-shimmer {
          animation: featured-shimmer 3s ease-in-out infinite;
        }
        
        .animate-featured-particle-1 {
          animation: featured-particle-1 3s ease-out infinite;
        }
        
        .animate-featured-particle-2 {
          animation: featured-particle-2 3.5s ease-out infinite 0.5s;
        }
        
        .animate-featured-particle-3 {
          animation: featured-particle-3 3.2s ease-out infinite 1s;
        }
        
        .animate-featured-logo {
          animation: featured-logo 4s ease-in-out infinite;
        }
        
        .animate-featured-quote {
          animation: featured-quote 3s ease-in-out infinite;
        }
        
        .animate-featured-avatar-glow {
          animation: featured-avatar-glow 3s ease-in-out infinite;
        }
        
        .animate-featured-name {
          animation: featured-name 2.5s ease-in-out infinite;
        }
        
        @keyframes slideInFromLeftCreative {
          0% {
            opacity: 0;
            transform: translateX(-300px) scale(0.75) rotateY(-25deg);
            filter: blur(10px);
          }
          30% {
            opacity: 0.3;
            transform: translateX(-50px) scale(0.9) rotateY(-10deg);
            filter: blur(5px);
          }
          60% {
            opacity: 0.8;
            transform: translateX(25px) scale(1.08) rotateY(5deg);
            filter: blur(1px);
          }
          80% {
            transform: translateX(-8px) scale(0.98) rotateY(-2deg);
            filter: blur(0.3px);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1) rotateY(0deg);
            filter: blur(0);
          }
        }
        
        @keyframes slideInFromRightCreative {
          0% {
            opacity: 0;
            transform: translateX(300px) scale(0.75) rotateY(25deg);
            filter: blur(10px);
          }
          30% {
            opacity: 0.3;
            transform: translateX(50px) scale(0.9) rotateY(10deg);
            filter: blur(5px);
          }
          60% {
            opacity: 0.8;
            transform: translateX(-25px) scale(1.08) rotateY(-5deg);
            filter: blur(1px);
          }
          80% {
            transform: translateX(8px) scale(0.98) rotateY(2deg);
            filter: blur(0.3px);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1) rotateY(0deg);
            filter: blur(0);
          }
        }
        
        @keyframes testimonialFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        
        @keyframes testimonial-bg-left {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.1;
          }
          50% {
            transform: translate(50px, -30px) scale(1.2);
            opacity: 0.2;
          }
        }
        
        @keyframes testimonial-bg-right {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.1;
          }
          50% {
            transform: translate(-50px, 30px) scale(1.2);
            opacity: 0.2;
          }
        }
        
        @keyframes testimonial-border {
          0%, 100% {
            border-color: rgba(255, 255, 255, 0.1);
            box-shadow: 0 0 0 rgba(255, 255, 255, 0);
          }
          50% {
            border-color: rgba(255, 255, 255, 0.2);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
          }
        }
        
        @keyframes testimonial-glow {
          0%, 100% {
            opacity: 0.2;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 0.4;
            transform: translateX(50%) scale(1.2);
          }
        }
        
        @keyframes testimonial-text-fade {
          0%, 100% {
            opacity: 0.9;
          }
          50% {
            opacity: 1;
          }
        }
        
        @keyframes testimonial-avatar {
          0%, 100% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.02) rotate(2deg);
          }
        }
        
        @keyframes testimonial-particle-1 {
          0% {
            transform: translate(0, -50%) translateX(0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(0, -50%) translateX(100px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(0, -50%) translateX(200px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes testimonial-particle-2 {
          0% {
            transform: translate(0, -50%) translateX(0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(0, -50%) translateX(120px) translateY(-10px) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translate(0, -50%) translateX(240px) translateY(-20px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes testimonial-particle-3 {
          0% {
            transform: translate(0, -50%) translateX(0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(0, -50%) translateX(80px) translateY(10px) scale(1);
            opacity: 0.9;
          }
          100% {
            transform: translate(0, -50%) translateX(160px) translateY(20px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes testimonial-particle-4 {
          0% {
            transform: translate(0, -50%) translateX(0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(0, -50%) translateX(150px) translateY(-5px) scale(1);
            opacity: 0.7;
          }
          100% {
            transform: translate(0, -50%) translateX(300px) translateY(-10px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes testimonial-particle-5 {
          0% {
            transform: translate(0, -50%) translateX(0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(0, -50%) translateX(90px) translateY(15px) scale(1);
            opacity: 0.85;
          }
          100% {
            transform: translate(0, -50%) translateX(180px) translateY(30px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes testimonial-particle-6 {
          0% {
            transform: translate(0, -50%) translateX(0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(0, -50%) translateX(110px) translateY(-15px) scale(1);
            opacity: 0.75;
          }
          100% {
            transform: translate(0, -50%) translateX(220px) translateY(-30px) scale(0);
            opacity: 0;
          }
        }
        
        /* Reverse particle animations for right-aligned testimonials */
        @keyframes testimonial-particle-1-reverse {
          0% {
            transform: translate(0, -50%) translateX(0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(0, -50%) translateX(-100px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(0, -50%) translateX(-200px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes testimonial-particle-2-reverse {
          0% {
            transform: translate(0, -50%) translateX(0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(0, -50%) translateX(-120px) translateY(-10px) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translate(0, -50%) translateX(-240px) translateY(-20px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes testimonial-particle-3-reverse {
          0% {
            transform: translate(0, -50%) translateX(0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(0, -50%) translateX(-80px) translateY(10px) scale(1);
            opacity: 0.9;
          }
          100% {
            transform: translate(0, -50%) translateX(-160px) translateY(20px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes testimonial-particle-4-reverse {
          0% {
            transform: translate(0, -50%) translateX(0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(0, -50%) translateX(-150px) translateY(-5px) scale(1);
            opacity: 0.7;
          }
          100% {
            transform: translate(0, -50%) translateX(-300px) translateY(-10px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes testimonial-particle-5-reverse {
          0% {
            transform: translate(0, -50%) translateX(0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(0, -50%) translateX(-90px) translateY(15px) scale(1);
            opacity: 0.85;
          }
          100% {
            transform: translate(0, -50%) translateX(-180px) translateY(30px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes testimonial-particle-6-reverse {
          0% {
            transform: translate(0, -50%) translateX(0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(0, -50%) translateX(-110px) translateY(-15px) scale(1);
            opacity: 0.75;
          }
          100% {
            transform: translate(0, -50%) translateX(-220px) translateY(-30px) scale(0);
            opacity: 0;
          }
        }
        
        .testimonial-card {
          will-change: transform, opacity;
        }
        
        .animate-testimonial-bg-left {
          animation: testimonial-bg-left 8s ease-in-out infinite;
        }
        
        .animate-testimonial-bg-right {
          animation: testimonial-bg-right 10s ease-in-out infinite;
        }
        
        .animate-testimonial-border {
          animation: testimonial-border 3s ease-in-out infinite;
        }
        
        .animate-testimonial-glow {
          animation: testimonial-glow 4s ease-in-out infinite;
        }
        
        .animate-testimonial-text-fade {
          animation: testimonial-text-fade 3s ease-in-out infinite;
        }
        
        .animate-testimonial-avatar {
          animation: testimonial-avatar 4s ease-in-out infinite;
        }
        
        .animate-testimonial-particle-1 {
          animation: testimonial-particle-1 2s ease-out infinite;
        }
        
        .animate-testimonial-particle-2 {
          animation: testimonial-particle-2 2.3s ease-out infinite;
        }
        
        .animate-testimonial-particle-3 {
          animation: testimonial-particle-3 2.1s ease-out infinite;
        }
        
        .animate-testimonial-particle-4 {
          animation: testimonial-particle-4 2.5s ease-out infinite;
        }
        
        .animate-testimonial-particle-5 {
          animation: testimonial-particle-5 2.2s ease-out infinite;
        }
        
        .animate-testimonial-particle-6 {
          animation: testimonial-particle-6 2.4s ease-out infinite;
        }
        
        .animate-testimonial-particle-1-reverse {
          animation: testimonial-particle-1-reverse 2s ease-out infinite;
        }
        
        .animate-testimonial-particle-2-reverse {
          animation: testimonial-particle-2-reverse 2.3s ease-out infinite;
        }
        
        .animate-testimonial-particle-3-reverse {
          animation: testimonial-particle-3-reverse 2.1s ease-out infinite;
        }
        
        .animate-testimonial-particle-4-reverse {
          animation: testimonial-particle-4-reverse 2.5s ease-out infinite;
        }
        
        .animate-testimonial-particle-5-reverse {
          animation: testimonial-particle-5-reverse 2.2s ease-out infinite;
        }
        
        .animate-testimonial-particle-6-reverse {
          animation: testimonial-particle-6-reverse 2.4s ease-out infinite;
        }
        
        @keyframes testimonial-bg-gradient {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        
        @keyframes testimonial-orb-1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(20px, -15px) scale(1.2);
            opacity: 0.5;
          }
        }
        
        @keyframes testimonial-orb-2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(-15px, 20px) scale(1.15);
            opacity: 0.5;
          }
        }
        
        @keyframes testimonial-icon-float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-3px) rotate(2deg);
          }
        }
        
        @keyframes testimonial-icon-pulse {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.02);
            filter: brightness(1.1);
          }
        }
        
        @keyframes testimonial-logo-rotate {
          0% {
            transform: rotate(-12deg) translateY(0px);
          }
          25% {
            transform: rotate(0deg) translateY(-6px);
          }
          50% {
            transform: rotate(12deg) translateY(0px);
          }
          75% {
            transform: rotate(0deg) translateY(6px);
          }
          100% {
            transform: rotate(-12deg) translateY(0px);
          }
        }
        
        @keyframes testimonial-quote-glow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
          }
          50% {
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.2), 0 0 30px rgba(255, 255, 255, 0.1);
          }
        }
        
        @keyframes testimonial-shimmer {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }
        
        @keyframes testimonial-avatar-glow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        
        @keyframes testimonial-name-glow {
          0%, 100% {
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.1);
          }
          50% {
            text-shadow: 0 0 15px rgba(255, 255, 255, 0.3), 0 0 25px rgba(255, 255, 255, 0.1);
          }
        }
        
        .animate-testimonial-bg-gradient {
          animation: testimonial-bg-gradient 4s ease-in-out infinite;
        }
        
        .animate-testimonial-orb-1 {
          animation: testimonial-orb-1 6s ease-in-out infinite;
        }
        
        .animate-testimonial-orb-2 {
          animation: testimonial-orb-2 8s ease-in-out infinite;
        }
        
        .animate-testimonial-icon-float {
          animation: testimonial-icon-float 4s ease-in-out infinite;
        }
        
        .animate-testimonial-icon-pulse {
          animation: testimonial-icon-pulse 3s ease-in-out infinite;
        }
        
        .animate-testimonial-quote-glow {
          animation: testimonial-quote-glow 3s ease-in-out infinite;
        }
        
        .animate-testimonial-shimmer {
          animation: testimonial-shimmer 3s ease-in-out infinite;
        }
        
        .animate-testimonial-avatar-glow {
          animation: testimonial-avatar-glow 3s ease-in-out infinite;
        }
        
        .animate-testimonial-name-glow {
          animation: testimonial-name-glow 2.5s ease-in-out infinite;
        }
        
        .animate-testimonial-logo-rotate {
          animation: testimonial-logo-rotate 4s ease-in-out infinite;
          transform-origin: center;
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
        
        /* Linear-style Vector Animations */
        @keyframes vector-float-1 {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            transform: translate(20px, -20px) rotate(5deg);
            opacity: 0.3;
          }
        }
        
        @keyframes vector-float-2 {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            transform: translate(-15px, 15px) rotate(-5deg);
            opacity: 0.3;
          }
        }
        
        @keyframes vector-float-3 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          50% {
            transform: translate(10px, 10px) scale(1.1);
            opacity: 0.3;
          }
        }
        
        @keyframes vector-diagonal {
          0% {
            transform: translateX(0);
            opacity: 0.1;
          }
          50% {
            transform: translateX(20px);
            opacity: 0.15;
          }
          100% {
            transform: translateX(0);
            opacity: 0.1;
          }
        }
        
        @keyframes vector-dot {
          0%, 100% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.5);
          }
        }
        
        @keyframes vector-curve {
          0%, 100% {
            transform: translateX(0) translateY(0);
            opacity: 0.1;
          }
          50% {
            transform: translateX(-10px) translateY(10px);
            opacity: 0.15;
          }
        }
        
        .animate-vector-float-1 {
          animation: vector-float-1 8s ease-in-out infinite;
        }
        
        .animate-vector-float-2 {
          animation: vector-float-2 10s ease-in-out infinite;
        }
        
        .animate-vector-float-3 {
          animation: vector-float-3 12s ease-in-out infinite;
        }
        
        .animate-vector-diagonal {
          animation: vector-diagonal 15s ease-in-out infinite;
        }
        
        .animate-vector-dot {
          animation: vector-dot 3s ease-in-out infinite;
        }
        
        .animate-vector-curve {
          animation: vector-curve 6s ease-in-out infinite;
        }
        
        /* Feature Cards Animations */
        @keyframes feature-gradient-1 {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
        
        @keyframes feature-gradient-2 {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
        
        @keyframes feature-gradient-3 {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
        
        @keyframes feature-gradient-4 {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
        
        @keyframes feature-border-1 {
          0%, 100% {
            border-color: rgba(59, 130, 246, 0.2);
            box-shadow: 0 0 0 rgba(59, 130, 246, 0);
          }
          50% {
            border-color: rgba(59, 130, 246, 0.3);
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.1);
          }
        }
        
        @keyframes feature-border-2 {
          0%, 100% {
            border-color: rgba(168, 85, 247, 0.2);
            box-shadow: 0 0 0 rgba(168, 85, 247, 0);
          }
          50% {
            border-color: rgba(168, 85, 247, 0.3);
            box-shadow: 0 0 15px rgba(168, 85, 247, 0.1);
          }
        }
        
        @keyframes feature-border-3 {
          0%, 100% {
            border-color: rgba(34, 197, 94, 0.2);
            box-shadow: 0 0 0 rgba(34, 197, 94, 0);
          }
          50% {
            border-color: rgba(34, 197, 94, 0.3);
            box-shadow: 0 0 15px rgba(34, 197, 94, 0.1);
          }
        }
        
        @keyframes feature-border-4 {
          0%, 100% {
            border-color: rgba(249, 115, 22, 0.2);
            box-shadow: 0 0 0 rgba(249, 115, 22, 0);
          }
          50% {
            border-color: rgba(249, 115, 22, 0.3);
            box-shadow: 0 0 15px rgba(249, 115, 22, 0.1);
          }
        }
        
        @keyframes feature-glow-1 {
          0%, 100% {
            opacity: 0.3;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 0.5;
            transform: translateX(50%) scale(1.2);
          }
        }
        
        @keyframes feature-glow-2 {
          0%, 100% {
            opacity: 0.3;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 0.5;
            transform: translateX(50%) scale(1.2);
          }
        }
        
        @keyframes feature-glow-3 {
          0%, 100% {
            opacity: 0.3;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 0.5;
            transform: translateX(50%) scale(1.2);
          }
        }
        
        @keyframes feature-glow-4 {
          0%, 100% {
            opacity: 0.3;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 0.5;
            transform: translateX(50%) scale(1.2);
          }
        }
        
        @keyframes feature-particle {
          0%, 100% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(20px, -30px) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes feature-shimmer {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }
        
        @keyframes feature-content-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }
        
        @keyframes feature-icon-float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-3px) rotate(2deg);
          }
        }
        
        @keyframes feature-icon-pulse {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.05);
            filter: brightness(1.2);
          }
        }
        
        @keyframes feature-title-glow {
          0%, 100% {
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.1);
          }
          50% {
            text-shadow: 0 0 15px rgba(255, 255, 255, 0.3), 0 0 25px rgba(255, 255, 255, 0.1);
          }
        }
        
        @keyframes feature-text-fade {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
        
        .feature-card {
          will-change: transform, opacity;
        }
        
        .animate-feature-gradient-1 {
          animation: feature-gradient-1 4s ease-in-out infinite;
        }
        
        .animate-feature-gradient-2 {
          animation: feature-gradient-2 4s ease-in-out infinite;
        }
        
        .animate-feature-gradient-3 {
          animation: feature-gradient-3 4s ease-in-out infinite;
        }
        
        .animate-feature-gradient-4 {
          animation: feature-gradient-4 4s ease-in-out infinite;
        }
        
        .animate-feature-border-1 {
          animation: feature-border-1 3s ease-in-out infinite;
        }
        
        .animate-feature-border-2 {
          animation: feature-border-2 3s ease-in-out infinite;
        }
        
        .animate-feature-border-3 {
          animation: feature-border-3 3s ease-in-out infinite;
        }
        
        .animate-feature-border-4 {
          animation: feature-border-4 3s ease-in-out infinite;
        }
        
        .animate-feature-glow-1 {
          animation: feature-glow-1 4s ease-in-out infinite;
        }
        
        .animate-feature-glow-2 {
          animation: feature-glow-2 4s ease-in-out infinite;
        }
        
        .animate-feature-glow-3 {
          animation: feature-glow-3 4s ease-in-out infinite;
        }
        
        .animate-feature-glow-4 {
          animation: feature-glow-4 4s ease-in-out infinite;
        }
        
        .animate-feature-particle {
          animation: feature-particle 3s ease-out infinite;
        }
        
        .animate-feature-shimmer {
          animation: feature-shimmer 3s ease-in-out infinite;
        }
        
        .animate-feature-content-float {
          animation: feature-content-float 4s ease-in-out infinite;
        }
        
        .animate-feature-icon-float {
          animation: feature-icon-float 4s ease-in-out infinite;
        }
        
        .animate-feature-icon-pulse {
          animation: feature-icon-pulse 3s ease-in-out infinite;
        }
        
        .animate-feature-title-glow {
          animation: feature-title-glow 2.5s ease-in-out infinite;
        }
        
        .animate-feature-text-fade {
          animation: feature-text-fade 3s ease-in-out infinite;
        }
        
        @keyframes particle-1 {
          0% {
            transform: translate(-50%, -50%) translate(0, 0) scale(0);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) translate(20px, -30px) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) translate(40px, -60px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes particle-2 {
          0% {
            transform: translate(-50%, -50%) translate(0, 0) scale(0);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) translate(-25px, 20px) scale(1);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) translate(-50px, 40px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes particle-3 {
          0% {
            transform: translate(-50%, -50%) translate(0, 0) scale(0);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) translate(15px, 25px) scale(1);
            opacity: 0.7;
          }
          100% {
            transform: translate(-50%, -50%) translate(30px, 50px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes gradient-1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(50px, -30px) scale(1.2);
            opacity: 0.5;
          }
        }
        
        @keyframes gradient-2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(-40px, 40px) scale(1.15);
            opacity: 0.5;
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-particle-1 {
          animation: particle-1 2s ease-out infinite;
        }
        
        .animate-particle-2 {
          animation: particle-2 2.5s ease-out infinite 0.3s;
        }
        
        .animate-particle-3 {
          animation: particle-3 2.2s ease-out infinite 0.6s;
        }
        
        .animate-gradient-1 {
          animation: gradient-1 8s ease-in-out infinite;
        }
        
        .animate-gradient-2 {
          animation: gradient-2 10s ease-in-out infinite;
        }
        
        /* Continuous animations (always running) */
        @keyframes breathe {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
        
        @keyframes border-glow {
          0%, 100% {
            border-color: rgba(255, 255, 255, 0.03);
            box-shadow: 0 0 0 rgba(255, 255, 255, 0);
          }
          50% {
            border-color: rgba(255, 255, 255, 0.08);
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.05);
          }
        }
        
        @keyframes gentle-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
        
        .animate-breathe {
          animation: breathe 4s ease-in-out infinite;
        }
        
        .animate-border-glow {
          animation: border-glow 3s ease-in-out infinite;
        }
        
        .animate-gentle-scale {
          animation: gentle-scale 4s ease-in-out infinite;
        }
        
        /* Icon-specific animations */
        @keyframes pulse-ring {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
        
        @keyframes pulse-ring-delayed {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.08);
          }
        }
        
        @keyframes pulse-dot {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        @keyframes rotate-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes rotate-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        
        @keyframes orbit-planet {
          0% {
            transform: rotate(0deg) translateX(8px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(8px) rotate(-360deg);
          }
        }
        
        @keyframes draw-line {
          0% {
            stroke-dasharray: 0, 100;
          }
          100% {
            stroke-dasharray: 100, 0;
          }
        }
        
        @keyframes pixel-1 {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          25% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
        
        @keyframes pixel-2 {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
        
        @keyframes pixel-3 {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          75% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
        
        @keyframes pixel-4 {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          25%, 75% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
        
        @keyframes sync-1 {
          0%, 100% {
            opacity: 0.5;
            transform: translateY(0);
          }
          50% {
            opacity: 0.7;
            transform: translateY(-2px);
          }
        }
        
        @keyframes sync-2 {
          0%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          50% {
            opacity: 0.5;
            transform: translateY(2px);
          }
        }
        
        @keyframes sync-3 {
          0%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          50% {
            opacity: 0.5;
            transform: translateY(-2px);
          }
        }
        
        @keyframes vertex-glow {
          0%, 100% {
            opacity: 0.4;
            filter: brightness(1);
          }
          50% {
            opacity: 0.6;
            filter: brightness(1.2);
          }
        }
        
        @keyframes vertex-glow-delayed {
          0%, 100% {
            opacity: 0.6;
            filter: brightness(1);
          }
          50% {
            opacity: 0.8;
            filter: brightness(1.3);
          }
        }
        
        @keyframes nimbus-1 {
          0%, 100% {
            transform: translateX(0) translateY(0);
            opacity: 0.4;
          }
          50% {
            transform: translateX(2px) translateY(-1px);
            opacity: 0.6;
          }
        }
        
        @keyframes nimbus-2 {
          0%, 100% {
            transform: translateX(0) translateY(0);
            opacity: 0.4;
          }
          50% {
            transform: translateX(-2px) translateY(1px);
            opacity: 0.6;
          }
        }
        
        @keyframes nimbus-3 {
          0%, 100% {
            transform: translateX(0) translateY(0);
            opacity: 0.5;
          }
          50% {
            transform: translateX(1px) translateY(-2px);
            opacity: 0.7;
          }
        }
        
        @keyframes nimbus-4 {
          0%, 100% {
            transform: translateX(0) translateY(0);
            opacity: 0.5;
          }
          50% {
            transform: translateX(-1px) translateY(2px);
            opacity: 0.7;
          }
        }
        
        @keyframes horizon-dot-1 {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          33% {
            opacity: 0.8;
            transform: scale(1.2);
          }
        }
        
        @keyframes horizon-dot-2 {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          66% {
            opacity: 0.8;
            transform: scale(1.2);
          }
        }
        
        @keyframes horizon-dot-3 {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          33%, 66% {
            opacity: 0.8;
            transform: scale(1.2);
          }
        }
        
        @keyframes horizon-wave {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }
        
        @keyframes apex-glow {
          0%, 100% {
            opacity: 0.5;
            filter: brightness(1);
          }
          50% {
            opacity: 0.7;
            filter: brightness(1.2);
          }
        }
        
        @keyframes apex-glow-delayed {
          0%, 100% {
            opacity: 0.7;
            filter: brightness(1);
          }
          50% {
            opacity: 0.9;
            filter: brightness(1.3);
          }
        }
        
        @keyframes prism-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes prism-rotate-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        
        @keyframes acme-pulse {
          0%, 100% {
            opacity: 0.4;
            stroke-width: 2;
          }
          50% {
            opacity: 0.6;
            stroke-width: 2.5;
          }
        }
        
        @keyframes acme-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Apply animations to icons - target child elements */
        .icon-nova .animate-pulse-ring,
        .icon-nova circle.animate-pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }
        
        .icon-nova .animate-pulse-ring-delayed,
        .icon-nova circle.animate-pulse-ring-delayed {
          animation: pulse-ring-delayed 2s ease-in-out infinite 0.3s;
        }
        
        .icon-nova .animate-pulse-dot,
        .icon-nova circle.animate-pulse-dot {
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
        
        .icon-atlas .animate-pulse-dot,
        .icon-atlas circle.animate-pulse-dot {
          animation: pulse-dot 2s ease-in-out infinite;
        }
        
        .icon-orbit .animate-pulse-dot,
        .icon-orbit circle.animate-pulse-dot {
          animation: pulse-dot 2s ease-in-out infinite;
        }
        
        .icon-flux .animate-pulse-dot,
        .icon-flux circle.animate-pulse-dot {
          animation: pulse-dot 1.8s ease-in-out infinite;
        }
        
        .icon-vertex .animate-pulse-dot,
        .icon-vertex circle.animate-pulse-dot {
          animation: pulse-dot 2s ease-in-out infinite;
        }
        
        .icon-apex .animate-pulse-dot,
        .icon-apex rect.animate-pulse-dot {
          animation: pulse-dot 2s ease-in-out infinite;
        }
        
        .icon-prism .animate-pulse-dot,
        .icon-prism circle.animate-pulse-dot {
          animation: pulse-dot 2.5s ease-in-out infinite;
        }
        
        .icon-acme .animate-pulse-dot,
        .icon-acme circle.animate-pulse-dot {
          animation: pulse-dot 1.8s ease-in-out infinite;
        }
        
        .icon-atlas .animate-draw-line,
        .icon-atlas path.animate-draw-line {
          animation: draw-line 3s ease-in-out infinite;
          stroke-dasharray: 50;
        }
        
        .icon-pixel .animate-pixel-1,
        .icon-pixel rect.animate-pixel-1 {
          animation: pixel-1 2s ease-in-out infinite;
        }
        
        .icon-pixel .animate-pixel-2,
        .icon-pixel rect.animate-pixel-2 {
          animation: pixel-2 2s ease-in-out infinite 0.5s;
        }
        
        .icon-pixel .animate-pixel-3,
        .icon-pixel rect.animate-pixel-3 {
          animation: pixel-3 2s ease-in-out infinite 1s;
        }
        
        .icon-pixel .animate-pixel-4,
        .icon-pixel rect.animate-pixel-4 {
          animation: pixel-4 2s ease-in-out infinite 1.5s;
        }
        
        .icon-orbit .animate-rotate-slow,
        .icon-orbit circle.animate-rotate-slow {
          animation: rotate-slow 8s linear infinite;
        }
        
        .icon-orbit .animate-rotate-reverse,
        .icon-orbit circle.animate-rotate-reverse {
          animation: rotate-reverse 6s linear infinite;
        }
        
        .icon-orbit .animate-orbit-planet,
        .icon-orbit circle.animate-orbit-planet {
          animation: orbit-planet 4s linear infinite;
        }
        
        .icon-sync .animate-sync-1,
        .icon-sync path.animate-sync-1 {
          animation: sync-1 2s ease-in-out infinite;
        }
        
        .icon-sync .animate-sync-2,
        .icon-sync path.animate-sync-2 {
          animation: sync-2 2s ease-in-out infinite 0.3s;
        }
        
        .icon-sync .animate-sync-3,
        .icon-sync path.animate-sync-3 {
          animation: sync-3 2s ease-in-out infinite 0.6s;
        }
        
        .icon-flux .animate-rotate-slow,
        .icon-flux path.animate-rotate-slow {
          animation: rotate-slow 6s linear infinite;
        }
        
        .icon-vertex .animate-vertex-glow,
        .icon-vertex polygon.animate-vertex-glow {
          animation: vertex-glow 3s ease-in-out infinite;
        }
        
        .icon-vertex .animate-vertex-glow-delayed,
        .icon-vertex polygon.animate-vertex-glow-delayed {
          animation: vertex-glow-delayed 3s ease-in-out infinite 0.5s;
        }
        
        .icon-nimbus .animate-nimbus-1,
        .icon-nimbus ellipse.animate-nimbus-1 {
          animation: nimbus-1 4s ease-in-out infinite;
        }
        
        .icon-nimbus .animate-nimbus-2,
        .icon-nimbus ellipse.animate-nimbus-2 {
          animation: nimbus-2 4s ease-in-out infinite 0.5s;
        }
        
        .icon-nimbus .animate-nimbus-3,
        .icon-nimbus ellipse.animate-nimbus-3 {
          animation: nimbus-3 4s ease-in-out infinite 1s;
        }
        
        .icon-nimbus .animate-nimbus-4,
        .icon-nimbus ellipse.animate-nimbus-4 {
          animation: nimbus-4 4s ease-in-out infinite 1.5s;
        }
        
        .icon-horizon .animate-horizon-dot-1,
        .icon-horizon circle.animate-horizon-dot-1 {
          animation: horizon-dot-1 2s ease-in-out infinite;
        }
        
        .icon-horizon .animate-horizon-dot-2,
        .icon-horizon circle.animate-horizon-dot-2 {
          animation: horizon-dot-2 2s ease-in-out infinite 0.3s;
        }
        
        .icon-horizon .animate-horizon-dot-3,
        .icon-horizon circle.animate-horizon-dot-3 {
          animation: horizon-dot-3 2s ease-in-out infinite 0.6s;
        }
        
        .icon-horizon .animate-horizon-wave,
        .icon-horizon path.animate-horizon-wave {
          animation: horizon-wave 3s ease-in-out infinite;
          transform-origin: center;
        }
        
        .icon-apex .animate-apex-glow,
        .icon-apex path.animate-apex-glow {
          animation: apex-glow 3s ease-in-out infinite;
        }
        
        .icon-apex .animate-apex-glow-delayed,
        .icon-apex path.animate-apex-glow-delayed {
          animation: apex-glow-delayed 3s ease-in-out infinite 0.5s;
        }
        
        .icon-prism .animate-prism-rotate,
        .icon-prism polygon.animate-prism-rotate {
          animation: prism-rotate 10s linear infinite;
        }
        
        .icon-prism .animate-prism-rotate-reverse,
        .icon-prism polygon.animate-prism-rotate-reverse {
          animation: prism-rotate-reverse 8s linear infinite;
        }
        
        .icon-acme .animate-acme-pulse,
        .icon-acme rect.animate-acme-pulse {
          animation: acme-pulse 2s ease-in-out infinite;
        }
        
        .icon-acme .animate-acme-rotate,
        .icon-acme path.animate-acme-rotate {
          animation: acme-rotate 5s linear infinite;
        }
        
        /* Stat Card Animations */
        @keyframes statsTitleEntrance {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          60% {
            transform: translateY(5px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes title-glow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
          }
          50% {
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 255, 255, 0.1);
          }
        }
        
        @keyframes statCardEntrance {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.8) rotateX(20deg);
          }
          60% {
            transform: translateY(-10px) scale(1.05) rotateX(-5deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotateX(0deg);
          }
        }
        
        @keyframes statCardFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        
        @keyframes stat-bg-pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        
        @keyframes stat-border-glow {
          0%, 100% {
            border-color: rgba(255, 255, 255, 0.1);
            box-shadow: 0 0 0 rgba(255, 255, 255, 0);
          }
          50% {
            border-color: rgba(255, 255, 255, 0.2);
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
          }
        }
        
        @keyframes stat-glow {
          0%, 100% {
            opacity: 0.3;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 0.6;
            transform: translateX(50%) scale(1.2);
          }
        }
        
        @keyframes stat-icon-float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-4px) rotate(5deg);
          }
        }
        
        @keyframes stat-number-glow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
            transform: scale(1);
          }
          50% {
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.4), 0 0 30px rgba(255, 255, 255, 0.2);
            transform: scale(1.02);
          }
        }
        
        @keyframes stat-suffix-pulse {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
        
        @keyframes stat-label-fade {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
        
        @keyframes stat-particle-1 {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(20px, -30px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(40px, -60px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes stat-particle-2 {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(-25px, 20px) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50px, 40px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes stat-particle-3 {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(15px, 25px) scale(1);
            opacity: 0.9;
          }
          100% {
            transform: translate(30px, 50px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes stat-particle-4 {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(-20px, -15px) scale(1);
            opacity: 0.7;
          }
          100% {
            transform: translate(-40px, -30px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes stats-bg-1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          50% {
            transform: translate(30px, -20px) scale(1.2);
            opacity: 0.4;
          }
        }
        
        @keyframes stats-bg-2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          50% {
            transform: translate(-25px, 30px) scale(1.15);
            opacity: 0.4;
          }
        }
        
        @keyframes stats-bg-3 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.15;
          }
          50% {
            transform: translate(20px, 25px) scale(1.1);
            opacity: 0.3;
          }
        }
        
        /* Icon-specific stat animations */
        @keyframes speed-ring {
          0%, 100% {
            transform: rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: rotate(180deg);
            opacity: 0.5;
          }
        }
        
        @keyframes speed-arrow {
          0%, 100% {
            transform: translateX(0) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translateX(2px) scale(1.1);
            opacity: 1;
          }
        }
        
        @keyframes money-ring {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1) rotate(180deg);
            opacity: 0.5;
          }
        }
        
        @keyframes money-x {
          0%, 100% {
            transform: rotate(0deg) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: rotate(45deg) scale(1.2);
            opacity: 0.6;
          }
        }
        
        @keyframes eye-open {
          0%, 100% {
            transform: scaleY(1);
            opacity: 0.3;
          }
          50% {
            transform: scaleY(1.1);
            opacity: 0.5;
          }
        }
        
        @keyframes eye-lid {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-1px);
            opacity: 0.4;
          }
        }
        
        /* Apply stat icon animations */
        .stat-icon-speed .animate-speed-ring {
          animation: speed-ring 3s linear infinite;
          transform-origin: 12px 12px;
        }
        
        .stat-icon-speed .animate-speed-arrow {
          animation: speed-arrow 2s ease-in-out infinite;
        }
        
        .stat-icon-speed .animate-pulse-dot {
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
        
        .stat-icon-money .animate-money-ring {
          animation: money-ring 4s ease-in-out infinite;
          transform-origin: 12px 12px;
        }
        
        .stat-icon-money .animate-money-x {
          animation: money-x 3s ease-in-out infinite;
          transform-origin: 12px 12px;
        }
        
        .stat-icon-money .animate-pulse-dot {
          animation: pulse-dot 2s ease-in-out infinite;
        }
        
        .stat-icon-eye .animate-eye-open {
          animation: eye-open 3s ease-in-out infinite;
          transform-origin: 12px 12px;
        }
        
        .stat-icon-eye .animate-eye-lid {
          animation: eye-lid 2.5s ease-in-out infinite;
        }
        
        .stat-icon-eye .animate-pulse-dot {
          animation: pulse-dot 1.8s ease-in-out infinite;
        }
        
        /* Animation classes */
        .animate-title-glow {
          animation: title-glow 3s ease-in-out infinite;
        }
        
        .animate-stat-bg-pulse {
          animation: stat-bg-pulse 4s ease-in-out infinite;
        }
        
        .animate-stat-border-glow {
          animation: stat-border-glow 3s ease-in-out infinite;
        }
        
        .animate-stat-glow {
          animation: stat-glow 4s ease-in-out infinite;
        }
        
        .animate-stat-icon-float {
          animation: stat-icon-float 4s ease-in-out infinite;
        }
        
        .animate-stat-number-glow {
          animation: stat-number-glow 2.5s ease-in-out infinite;
        }
        
        .animate-stat-suffix-pulse {
          animation: stat-suffix-pulse 1.5s ease-in-out infinite;
        }
        
        .animate-stat-label-fade {
          animation: stat-label-fade 3s ease-in-out infinite;
        }
        
        .animate-stat-particle-1 {
          animation: stat-particle-1 3s ease-out infinite;
        }
        
        .animate-stat-particle-2 {
          animation: stat-particle-2 3.5s ease-out infinite 0.5s;
        }
        
        .animate-stat-particle-3 {
          animation: stat-particle-3 3.2s ease-out infinite 1s;
        }
        
        .animate-stat-particle-4 {
          animation: stat-particle-4 3.8s ease-out infinite 1.5s;
        }
        
        .animate-stats-bg-1 {
          animation: stats-bg-1 8s ease-in-out infinite;
        }
        
        .animate-stats-bg-2 {
          animation: stats-bg-2 10s ease-in-out infinite;
        }
        
        .animate-stats-bg-3 {
          animation: stats-bg-3 12s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Customers;

