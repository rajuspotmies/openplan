"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Book, Code, Rocket, Settings, FileText, HelpCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

const Docs = () => {
  const sections = [
    {
      title: "Getting Started",
      icon: Rocket,
      description: "Quick start guides to get you up and running with OpenPlan.",
      links: [
        { name: "Introduction", href: "#introduction" },
        { name: "Quick Start Guide", href: "#quickstart" },
        { name: "Installation", href: "#installation" },
        { name: "First Project", href: "#first-project" },
      ],
    },
    {
      title: "Core Concepts",
      icon: Book,
      description: "Understand the fundamental concepts behind OpenPlan.",
      links: [
        { name: "Product Lifecycle", href: "#lifecycle" },
        { name: "BOM Management", href: "#bom" },
        { name: "Sourcing & Vendors", href: "#sourcing" },
        { name: "Quality Assurance", href: "#quality" },
      ],
    },
    {
      title: "API Reference",
      icon: Code,
      description: "Complete API documentation for developers.",
      links: [
        { name: "Authentication", href: "#auth" },
        { name: "REST API", href: "#rest-api" },
        { name: "Webhooks", href: "#webhooks" },
        { name: "SDKs & Libraries", href: "#sdks" },
      ],
    },
    {
      title: "Configuration",
      icon: Settings,
      description: "Learn how to configure OpenPlan for your needs.",
      links: [
        { name: "Workspace Settings", href: "#workspace" },
        { name: "User Permissions", href: "#permissions" },
        { name: "Integrations", href: "#integrations" },
        { name: "Notifications", href: "#notifications" },
      ],
    },
    {
      title: "Guides & Tutorials",
      icon: FileText,
      description: "Step-by-step tutorials for common workflows.",
      links: [
        { name: "Managing BOMs", href: "#managing-boms" },
        { name: "Vendor Management", href: "#vendor-management" },
        { name: "Build Tracking", href: "#build-tracking" },
        { name: "Analytics & Reports", href: "#analytics" },
      ],
    },
    {
      title: "Help & Support",
      icon: HelpCircle,
      description: "Get help when you need it.",
      links: [
        { name: "FAQ", href: "#faq" },
        { name: "Troubleshooting", href: "#troubleshooting" },
        { name: "Contact Support", href: "/contact" },
        { name: "Community", href: "#community" },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        <section className="container mx-auto sm:px-12 px-4 pt-28 pb-16">
          {/* Header */}
          <div className="max-w-3xl mb-12">
            <h1 className="text-3xl md:text-4xl font-semibold">Documentation</h1>
            <p className="mt-3 text-muted-foreground text-lg">
              Everything you need to know about OpenPlan. From getting started to advanced features, find all the information you need here.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Search documentation..."
                className="w-full h-12 px-4 rounded-lg border border-border/60 bg-card/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-muted-foreground bg-muted rounded">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Documentation Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => (
              <div
                key={section.title}
                className="rounded-xl border border-border/60 bg-card/40 p-6 hover:border-border transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {section.description}
                </p>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      {link.href.startsWith("/") ? (
                        <Link
                          href={link.href}
                          className="text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1"
                        >
                          {link.name}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1"
                        >
                          {link.name}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Additional Resources */}
          <div className="mt-16 max-w-3xl">
            <h2 className="text-xl font-semibold mb-6">Additional Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="https://github.com/openplan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg border border-border/60 bg-card/40 hover:border-border transition-colors"
              >
                <Code className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">GitHub</p>
                  <p className="text-sm text-muted-foreground">View our open source projects</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
              </a>
              <Link
                href="/contact"
                className="flex items-center gap-3 p-4 rounded-lg border border-border/60 bg-card/40 hover:border-border transition-colors"
              >
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Contact Support</p>
                  <p className="text-sm text-muted-foreground">Get help from our team</p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Docs;

