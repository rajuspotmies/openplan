"use client";

import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Code2,
  Bug,
  BrainCircuit,
  Megaphone,
  MapPin,
  Clock,
} from "lucide-react";

const roles = [
  {
    title: "MERN Stack Developer",
    icon: Code2,
    summary:
      "Build rich, performant web experiences across MongoDB, Express, React, and Node. Help ship delightful features quickly and reliably.",
    tags: ["Full-time", "Remote-friendly"],
    location: "Hyderabad, IN / Remote",
  },
  {
    title: "QA Engineer",
    icon: Bug,
    summary:
      "Own quality across web and APIs. Design robust test plans, build automation, and safeguard user trust.",
    tags: ["Full-time", "On-site"],
    location: "Hyderabad, IN",
  },
  {
    title: "AI Engineer",
    icon: BrainCircuit,
    summary:
      "Prototype and productionize ML/AI features that augment operations workflows. Work across data, models, and UX.",
    tags: ["Full-time", "Hybrid"],
    location: "Hyderabad, IN",
  },
  {
    title: "Marketing Intern",
    icon: Megaphone,
    summary:
      "Support campaigns, content, and social. Learn fast, experiment often, and help tell our product story.",
    tags: ["Internship", "3–6 months"],
    location: "Hyderabad, IN / Remote",
  },
];

const Careers = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <section className="container mx-auto sm:px-12 px-2 pt-28 pb-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-semibold">
              Careers at OpenPlan
            </h1>
            <p className="mt-3 text-muted-foreground">
              Join us to build modern operations software for hardware teams. We
              value craft, clarity, and shipping fast.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card key={role.title} className="bg-card/40 border-border/60">
                  <CardHeader className="flex-row items-start gap-3 p-6">
                    <div className="h-10 w-10 inline-flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{role.title}</CardTitle>
                      <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center text-xs text-muted-foreground">
                          <MapPin className="mr-1 h-3.5 w-3.5" />
                          {role.location}
                        </span>
                        <span className="inline-flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3.5 w-3.5" />
                          Openings
                        </span>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 px-6 pb-6">
                    <p className="text-sm text-muted-foreground">
                      {role.summary}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {role.tags.map((t) => (
                        <Badge
                          key={t}
                          variant="secondary"
                          className="bg-muted/60"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-6">
                      <Button
                        className="h-10 rounded-lg bg-gradient-primary"
                        type="button"
                      >
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
