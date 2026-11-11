"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpenText, Search, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "@/lib/router";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
const blogMissingMiddle = "/assets/blog/blog-missing-middle.png";
const blogDesignChanges = "/assets/blog/blog-design-changes.png";
const blogBomsExcel = "/assets/blog/blog-boms-excel.png";
const blogBomsTransit = "/assets/blog/blog-boms-transit.png";

const posts = [
  {
    title: "The missing middle of hardware tooling",
    excerpt:
      "Hardware startups juggle disconnected tools — BOMs in Excel, timelines in Jira, procurement in spreadsheets — creating inefficiencies that neither enterprise PLM nor lightweight software tools fully solve.",
    category: "Operations",
    readTime: "5 min read",
    image: blogMissingMiddle,
    url: "https://medium.com/@sekharatece/the-missing-middle-of-hardware-tooling-1ff43f681479",
  },
  {
    title: "How exactly fast-moving hardware teams handle design changes without chaos",
    excerpt:
      "Design change chaos stems from poor traceability, not the changes themselves. Fast teams treat change orders as tracked objects and map impact before approval.",
    category: "Engineering",
    readTime: "6 min read",
    image: blogDesignChanges,
    url: "https://medium.com/@sekharatece/how-exactly-fast-moving-hardware-teams-handle-design-changes-without-chaos-1ed397b1767f",
  },
  {
    title: "Why engineers still manage BOMs in Excel (and what it actually costs them)",
    excerpt:
      "The real problem isn't Excel — it's the disconnected copies of BOMs across teams that create silent failures in the gap between the file and everything that depends on it.",
    category: "BOM Management",
    readTime: "6 min read",
    image: blogBomsExcel,
    url: "https://medium.com/@sekharatece/why-engineers-still-manage-boms-in-excel-and-what-it-actually-costs-them-9c6af727a31f",
  },
  {
    title: "Somewhere between Bangalore and Shenzhen, a BOM revision died in transit",
    excerpt:
      "Storing critical BOM updates in message threads instead of a canonical record creates systemic failures across time zones and supply chains.",
    category: "Supply Chain",
    readTime: "7 min read",
    image: blogBomsTransit,
    url: "https://medium.com/@sekharatece/somewhere-between-bangalore-and-shenzhen-a-bom-revision-died-in-transit-e77e02e4ba0f",
  },
];

const categories = ["All", ...Array.from(new Set(posts.map((post) => post.category)))];

const BlogPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory = activeCategory === "All" || post.category === activeCategory;
      const matchesSearch = `${post.title} ${post.excerpt} ${post.category}`
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navigation />
      <div className="mx-auto flex max-w-7xl flex-col px-4 pt-8 pb-6 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>

        <div className="space-y-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-slate-200">
                <BookOpenText className="h-4 w-4" aria-hidden="true" />
                All insights
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Explore every blog post
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Browse practical stories, product learnings, and launch advice from hardware teams.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">
                <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search blogs"
                  className="w-full bg-transparent outline-none placeholder:text-slate-500 sm:w-44"
                />
              </label>

              <label className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">
                <SlidersHorizontal className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <select
                  value={activeCategory}
                  onChange={(event) => setActiveCategory(event.target.value)}
                  className="bg-transparent outline-none"
                >
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-slate-900 text-slate-100">
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post, index) => (
              <motion.a
                key={post.title}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
                className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-900/80"
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={post.image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                    {post.category}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                    <BookOpenText className="h-4 w-4" aria-hidden="true" />
                    <span>{post.readTime}</span>
                  </div>
                  <h2 className="text-lg font-semibold leading-snug text-white">{post.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{post.excerpt}</p>
                  <div className="mt-auto pt-5 text-sm font-semibold text-slate-100 transition group-hover:text-blue-400">
                    Read article <span className="ml-1">→</span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-slate-900/70 p-8 text-center text-slate-300">
              No blogs match your search yet.
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPage;
