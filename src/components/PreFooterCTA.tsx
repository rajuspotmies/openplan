import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@/lib/router";

const whiteLogo = "/logo.svg";

const PreFooterCTA = () => {
  const navigate = useNavigate();

  return (
    <motion.section
      className="relative z-30 bg-background"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-10 left-1/4 h-56 w-56 rounded-full bg-[#1a4fa5]/10 blur-3xl" />
        <div className="absolute bottom-8 right-1/4 h-64 w-64 rounded-full bg-[#2f6dd1]/10 blur-3xl" />
      </div>

      {/* ========== MOBILE VIEW ========== */}
      <div className="md:hidden px-5 py-14">
        <div className="rounded-2xl border border-[#1f3150] bg-[#07111f] overflow-hidden">
          {/* Dot grid background */}
          <div className="relative px-6 pt-10 pb-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18px_18px,rgba(135,190,255,0.18)_2px,transparent_2.5px)] [background-size:24px_24px] opacity-40" />

            {/* Logo + brand */}
            <motion.div
              className="relative flex items-center gap-3 mb-6"
              initial={{ opacity: 0.6 }}
              whileInView={{ opacity: 1 }}
              viewport={{ amount: 0.55, once: false }}
              transition={{ duration: 0.5 }}
            >
              <motion.img
                src={whiteLogo}
                alt="OpenPlan"
                className="h-9 w-9 object-contain"
                initial={{ opacity: 0.55, filter: "brightness(0.75) invert(1)" }}
                whileInView={{ opacity: 1, filter: "brightness(1) invert(1)" }}
                viewport={{ amount: 0.55, once: false }}
                transition={{ duration: 0.55 }}
              />
              <motion.span
                className="text-[28px] leading-none tracking-[-0.03em] font-medium antialiased"
                initial={{ color: "rgba(216,233,255,0.68)" }}
                whileInView={{ color: "rgb(255,255,255)" }}
                viewport={{ amount: 0.55, once: false }}
                transition={{ duration: 0.55 }}
              >
                Open<span className="-ml-[0.02em]">Plan</span>
              </motion.span>
            </motion.div>

            <p className="relative text-[16px] leading-[1.45] text-[rgb(216,233,255)]/75 mb-8">
              Built for modern hardware teams to plan, build, and ship with confidence.
            </p>

            {/* Divider */}
            <div className="relative border-t border-white/[0.07] mb-8" />

            {/* Headline */}
            <h3 className="relative text-[2rem] leading-[1.1] tracking-[-0.03em] font-medium text-[rgb(216,233,255)] mb-2">
              Start building with OpenPlan
            </h3>
            <p className="relative text-[15px] text-[rgb(216,233,255)]/55 mb-8 leading-relaxed">
              Use OpenPlan to improve every step of your hardware development lifecycle.
            </p>

            {/* CTA Buttons */}
            <div className="relative flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full h-12 px-7 rounded-[10px] text-[15px] font-medium bg-[#ffffff] text-[#0f1626] hover:bg-[#eef3fb]"
                onClick={() => { window.location.href = "https://app.openplanai.com/"; }}
              >
                Sign In
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 px-7 rounded-[10px] text-[15px] font-medium border-[#2b3f62] bg-[#0b1322] text-[#dce7f7] hover:border-[#3f5a86] hover:bg-[#0f1a30]"
                onClick={() => navigate("/contact")}
              >
                Get a demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ========== DESKTOP VIEW ========== */}
      <div className="hidden md:block py-24">
        <div className="container mx-auto max-w-8xl sm:px-12 px-2">
          <div className="border-y border-[#1f3150] bg-background/95">
            <div className="grid lg:grid-cols-[1fr_1fr] items-center">
              <div className="relative min-h-[420px] overflow-hidden px-8 py-16 sm:px-12 sm:py-20 lg:px-16">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18px_18px,rgba(135,190,255,0.28)_2px,transparent_2.5px)] [background-size:24px_24px] opacity-45" />
                <div className="relative h-full flex flex-col justify-center">
                  <motion.div
                    className="flex items-center gap-4"
                    initial={{ opacity: 0.6 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ amount: 0.55, once: false }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <motion.img
                      src={whiteLogo}
                      alt="OpenPlan"
                      className="h-14 w-14 object-contain"
                      initial={{ opacity: 0.55, filter: "brightness(0.75) invert(1)" }}
                      whileInView={{ opacity: 1, filter: "brightness(1) invert(1)" }}
                      viewport={{ amount: 0.55, once: false }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                    />
                    <motion.h3
                      className="text-[56px] leading-none tracking-[-0.03em] font-medium antialiased"
                      initial={{ color: "rgba(216,233,255,0.68)" }}
                      whileInView={{ color: "rgb(255,255,255)" }}
                      viewport={{ amount: 0.55, once: false }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                    >
                      Open<span className="-ml-[0.025em]">Plan</span>
                    </motion.h3>
                  </motion.div>
                  <p className="mt-6 max-w-[520px] text-[22px] leading-[1.25] text-[rgb(216,233,255)]">
                    Built for modern hardware teams to plan, build, and ship with confidence.
                  </p>
                </div>
              </div>

              <div className="px-8 py-16 sm:px-12 sm:py-20 lg:px-16">
                <div className="max-w-[540px] space-y-8">
                  <h3 className="text-[58px] leading-[1.02] tracking-[-0.03em] font-medium text-[rgb(216,233,255)]">
                    Start building with OpenPlan
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      size="lg"
                      className="h-12 px-7 rounded-[10px] text-[15px] font-medium bg-[#ffffff] text-[#0f1626] hover:bg-[#eef3fb]"
                      onClick={() => { window.location.href = "https://app.openplanai.com/"; }}
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 px-7 rounded-[10px] text-[15px] font-medium border-[#2b3f62] bg-[#0b1322] text-[#dce7f7] hover:border-[#3f5a86] hover:bg-[#0f1a30]"
                      onClick={() => navigate("/contact")}
                    >
                      Get a demo
                    </Button>
                  </div>
                  <p className="text-[32px] leading-[1.02] tracking-[-0.03em] font-medium text-[rgb(216,233,255)]">
                    Build, ship, and scale hardware programs with clarity.
                  </p>
                  <p className="text-base text-muted-foreground max-w-md">
                    Use OpenPlan to improve every step of your hardware development lifecycle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </motion.section>
  );
};

export default PreFooterCTA;
