export function BrandMark() {
  return (
    <div className="flex items-center gap-3" aria-label="VERIFIED by UFCU">
      <div className="grid size-9 place-items-center rounded-md bg-primary text-sm font-semibold text-white" aria-hidden="true">
        V
      </div>
      <div className="leading-none">
        <p className="text-sm font-semibold tracking-[0.14em] text-primary">VERIFIED</p>
        <p className="mt-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-mute">by UFCU</p>
      </div>
    </div>
  );
}
