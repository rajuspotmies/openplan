import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter_Tight } from "next/font/google";
import Script from "next/script";
import Providers from "@/components/Providers";
import "./globals.css";

// Display/text face: Inter Tight (tight, premium grotesk). Mono: Geist Mono for labels and buttons.
const sans = Inter_Tight({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const GA_ID = "G-8Z892GP5SK";

export const metadata: Metadata = {
  metadataBase: new URL("https://openplan.ai"),
  title: "OpenPlan - Modern Ops for Hardware SaaS",
  description:
    "Streamline hardware development with our comprehensive SaaS platform. Project management, inventory tracking, compliance, and more for automotive, aerospace, pharma, and media companies.",
  authors: [{ name: "OpenPlan" }],
  keywords: [
    "hardware development",
    "project management",
    "inventory management",
    "compliance",
    "ISO standards",
    "automotive",
    "aerospace",
    "pharmaceuticals",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "OpenPlan - Hardware Development Made Simple",
    description:
      "The AI planning layer for hardware teams — works alongside your PLM. Save time, reduce errors, improve collaboration.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: [
      { url: "/favicon-light.svg?v=2", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.svg?v=2", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>
      </body>
    </html>
  );
}
