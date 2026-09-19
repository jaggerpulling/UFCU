import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { routePaths } from "@/app/routes";
import { Button, SourceBadge } from "@/components";
import {
  getNovaReport,
  getNovaStatus,
  recordNovaCompletion,
  type NovaInitialization,
  type NovaReport,
} from "@/features/credit/nova-api";
import { mountNovaConnect } from "@/features/credit/nova-connect";
import { getSavedNovaResult, saveNovaResult } from "@/features/profile/member-profile";
import { useScrollReset } from "@/lib/use-scroll-reset";

type ViewState = "connecting" | "widget" | "processing" | "complete" | "error";
const terminalFailures = new Set(["ERROR", "EXPIRED", "NOT_AUTHENTICATED", "NOT_FOUND"]);
type StoredNovaInitialization = NovaInitialization & { initializedAt?: number };

function readInitialization(): StoredNovaInitialization | null {
  try {
    const stored = sessionStorage.getItem("verified.nova.initialization");
    if (!stored) return null;
    const value = JSON.parse(stored) as Partial<StoredNovaInitialization>;
    const valid = (value.provider === "demo_mock" || value.provider === "nova_sandbox")
      && [value.providerLabel, value.token, value.publicToken, value.publicId, value.productId]
        .every((field) => typeof field === "string" && field.length > 0)
      && typeof value.expiresIn === "number";
    if (!valid) return null;
    if (value.initializedAt && Date.now() - value.initializedAt > value.expiresIn! * 1000) {
      sessionStorage.removeItem("verified.nova.initialization");
      return null;
    }
    return value as StoredNovaInitialization;
  } catch {
    return null;
  }
}

function readCompletedReport(initialization: StoredNovaInitialization | null) {
  const saved = getSavedNovaResult();
  return saved && initialization && saved.publicToken === initialization.publicToken ? saved : null;
}

export function CreditConnectPage() {
  const navigate = useNavigate();
  const [initialization] = useState(readInitialization);
  const [initialReport] = useState(() => readCompletedReport(initialization));
  const abortController = useRef<AbortController | null>(null);
  const completing = useRef(false);
  const [viewState, setViewState] = useState<ViewState>(() => {
    if (initialReport) return "complete";
    if (!initialization) return "error";
    return initialization.provider === "demo_mock" ? "widget" : "connecting";
  });
  const [message, setMessage] = useState("Preparing your secure connection…");
  const [error, setError] = useState<string | null>(() =>
    initialization ? null : "Your connection session has expired. Return to the previous step to start again.",
  );
  const [report, setReport] = useState<NovaReport | null>(initialReport);
  useScrollReset(viewState);

  const pollForReport = useCallback(async (publicToken: string, minimumDelay = 0) => {
    abortController.current?.abort();
    const controller = new AbortController();
    abortController.current = controller;
    setViewState("processing");
    if (minimumDelay > 0) await abortableDelay(minimumDelay, controller.signal);

    for (let attempt = 0; attempt < 30; attempt += 1) {
      const status = await getNovaStatus(publicToken, controller.signal);
      const normalizedStatus = status.status.toUpperCase();
      if (normalizedStatus === "SUCCESS") {
        setMessage("Building your VERIFIED profile…");
        const result = await getNovaReport(publicToken, controller.signal);
        setReport(result);
        saveNovaResult(result);
        setViewState("complete");
        return;
      }
      if (terminalFailures.has(normalizedStatus)) {
        throw new Error(`Nova Credit could not complete this report (${status.substatus ?? status.status}).`);
      }
      setMessage(attempt < 2 ? "Finding your credit history…" : "Translating your financial profile…");
      await abortableDelay(2000, controller.signal);
    }
    throw new Error("Your report is still processing. Please try again shortly.");
  }, []);

  const handleSuccess = useCallback(async (publicToken: string, status?: string) => {
    if (completing.current) return;
    completing.current = true;
    setMessage("Finding your credit history…");
    setViewState("processing");
    try {
      await recordNovaCompletion(publicToken, status);
      await pollForReport(publicToken, initialization?.provider === "demo_mock" ? 650 : 0);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : "The report could not be retrieved.");
      setViewState("error");
      completing.current = false;
    }
  }, [initialization, pollForReport]);

  useEffect(() => {
    if (!initialization || initialization.provider === "demo_mock") return;

    let cleanup: (() => void) | undefined;
    mountNovaConnect(initialization, {
      onSuccess: handleSuccess,
      onError: (reason) => { setError(reason); setViewState("error"); },
      onExit: () => setMessage("Connection closed. You can continue when you’re ready."),
    })
      .then((destroy) => { cleanup = destroy; setViewState("widget"); })
      .catch((caught) => { setError(caught instanceof Error ? caught.message : "NovaConnect could not be loaded."); setViewState("error"); });

    return () => { cleanup?.(); abortController.current?.abort(); };
  }, [handleSuccess, initialization]);

  if (viewState === "complete" && report && initialization) {
    const demo = initialization.provider === "demo_mock";
    return (
      <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
        <div className="flex-1">
          <div className="grid size-14 place-items-center rounded-full bg-positive text-white verified-pop" aria-hidden="true">✓</div>
          <p className="mt-5 text-caption font-semibold uppercase tracking-[0.16em] text-positive">Connection complete</p>
          <h1 className="mt-2 font-display text-display-md text-primary">International credit profile connected</h1>
          <div className="mt-7 rounded-lg border-2 border-positive bg-canvas confirmed-card">
            <ul className="divide-y divide-primary-subtle px-4 text-body-sm text-primary">
              {(demo ? ["4 years of credit history", "3 active accounts", "Strong payment history", "No reported delinquencies"] : ["Credit Passport report retrieved", "Report status confirmed", "History ready for your VERIFIED profile"]).map((item) => (
                <li key={item} className="flex gap-3 py-3.5"><span className="text-positive">✓</span>{item}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4"><SourceBadge variant="verified" label={demo ? "Nova Credit — Demo Data" : "Nova Credit Sandbox"} /></div>
          {demo ? <p className="mt-3 text-caption text-mute">Synthetic financial information for demonstration only.</p> : null}
        </div>
        <div className="sticky bottom-0 mt-7 bg-canvas pb-2 pt-4"><Button fullWidth onClick={() => navigate(routePaths.profile)}>Continue to VERIFIED profile →</Button></div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col px-6 pb-6 pt-8">
      <div className="flex-1">
        <p className="text-caption font-semibold uppercase tracking-[0.16em] text-mute">Financial history · Secure connection</p>
        <h1 className="mt-3 font-display text-display-md text-primary">Bring your credit history with you</h1>
        {initialization ? (
          <p className="mt-3 inline-flex rounded-full bg-canvas-soft px-3 py-1 text-caption font-semibold text-body">Provider: {initialization.providerLabel}</p>
        ) : null}

        {viewState === "widget" && initialization?.provider === "demo_mock" ? (
          <div className="mt-7 rounded-lg border border-primary-subtle bg-canvas-soft p-5 text-center">
            <p className="font-display text-display-sm text-primary">NovaConnect demo</p>
            <p className="mt-2 text-body-sm text-body">This labeled mock follows the sandbox completion flow without contacting a credit bureau.</p>
            <Button className="mt-5" fullWidth onClick={() => handleSuccess(initialization.publicToken, "SUCCESS")}>Connect demo credit history</Button>
          </div>
        ) : null}

        {initialization?.provider === "nova_sandbox" && (viewState === "connecting" || viewState === "widget") ? (
          <div id="nova-embed" className="mt-7 min-h-72" />
        ) : null}

        {viewState === "connecting" || viewState === "processing" ? (
          <div className="mt-12 text-center" aria-live="polite">
            <span className="mx-auto block size-12 animate-spin rounded-full border-4 border-primary-subtle border-t-secondary" />
            <p className="mt-5 font-semibold text-primary">{message}</p>
            <p className="mt-2 text-body-sm text-mute">Keep this page open while the report is prepared.</p>
          </div>
        ) : null}

        {viewState === "error" ? (
          <div className="mt-7 rounded-lg bg-negative-subtle p-5" role="alert">
            <p className="font-semibold text-negative">Connection interrupted</p>
            <p className="mt-2 text-body-sm text-body">{error}</p>
            <Button className="mt-4" variant="secondary" fullWidth onClick={() => navigate(routePaths.credit)}>Start again</Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function abortableDelay(milliseconds: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, milliseconds);
    signal.addEventListener("abort", () => {
      window.clearTimeout(timer);
      reject(new DOMException("Request cancelled", "AbortError"));
    }, { once: true });
  });
}
