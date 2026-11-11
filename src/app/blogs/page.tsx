import type { Metadata } from "next";
import BlogPageView from "@/views/BlogPage";

export const metadata: Metadata = {
  title: "Blog | OpenPlan",
};

export default function Page() {
  return <BlogPageView />;
}
