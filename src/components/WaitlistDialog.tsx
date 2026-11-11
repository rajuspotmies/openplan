import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitToGoogleSheets } from "@/lib/googleSheets";
import CaptchaField from "@/components/CaptchaField";

interface WaitlistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onSubmit?: (formData: WaitlistFormData) => void;
}

export interface WaitlistFormData {
  name: string;
  email: string;
  mobile: string;
  company: string;
  industry: string;
  message?: string;
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

const WaitlistDialog: React.FC<WaitlistDialogProps> = ({
  isOpen,
  onClose,
  title = "Join Our Waitlist",
  description = "Be the first to know when we launch. Get early access to our platform.",
  onSubmit,
}) => {
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetTrigger, setCaptchaResetTrigger] = useState(0);

  const validateForm = (): boolean => {
    const newErrors: Partial<WaitlistFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else {
      // Allow international formatting chars but validate as E.164-like digits (+ optional, 7-15 digits).
      const normalizedMobile = formData.mobile.replace(/[\s()-]/g, "");
      if (!/^\+?[1-9]\d{6,14}$/.test(normalizedMobile)) {
        newErrors.mobile = "Please enter a valid mobile number";
      }
    }

    if (!formData.company.trim()) {
      newErrors.company = "Company name is required";
    }

    if (!formData.industry) {
      newErrors.industry = "Industry is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof WaitlistFormData, value: string) => {
    const nextValue =
      field === "mobile"
        ? value
            .replace(/[^\d+\s()-]/g, "")
            .replace(/(?!^)\+/g, "")
        : value;

    setFormData((prev) => ({ ...prev, [field]: nextValue }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }
    if (!captchaToken) {
      setSubmitError("Please complete the CAPTCHA before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitToGoogleSheets("waitlist", { ...formData, captchaToken });

      // Call the optional callback after successful Google Sheets submit.
      if (onSubmit) {
        await onSubmit(formData);
      }

      // Reset form and close dialog
      setFormData({
        name: "",
        email: "",
        mobile: "",
        company: "",
        industry: "",
        message: "",
      });
      setCaptchaResetTrigger((prev) => prev + 1);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to submit right now. Please try again in a moment."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* Row 1: Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
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
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Email */}
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
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Row 2: Mobile and Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mobile */}
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
                {errors.mobile && (
                  <p className="text-sm text-red-500">{errors.mobile}</p>
                )}
              </div>

              {/* Company */}
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
                {errors.company && (
                  <p className="text-sm text-red-500">{errors.company}</p>
                )}
              </div>
            </div>

            {/* Row 3: Industry (Full Width) */}
            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => handleInputChange("industry", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger
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
              {errors.industry && (
                <p className="text-sm text-red-500">{errors.industry}</p>
              )}
            </div>

            {/* Row 4: Message (Full Width) */}
            <div className="space-y-2">
              <Label htmlFor="message">Additional Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Tell us more about your needs or any questions you have..."
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                rows={3}
                disabled={isSubmitting}
              />
            </div>
            <CaptchaField
              onVerify={(token) => {
                setCaptchaToken(token);
                if (token) {
                  setSubmitError(null);
                }
              }}
              resetTrigger={captchaResetTrigger}
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary hover:shadow-glow"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Joining..." : "Join Waitlist"}
            </Button>
          </div>

          {submitError && (
            <p className="text-sm text-red-500 text-center">{submitError}</p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistDialog;
