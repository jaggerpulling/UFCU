import type { NovaInitialization } from "./nova-api";

const NOVA_SCRIPT_URL = "https://static.novacredit.com/connect/v2/init.js";

interface NovaRegisterOptions {
  env: "sandbox";
  publicId: string;
  productId: string;
  token: string;
  onSuccess: (publicToken: string, status?: string) => void;
  onError: (publicToken: string | undefined, error?: string) => void;
  onExit: (publicToken?: string) => void;
}

interface NovaSdk {
  register(options: NovaRegisterOptions): void;
  destroy?(): void;
}

declare global {
  interface Window {
    Nova?: NovaSdk;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadNovaScript(): Promise<void> {
  if (window.Nova) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${NOVA_SCRIPT_URL}"]`);
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("NovaConnect could not be loaded.")), {
      once: true,
    });
    if (!existing) {
      script.src = NOVA_SCRIPT_URL;
      script.async = true;
      document.head.appendChild(script);
    }
  });
  return scriptPromise;
}

export async function mountNovaConnect(
  initialization: NovaInitialization,
  hooks: {
    onSuccess: (publicToken: string, status?: string) => void;
    onError: (message: string) => void;
    onExit: () => void;
  },
): Promise<() => void> {
  await loadNovaScript();
  if (!window.Nova) throw new Error("NovaConnect did not initialize.");

  window.Nova.register({
    env: "sandbox",
    publicId: initialization.publicId,
    productId: initialization.productId,
    token: initialization.token,
    onSuccess: hooks.onSuccess,
    onError: (_publicToken, error) => hooks.onError(error ?? "NovaConnect encountered an error."),
    onExit: hooks.onExit,
  });

  return () => window.Nova?.destroy?.();
}
