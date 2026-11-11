"use client";

import dynamic from "next/dynamic";

// three.js / WebGL needs the browser, so render this page on the client only.
const TestRoverAnatomy = dynamic(() => import("@/views/TestRoverAnatomy"), { ssr: false });

export default function RoverClient() {
  return <TestRoverAnatomy />;
}
