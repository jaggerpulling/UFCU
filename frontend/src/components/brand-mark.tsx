export function BrandMark() {
  return (
    <div className="flex items-center gap-3" aria-label="UFCU Verified">
      <img
        src="/assets/ufcu-logo.png"
        alt=""
        className="h-auto w-14 shrink-0"
        aria-hidden="true"
      />
      <div className="h-8 w-px bg-primary-subtle" aria-hidden="true" />
      <div className="leading-none">
        <p className="text-sm font-semibold tracking-[0.14em] text-primary">VERIFIED</p>
        <p className="mt-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-mute">Member onboarding</p>
      </div>
    </div>
  );
}
