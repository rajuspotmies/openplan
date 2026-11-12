"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Light only for now: forcedTheme ignores a saved "dark" choice. Drop forcedTheme and set
  // SHOW_THEME_SWITCH in Navigation to bring the dark theme back.
  return (
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false} disableTransitionOnChange storageKey="theme">
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
