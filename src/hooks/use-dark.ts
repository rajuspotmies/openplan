"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/** True when the dark theme is on. False on the server and the first client render (light is the default). */
export function useDark() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && resolvedTheme === "dark";
}
