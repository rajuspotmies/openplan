import React, { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface CaptchaFieldProps {
  onVerify: (token: string) => void;
  resetTrigger?: number;
  disabled?: boolean;
}

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-script";
const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let turnstileScriptPromise: Promise<void> | null = null;

const loadTurnstileScript = () => {
  if (window.turnstile) {
    return Promise.resolve();
  }

  if (!turnstileScriptPromise) {
    turnstileScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById(
        TURNSTILE_SCRIPT_ID
      ) as HTMLScriptElement | null;

      if (existingScript) {
        const startedAt = Date.now();
        const maxWaitMs = 5000;
        const intervalId = window.setInterval(() => {
          if (window.turnstile) {
            window.clearInterval(intervalId);
            resolve();
            return;
          }
          if (Date.now() - startedAt > maxWaitMs) {
            window.clearInterval(intervalId);
            reject(new Error("Timed out while loading CAPTCHA script."));
          }
        }, 100);
        return;
      }

      const script = document.createElement("script");
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = TURNSTILE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load CAPTCHA script."));
      document.head.appendChild(script);
    });
  }

  return turnstileScriptPromise;
};

const CaptchaField: React.FC<CaptchaFieldProps> = ({
  onVerify,
  resetTrigger = 0,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  const [error, setError] = useState<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    let isMounted = true;

    if (!siteKey) {
      setError("CAPTCHA site key is missing. Set VITE_TURNSTILE_SITE_KEY.");
      return;
    }

    const initializeWidget = async () => {
      try {
        await loadTurnstileScript();
        if (!isMounted || !containerRef.current || !window.turnstile) {
          return;
        }

        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "dark",
          callback: (token) => {
            setError(null);
            onVerifyRef.current(token);
          },
          "expired-callback": () => {
            onVerifyRef.current("");
          },
          "error-callback": () => {
            onVerifyRef.current("");
            setError("CAPTCHA verification failed. Please retry.");
          },
        });
      } catch (scriptError) {
        setError(
          scriptError instanceof Error
            ? scriptError.message
            : "Unable to load CAPTCHA."
        );
      }
    };

    initializeWidget();

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  useEffect(() => {
    if (resetTrigger <= 0 || !widgetIdRef.current || !window.turnstile) {
      return;
    }
    window.turnstile.reset(widgetIdRef.current);
    onVerifyRef.current("");
  }, [resetTrigger]);

  return (
    <div className="space-y-2">
      <Label>Security Check *</Label>
      <div
        className={`min-h-[65px] rounded-md border border-border/70 p-2 ${
          disabled ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div ref={containerRef} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default CaptchaField;
