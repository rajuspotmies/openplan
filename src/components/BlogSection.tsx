"use client";

// Insights as a ruled sheet of three articles inside the page's railed frame, in the same
// vocabulary as Pricing: mono labels, hairlines, square corners and the house blue as accent.
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "@/lib/router";
import BlurReveal, { BlurWords } from "@/components/motion/BlurReveal";

const posts = [
  {
    id: 1,
    title: "The missing middle of hardware tooling",
    excerpt:
      "Hardware startups juggle disconnected tools: BOMs in Excel, timelines in Jira, procurement in spreadsheets. Neither enterprise PLM nor lightweight software tools fully solve it.",
    category: "Operations",
    readTime: "5 min read",
    image: "/assets/blog/blog-missing-middle.png",
    url: "https://medium.com/@sekharatece/the-missing-middle-of-hardware-tooling-1ff43f681479",
  },
  {
    id: 2,
    title: "How exactly fast-moving hardware teams handle design changes without chaos",
    excerpt:
      "Design change chaos stems from poor traceability, not the changes themselves. Fast teams treat change orders as tracked objects and map impact before approval.",
    category: "Engineering",
    readTime: "6 min read",
    image: "/assets/blog/blog-design-changes.png",
    url: "https://medium.com/@sekharatece/how-exactly-fast-moving-hardware-teams-handle-design-changes-without-chaos-1ed397b1767f",
  },
  {
    id: 3,
    title: "Why engineers still manage BOMs in Excel (and what it actually costs them)",
    excerpt:
      "The real problem isn't Excel. It's the disconnected copies of BOMs across teams that create silent failures in the gap between the file and everything that depends on it.",
    category: "BOM Management",
    readTime: "6 min read",
    image: "/assets/blog/blog-boms-excel.png",
    url: "https://medium.com/@sekharatece/why-engineers-still-manage-boms-in-excel-and-what-it-actually-costs-them-9c6af727a31f",
  },
];

/** A hairline "+" mark sitting on a ruled corner. */
function Cross({ className }: { className: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute h-[9px] w-[9px] ${className}`}>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-black/30" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-black/30" />
    </span>
  );
}

const BlogSection = () => {
  const navigate = useNavigate();

  return (
    <section id="blog" className="relative z-30 bg-white text-brand-ink">
      <div className="relative mx-auto w-[min(1600px,calc(100%-2*clamp(12px,2.4vw,36px)))] border-x border-black/[0.08]">
        <div className="px-[clamp(20px,3vw,48px)] py-[clamp(88px,10vw,136px)]">
          {/* Header: title left, lede and link right */}
          <div className="grid items-end gap-x-[clamp(32px,5vw,80px)] gap-y-8 lg:grid-cols-2">
            <div>
              <BlurReveal>
                <p className="m-0 font-mono text-[13px] uppercase leading-none tracking-[0.1em] text-neutral-500">
                  <span className="text-brand-ink">OpenPlan</span> <span className="text-neutral-300">/</span> Insights
                </p>
              </BlurReveal>
              <h2 className="mt-7 text-balance text-[clamp(2.2rem,4vw,3.6rem)] font-medium leading-[1.04] tracking-[-0.04em]">
                <BlurWords text="Fresh ideas for" delay={0.05} />{" "}
                <span className="block text-neutral-400">
                  <BlurWords text="modern hardware teams." delay={0.18} />
                </span>
              </h2>
            </div>
            <BlurReveal delay={0.25} className="lg:justify-self-end">
              <p className="m-0 max-w-[40ch] text-pretty text-[17px] leading-[1.55] text-neutral-600">
                Explore practical stories, product tips, and launch lessons from teams building with clarity.
              </p>
              <button
                type="button"
                onClick={() => navigate("/blogs")}
                className="group/cta mt-6 inline-flex h-11 items-center gap-6 border border-black/[0.14] bg-white px-5 font-mono text-[12px] uppercase tracking-[0.1em] text-brand-ink transition-[background-color,border-color,color] duration-300 ease-out hover:border-brand-ink hover:bg-brand-ink hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                All articles
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
                  strokeWidth={1.75}
                />
              </button>
            </BlurReveal>
          </div>

          {/* Articles: one ruled sheet */}
          <BlurReveal delay={0.1} y={24} blur={12}>
            <div className="relative mt-[clamp(48px,6vw,80px)] grid border-t border-black/[0.1] md:grid-cols-3">
              <Cross className="-left-[5px] -top-[5px]" />
              <Cross className="-right-[5px] -top-[5px]" />
              {posts.map((post, i) => (
                <a
                  key={post.id}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative flex flex-col border-b border-black/[0.1] bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40 ${
                    i > 0 ? "md:border-l" : ""
                  }`}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-[-1px] z-[1] h-[2px] origin-left scale-x-0 bg-brand transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                  />
                  <div className="px-[clamp(20px,2.4vw,36px)] pt-[clamp(24px,2.6vw,36px)]">
                    <div className="relative aspect-[16/9] overflow-hidden border border-black/[0.08] bg-neutral-100">
                      <img
                        src={post.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col px-[clamp(20px,2.4vw,36px)] pb-9 pt-6">
                    <div className="flex items-center justify-between font-mono text-[11.5px] uppercase leading-none tracking-[0.1em] text-neutral-400">
                      <span>
                        {String(i + 1).padStart(2, "0")} <span className="text-brand-ink">{post.category}</span>
                      </span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="mt-5 text-pretty text-[clamp(1.2rem,1.45vw,1.45rem)] font-medium leading-[1.2] tracking-[-0.025em] transition-colors duration-300 ease-out group-hover:text-brand">
                      {post.title}
                    </h3>
                    <p className="mb-8 mt-3 text-pretty text-[15px] leading-[1.6] text-neutral-600">{post.excerpt}</p>
                    <span className="mt-auto flex items-center justify-between border-t border-black/[0.06] pt-5 font-mono text-[11.5px] uppercase tracking-[0.1em] text-brand-ink">
                      Read on Medium
                      <ArrowUpRight
                        className="h-4 w-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        strokeWidth={1.75}
                      />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </BlurReveal>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
