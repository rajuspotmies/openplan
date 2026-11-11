import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Clock, TrendingDown, Users, Zap } from "lucide-react";

const AnimatedMetric = ({ value }: { value: string }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-12% 0px" });
  const [displayValue, setDisplayValue] = useState(value);

  const parsedMetric = useMemo(() => {
    const numeric = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
    const prefix = value.startsWith("-") ? "-" : "";
    const suffix = value.replace(/^-?[0-9.]+/, "");
    const decimals = value.includes(".") ? value.split(".")[1]?.replace(/[^0-9]/g, "").length ?? 0 : 0;
    return { numeric: Number.isFinite(numeric) ? numeric : 0, prefix, suffix, decimals };
  }, [value]);

  useEffect(() => {
    if (!isInView) return;

    const durationMs = 850;
    const start = performance.now();
    const target = parsedMetric.numeric;
    let raf = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      const currentStr = `${parsedMetric.prefix}${current.toFixed(parsedMetric.decimals)}${parsedMetric.suffix}`;
      setDisplayValue(currentStr);

      if (progress < 1) {
        raf = window.requestAnimationFrame(tick);
      } else {
        setDisplayValue(value);
      }
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [isInView, parsedMetric.decimals, parsedMetric.numeric, parsedMetric.prefix, parsedMetric.suffix, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="text-7xl sm:text-8xl font-black tracking-tighter text-slate-900 group-hover:text-blue-600 transition-colors duration-500"
    >
      {displayValue}
    </motion.div>
  );
};

const Benefits = () => {
  const benefits = [
    {
      icon: Clock,
      title: "Faster completion",
      value: "40%",
      description: "Save time on repetitive tasks and focus on actual engineering.",
    },
    {
      icon: TrendingDown,
      title: "Costly mistakes",
      value: "-85%",
      description: "Automated validation prevents errors before they hit production.",
    },
    {
      icon: Users,
      title: "Team coordination",
      value: "3x",
      description: "Faster alignment across hardware, software, and ops.",
    },
    {
      icon: Zap,
      title: "Compliance rate",
      value: "100%",
      description: "Built-in ISO/FDA reporting ensures you never miss a requirement.",
    },
  ];

  return (
    <section id="benefits" className="relative z-30 bg-white">
      <div className="container mx-auto max-w-8xl sm:px-12 px-4">
        {/* Two Halves Layout */}
        <div className="flex flex-col lg:flex-row items-start relative">
          
          {/* Left Side: Sticky and Vertically Centered */}
          <div className="lg:w-1/2 w-full lg:h-screen lg:sticky lg:top-0 flex flex-col justify-center pt-24 pb-12 lg:py-0 self-start pr-0 lg:pr-12">
            <motion.div 
              className="flex flex-col justify-center text-left max-w-lg mx-auto lg:mx-0 lg:pl-8"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-6 w-max">
                 <Zap className="h-4 w-4" /> Real impact
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-slate-900 tracking-tight leading-tight">
                Hardware is hard. <br/>
                <motion.span
                  className="inline-block text-transparent bg-clip-text bg-[linear-gradient(95deg,#94a3b8_0%,#94a3b8_40%,#3b82f6_55%,#94a3b8_72%,#94a3b8_100%)] [background-size:220%_100%]"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0, backgroundPosition: ["100% 0%", "0% 0%"] }}
                  viewport={{ once: true, amount: 0.7 }}
                  transition={{
                    opacity: { duration: 0.7, ease: "easeOut", delay: 0.7 },
                    y: { duration: 0.7, ease: "easeOut", delay: 0.7 },
                    backgroundPosition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.75 },
                  }}
                >
                  We make it faster.
                </motion.span>
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
                Don't just take our word for it. Our customers see real, measurable improvements in their development processes from day one.
              </p>
            </motion.div>
          </div>

          {/* Right Side: 4 Scrollable Sections */}
          <div className="lg:w-1/2 w-full pb-24 lg:pb-24 lg:pr-8">
            <div className="flex flex-col">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <motion.div 
                    key={index}
                    className="min-h-[50vh] lg:min-h-[66vh] flex flex-col justify-center py-10"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10% 0px" }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  >
                    <div className="bg-slate-50 border border-slate-100 p-8 sm:p-10 rounded-[2rem] hover:shadow-xl hover:border-blue-100 transition-all duration-500 group flex flex-col justify-between gap-10 w-full lg:max-w-[560px]">
                      
                      {/* Top: Icon & Title */}
                      <div className="flex flex-col gap-6">
                        <div className="h-16 w-16 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all duration-300">
                          <IconComponent className="h-7 w-7 text-slate-500 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                          <p className="text-slate-600 text-lg leading-relaxed max-w-sm">{benefit.description}</p>
                        </div>
                      </div>
                      
                      {/* Bottom: Huge Metric */}
                      <div className="flex justify-start">
                        <AnimatedMetric value={benefit.value} />
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Benefits;
