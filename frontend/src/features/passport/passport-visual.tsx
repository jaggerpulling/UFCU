interface PassportVisualProps {
  scanning?: boolean;
  complete?: boolean;
}

export function PassportVisual({ scanning = false, complete = false }: PassportVisualProps) {
  return (
    <div className="relative mx-auto grid h-52 w-full max-w-[19rem] place-items-center" aria-hidden="true">
      {scanning ? (
        <>
          <span className="scan-wave scan-wave-one" />
          <span className="scan-wave scan-wave-two" />
          <span className="scan-wave scan-wave-three" />
        </>
      ) : null}

      <div
        className={`relative z-10 h-40 w-56 overflow-hidden rounded-lg border-2 p-5 transition-colors duration-500 ${
          complete ? "border-secondary bg-white" : "border-primary bg-primary"
        }`}
      >
        <div className={`flex items-center justify-between ${complete ? "text-primary" : "text-white"}`}>
          <span className="text-[0.625rem] font-semibold uppercase tracking-[0.2em]">Passport</span>
          <GlobeIcon />
        </div>

        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between">
          <div className={`space-y-2 ${complete ? "text-primary" : "text-white"}`}>
            <span className="block h-1.5 w-24 rounded-full bg-current opacity-70" />
            <span className="block h-1.5 w-16 rounded-full bg-current opacity-40" />
          </div>
          <div
            className={`grid size-12 place-items-center rounded-full ${
              complete ? "bg-secondary-subtle text-secondary-darker" : "bg-white/15 text-white"
            }`}
          >
            {complete ? <CheckIcon /> : <ChipIcon />}
          </div>
        </div>

        {scanning ? <span className="scan-line" /> : null}
      </div>
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg className="size-7" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="16" cy="16" r="11" />
      <path d="M5 16h22M16 5c3 3 4.5 6.7 4.5 11S19 24 16 27c-3-3-4.5-6.7-4.5-11S13 8 16 5Z" />
    </svg>
  );
}

function ChipIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M9 2v3m3-3v3m3-3v3M9 19v3m3-3v3m3-3v3M2 9h3m-3 3h3m-3 3h3m14-6h3m-3 3h3m-3 3h3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="m6 12 4 4 8-9" />
    </svg>
  );
}
