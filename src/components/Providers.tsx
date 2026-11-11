"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* Global App Wrapper */}
        <div className="relative min-h-screen bg-background overflow-clip">
          <div className="relative z-10">{children}</div>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}
