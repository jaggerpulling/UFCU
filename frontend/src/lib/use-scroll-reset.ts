import { useEffect } from "react";

export function useScrollReset(trigger: unknown) {
  useEffect(() => {
    const reset = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    reset();
    let settledFrame = 0;
    const frame = window.requestAnimationFrame(() => {
      settledFrame = window.requestAnimationFrame(reset);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(settledFrame);
    };
  }, [trigger]);
}
