import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLocation } from "@/lib/router";
import { ChevronDown, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
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

/** The dark theme is built (see "Themes" in globals.css); flip this to offer the switch again. */
const SHOW_THEME_SWITCH = false;

const Navigation = () => {
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(() => location.pathname.startsWith("/industries"));
  const [isScrolledToLight, setIsScrolledToLight] = useState(false);
  // At the very top of the page the navbar has no surface at all;
  // the frosted pill eases in once the page starts scrolling.
  const [isAtTop, setIsAtTop] = useState(true);

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

    // The nav is fixed at the top, so its bottom edge only moves on resize.
    let navBottom = 80;
    const measure = () => {
      const nav = navRef.current;
      if (nav) navBottom = nav.getBoundingClientRect().bottom;
    };
    measure();

    const sample = () => {
      const nav = navRef.current;
      const y = navBottom + 8;
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

    // elementsFromPoint is a full hit test of the page: run it at most every 120ms (plus a
    // trailing sample when scrolling stops), never on every scroll frame. The colour change
    // itself is a 300-500ms transition, so the lower rate is invisible.
    let frame = 0;
    let timer = 0;
    let lastSample = 0;
    const SAMPLE_MS = 120;
    const update = () => {
      frame = 0;
      setIsAtTop(window.scrollY < 24);
      const now = performance.now();
      window.clearTimeout(timer);
      if (now - lastSample >= SAMPLE_MS) {
        lastSample = now;
        sample();
      } else {
        timer = window.setTimeout(() => {
          lastSample = performance.now();
          sample();
        }, SAMPLE_MS);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    update();
    const t = window.setTimeout(sample, 600); // after lazy sections mount
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(t);
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // a theme switch changes the backgrounds under the nav: sample them again once they have repainted
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => window.dispatchEvent(new Event("scroll"))));
    return () => cancelAnimationFrame(id);
  }, [resolvedTheme]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Open the industries list by default when you're already on an industry page.
  useEffect(() => {
    if (isMobileMenuOpen) setIndustriesOpen(location.pathname.startsWith("/industries"));
  }, [isMobileMenuOpen, location.pathname]);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (location.pathname === "/") {
      e.preventDefault();
    }
  };

  const isActive = (href: string) => (href === "/" ? location.pathname === "/" : location.pathname.startsWith(href));
  // the underline shows on hover only; the current page is marked by aria-current
  const linkClass = (_active = false) => `relative py-1 text-[14px] transition-colors duration-300 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 after:scale-x-0 ${
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
                  {industries.map((item) => {
                    const on = isActive(item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={on ? "page" : undefined}
                          className={`relative flex items-center justify-between gap-6 px-3.5 py-2.5 text-[14px] transition-colors duration-200 ease-out ${
                            on ? "bg-white/[0.08] text-white" : "text-neutral-300 hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          {/* current page: a blue rule on the left edge and a dot on the right */}
                          <span aria-hidden className={`absolute inset-y-1.5 left-0 w-[2px] bg-brand transition-opacity duration-200 ${on ? "opacity-100" : "opacity-0"}`} />
                          {item.label}
                          {on ? <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" /> : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <Link href="/blogs" className={linkClass(isActive("/blogs"))} aria-current={isActive("/blogs") ? "page" : undefined}>
              Blog
            </Link>
          </div>

          <div className="flex items-center gap-1.5 min-[360px]:gap-2 lg:gap-3">
            {SHOW_THEME_SWITCH && (
              <>
                {/* Theme: light / dark. Both icons render and CSS shows the right one, so the
                    server markup always matches the client. */}
                <button
                  type="button"
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  aria-label="Switch between light and dark theme"
                  title="Switch theme"
                  className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center border transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 lg:h-10 lg:w-10 ${
                    isScrolledToLight
                      ? "border-black/15 text-black hover:border-black/80"
                      : "border-white/25 text-white hover:border-white/70"
                  }`}
                >
                  <Sun className="theme-ico theme-ico-sun absolute h-[17px] w-[17px]" strokeWidth={1.75} aria-hidden />
                  <Moon className="theme-ico theme-ico-moon absolute h-[17px] w-[17px]" strokeWidth={1.75} aria-hidden />
                </button>
                  </>
            )}
            {/* Phones and tablets: sign in stays in the bar, next to the menu */}
            <a
              href="https://app.openplanai.com/"
              className={`inline-flex h-9 items-center gap-1.5 whitespace-nowrap border px-3.5 font-mono text-[11.5px] uppercase tracking-[0.1em] transition-colors duration-300 max-[359px]:px-2.5 max-[359px]:text-[10.5px] lg:hidden ${
                isScrolledToLight
                  ? "border-black/80 text-black hover:bg-black hover:text-white"
                  : "border-white/70 text-white hover:bg-white hover:text-black"
              }`}
            >
              Sign in
            </a>
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
                    <Link
                      href="/"
                      aria-current={isActive("/") ? "page" : undefined}
                      className={`flex items-center justify-between border-b border-white/10 py-3 text-[16px] transition-colors ${isActive("/") ? "text-white" : "text-gray-300 hover:text-white"}`}
                      onClick={closeMobileMenu}
                    >
                      Home
                      {isActive("/") ? <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" /> : null}
                    </Link>

                    {/* Industries collapse into one dropdown */}
                    <div className="border-b border-white/10">
                      <button
                        type="button"
                        aria-expanded={industriesOpen}
                        aria-controls="mobile-industries"
                        onClick={() => setIndustriesOpen((o) => !o)}
                        className={`flex w-full items-center justify-between py-3 text-left text-[16px] transition-colors focus:outline-none focus-visible:text-white ${
                          isActive("/industries") ? "text-white" : "text-gray-300 hover:text-white"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          Industries
                          {isActive("/industries") ? <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" /> : null}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${industriesOpen ? "rotate-180" : ""}`}
                          strokeWidth={2}
                          aria-hidden
                        />
                      </button>
                      <div
                        id="mobile-industries"
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                          industriesOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <ul className="overflow-hidden" inert={!industriesOpen}>
                          {industries.map((item) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                onClick={closeMobileMenu}
                                aria-current={isActive(item.href) ? "page" : undefined}
                                className={`block border-l py-2.5 pl-4 text-[15px] transition-colors ${
                                  isActive(item.href) ? "border-brand text-white" : "border-white/10 text-gray-400 hover:text-white"
                                }`}
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                          <li className="h-3" aria-hidden />
                        </ul>
                      </div>
                    </div>

                    <Link
                      href="/blogs"
                      aria-current={isActive("/blogs") ? "page" : undefined}
                      className={`flex items-center justify-between border-b border-white/10 py-3 text-[16px] transition-colors ${isActive("/blogs") ? "text-white" : "text-gray-300 hover:text-white"}`}
                      onClick={closeMobileMenu}
                    >
                      Blog
                      {isActive("/blogs") ? <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" /> : null}
                    </Link>

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


