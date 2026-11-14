"use client";

import { useEffect, Suspense, lazy } from "react";
import { useLocation } from "@/lib/router";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import PartsShelfField from "@/components/hero/PartsShelfField";
import BlueAsciiField from "@/components/hero/BlueAsciiField";
import BlueprintField from "@/components/hero/BlueprintField";
import { HERO_DESIGN } from "@/components/hero/heroDesign";
import PanelReveal, { PanelClip } from "@/components/motion/PanelReveal";
import TrustedBy from "@/components/TrustedBy";

// Lazy load below-the-fold components for faster initial load
const DemoVideo = lazy(() => import("@/components/DemoVideo"));
const ScrollLifecycleSection = lazy(() => import("@/components/ScrollLifecycleSection"));
const OpenPlanSlides = lazy(() => import("@/components/slides/OpenPlanSlides"));
const Features = lazy(() => import("@/components/Features"));
const Industries = lazy(() => import("@/components/Industries"));
const Pricing = lazy(() => import("@/components/Pricing"));
const FAQ = lazy(() => import("@/components/FAQ"));
const BlogSection = lazy(() => import("@/components/BlogSection"));
const GetStarted = lazy(() => import("@/components/GetStarted"));
const PreFooterCTA = lazy(() => import("@/components/PreFooterCTA"));
const Footer = lazy(() => import("@/components/Footer"));

const Index = () => {
  const { hash } = useLocation();

  useEffect(() => {
    const sectionId = hash.replace(/^#/, "");

    if (sectionId) {
      const scrollToSection = () => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return true;
        }
        return false;
      };
      const delays = [0, 50, 200, 400, 800, 1500];
      const timeouts = delays.map((ms) => setTimeout(() => scrollToSection(), ms));
      return () => timeouts.forEach(clearTimeout);
    }

    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };

    scrollToTop();

    const handleLoad = () => {
      scrollToTop();
    };

    const timeoutId = setTimeout(() => scrollToTop(), 0);
    const timeoutId2 = setTimeout(() => scrollToTop(), 50);
    const timeoutId3 = setTimeout(() => scrollToTop(), 200);

    let loadListenerAdded = false;

    if (document.readyState === "complete") {
      scrollToTop();
    } else {
      window.addEventListener("load", handleLoad);
      loadListenerAdded = true;
    }

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);

      if (loadListenerAdded) {
        window.removeEventListener("load", handleLoad);
      }
    };
  }, [hash]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0B' }}>
      <Navigation />
      {/* Hero → panel that opens over the pinned hero background: "How to get started" comes second */}
      <PanelReveal
        background={
          HERO_DESIGN === "shelf" ? (
            <PartsShelfField className="absolute inset-0 h-full w-full" />
          ) : HERO_DESIGN === "blueprint" ? (
            <BlueprintField className="absolute inset-0 h-full w-full" />
          ) : (
            <BlueAsciiField className="absolute inset-0 h-full w-full" />
          )
        }
        hero={<Hero background={false} />}
        clip={false}
      >
        <Suspense fallback={<div className="h-screen bg-[#0A0A0B]" />}>
          <TrustedBy />
          <GetStarted />
        </Suspense>
      </PanelReveal>
      <Suspense fallback={null}>
        <DemoVideo />
        <ScrollLifecycleSection />
        <OpenPlanSlides />
        <PanelClip className="bg-white">
          <Features />
          <Industries />
          <Pricing />
          <FAQ />
          <BlogSection />
        </PanelClip>
        <PreFooterCTA />
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
