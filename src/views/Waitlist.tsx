"use client";

import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Zap, Shield, Users } from "lucide-react";
import { submitToGoogleSheets, fetchWaitlistCount } from "@/lib/googleSheets";
import CaptchaField from "@/components/CaptchaField";
import CalendlyEmbed from "@/components/CalendlyEmbed";

const CALENDLY_URL = "https://calendly.com/sekhar-javvadi/introduction-meeting";

interface WaitlistFormData {
  name: string;
  email: string;
  mobile: string;
  company: string;
  industry: string;
  message: string;
}

const industries = [
  "Manufacturing",
  "Automotive",
  "Electronics",
  "Aerospace",
  "Medical Devices",
  "Consumer Electronics",
  "Industrial Equipment",
  "Telecommunications",
  "Energy & Utilities",
  "Other",
];

const benefits = [
  {
    icon: Zap,
    title: "Early Access",
    description: "Be among the first to use OpenPlan when we launch.",
  },
  {
    icon: Shield,
    title: "Exclusive Features",
    description: "Waitlist members get access to features before general release.",
  },
  {
    icon: Users,
    title: "Priority Support",
    description: "Dedicated onboarding and priority support from our team.",
  },
  {
    icon: CheckCircle,
    title: "Founder Pricing",
    description: "Lock in special pricing reserved only for early adopters.",
  },
];

const APPLICATION_TOTAL = 100;

const Waitlist = () => {
  const [formData, setFormData] = useState<WaitlistFormData>({
    name: "",
    email: "",
    mobile: "",
    company: "",
    industry: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<WaitlistFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetTrigger, setCaptchaResetTrigger] = useState(0);
  const [applicationCount, setApplicationCount] = useState<number | null>(null);
  const [submittedInfo, setSubmittedInfo] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchWaitlistCount().then(setApplicationCount);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<WaitlistFormData> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else {
      const normalizedMobile = formData.mobile.replace(/[\s()-]/g, "");
      if (!/^\+?[1-9]\d{6,14}$/.test(normalizedMobile)) {
        newErrors.mobile = "Please enter a valid mobile number";
      }
    }

    if (!formData.company.trim()) newErrors.company = "Company name is required";
    if (!formData.industry) newErrors.industry = "Industry is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof WaitlistFormData, value: string) => {
    const nextValue =
      field === "mobile"
        ? value.replace(/[^\d+\s()-]/g, "").replace(/(?!^)\+/g, "")
        : value;

    setFormData((prev) => ({ ...prev, [field]: nextValue }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("idle");
    setSubmitErrorMessage("");

    if (!validateForm()) return;

    if (!captchaToken) {
      setSubmitStatus("error");
      setSubmitErrorMessage("Please complete the CAPTCHA before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitToGoogleSheets("waitlist", { ...formData, captchaToken });
      setSubmittedInfo({ name: formData.name, email: formData.email });
      setFormData({ name: "", email: "", mobile: "", company: "", industry: "", message: "" });
      setCaptchaResetTrigger((prev) => prev + 1);
      setSubmitStatus("success");
      setApplicationCount((prev) => (prev !== null ? prev + 1 : prev));
      setTimeout(() => fetchWaitlistCount().then(setApplicationCount), 1500);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit right now. Please try again in a moment."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        <section className="container mx-auto sm:px-12 px-4 pt-28 pb-16">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold">Join Our Waitlist</h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Be the first to know when we launch. Get early access to our platform and exclusive
              benefits reserved for founding members.
            </p>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground/80 italic">
              Trusted by teams building modern hardware products.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Benefits sidebar */}
            <div className="rounded-xl border border-border/60 bg-card/40 p-4 sm:p-6 space-y-6">
              <h2 className="text-base sm:text-lg font-semibold">Why join early?</h2>
              <div className="space-y-5">
                {benefits.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex items-start gap-3">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium">{title}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border/40">
                <p className="text-[11px] sm:text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <a href="/contact" className="text-primary hover:underline">
                    Contact us
                  </a>
                </p>
              </div>
            </div>

            {/* Waitlist form */}
            <form
              onSubmit={handleSubmit}
              className="lg:col-span-2 rounded-xl border border-border/60 bg-card/40 p-4 sm:p-6"
            >
              {submitStatus === "success" ? (
                <div className="flex flex-col items-center py-10 gap-4 text-center">
                  <CheckCircle className="h-12 w-12 text-green-400" />
                  <h2 className="text-xl font-semibold">You're on the list!</h2>
                  <p className="text-muted-foreground max-w-sm">
                    Thanks for signing up. Want to skip the line? Grab a time below to talk to our
                    team directly.
                  </p>

                  <div className="w-full mt-2">
                    <CalendlyEmbed url={CALENDLY_URL} prefill={submittedInfo ?? undefined} />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSubmitStatus("idle");
                      setSubmittedInfo(null);
                    }}
                  >
                    Submit another response
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Row 1: Name and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={errors.name ? "border-red-500" : ""}
                        disabled={isSubmitting}
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={errors.email ? "border-red-500" : ""}
                        disabled={isSubmitting}
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Row 2: Mobile and Company */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile Number *</Label>
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="Enter your mobile number"
                        value={formData.mobile}
                        onChange={(e) => handleInputChange("mobile", e.target.value)}
                        className={errors.mobile ? "border-red-500" : ""}
                        disabled={isSubmitting}
                      />
                      {errors.mobile && <p className="text-sm text-red-500">{errors.mobile}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name *</Label>
                      <Input
                        id="company"
                        type="text"
                        placeholder="Enter your company name"
                        value={formData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        className={errors.company ? "border-red-500" : ""}
                        disabled={isSubmitting}
                      />
                      {errors.company && <p className="text-sm text-red-500">{errors.company}</p>}
                    </div>
                  </div>

                  {/* Row 3: Industry */}
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => handleInputChange("industry", value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        id="industry"
                        className={errors.industry ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#050b17] border-[#2e3c54] text-[#d2deee]">
                        {industries.map((industry) => (
                          <SelectItem
                            key={industry}
                            value={industry}
                            className="focus:bg-[#1a2438] focus:text-[#f1f6ff]"
                          >
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.industry && <p className="text-sm text-red-500">{errors.industry}</p>}
                  </div>

                  {/* Row 4: Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Additional Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your needs or any questions you have..."
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      rows={4}
                      disabled={isSubmitting}
                      className="resize-none"
                    />
                  </div>

                  <CaptchaField
                    onVerify={(token) => {
                      setCaptchaToken(token);
                      if (token) setSubmitErrorMessage("");
                    }}
                    resetTrigger={captchaResetTrigger}
                    disabled={isSubmitting}
                  />

                  {submitStatus === "error" && (
                    <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {submitErrorMessage}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-2">
                    {/* Application progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-foreground">
                          {applicationCount === null ? "Loading..." : `${applicationCount} applications received`}
                        </span>
                        <span className="text-muted-foreground">
                          {applicationCount !== null && `${Math.max(APPLICATION_TOTAL - applicationCount, 0)} spots left of ${APPLICATION_TOTAL}`}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: applicationCount === null ? "0%" : `${Math.min((applicationCount / APPLICATION_TOTAL) * 100, 100)}%`,
                            background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                          }}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="bg-gradient-primary hover:shadow-glow"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Joining..." : "Join Waitlist →"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      We respect your privacy. Your information is never shared.
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Waitlist;
