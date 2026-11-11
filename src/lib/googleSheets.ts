type FormType = "waitlist" | "demo";

const getGoogleSheetsEndpoint = (formType: FormType): string => {
  const baseEndpoint = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL?.trim();
  const waitlistEndpoint = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WAITLIST_URL?.trim();
  const demoEndpoint = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_DEMO_URL?.trim();

  if (formType === "waitlist" && waitlistEndpoint) {
    return waitlistEndpoint;
  }

  if (formType === "demo" && demoEndpoint) {
    return demoEndpoint;
  }

  if (baseEndpoint) {
    return baseEndpoint;
  }

  throw new Error(
    "Google Sheets endpoint is not configured. Set VITE_GOOGLE_SHEETS_WEB_APP_URL or form-specific URLs."
  );
};

export const fetchWaitlistCount = async (): Promise<number> => {
  try {
    const endpoint = getGoogleSheetsEndpoint("waitlist");
    const url = new URL(endpoint);
    url.searchParams.set("action", "getCount");
    url.searchParams.set("formType", "waitlist");
    url.searchParams.set("t", Date.now().toString());

    const response = await fetch(url.toString(), { method: "GET", cache: "no-store" });
    if (!response.ok) return 0;
    const data = (await response.json()) as { success?: boolean; count?: number };
    return typeof data.count === "number" ? data.count : 0;
  } catch {
    return 0;
  }
};

export const submitToGoogleSheets = async <T extends object>(
  formType: FormType,
  payload: T
) => {
  let endpoint: string;
  try {
    endpoint = getGoogleSheetsEndpoint(formType);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[googleSheets] No endpoint configured for "${formType}" — skipping network submit in dev mode.`,
        payload
      );
      return;
    }
    throw error;
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        // text/plain avoids CORS preflight for Apps Script web apps
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        formType,
        submittedAt: new Date().toISOString(),
        ...payload,
      }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network request failed";
    throw new Error(
      `Unable to reach Google Sheets endpoint. Verify Web App deployment access is set to 'Anyone' and URL is correct. Details: ${message}`
    );
  }

  if (!response.ok) {
    throw new Error(`Google Sheets request failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = (await response.json()) as { success?: boolean; error?: string };
    if (data.success === false) {
      throw new Error(data.error || "Google Sheets submission failed.");
    }
  }
};
