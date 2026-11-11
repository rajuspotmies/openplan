"use client";

// Small shim that keeps the react-router-dom hooks the old site used
// (useNavigate / useLocation) working on top of the Next.js App Router.
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const HASH_EVENT = "openplan:hashchange";

export function useNavigate() {
  const router = useRouter();
  return useCallback(
    (to: string | number, options?: { replace?: boolean }) => {
      if (typeof to === "number") {
        window.history.go(to);
        return;
      }
      if (options?.replace) router.replace(to);
      else router.push(to);
      // Next updates the URL with pushState, which fires no hashchange event.
      window.setTimeout(() => window.dispatchEvent(new Event(HASH_EVENT)), 0);
    },
    [router],
  );
}

export function useLocation() {
  const pathname = usePathname() ?? "/";
  const [hash, setHash] = useState("");
  const [key, setKey] = useState(0);

  useEffect(() => {
    const update = () => {
      setHash(window.location.hash);
      setKey((k) => k + 1);
    };
    update();
    window.addEventListener("hashchange", update);
    window.addEventListener(HASH_EVENT, update);
    return () => {
      window.removeEventListener("hashchange", update);
      window.removeEventListener(HASH_EVENT, update);
    };
  }, [pathname]);

  return { pathname, hash, search: "", key: String(key) };
}
