"use client";

import HalftoneWordmarkFooter, { type FooterColumn } from "@/components/ui/halftone-wordmark-footer";

const COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Customers", href: "/customers" },
      { label: "Docs", href: "/docs" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blogs" },
      { label: "Contact", href: "/contact" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/openplanai" },
      { label: "X", href: "https://x.com/openplanai" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Security", href: "/security" },
    ],
  },
];

const Footer = () => (
  <HalftoneWordmarkFooter
    wordmark="openplan"
    label="OpenPlan AI"
    meta={`©${new Date().getFullYear()} · Velmond Labs Private Limited`}
    columns={COLUMNS}
    height="clamp(440px, 34vw + 300px, 560px)"
  />
);

export default Footer;
