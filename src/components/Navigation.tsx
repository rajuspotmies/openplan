import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLocation } from "@/lib/router";
import { ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const whiteLogo = "/logo.svg";

const industries = [
  { label: "Medtech", href: "/industries/medtech" },
  { label: "Drones", href: "/industries/drone" },
  { label: "Automotive", href: "/industries/automotive" },
  { label: "Consumer electronics", href: "/industries/consumer-electronics" },
];

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolledToLight, setIsScrolledToLight] = useState(false);
  // At the very top of the page the navbar has no surface at all;
  // the frosted pill eases in once the page starts scrolling.
  const [isAtTop, setIsAtTop] = useState(true);
  const location = useLocation();

  // Pick the light or dark navbar style from whatever background is behind it,
  // so it works on every section and page without hard-coded section ids.
  const navRef = React.useRef<HTMLElement>(null);
  useEffect(() => {
    const luminance = (color: string) => {
      const m = color.match(/[\d.]+/g);
      if (!m) return null;
      const [r, g, b, a = 1] = m.map(Number);
      if (a < 0.5) return null; // transparent: keep looking further down
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    };

    const update = () => {
      setIsAtTop(window.scrollY < 24);
      const nav = navRef.current;
      const y = nav ? nav.getBoundingClientRect().bottom + 8 : 80;
      // Sample the side gutters (where a page's own background shows) instead of the middle,
      // where buttons, pills and cards would give a false reading. Average what they report.
      const readings: number[] = [];
      for (const fx of [0.04, 0.96]) {
        for (const el of document.elementsFromPoint(window.innerWidth * fx, y)) {
          if (nav?.contains(el)) continue;
          const l = luminance(getComputedStyle(el).backgroundColor);
          if (l !== null) {
            readings.push(l);
            break;
          }
        }
      }
      if (readings.length) setIsScrolledToLight(readings.reduce((a, c) => a + c, 0) / readings.length > 0.6);
    };

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    const t = window.setTimeout(update, 600); // after lazy sections mount
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (location.pathname === "/") {
      e.preventDefault();
    }
  };

  const isActive = (href: string) => (href === "/" ? location.pathname === "/" : location.pathname.startsWith(href));
  const linkClass = (active = false) => `relative py-1 text-[14px] transition-colors duration-300 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 ${
    active ? "after:scale-x-100" : "after:scale-x-0"
  } ${
    isScrolledToLight ? "text-neutral-700 hover:text-black after:bg-black" : "text-neutral-200 hover:text-white after:bg-white"
  }`;

  return (
    <nav
      ref={navRef}
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${
        isAtTop
          ? "border-transparent bg-transparent"
          : `backdrop-blur-xl backdrop-saturate-150 ${isScrolledToLight ? "border-black/[0.07] bg-white/80" : "border-white/[0.08] bg-black/75"}`
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1384px] items-center justify-between gap-6 px-6 sm:px-8 md:h-[68px]">
        <Link href="/" className="flex shrink-0 items-center gap-2" onClick={handleLogoClick}>
          <img
            src={whiteLogo}
            alt="OpenPlan"
            className={`h-5 w-5 object-contain transition-all duration-300 ${isScrolledToLight ? "brightness-0" : "brightness-0 invert"}`}
          />
          <span
            className={`text-[17px] font-semibold tracking-[-0.02em] antialiased transition-colors duration-300 ${
              isScrolledToLight ? "text-black" : "text-white"
            }`}
          >
            OpenPlan
          </span>
        </Link>

        <div className="flex items-center gap-7">
          <div className="hidden items-center gap-7 lg:flex">
            <Link href="/" className={linkClass(isActive("/"))} aria-current={isActive("/") ? "page" : undefined}>
              Home
            </Link>
            {/* Industries dropdown: opens on hover and on keyboard focus */}
            <div className="group/ind relative">
              <button
                type="button"
                aria-haspopup="true"
                className={`${linkClass(isActive("/industries"))} inline-flex items-center gap-1.5`}
              >
                Industries
                <ChevronDown
                  className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/ind:rotate-180 group-focus-within/ind:rotate-180"
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
              <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 translate-y-1 pt-4 opacity-0 transition-[opacity,transform,visibility] duration-300 ease-out group-hover/ind:visible group-hover/ind:translate-y-0 group-hover/ind:opacity-100 group-focus-within/ind:visible group-focus-within/ind:translate-y-0 group-focus-within/ind:opacity-100">
                <ul className="min-w-[220px] border border-white/10 bg-black/90 p-1.5 backdrop-blur-xl">
                  {industries.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block px-3.5 py-2.5 text-[14px] text-neutral-300 transition-colors duration-200 ease-out hover:bg-white/[0.06] hover:text-white"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Link href="/blogs" className={linkClass(isActive("/blogs"))}>
              Blog
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 lg:flex">
              <Link
                href="/contact"
                className={`inline-flex h-10 items-center border px-4 text-[14px] font-medium transition-colors duration-300 ${
                  isScrolledToLight
                    ? "border-black/80 text-black hover:bg-black hover:text-white"
                    : "border-white/70 text-white hover:bg-white hover:text-black"
                }`}
              >
                Book demo
              </Link>
              <a
                href="https://app.openplanai.com/"
                className={`inline-flex h-10 items-center px-4 text-[14px] font-medium transition-colors duration-300 ${
                  isScrolledToLight ? "bg-black text-white hover:bg-neutral-800" : "bg-white text-black hover:bg-neutral-200"
                }`}
              >
                Open app
              </a>
            </div>

              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`lg:hidden rounded-full h-9 w-9 transition-colors ${
                      isScrolledToLight ? "text-black hover:bg-black/[0.05]" : "text-white hover:bg-white/[0.08]"
                    }`}
                    aria-label="Toggle menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[300px] bg-black/70 backdrop-blur-2xl border-white/10"
                >
                  <SheetHeader>
                    <SheetTitle className="text-white text-left">Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4 mt-8">
                    {[{ label: "Home", href: "/" }, ...industries, { label: "Blog", href: "/blogs" }].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-[16px] text-gray-300 hover:text-white transition-colors py-3 border-b border-white/10"
                        onClick={closeMobileMenu}
                      >
                        {item.label}
                      </Link>
                    ))}

                    <div className="flex flex-col gap-3 mt-6">
                      <a
                        href="https://app.openplanai.com/"
                        onClick={closeMobileMenu}
                        className="w-full h-12 inline-flex items-center justify-center rounded-full bg-transparent text-white border border-white/20 hover:bg-white/5 transition-colors text-[15px] font-medium gap-2 group"
                      >
                        <span>Sign In</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                          <path d="M11.9852 4L12 10.7704H10.9314V6.60741L10.9462 5.80741L4.74211 12L4 11.2444L10.2041 5.03704L9.47681 5.05185L5.21707 5.05185V4L11.9852 4Z" fill="currentColor"></path>
                        </svg>
                      </a>
                      <Link
                        href="/contact"
                        onClick={closeMobileMenu}
                        className="w-full h-12 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors text-[15px] font-medium flex items-center justify-center gap-2 group"
                      >
                        <span>Get a demo</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                          <path d="M11.9852 4L12 10.7704H10.9314V6.60741L10.9462 5.80741L4.74211 12L4 11.2444L10.2041 5.03704L9.47681 5.05185L5.21707 5.05185V4L11.9852 4Z" fill="currentColor"></path>
                        </svg>
                      </Link>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;


