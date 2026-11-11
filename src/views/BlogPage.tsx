"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Search } from "lucide-react";
import { useNavigate } from "@/lib/router";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { revealEase } from "@/components/motion/BlurReveal";

const posts = [
  {
    title: "The missing middle of hardware tooling",
    excerpt:
      "Hardware startups juggle disconnected tools — BOMs in Excel, timelines in Jira, procurement in spreadsheets — creating inefficiencies that neither enterprise PLM nor lightweight software tools fully solve.",
    category: "Operations",
    readTime: "5 min read",
    image: "/assets/blog/blog-missing-middle.png",
    url: "https://medium.com/@sekharatece/the-missing-middle-of-hardware-tooling-1ff43f681479",
  },
  {
    title: "How exactly fast-moving hardware teams handle design changes without chaos",
    excerpt:
      "Design change chaos stems from poor traceability, not the changes themselves. Fast teams treat change orders as tracked objects and map impact before approval.",
    category: "Engineering",
    readTime: "6 min read",
    image: "/assets/blog/blog-design-changes.png",
    url: "https://medium.com/@sekharatece/how-exactly-fast-moving-hardware-teams-handle-design-changes-without-chaos-1ed397b1767f",
  },
  {
    title: "Why engineers still manage BOMs in Excel (and what it actually costs them)",
    excerpt:
      "The real problem isn't Excel — it's the disconnected copies of BOMs across teams that create silent failures in the gap between the file and everything that depends on it.",
    category: "BOM Management",
    readTime: "6 min read",
    image: "/assets/blog/blog-boms-excel.png",
    url: "https://medium.com/@sekharatece/why-engineers-still-manage-boms-in-excel-and-what-it-actually-costs-them-9c6af727a31f",
  },
  {
    title: "Somewhere between Bangalore and Shenzhen, a BOM revision died in transit",
    excerpt:
      "Storing critical BOM updates in message threads instead of a canonical record creates systemic failures across time zones and supply chains.",
    category: "Supply Chain",
    readTime: "7 min read",
    image: "/assets/blog/blog-boms-transit.png",
    url: "https://medium.com/@sekharatece/somewhere-between-bangalore-and-shenzhen-a-bom-revision-died-in-transit-e77e02e4ba0f",
  },
];

type Post = (typeof posts)[number];

const categories = ["All", ...Array.from(new Set(posts.map((post) => post.category)))];

const FRAME = "mx-auto w-[min(1600px,calc(100%-2*clamp(12px,2.4vw,36px)))] border-x border-white/[0.08]";
const PAD = "px-[clamp(16px,4vw,72px)]";

function Meta({ post, index }: { post: Post; index: number }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white/45">
      <span className="text-brand-light">{String(index + 1).padStart(2, "0")}</span>
      <span className="h-px w-4 bg-white/20" aria-hidden />
      <span>{post.category}</span>
      <span aria-hidden>·</span>
      <span>{post.readTime}</span>
    </div>
  );
}

function ReadLink() {
  return (
    <span className="mt-auto inline-flex items-center gap-1.5 pt-6 font-mono text-[12px] uppercase tracking-[0.14em] text-white/80 transition-colors duration-300 ease-out group-hover:text-brand-light">
      Read on Medium
      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </span>
  );
}

const BlogPage = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) navigate(-1);
    else navigate("/", { replace: true });
  };

  const filteredPosts = useMemo(() => {
    const q = search.toLowerCase();
    return posts.filter(
      (post) =>
        (activeCategory === "All" || post.category === activeCategory) &&
        `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(q),
    );
  }, [activeCategory, search]);

  const [featured, ...rest] = filteredPosts;
  const indexOf = (p: Post) => posts.indexOf(p);
  const reveal = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18, filter: "blur(10px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 0.8, delay: 0.06 * i, ease: revealEase },
        };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <Navigation />

      {/* Header */}
      <section className="bg-[#0A0A0B]">
        <div className={`${FRAME} ${PAD} pb-12 pt-28 md:pb-16 md:pt-36`}>
          <button
            type="button"
            onClick={handleBack}
            className="mb-10 inline-flex w-fit items-center gap-2 border border-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white/70 transition-colors duration-200 ease-out hover:border-white/30 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back
          </button>

          <div className="mb-4 flex items-center gap-3 font-mono text-[13px] uppercase tracking-[0.04em] text-white/55">
            <span className="flex-none">Blog · All insights</span>
            <span aria-hidden className="relative h-px min-w-5 flex-1 bg-white/[0.12]">
              <span className="absolute -top-[3px] left-0 h-[7px] w-px bg-white/[0.12]" />
              <span className="absolute -top-[3px] right-0 h-[7px] w-px bg-white/[0.12]" />
            </span>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[760px]">
              <h1 className="text-balance text-4xl font-medium leading-[1.04] tracking-[-0.045em] sm:text-5xl lg:text-[3.6rem]">
                Notes from the <span className="text-brand-light">hardware floor</span>
              </h1>
              <p className="mt-5 max-w-[600px] text-pretty text-[16px] leading-relaxed text-white/55 sm:text-[17px]">
                Practical stories, product learnings and launch advice from hardware teams.
              </p>
            </div>

            <label className="flex w-full items-center gap-2.5 border border-white/15 bg-white/[0.03] px-3.5 py-2.5 transition-colors focus-within:border-brand lg:w-[320px]">
              <Search className="h-4 w-4 flex-none text-white/40" aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search articles"
                aria-label="Search articles"
                className="w-full bg-transparent text-[14px] text-white outline-none placeholder:text-white/35"
              />
            </label>
          </div>

          {/* Category tabs */}
          <div role="tablist" aria-label="Filter by category" className="mt-10 flex flex-wrap gap-x-1 gap-y-2 border-b border-white/[0.08]">
            {categories.map((category) => {
              const on = category === activeCategory;
              return (
                <button
                  key={category}
                  role="tab"
                  aria-selected={on}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`relative -mb-px border-b px-3 pb-3 pt-1 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors duration-200 ease-out ${
                    on ? "border-brand text-white" : "border-transparent text-white/45 hover:text-white/80"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="bg-[#0A0A0B]">
        <div className={`${FRAME} ${PAD} pb-24 md:pb-32`}>
          {featured ? (
            <>
              {/* Featured: image left, copy right */}
              <motion.a
                key={`f-${featured.title}`}
                href={featured.url}
                target="_blank"
                rel="noopener noreferrer"
                {...reveal(0)}
                className="group grid border border-white/[0.1] bg-[#0d0d0e] transition-colors duration-300 ease-out hover:border-white/25 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]"
              >
                <div className="flex items-center overflow-hidden border-b border-white/[0.1] bg-[#111] lg:border-b-0 lg:border-r">
                  <img
                    src={featured.image}
                    alt=""
                    className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-col p-6 sm:p-8 lg:p-10">
                  <span className="mb-5 w-fit bg-brand px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white">
                    Latest
                  </span>
                  <Meta post={featured} index={indexOf(featured)} />
                  <h2 className="mt-5 text-balance text-[26px] font-medium leading-[1.12] tracking-[-0.03em] sm:text-[32px]">
                    {featured.title}
                  </h2>
                  <p className="mt-4 text-pretty text-[15px] leading-relaxed text-white/55 sm:text-[16px]">{featured.excerpt}</p>
                  <ReadLink />
                </div>
              </motion.a>

              {/* Rest: hairline grid */}
              {rest.length > 0 && (
                <div className="mt-6 grid gap-px border border-white/[0.1] bg-white/[0.1] md:grid-cols-2 xl:grid-cols-3">
                  {rest.map((post, i) => (
                    <motion.a
                      key={post.title}
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      {...reveal(i + 1)}
                      className="group flex h-full flex-col bg-[#0A0A0B] p-5 transition-colors duration-300 ease-out hover:bg-[#0f0f11] sm:p-6"
                    >
                      <div className="relative aspect-[3/2] overflow-hidden border border-white/[0.08] bg-[#111]">
                        <img
                          src={post.image}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                      </div>
                      <div className="mt-5">
                        <Meta post={post} index={indexOf(post)} />
                      </div>
                      <h2 className="mt-3 text-balance text-[20px] font-medium leading-[1.2] tracking-[-0.025em]">{post.title}</h2>
                      <p className="mt-3 line-clamp-3 text-[14.5px] leading-relaxed text-white/50">{post.excerpt}</p>
                      <ReadLink />
                    </motion.a>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="border border-dashed border-white/15 p-10 text-center font-mono text-[12px] uppercase tracking-[0.14em] text-white/45">
              No articles match your search yet.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPage;
