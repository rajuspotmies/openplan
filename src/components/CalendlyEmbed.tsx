import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: Record<string, unknown>;
      }) => void;
    };
  }
}

interface CalendlyEmbedProps {
  url: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  className?: string;
}

const CALENDLY_SCRIPT_ID = "calendly-widget-script";
const CALENDLY_SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";

let calendlyScriptPromise: Promise<void> | null = null;

const loadCalendlyScript = () => {
  if (window.Calendly) {
    return Promise.resolve();
  }

  if (!calendlyScriptPromise) {
    calendlyScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById(
        CALENDLY_SCRIPT_ID
      ) as HTMLScriptElement | null;

      if (existingScript) {
        const startedAt = Date.now();
        const maxWaitMs = 5000;
        const intervalId = window.setInterval(() => {
          if (window.Calendly) {
            window.clearInterval(intervalId);
            resolve();
            return;
          }
          if (Date.now() - startedAt > maxWaitMs) {
            window.clearInterval(intervalId);
            reject(new Error("Timed out while loading Calendly script."));
          }
        }, 100);
        return;
      }

      const script = document.createElement("script");
      script.id = CALENDLY_SCRIPT_ID;
      script.src = CALENDLY_SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Calendly script."));
      document.head.appendChild(script);
    });
  }

  return calendlyScriptPromise;
};

const CalendlyEmbed: React.FC<CalendlyEmbedProps> = ({ url, prefill, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeWidget = async () => {
      try {
        await loadCalendlyScript();
        if (!isMounted || !containerRef.current || !window.Calendly) {
          return;
        }

        containerRef.current.innerHTML = "";

        const params = new URLSearchParams();
        if (prefill?.name) params.set("name", prefill.name);
        if (prefill?.email) params.set("email", prefill.email);
        const widgetUrl = params.toString() ? `${url}?${params.toString()}` : url;

        window.Calendly.initInlineWidget({
          url: widgetUrl,
          parentElement: containerRef.current,
          prefill: {
            name: prefill?.name,
            email: prefill?.email,
          },
        });
      } catch (scriptError) {
        setError(
          scriptError instanceof Error
            ? scriptError.message
            : "Unable to load the scheduling widget."
        );
      }
    };

    initializeWidget();

    return () => {
      isMounted = false;
    };
  }, [url, prefill?.name, prefill?.email]);

  if (error) {
    return (
      <div className="rounded-md border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-400">
        {error}{" "}
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
          Open scheduling page instead
        </a>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minWidth: "280px", height: "700px" }}
    />
  );
};

export default CalendlyEmbed;
