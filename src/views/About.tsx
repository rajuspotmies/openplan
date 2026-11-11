"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import React from "react";
import {
  Target,
  HeartHandshake,
  Factory,
  Users2,
  Building2,
  Rocket,
  Globe,
  Briefcase,
  ArrowUpRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const spotmiesStats = [
  { icon: Briefcase, value: "50+", label: "Projects delivered" },
  { icon: Users2, value: "25+", label: "Team members" },
  { icon: Globe, value: "30+", label: "World wide clients" },
  { icon: Rocket, value: "AI-first", label: "Product engineering" },
];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <section className="container mx-auto sm:px-12 px-4 pt-28 pb-20">
          {/* Hero */}
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
              About OpenPlan
            </h1>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
              OpenPlan is building modern operations software for hardware
              teams. We help you unify planning, BOM, sourcing, builds, quality,
              and analytics in one place so you can ship reliably and scale with
              confidence. OpenPlan is built and operated by{" "}
              {/* <a
                href="https://www.spotmies.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Spotmies
              </a> */}
              Velmond Labs Private Limited, a technology company that designs and ships AI-driven
              applications, platforms, and products for startups and
              enterprises.
            </p>
          </div>

          {/* Mission / Values / Who we serve */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/40 border-border/60 transition-colors hover:border-primary/30">
              <CardHeader className="flex-row items-center gap-3 p-4 sm:p-6">
                <div className="h-9 w-9 sm:h-10 sm:w-10 inline-flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <CardTitle className="text-sm sm:text-base">Our mission</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4 sm:px-6 sm:pb-6">
                <CardDescription className="text-xs sm:text-sm">
                  Empower every hardware team with software that feels
                  delightful, unifies their workflows, and lets them focus on
                  building great products.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border/60 transition-colors hover:border-primary/30">
              <CardHeader className="flex-row items-center gap-3 p-4 sm:p-6">
                <div className="h-9 w-9 sm:h-10 sm:w-10 inline-flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <HeartHandshake className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <CardTitle className="text-sm sm:text-base">What we value</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4 sm:px-6 sm:pb-6">
                <CardDescription className="text-xs sm:text-sm">
                  Reliability, clarity, and speed. We sweat the details and
                  design for teams that build in the real world.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border/60 transition-colors hover:border-primary/30">
              <CardHeader className="flex-row items-center gap-3 p-4 sm:p-6">
                <div className="h-9 w-9 sm:h-10 sm:w-10 inline-flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Factory className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <CardTitle className="text-sm sm:text-base">Who we serve</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4 sm:px-6 sm:pb-6">
                <CardDescription className="text-xs sm:text-sm">
                  From startups to enterprises across manufacturing, automotive,
                  aerospace, electronics, and more.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Our story */}
          {/* NOTE: inner comment endings are escaped as *\/ — remove the backslash when uncommenting
          <div className="mt-16 rounded-xl border border-border/60 bg-card/40 p-4 sm:p-8">
            <h3 className="text-sm sm:text-base font-semibold">Our story</h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
              OpenPlan was founded by Sekhar Javvadi and Satish, co-founders of{" "}
              {/* <a
                href="https://www.spotmies.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Spotmies
              </a> *\/}
              Velmond Labs Private Limited, after years of wrestling with fragmented tools and spreadsheets
              across the hardware projects they built and shipped. They
              believed hardware deserved software as polished as the products
              it creates, so they brought {/* Spotmies' *\/}Velmond Labs Private Limited's product, engineering, and
              client delivery experience to bear and built OpenPlan to bring
              everything together.
            </p>
          </div>
          */}




          {/* Founding team section */}
          <div className="mt-16">
            <div className="flex items-center gap-2">
              <Users2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h3 className="text-sm sm:text-base font-semibold">
                Meet the founding team
              </h3>
            </div>
            {/* <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              OpenPlan is built by the founding team behind{" "}
              <a
                href="https://www.spotmies.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Spotmies
              </a>
              .
            </p> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {[
                {
                  name: "Sekhar Javvadi",
                  role: "CEO & Co-Founder",
                  initials: "SJ",
                  photo: "/team/sekhar.jpg",
                  // bio: "Sekhar Javvadi is a technology entrepreneur with 5+ years of experience building AI-driven applications, scalable platforms, and IoT solutions. He founded OpenPlan after years of shipping hardware for clients at Spotmies, where fragmented tools and spreadsheets kept slowing teams down. As CEO, he leads OpenPlan's product vision and engineering, focused on giving hardware teams one unified platform for planning, BOM, sourcing, builds, and quality.",
                  bio: "Sekhar Javvadi is a technology entrepreneur with 5+ years of experience building AI-driven applications, scalable platforms, and IoT solutions. He founded OpenPlan after years of shipping hardware for clients at Velmond Labs Private Limited, where fragmented tools and spreadsheets kept slowing teams down. As CEO, he leads OpenPlan's product vision and engineering, focused on giving hardware teams one unified platform for planning, BOM, sourcing, builds, and quality.",
                },
                {
                  name: "Satish",
                  role: "COO & Co-Founder",
                  initials: "S",
                  photo: "/team/satish.jpg",
                  // bio: "Satish is a technology entrepreneur with over 6 years of experience building and leading AI-powered platforms for interviews and career growth. He currently serves as CEO and Co-Founder at Spotmies, driving product, sales, and business processes. His background spans full-stack development, AWS, blockchain architecture, and qualitative research through video podcasting focused on scale-up and startup stories.",
                  bio: "Satish is a technology entrepreneur with over 6 years of experience building and leading AI-powered platforms for interviews and career growth. He currently serves as CEO and Co-Founder at Velmond Labs Private Limited, driving product, sales, and business processes. His background spans full-stack development, AWS, blockchain architecture, and qualitative research through video podcasting focused on scale-up and startup stories.",
                },
              ].map((m) => (
                <Card
                  key={m.name}
                  className="bg-card/40 border-border/60 transition-colors hover:border-primary/30"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                        <AvatarImage src={m.photo} alt={m.name} />
                        <AvatarFallback>{m.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs sm:text-sm font-medium leading-none">
                          {m.name}
                        </p>
                        <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                          {m.role}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                      {m.bio}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-16">
            {/* <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h3 className="text-sm sm:text-base font-semibold">About Spotmies</h3>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
              The technology company behind OpenPlan's product, engineering,
              and delivery.
            </p> */}
            {/* About Spotmies */}
            {/* <div className="mt-6 overflow-hidden rounded-xl border border-border/60 bg-card/40">
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
                <div className="p-4 sm:p-8">
                  <img
                    src="/partners/spotmies-logo.png"
                    alt="Spotmies"
                    className="h-6 sm:h-8 w-auto object-contain object-left"
                  />
                  <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] sm:text-xs font-medium text-primary">
                    <Rocket className="h-3.5 w-3.5" />
                    Product &amp; engineering studio
                  </span>
                  <p className="mt-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    Spotmies is a technology company that designs, builds, and
                    ships AI-driven applications, scalable platforms, and
                    digital products for startups and enterprises. Over the
                    years, the team has delivered 50+ client projects across
                    industries — spanning full-stack development, AI/ML,
                    IoT, and blockchain — and grown into a 25-member team
                    trusted to take products from idea to production.
                  </p>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    OpenPlan is Spotmies' own product: the operations platform
                    the founders wished they had while shipping hardware for
                    their clients, now built for every hardware team to use.
                  </p>
                  <a
                    href="https://www.spotmies.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:underline"
                  >
                    Visit spotmies.com
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-px bg-border/60 lg:border-l lg:border-border/60">
                  {spotmiesStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex flex-col justify-center gap-2 bg-card/60 p-4 sm:p-6"
                    >
                      <stat.icon className="h-4 w-4 text-primary" />
                      <div className="text-lg sm:text-xl font-semibold tracking-tight">
                        {stat.value}
                      </div>
                      <div className="text-[11px] sm:text-xs text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div> */}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
